"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { 
  ArrowLeft, 
  Star, 
  Bell, 
  ChevronDown, 
  Plus, 
  ChevronRight 
} from "lucide-react"
import { useCrypto, COINS, formatPrice } from "../store"

// 🌎 Country-based configurations for Currency, Symbol, Limits, and Presets
const COUNTRY_CONFIGS: Record<string, { currency: string, symbol: string, min: number, max: number, presets: number[] }> = {
  IN: { currency: "INR", symbol: "₹", min: 50, max: 100000, presets: [50, 100, 200, 500, 1000] },
  US: { currency: "USD", symbol: "$", min: 1, max: 5000, presets: [1, 5, 10, 25, 50] },
  EU: { currency: "EUR", symbol: "€", min: 1, max: 5000, presets: [1, 5, 10, 20, 50] },
  GB: { currency: "GBP", symbol: "£", min: 1, max: 4000, presets: [1, 5, 10, 20, 50] },
}

export default function PredictScreen({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { 
    prices = {}, 
    balance = 0, 
    selectedCoin, 
    setSelectedCoin, 
    mounted,
    setBalance // 🪙 Imported the balance state modifier from store
  } = useCrypto()
  
  const [duration, setDuration] = useState<string>("10s")
  
  // 🌎 Dynamic Country & Currency Config States
  const [config, setConfig] = useState(COUNTRY_CONFIGS.IN)
  const [amount, setAmount] = useState<number>(50) 
  
  // ⏱️ Trading States
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [isTradeActive, setIsTradeActive] = useState<boolean>(false)
  const [tradeDirection, setTradeDirection] = useState<"UP" | "DOWN" | null>(null)
  const [entryPrice, setEntryPrice] = useState<number>(0)
  const [tradeResult, setTradeResult] = useState<{ status: "WIN" | "LOSS"; profit: number } | null>(null)
  const [initialDuration, setInitialDuration] = useState<number>(10)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const priceRef = useRef<number>(64892.58)

  // 📈 Live Area Chart Coordinates
  const [chartPoints, setChartPoints] = useState<number[]>([
    45, 48, 42, 55, 50, 48, 52, 58, 54, 62, 65, 60, 63, 68, 62, 65, 72, 70, 75, 78, 72, 74, 85, 83
  ])

  const currentCoinId = selectedCoin?.id || "BTCUSDT"
  const currentCoinPrice = prices[currentCoinId] || 64892.58

  // 🔄 Load user selected country from signup/login step
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCountry = localStorage.getItem("user_country") || "IN"
      const activeConfig = COUNTRY_CONFIGS[savedCountry] || COUNTRY_CONFIGS.IN
      setConfig(activeConfig)
      setAmount(activeConfig.min) // Auto-set minimum limit based on chosen country
    }
  }, [])

  // Keep latest price in a ref to prevent unnecessary timer component updates
  useEffect(() => {
    priceRef.current = currentCoinPrice
  }, [currentCoinPrice])

  // Chart tick animation logic
  useEffect(() => {
    if (!mounted || currentCoinPrice === 0) return
    setChartPoints(prev => {
      const next = [...prev.slice(1)]
      const lastPoint = prev[prev.length - 1] || 50
      const change = (Math.random() - 0.49) * 5
      const nextPoint = Math.max(15, Math.min(88, lastPoint + change))
      next.push(nextPoint)
      return next
    })
  }, [currentCoinPrice, mounted])

  // ⏱️ Trade Expiry & Countdown Engine
  useEffect(() => {
    let intervalId: NodeJS.Timeout

    if (isTradeActive && timeLeft > 0) {
      const startTime = Date.now()
      const endTime = startTime + timeLeft * 1000

      intervalId = setInterval(() => {
        const now = Date.now()
        const remainingMs = endTime - now
        const remainingSeconds = Math.ceil(remainingMs / 1000)

        if (remainingSeconds <= 0) {
          clearInterval(intervalId)
          setTimeLeft(0)

          const finalPrice = Number(priceRef.current)
          const startPrice = Number(entryPrice)
          
          let isWin = false

          if (tradeDirection === "UP" && finalPrice >= startPrice) {
            isWin = true
          } else if (tradeDirection === "DOWN" && finalPrice <= startPrice) {
            isWin = true
          }

          if (finalPrice === startPrice) {
            isWin = Math.random() > 0.5 
          }

          const calculatedProfit = isWin ? amount * 0.9 : -amount

          setTradeResult({
            status: isWin ? "WIN" : "LOSS",
            profit: calculatedProfit
          })

          // 🪙 Update Global Wallet Balance instantly on resolution
          if (setBalance) {
            if (isWin) {
              // Return original stake amount + 90% profit payout
              const payout = amount + (amount * 0.9);
              setBalance(prev => prev + payout);
            }
            // If LOSS, balance remains unchanged since stake was deducted at start
          }
          
          try {
            const currentBets = JSON.parse(localStorage.getItem("crypto_bets") || "[]")
            
            const newBetHistoryItem = {
              id: Date.now().toString(),
              coinIcon: selectedCoin?.icon || "₿",
              coinId: currentCoinId,
              direction: tradeDirection,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              duration: duration,
              status: isWin ? "WIN" : "LOSS",
              profit: calculatedProfit,
              amount: amount.toString()
            }

            const updatedBets = [newBetHistoryItem, ...currentBets]
            localStorage.setItem("crypto_bets", JSON.stringify(updatedBets))

            window.dispatchEvent(new Event("betsUpdated"))
          } catch (error) {
            console.error("Error saving bet history:", error)
          }

          setIsTradeActive(false) 
        } else {
          setTimeLeft(remainingSeconds)
        }
      }, 200)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [isTradeActive, entryPrice, tradeDirection, amount, duration, selectedCoin, currentCoinId, setBalance])

  // 🚀 Trade Init Handler with dynamic boundaries verification
  const handlePlaceBet = (dir: "UP" | "DOWN") => {
    if (isTradeActive) return
    
    if (amount < config.min) {
      alert(`Minimum bet amount is ${config.symbol}${config.min}`);
      return;
    }
    if (amount > config.max) {
      alert(`Maximum bet amount is ${config.symbol}${config.max.toLocaleString()}`);
      return;
    }

    // 🪙 Verify available demo funds before executing trade
    if (balance < amount) {
      alert("Insufficient Balance! Please refresh your demo balance.");
      return;
    }

    // Deduct stake amount immediately when trade starts
    if (setBalance) {
      setBalance(prev => prev - amount);
    }

    setTradeResult(null) 
    const seconds = duration === "1m" ? 60 : parseInt(duration) || 10
    
    setInitialDuration(seconds)
    setTimeLeft(seconds)
    setTradeDirection(dir)
    setEntryPrice(currentCoinPrice) 
    setIsTradeActive(true)
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0b0e11] text-zinc-500 font-black text-xs uppercase tracking-widest">
        Loading Trading Environment...
      </div>
    )
  }

  const widthBetween = 100 / (chartPoints.length - 1)
  const pathD = chartPoints.reduce((acc, p, i) => acc + `${i === 0 ? "M" : "L"} ${i * widthBetween} ${100 - p}`, "")
  const areaD = `${pathD} L 100 100 L 0 100 Z`

  const formatSingleClock = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex flex-col bg-[#0b0e11] min-h-screen text-white select-none pb-24 font-sans">
      
      {/* 1. TOP NAVBAR */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0b0e11] border-b border-white/5">
        <div className="flex items-center gap-3">
          <ArrowLeft className="size-5 text-zinc-400 cursor-pointer hover:text-white" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-black bg-amber-500 text-black size-6 rounded-full flex items-center justify-center">
              {selectedCoin?.icon || "₿"}
            </span>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-sm">{selectedCoin?.label || "Bitcoin"}</span>
                <span className="text-[9px] bg-emerald-500 text-black px-0.5 py-px rounded font-black">✓</span>
              </div>
              <p className="text-[10px] text-zinc-500 font-bold tracking-wider">{currentCoinId} / USDT</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-zinc-400">
          <Star className="size-5 hover:text-amber-400 cursor-pointer" />
          <Bell className="size-5 hover:text-white cursor-pointer" />
        </div>
      </div>

      {/* 2. LIVE PRICE INDICATOR */}
      <div className="px-4 pt-4 pb-1">
        <div className="flex items-baseline justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight tabular-nums text-white">
              {formatPrice(currentCoinPrice, currentCoinId)}
            </h1>
            <p className="text-xs font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
              +{formatPrice(currentCoinPrice * 0.0197, currentCoinId)} (+1.97%) <span>▲</span>
            </p>
          </div>
          <div className="bg-[#10b981] text-black font-black text-xs px-2.5 py-1 rounded-md tracking-wide">
            +1.97%
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4 bg-white/[0.01] border border-white/5 p-2 rounded-xl text-[10px] font-bold text-zinc-500">
          <div>
            <p>24H High</p>
            <p className="text-zinc-200 mt-0.5 tabular-nums">65,240.75</p>
          </div>
          <div>
            <p>24H Low</p>
            <p className="text-zinc-200 mt-0.5 tabular-nums">63,248.19</p>
          </div>
          <div>
            <p>24H Vol</p>
            <p className="text-zinc-200 mt-0.5 tabular-nums">32.65 B</p>
          </div>
        </div>
      </div>

      {/* 🪙 3. THREE COIN QUICK SWITCHER BAR */}
      <div className="px-4 my-2">
        <div className="grid grid-cols-3 gap-1.5 bg-[#12161a] p-1 rounded-xl border border-white/5">
          {COINS.map((c) => {
            const isSelected = currentCoinId === c.id
            return (
              <button
                key={c.id}
                onClick={() => !isTradeActive && setSelectedCoin && setSelectedCoin(c)}
                disabled={isTradeActive}
                className={`py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1 ${
                  isSelected ? "bg-[#1f2630] text-emerald-400 border border-emerald-500/20 shadow-md" : "text-zinc-400 hover:text-white"
                } ${isTradeActive ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                <span>{c.icon}</span>
                <span>{c.id.replace("USDT", "")}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 📊 4. TIMEFRAMES */}
      <div className="flex items-center justify-between px-4 mb-2 border-b border-white/5 pb-2 text-xs font-bold text-zinc-400">
        {["1H", "4H", "1D", "1M", "1W"].map((tf) => (
          <span key={tf} className={`px-3 py-1 rounded-md ${tf === "1D" ? "bg-[#181e25] text-emerald-400 font-black" : ""}`}>
            {tf}
          </span>
        ))}
        <span className="text-zinc-600 text-sm font-black pr-1">⦚⦚</span>
      </div>

      {/* 5. AREA CHART WINDOW */}
      <div className="h-52 w-full relative px-1 bg-gradient-to-b from-transparent to-zinc-950/30">
        <div className="absolute right-3 inset-y-2 flex flex-col justify-between text-[9px] font-black text-zinc-600 pointer-events-none z-10 text-right">
          <p>66,000</p>
          <p>65,000</p>
          <p>64,000</p>
          <p>63,000</p>
          <p>62,000</p>
          <p>61,000</p>
        </div>

        <div className="absolute inset-x-0 top-[38%] border-t border-dashed border-emerald-500/20 flex items-center justify-end pr-14 z-10">
          <span className="bg-[#10b981] text-black text-[9px] font-black px-1.5 py-0.5 rounded shadow-lg">
            {formatPrice(currentCoinPrice, currentCoinId)}
          </span>
        </div>

        {isTradeActive && (
          <div className="absolute inset-x-0 top-[45%] border-t-2 border-dotted border-amber-400 z-20 flex items-center pl-4">
            <span className="bg-amber-400 text-black text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
              ENTRY: ${formatPrice(entryPrice, currentCoinId)} ({tradeDirection})
            </span>
          </div>
        )}

        <div className="w-[88%] h-36 mt-4 relative">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="waveAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d={areaD} fill="url(#waveAreaGrad)" className="transition-all duration-300" />
            <path d={pathD} fill="none" stroke="#10b981" strokeWidth="1.5" className="transition-all duration-300" />
          </svg>
        </div>
      </div>

      {/* POPUP BANNER FOR RESULT */}
      {tradeResult && (
        <div className={`mx-4 mb-4 p-4 rounded-xl border text-center font-black text-sm uppercase tracking-wider flex items-center justify-between px-6 transition-all duration-500 shadow-2xl ${
          tradeResult.status === "WIN" 
            ? "bg-emerald-950/80 border-emerald-500 text-emerald-400 shadow-emerald-950/50" 
            : "bg-rose-950/80 border-rose-500 text-rose-400 shadow-rose-950/50"
        }`}>
          <div className="flex flex-col items-start">
            <span className="text-[10px] text-zinc-400 font-bold tracking-normal text-left">Trade Finished</span>
            <span className="text-base mt-0.5">
              {tradeResult.status === "WIN" ? "🎉 WIN PROFIT!" : "💥 LOSS TRADE"}
            </span>
          </div>
          <span className="text-xl font-black tabular-nums">
            {tradeResult.status === "WIN" ? `+${config.symbol}${tradeResult.profit.toFixed(2)}` : `-${config.symbol}${Math.abs(tradeResult.profit).toFixed(2)}`}
          </span>
        </div>
      )}

      {/* 6. LOWER CONTROL BOX */}
      <div className="bg-[#12161a] border-t border-white/5 rounded-t-3xl p-4 flex flex-col gap-4 shadow-2xl">
        
        <div>
          <p className="text-[10px] font-black text-zinc-500 tracking-wider mb-2 uppercase">Select Time</p>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {["5s", "10s", "30s", "1m"].map((t) => (
              <button
                key={t}
                onClick={() => !isTradeActive && setDuration(t)}
                disabled={isTradeActive}
                className={`rounded-xl px-4 py-2 text-xs font-black shrink-0 border transition-all ${
                  duration === t ? "bg-[#10b981] text-black border-emerald-500" : "bg-[#181e25] border-white/5 text-zinc-400"
                } ${isTradeActive ? "opacity-30 cursor-not-allowed" : ""}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-5 gap-3 items-center">
          
          {/* Circular Countdown Clock */}
          <div className="col-span-2 flex flex-col items-center justify-center bg-[#181e25] rounded-2xl p-3 border border-white/5 relative h-[145px]">
            <svg className="w-14 h-14 transform -rotate-90">
              <circle cx="28" cy="28" r="24" className="stroke-zinc-800 stroke-2 fill-none" />
              <motion.circle 
                cx="28" cy="28" r="24" 
                className="stroke-[#10b981] stroke-[2.5] fill-none" 
                strokeDasharray="151"
                animate={{ strokeDashoffset: isTradeActive ? (151 * (initialDuration - timeLeft)) / initialDuration : 151 }}
                transition={{ duration: 0.2, ease: "linear" }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center inset-0 mt-2">
              <span className="text-sm font-black tracking-tight tabular-nums">
                {formatSingleClock(timeLeft)}
              </span>
              <span className="text-[8px] font-bold text-zinc-500 tracking-wide uppercase">
                {isTradeActive ? "Running" : "Ready"}
              </span>
            </div>
          </div>

          <div className="col-span-3 flex flex-col gap-2">
            <div className="bg-[#181e25] rounded-xl border border-white/5 px-3 py-2 flex items-center justify-between">
              <div>
                <p className="text-[8px] font-black text-zinc-500 uppercase tracking-wider">Amount ({config.currency})</p>
                <input 
                  type="text" 
                  value={amount} 
                  disabled={isTradeActive}
                  onChange={(e) => {
                    const val = Number(e.target.value) || 0;
                    setAmount(val);
                  }}
                  className="bg-transparent text-sm font-black text-white w-24 focus:outline-none mt-0.5 tabular-nums disabled:opacity-50"
                />
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-800/50 px-2 py-1 rounded-lg border border-white/5 text-xs font-bold text-zinc-300">
                <span className="text-emerald-400 font-black text-xs">{config.symbol}</span>
                <ChevronDown className="size-3.5 text-zinc-500" />
              </div>
            </div>

            <div className="grid grid-cols-5 gap-1">
              {config.presets.map((v) => (
                <button
                  key={v}
                  onClick={() => !isTradeActive && setAmount(v)}
                  disabled={isTradeActive}
                  className={`py-1.5 rounded-md text-[10px] font-black border transition-all ${
                    amount === v ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/40" : "bg-[#181e25] border-white/5 text-zinc-400"
                  } ${isTradeActive ? "opacity-30 cursor-not-allowed" : ""}`}
                >
                  {config.symbol}{v}
                </button>
              ))}
            </div>

            <div className="w-full mt-1.5 px-0.5">
              <input
                type="range"
                min={config.min}
                max={config.max}
                step={config.min}
                disabled={isTradeActive}
                value={amount}
                onChange={(e) => !isTradeActive && setAmount(Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#10b981] disabled:opacity-50"
                style={{
                  background: `linear-gradient(to right, #10b981 0%, #10b981 ${((amount - config.min) / (config.max - config.min)) * 100}%, #27272a ${((amount - config.min) / (config.max - config.min)) * 100}%, #27272a 100%)`
                }}
              />
              <div className="flex justify-between text-[9px] font-black text-zinc-500 mt-1">
                <span>{config.symbol}{config.min}</span>
                <span>{config.symbol}{config.max.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 px-1 mt-0.5">
              <span>Available Balance</span>
              <span className="text-zinc-300 tabular-nums font-black flex items-center gap-0.5">
                {config.symbol}{(balance || 0).toLocaleString()}
                <Plus className="size-2.5 bg-[#10b981] text-black rounded-full p-px ml-0.5 cursor-pointer" />
              </span>
            </div>
          </div>
        </div>

        {/* UP & DOWN Switches */}
        <div className="grid grid-cols-2 gap-3 items-center mt-1">
          <button
            onClick={() => handlePlaceBet("UP")}
            disabled={isTradeActive}
            className={`rounded-xl bg-[#10b981] py-3 text-center transition active:scale-95 ${
              isTradeActive ? "opacity-30 cursor-not-allowed" : "hover:brightness-105 shadow-lg shadow-emerald-950/20"
            }`}
          >
            <p className="text-sm font-black tracking-widest text-black flex items-center justify-center gap-1">↑ UP</p>
            <p className="text-[9px] font-black text-black/60 tracking-tight mt-0.5">Return: 90%</p>
          </button>

          <button
            onClick={() => handlePlaceBet("DOWN")}
            disabled={isTradeActive}
            className={`rounded-xl bg-[#ef4444] py-3 text-center transition active:scale-95 ${
              isTradeActive ? "opacity-30 cursor-not-allowed" : "hover:brightness-105 shadow-lg shadow-rose-950/20"
            }`}
          >
            <p className="text-sm font-black tracking-widest text-white flex items-center justify-center gap-1">↓ DOWN</p>
            <p className="text-[9px] font-black text-white/70 tracking-tight mt-0.5">Return: 90%</p>
          </button>
        </div>

        <div className="w-full p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-950/10 flex flex-col items-center justify-center text-center mt-1">
          <div className="flex items-center gap-1 text-[#10b981] font-extrabold text-[12px] tracking-wide">
            <span>⚡</span> START PREDICTING & WIN BIG!
          </div>
          <p className="text-zinc-500 text-[10px] mt-0.5 font-bold">
            Bet between {config.symbol}{config.min} to {config.symbol}{config.max.toLocaleString()} and start earning now.
          </p>
        </div>

      </div>

    </div>
  )
}