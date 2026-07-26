"use client"

import { useState, useEffect } from "react"
import { Award } from "lucide-react"

export function BetsScreen() {
  const [bets, setBets] = useState<any[]>([])

  const loadBets = () => {
    const savedBets = JSON.parse(localStorage.getItem("crypto_bets") || "[]")
    setBets(savedBets)
  }

  useEffect(() => {
    loadBets()
    // Listen for bets updated event from prediction screen
    window.addEventListener("betsUpdated", loadBets)
    return () => window.removeEventListener("betsUpdated", loadBets)
  }, [])

  if (bets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-zinc-500 px-6 text-center">
        <Award className="size-12 text-zinc-700 mb-3 animate-pulse" />
        <h3 className="text-white font-bold text-sm tracking-wider uppercase">Recent Bets</h3>
        <p className="text-xs text-zinc-500 mt-1">No bets yet — place your first prediction!</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-[#0b0e11] min-h-screen pb-24 text-white font-sans">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-black tracking-wider uppercase text-zinc-400">Your Bet History</h2>
        <button 
          onClick={() => { localStorage.removeItem("crypto_bets"); loadBets(); }}
          className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2 py-1 rounded transition active:scale-95"
        >
          Clear History
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {bets.map((bet) => (
          <div key={bet.id} className="bg-[#12161a] border border-white/5 p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="size-8 bg-zinc-800 rounded-full flex items-center justify-center text-sm">
                {bet.coinIcon}
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xs">{bet.coinId.replace("USDT", "")}</span>
                  <span className={`text-[9px] font-black px-1 rounded ${
                    bet.direction === "UP" 
                      ? "bg-emerald-500/10 text-emerald-400" 
                      : "bg-rose-500/10 text-rose-400"
                  }`}>
                    {bet.direction}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 font-medium mt-0.5">{bet.timestamp} • {bet.duration}</p>
              </div>
            </div>

            <div className="text-right">
              <p className={`text-xs font-black tabular-nums ${bet.status === "WIN" ? "text-emerald-400" : "text-rose-400"}`}>
                {bet.status === "WIN" ? `+$${bet.profit.toFixed(2)}` : `-$${Math.abs(bet.profit).toFixed(2)}`}
              </p>
              <p className="text-[9px] text-zinc-500 mt-0.5 font-bold tabular-nums">Amt: ₮{bet.amount}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}