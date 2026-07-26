import { Server } from "socket.io";
import http from "http";

const PORT = 3003;

const COINS = ["BTCUSDT", "ETHUSDT", "SOLUSDT"] as const;
type Coin = (typeof COINS)[number];

// --- Price State ---
const prices: Record<Coin, number> = {
  BTCUSDT: 66916.0,
  ETHUSDT: 1829.38,
  SOLUSDT: 75.26,
};

const priceHistory: Record<Coin, number[]> = {
  BTCUSDT: [],
  ETHUSDT: [],
  SOLUSDT: [],
};

const MAX_HISTORY = 60;

// --- Round State ---
interface Round {
  roundId: string;
  coin: Coin;
  entryPrice: number;
  duration: number; // seconds
  timeLeft: number; // seconds remaining
  status: "active" | "ended";
  createdAt: number; // timestamp ms
}

const activeRounds: Map<string, Round> = new Map(); // key: "coin-duration" e.g. "BTCUSDT-60"

function generateRoundId(): string {
  return `R${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

// --- HTTP + Socket.IO Server ---
const httpServer = http.createServer((req, res) => {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || "/", `http://localhost:${PORT}`);

  // GET /api/round/current?coin=BTCUSDT&duration=60
  if (url.pathname === "/api/round/current" && req.method === "GET") {
    const coin = (url.searchParams.get("coin") || "BTCUSDT") as Coin;
    const duration = parseInt(url.searchParams.get("duration") || "60", 10);
    const key = `${coin}-${duration}`;
    const round = activeRounds.get(key);

    if (round && round.status === "active") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        roundId: round.roundId,
        coin: round.coin,
        duration: round.duration,
        entryPrice: round.entryPrice,
        currentPrice: prices[round.coin],
        timeLeft: round.timeLeft,
        status: round.status,
      }));
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "No active round found", coin, duration }));
    }
    return;
  }

  // GET /api/prices
  if (url.pathname === "/api/prices" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      prices: {
        BTCUSDT: { price: prices.BTCUSDT },
        ETHUSDT: { price: prices.ETHUSDT },
        SOLUSDT: { price: prices.SOLUSDT },
      },
      history: {
        BTCUSDT: priceHistory.BTCUSDT.slice(-40),
        ETHUSDT: priceHistory.ETHUSDT.slice(-40),
        SOLUSDT: priceHistory.SOLUSDT.slice(-40),
      },
    }));
    return;
  }

  // GET /api/rounds (all active rounds)
  if (url.pathname === "/api/rounds" && req.method === "GET") {
    const rounds: Array<Record<string, unknown>> = [];
    for (const [, round] of activeRounds.entries()) {
      if (round.status === "active") {
        rounds.push({
          roundId: round.roundId,
          coin: round.coin,
          duration: round.duration,
          entryPrice: round.entryPrice,
          currentPrice: prices[round.coin],
          timeLeft: round.timeLeft,
        });
      }
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ rounds }));
    return;
  }

  // Default: 404
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

const io = new Server(httpServer, {
  cors: { origin: "*" },
});

// --- Binance Price Fetching ---
async function fetchBinancePrice(coin: Coin): Promise<number | null> {
  try {
    const res = await fetch(
      `https://api.binance.com/api/v3/ticker/price?symbol=${coin}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return parseFloat(data.price);
  } catch {
    return null;
  }
}

async function fetchAllPrices(): Promise<void> {
  for (const coin of COINS) {
    const binancePrice = await fetchBinancePrice(coin);
    if (binancePrice !== null) {
      prices[coin] = binancePrice;
    } else {
      // Fallback: random walk simulation
      const delta = (Math.random() - 0.5) * prices[coin] * 0.001;
      prices[coin] = Math.max(prices[coin] * 0.95, prices[coin] + delta);
    }
    prices[coin] = Number(prices[coin].toFixed(
      coin === "BTCUSDT" ? 2 : coin === "ETHUSDT" ? 2 : 4
    ));

    // Update history
    priceHistory[coin].push(prices[coin]);
    if (priceHistory[coin].length > MAX_HISTORY) {
      priceHistory[coin].shift();
    }
  }

  // Emit price updates
  io.emit("price:update", {
    BTCUSDT: prices.BTCUSDT,
    ETHUSDT: prices.ETHUSDT,
    SOLUSDT: prices.SOLUSDT,
    timestamp: Date.now(),
  });
}

// --- Round Tick Logic ---
function tickRounds(): void {
  for (const [key, round] of activeRounds.entries()) {
    if (round.status !== "active") continue;

    round.timeLeft -= 1;

    if (round.timeLeft <= 0) {
      // Round ended
      const exitPrice = prices[round.coin];
      round.status = "ended";

      io.emit("round:end", {
        roundId: round.roundId,
        coin: round.coin,
        entryPrice: round.entryPrice,
        exitPrice,
        duration: round.duration,
      });

      // Call the resolve API to settle bets
      resolveRound(round.roundId, exitPrice);

      // Remove ended round
      activeRounds.delete(key);

      // Immediately start a new round for this coin+duration
      startRound(round.coin, round.duration);
    } else {
      io.emit("round:tick", {
        roundId: round.roundId,
        coin: round.coin,
        duration: round.duration,
        timeLeft: round.timeLeft,
        entryPrice: round.entryPrice,
        currentPrice: prices[round.coin],
      });
    }
  }
}

function startRound(coin: Coin, duration: number): void {
  const key = `${coin}-${duration}`;
  const round: Round = {
    roundId: generateRoundId(),
    coin,
    entryPrice: prices[coin],
    duration,
    timeLeft: duration,
    status: "active",
    createdAt: Date.now(),
  };
  activeRounds.set(key, round);

  io.emit("round:new", {
    roundId: round.roundId,
    coin: round.coin,
    entryPrice: round.entryPrice,
    duration: round.duration,
    timeLeft: round.timeLeft,
  });
}

// --- Resolve Round via API ---
async function resolveRound(roundId: string, exitPrice: number): Promise<void> {
  try {
    await fetch("http://localhost:3000/api/round/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roundId, exitPrice }),
    });
    console.log(`✅ Round ${roundId} resolved at exit price ${exitPrice}`);
  } catch (err) {
    console.error(`❌ Failed to resolve round ${roundId}:`, err);
  }
}

// --- Initialize Rounds for all coin+duration combos ---
const DURATIONS = [5, 10, 20, 30, 40, 50, 60];

function initializeRounds(): void {
  for (const coin of COINS) {
    for (const duration of DURATIONS) {
      startRound(coin, duration);
    }
  }
}

// --- 1-second tick interval ---
setInterval(async () => {
  await fetchAllPrices();
  tickRounds();
}, 1000);

// --- Connection Handling ---
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Send current prices immediately
  socket.emit("price:update", {
    BTCUSDT: prices.BTCUSDT,
    ETHUSDT: prices.ETHUSDT,
    SOLUSDT: prices.SOLUSDT,
    timestamp: Date.now(),
  });

  // Send price history
  socket.emit("history:update", {
    BTCUSDT: [...priceHistory.BTCUSDT],
    ETHUSDT: [...priceHistory.ETHUSDT],
    SOLUSDT: [...priceHistory.SOLUSDT],
  });

  // Send all active rounds
  for (const [, round] of activeRounds.entries()) {
    if (round.status === "active") {
      socket.emit("round:tick", {
        roundId: round.roundId,
        coin: round.coin,
        duration: round.duration,
        timeLeft: round.timeLeft,
        entryPrice: round.entryPrice,
        currentPrice: prices[round.coin],
      });
    }
  }

  // Handle round join request
  socket.on("round:subscribe", ({ coin, duration }: { coin: Coin; duration: number }) => {
    const key = `${coin}-${duration}`;
    const round = activeRounds.get(key);
    if (round && round.status === "active") {
      socket.emit("round:tick", {
        roundId: round.roundId,
        coin: round.coin,
        duration: round.duration,
        timeLeft: round.timeLeft,
        entryPrice: round.entryPrice,
        currentPrice: prices[round.coin],
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// --- Start Server ---
httpServer.listen(PORT, () => {
  console.log(`🔌 Price Service running on port ${PORT}`);
  // Initial price fetch + round initialization
  fetchAllPrices().then(() => {
    initializeRounds();
    console.log(`✅ ${COINS.length} coins × ${DURATIONS.length} durations = ${COINS.length * DURATIONS.length} active rounds`);
  });
});
