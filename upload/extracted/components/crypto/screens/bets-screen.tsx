"use client"

import { ArrowUpRight, ArrowDownRight, Trophy } from "lucide-react"
import { PriceChart } from "../price-chart"
import { useCrypto, formatClock, timeLabels, priceLabels } from "../store"

export function BetsScreen() {
  const { country, fmt, history, roundId, timeLeft, entryPrice, activeBet, recentBets } = useCrypto()

  const yLabels = priceLabels(history, 4)
  const xLabels = timeLabels()
  const stake = activeBet?.amount ?? 0
  const selectedDir = activeBet?.dir ?? "—"

  return (
    <div className="flex flex-col gap-4 px-4 pb-4 pt-3">
      {/* Live round */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="size-3 animate-pulse rounded-full bg-bear" />
            <h2 className="font-bold tracking-wide">LIVE ROUND</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Round ID: <span className="font-bold text-foreground">{roundId}</span>
          </p>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <div className="leading-tight">
            <p className="text-[10px] font-semibold tracking-wide text-muted-foreground">ENTRY PRICE</p>
            <p className="text-xl font-bold tabular-nums">
              {entryPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="flex flex-col items-center leading-tight">
            <span className="flex size-14 flex-col items-center justify-center rounded-full border-2 border-bull text-bull glow-green">
              <span className="text-[8px] font-semibold">TIME LEFT</span>
              <span className="text-base font-extrabold tabular-nums">{formatClock(timeLeft)}</span>
            </span>
          </div>
          <div className="text-right leading-tight">
            <p className="text-[10px] font-semibold tracking-wide text-muted-foreground">SELECTED</p>
            <p
              className={`flex items-center gap-1 text-lg font-bold ${
                selectedDir === "DOWN" ? "text-bear" : "text-bull"
              }`}
            >
              {selectedDir === "DOWN" ? (
                <ArrowDownRight className="size-5" />
              ) : selectedDir === "UP" ? (
                <ArrowUpRight className="size-5" />
              ) : null}
              {selectedDir}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-panel p-2">
          <div className="flex">
            <div className="h-40 flex-1">
              <PriceChart points={history} className="h-full w-full" />
            </div>
            <div className="flex flex-col justify-between py-1 pl-1 text-right text-[9px] text-muted-foreground tabular-nums">
              {yLabels.map((l, i) => (
                <span key={i}>{l}</span>
              ))}
            </div>
          </div>
          <div className="mt-1 flex justify-between pr-12 text-[9px] text-muted-foreground tabular-nums">
            {xLabels.map((l, i) => (
              <span key={i}>{l}</span>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <div className="leading-tight">
            <p className="text-[10px] font-semibold tracking-wide text-muted-foreground">YOU WILL GET</p>
            <p className="text-lg font-bold text-bull">
              {fmt(Math.round(stake * 1.8))} <span className="text-xs text-muted-foreground">(1.8x)</span>
            </p>
          </div>
          <div className="text-right leading-tight">
            <p className="text-[10px] font-semibold tracking-wide text-muted-foreground">YOUR BET</p>
            <p className="text-lg font-bold">{fmt(stake)}</p>
          </div>
        </div>
      </div>

      {/* Recent bets */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="size-5 text-gold" />
            <h2 className="font-bold tracking-wide">RECENT BETS</h2>
          </div>
          <span className="text-xs font-bold text-bull">LIVE</span>
        </div>
        {recentBets.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No bets yet — place your first prediction!</p>
        ) : (
          <ul className="flex flex-col">
            {recentBets.map((b) => {
              const won = b.status === "WON"
              return (
                <li
                  key={b.id}
                  className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-2 border-b border-border/60 py-2.5 text-sm last:border-0"
                >
                  <span className={`flex items-center gap-1 font-bold ${won ? "text-bull" : "text-bear"}`}>
                    {b.dir === "UP" ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
                    {b.dir}
                  </span>
                  <span className="font-semibold">
                    {country.symbol.trim()}
                    {b.amount.toLocaleString(country.locale)}
                  </span>
                  <span className="text-muted-foreground">{b.mult}x</span>
                  <span className={`font-bold ${won ? "text-bull" : "text-bear"}`}>{b.status}</span>
                  <span
                    className={`rounded-md px-2 py-1 text-right font-bold ${won ? "bg-bull/15 text-bull" : "text-bear"}`}
                  >
                    {country.symbol.trim()}
                    {b.payout.toLocaleString(country.locale)}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
