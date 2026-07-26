"use client"

import { useState } from "react"
import {
  Bitcoin,
  Layers,
  ChevronUp,
  ChevronDown,
  TrendingUp,
  Timer,
  Copy,
  Plus,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Check,
} from "lucide-react"
import { PriceChart } from "../price-chart"
import { useCrypto, formatClock, timeLabels, priceLabels } from "../store"
import type { Tab } from "../app-shell"

const timeframes = ["1m", "5m", "15m", "1H", "4H", "1D"]

export function PredictScreen({ onNavigate }: { onNavigate: (t: Tab) => void }) {
  const {
    country,
    fmt,
    price,
    history,
    changeAbs,
    changePct,
    roundId,
    timeLeft,
    balance,
    profit,
    selectedAmount,
    setSelectedAmount,
    amountOptions,
    placeBet,
    activeBet,
  } = useCrypto()

  const [activeIdx, setActiveIdx] = useState<"crypto" | "gold">("crypto")
  const [timeframe, setTimeframe] = useState("1m")
  const [copied, setCopied] = useState(false)

  const up = changeAbs >= 0
  const yLabels = priceLabels(history)
  const xLabels = timeLabels()

  const copyId = () => {
    navigator.clipboard?.writeText(roundId).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-col gap-3 px-4 pb-4 pt-3">
      {/* index tabs */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setActiveIdx("crypto")}
          className={`flex items-center gap-2 rounded-xl border p-2.5 text-left transition ${
            activeIdx === "crypto" ? "border-bull/50 bg-bull/10" : "border-border bg-card"
          }`}
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-gold text-black">
            <Bitcoin className="size-5" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold">Crypto IDX</p>
            <p className="text-[10px] font-semibold text-bull">85% ACCURACY</p>
          </div>
        </button>
        <button
          onClick={() => setActiveIdx("gold")}
          className={`flex items-center gap-2 rounded-xl border p-2.5 text-left transition ${
            activeIdx === "gold" ? "border-gold/50 bg-gold/10" : "border-border bg-card"
          }`}
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-gold/20 text-gold">
            <Layers className="size-5" />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold">Gold IDX</p>
            <p className="text-[10px] font-semibold text-muted-foreground">81% ACCURACY</p>
          </div>
        </button>
      </div>

      {/* price + live */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-extrabold tabular-nums">
            {price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
            <span className="text-sm font-semibold text-muted-foreground">USDT</span>
          </p>
          <p className={`flex items-center gap-1 text-sm font-semibold ${up ? "text-bull" : "text-bear"}`}>
            {up ? "+" : ""}
            {changeAbs.toFixed(2)} ({changePct.toFixed(2)}%)
            {up ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </p>
        </div>
        <span className="flex items-center gap-1 rounded-md border border-bull/40 bg-bull/10 px-2 py-1 text-xs font-bold text-bull">
          ● LIVE
        </span>
      </div>

      {/* chart */}
      <div className="relative rounded-xl border border-border bg-panel p-2">
        <div className="flex">
          <div className="relative h-44 flex-1">
            <PriceChart points={history} className="h-full w-full" />
          </div>
          <div className="flex flex-col justify-between py-1 pl-1 text-right text-[9px] text-muted-foreground tabular-nums">
            {yLabels.map((l, i) => (
              <span key={i}>{l}</span>
            ))}
          </div>
        </div>
        <div className="mt-1 flex justify-between pr-14 text-[9px] text-muted-foreground tabular-nums">
          {xLabels.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </div>
      </div>

      {/* timeframes */}
      <div className="flex items-center gap-1.5">
        {timeframes.map((t) => (
          <button
            key={t}
            onClick={() => setTimeframe(t)}
            className={`flex-1 rounded-md border py-1.5 text-xs font-bold transition ${
              t === timeframe ? "border-bull bg-bull/15 text-bull" : "border-border bg-card text-muted-foreground"
            }`}
          >
            {t}
          </button>
        ))}
        <button className="rounded-md border border-border bg-card p-1.5 text-bull">
          <TrendingUp className="size-4" />
        </button>
      </div>

      {/* next round timer */}
      <div className="flex items-center justify-between rounded-xl border border-bull/40 bg-panel p-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full border border-bull/50 text-bull glow-green">
            <Timer className="size-5" />
          </span>
          <div className="leading-tight">
            <p className="text-[10px] font-semibold tracking-wide text-muted-foreground">NEXT ROUND ENDS IN</p>
            <p className="text-2xl font-extrabold text-bull text-glow-green tabular-nums">{formatClock(timeLeft)}</p>
          </div>
        </div>
        <div className="text-right leading-tight">
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground">ROUND ID</p>
          <button onClick={copyId} className="flex items-center gap-1 text-sm font-bold">
            {roundId} {copied ? <Check className="size-3.5 text-bull" /> : <Copy className="size-3.5 text-muted-foreground" />}
          </button>
        </div>
      </div>

      {/* balance + profit */}
      <div className="flex items-center justify-between">
        <div className="leading-tight">
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground">YOUR BALANCE</p>
          <p className="flex items-center gap-2 text-lg font-bold">
            {fmt(balance, 2)}
            <button
              onClick={() => onNavigate("wallet")}
              aria-label="Add funds"
              className="flex size-5 items-center justify-center rounded-md bg-bull/20 text-bull"
            >
              <Plus className="size-3.5" />
            </button>
          </p>
        </div>
        <div className="text-right leading-tight">
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground">TOTAL PROFIT</p>
          <p className="text-lg font-bold text-bull">{fmt(profit)}</p>
        </div>
      </div>

      {/* amount selector */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-semibold tracking-wide text-muted-foreground">SELECT AMOUNT</p>
          <span className="flex items-center gap-1 text-[11px] font-bold text-gold">
            <Zap className="size-3.5" /> QUICK BET
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {amountOptions.map((a) => (
            <button
              key={a}
              onClick={() => setSelectedAmount(a)}
              className={`flex-1 rounded-md border py-2 text-xs font-bold transition ${
                a === selectedAmount ? "border-bull bg-bull/15 text-bull" : "border-border bg-card text-foreground"
              }`}
            >
              {country.symbol.trim()}
              {a.toLocaleString(country.locale)}
            </button>
          ))}
        </div>
      </div>

      {/* active bet banner */}
      {activeBet && (
        <div
          className={`flex items-center justify-between rounded-xl border px-3 py-2 text-sm font-bold ${
            activeBet.dir === "UP" ? "border-bull/50 bg-bull/10 text-bull" : "border-bear/50 bg-bear/10 text-bear"
          }`}
        >
          <span className="flex items-center gap-1">
            {activeBet.dir === "UP" ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
            {activeBet.dir} prediction live
          </span>
          <span>
            {country.symbol.trim()}
            {activeBet.amount.toLocaleString(country.locale)} · resolves in {formatClock(timeLeft)}
          </span>
        </div>
      )}

      {/* up / down */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => placeBet("UP")}
          disabled={!!activeBet}
          className="flex items-center justify-center gap-2 rounded-xl bg-bull py-3 text-black glow-green transition active:scale-95 disabled:opacity-40"
        >
          <div className="text-left leading-none">
            <p className="text-xl font-extrabold">UP</p>
            <p className="text-[10px] font-semibold">1.8x RETURN</p>
          </div>
          <ArrowUpRight className="size-6" />
        </button>
        <button
          onClick={() => placeBet("DOWN")}
          disabled={!!activeBet}
          className="flex items-center justify-center gap-2 rounded-xl bg-bear py-3 text-white glow-red transition active:scale-95 disabled:opacity-40"
        >
          <div className="text-left leading-none">
            <p className="text-xl font-extrabold">DOWN</p>
            <p className="text-[10px] font-semibold">1.8x RETURN</p>
          </div>
          <ArrowDownRight className="size-6" />
        </button>
      </div>
    </div>
  )
}
