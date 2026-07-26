"use client"

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react"

/* ---------------- Countries / currencies ---------------- */

export type Country = {
  code: string
  name: string
  symbol: string
  locale: string
}

export const COUNTRIES: Country[] = [
  { code: "IN", name: "India", symbol: "₹", locale: "en-IN" },
  { code: "US", name: "United States", symbol: "$", locale: "en-US" },
  { code: "GB", name: "United Kingdom", symbol: "£", locale: "en-GB" },
  { code: "EU", name: "Eurozone", symbol: "€", locale: "de-DE" },
  { code: "AE", name: "United Arab Emirates", symbol: "AED ", locale: "en-US" },
  { code: "NG", name: "Nigeria", symbol: "₦", locale: "en-US" },
  { code: "BR", name: "Brazil", symbol: "R$", locale: "pt-BR" },
  { code: "JP", name: "Japan", symbol: "¥", locale: "ja-JP" },
  { code: "RU", name: "Russia", symbol: "₽", locale: "ru-RU" },
  { code: "ZA", name: "South Africa", symbol: "R", locale: "en-ZA" },
]

export type Bet = {
  id: string
  dir: "UP" | "DOWN"
  amount: number
  mult: number
  status: "WON" | "LOST"
  payout: number
}

export type ActiveBet = {
  dir: "UP" | "DOWN"
  amount: number
  entry: number
} | null

type Toast = { id: number; msg: string; tone: "win" | "lose" | "info" }

const ROUND_SECONDS = 60
const MAX_POINTS = 40
const MULT = 1.8

type Store = {
  country: Country
  setCountry: (c: Country) => void
  fmt: (n: number, decimals?: number) => string

  price: number
  history: number[]
  changeAbs: number
  changePct: number

  roundId: string
  timeLeft: number
  entryPrice: number

  balance: number
  profit: number
  winnings: number
  bonus: number

  selectedAmount: number
  setSelectedAmount: (n: number) => void
  amountOptions: number[]

  activeBet: ActiveBet
  placeBet: (dir: "UP" | "DOWN") => void
  recentBets: Bet[]

  deposit: (n: number) => void
  withdraw: (n: number) => void

  toasts: Toast[]
}

const CryptoContext = createContext<Store | null>(null)

function randomId() {
  return "#" + Math.floor(1_000_000 + Math.random() * 9_000_000).toString()
}

export function CryptoProvider({ children }: { children: ReactNode }) {
  const [country, setCountry] = useState<Country>(COUNTRIES[0])

  const [price, setPrice] = useState(64370.25)
  const [history, setHistory] = useState<number[]>(() => {
    // seed with a gentle uptrend so the first chart looks alive
    const arr: number[] = []
    let p = 63950
    for (let i = 0; i < MAX_POINTS; i++) {
      p += (Math.random() - 0.42) * 60
      arr.push(Math.round(p * 100) / 100)
    }
    arr[arr.length - 1] = 64370.25
    return arr
  })

  const [roundId, setRoundId] = useState(randomId())
  const [timeLeft, setTimeLeft] = useState(48)
  const [entryPrice, setEntryPrice] = useState(64370.25)

  const [balance, setBalance] = useState(28450.75)
  const [profit, setProfit] = useState(1275500)
  const [winnings, setWinnings] = useState(1275500)
  const [bonus] = useState(1250)

  const amountOptions = [20, 50, 100, 500, 1000]
  const [selectedAmount, setSelectedAmount] = useState(50)

  const [activeBet, setActiveBet] = useState<ActiveBet>(null)
  const [recentBets, setRecentBets] = useState<Bet[]>([
    { id: "1", dir: "UP", amount: 100, mult: MULT, status: "WON", payout: 180 },
    { id: "2", dir: "DOWN", amount: 50, mult: MULT, status: "LOST", payout: 0 },
    { id: "3", dir: "UP", amount: 200, mult: MULT, status: "WON", payout: 360 },
    { id: "4", dir: "DOWN", amount: 100, mult: MULT, status: "LOST", payout: 0 },
  ])

  const [toasts, setToasts] = useState<Toast[]>([])
  const pushToast = useCallback((msg: string, tone: Toast["tone"]) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, msg, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800)
  }, [])

  // keep latest values available to the interval without re-subscribing
  const ref = useRef({ price, timeLeft, activeBet, entryPrice })
  ref.current = { price, timeLeft, activeBet, entryPrice }

  useEffect(() => {
    const interval = setInterval(() => {
      // 1) move the price (random walk)
      const cur = ref.current.price
      const next = Math.max(60000, Math.round((cur + (Math.random() - 0.5) * 90) * 100) / 100)
      setPrice(next)
      setHistory((h) => [...h.slice(-(MAX_POINTS - 1)), next])

      // 2) advance the round timer
      const t = ref.current.timeLeft - 1
      if (t > 0) {
        setTimeLeft(t)
        return
      }

      // 3) round ended -> resolve any active bet
      const bet = ref.current.activeBet
      if (bet) {
        const wentUp = next > bet.entry
        const won = (bet.dir === "UP" && wentUp) || (bet.dir === "DOWN" && !wentUp)
        const payout = won ? Math.round(bet.amount * MULT) : 0
        if (won) {
          setBalance((b) => b + payout)
          setProfit((p) => p + (payout - bet.amount))
          setWinnings((w) => w + payout)
        }
        setRecentBets((list) =>
          [
            {
              id: String(Date.now()),
              dir: bet.dir,
              amount: bet.amount,
              mult: MULT,
              status: won ? ("WON" as const) : ("LOST" as const),
              payout,
            },
            ...list,
          ].slice(0, 12),
        )
        pushToast(
          won ? `You WON ${country.symbol}${payout.toLocaleString(country.locale)}!` : "Round lost — try again",
          won ? "win" : "lose",
        )
        setActiveBet(null)
      }

      // 4) start a fresh round
      setRoundId(randomId())
      setEntryPrice(next)
      setTimeLeft(ROUND_SECONDS)
    }, 1000)

    return () => clearInterval(interval)
  }, [country.locale, country.symbol, pushToast])

  const fmt = useCallback(
    (n: number, decimals = 0) =>
      country.symbol +
      n.toLocaleString(country.locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }),
    [country],
  )

  const placeBet = useCallback(
    (dir: "UP" | "DOWN") => {
      if (activeBet) {
        pushToast("A prediction is already live this round", "info")
        return
      }
      if (selectedAmount > balance) {
        pushToast("Insufficient balance — please deposit", "info")
        return
      }
      setBalance((b) => b - selectedAmount)
      setActiveBet({ dir, amount: selectedAmount, entry: price })
      pushToast(`${dir} placed: ${country.symbol}${selectedAmount.toLocaleString(country.locale)}`, "info")
    },
    [activeBet, selectedAmount, balance, price, country, pushToast],
  )

  const deposit = useCallback(
    (n: number) => {
      if (n <= 0) return
      setBalance((b) => b + n)
      pushToast(`Deposited ${country.symbol}${n.toLocaleString(country.locale)}`, "win")
    },
    [country, pushToast],
  )

  const withdraw = useCallback(
    (n: number) => {
      if (n <= 0) return
      if (n > balance) {
        pushToast("Amount exceeds balance", "info")
        return
      }
      setBalance((b) => b - n)
      pushToast(`Withdrawal of ${country.symbol}${n.toLocaleString(country.locale)} requested`, "info")
    },
    [balance, country, pushToast],
  )

  const first = history[0] ?? price
  const changeAbs = Math.round((price - first) * 100) / 100
  const changePct = Math.round((changeAbs / first) * 10000) / 100

  const value: Store = {
    country,
    setCountry,
    fmt,
    price,
    history,
    changeAbs,
    changePct,
    roundId,
    timeLeft,
    entryPrice,
    balance,
    profit,
    winnings,
    bonus,
    selectedAmount,
    setSelectedAmount,
    amountOptions,
    activeBet,
    placeBet,
    recentBets,
    deposit,
    withdraw,
    toasts,
  }

  return <CryptoContext.Provider value={value}>{children}</CryptoContext.Provider>
}

export function useCrypto() {
  const ctx = useContext(CryptoContext)
  if (!ctx) throw new Error("useCrypto must be used within CryptoProvider")
  return ctx
}

export function formatClock(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export function timeLabels(count = 6) {
  const now = new Date()
  const labels: string[] = []
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 60_000)
    labels.push(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`)
  }
  return labels
}

export function priceLabels(history: number[], count = 7) {
  const min = Math.min(...history)
  const max = Math.max(...history)
  const pad = (max - min) * 0.1 || 100
  const lo = min - pad
  const hi = max + pad
  const labels: string[] = []
  for (let i = 0; i < count; i++) {
    const v = hi - ((hi - lo) / (count - 1)) * i
    labels.push(v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
  }
  return labels
}
