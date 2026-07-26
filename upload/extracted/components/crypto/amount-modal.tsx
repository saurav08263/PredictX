"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { useCrypto } from "./store"

type Props = {
  mode: "deposit" | "withdraw"
  onClose: () => void
}

const QUICK = [500, 1000, 2000, 5000]

export function AmountModal({ mode, onClose }: Props) {
  const { country, deposit, withdraw, balance } = useCrypto()
  const [value, setValue] = useState("")
  const isDeposit = mode === "deposit"

  const submit = () => {
    const n = Number(value)
    if (!n || n <= 0) return
    if (isDeposit) deposit(n)
    else withdraw(n)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70" onClick={onClose}>
      <div
        className="mx-auto w-full max-w-md rounded-t-2xl border-t border-border bg-panel p-4 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold tracking-wide">{isDeposit ? "DEPOSIT FUNDS" : "WITHDRAW FUNDS"}</h2>
          <button onClick={onClose} aria-label="Close">
            <X className="size-5 text-muted-foreground" />
          </button>
        </div>

        <p className="mb-2 text-[11px] font-semibold tracking-wide text-muted-foreground">
          AVAILABLE: <span className="text-foreground">{country.symbol}{balance.toLocaleString(country.locale)}</span>
        </p>

        <div className="flex items-center rounded-xl border border-border bg-card px-4 py-3">
          <span className="text-xl font-bold text-muted-foreground">{country.symbol.trim()}</span>
          <input
            autoFocus
            inputMode="numeric"
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="0"
            className="w-full bg-transparent px-2 text-2xl font-extrabold outline-none"
          />
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2">
          {QUICK.map((q) => (
            <button
              key={q}
              onClick={() => setValue(String(q))}
              className="rounded-lg border border-border bg-card py-2 text-xs font-bold text-foreground"
            >
              {country.symbol.trim()}
              {q.toLocaleString(country.locale)}
            </button>
          ))}
        </div>

        <button
          onClick={submit}
          className={`mt-4 w-full rounded-xl py-3.5 text-sm font-bold ${
            isDeposit ? "bg-bull text-black glow-green" : "border border-info bg-info/10 text-info"
          }`}
        >
          {isDeposit ? "ADD MONEY" : "REQUEST WITHDRAWAL"}
        </button>
      </div>
    </div>
  )
}
