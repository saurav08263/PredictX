"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { X, Loader2 } from "lucide-react"
import { useCrypto } from "./store"

type Props = {
  mode: "deposit" | "withdraw"
  onClose: () => void
  defaultMethod?: string
}

const QUICK = [500, 1000, 2000, 5000]
const METHODS = ["UPI", "Paytm", "G Pay", "PhonePe", "BANK"]

export function AmountModal({ mode, onClose, defaultMethod = "UPI" }: Props) {
  const { country, deposit, withdraw, balance } = useCrypto()
  const [value, setValue] = useState("")
  const [method, setMethod] = useState(defaultMethod)
  const [loading, setLoading] = useState(false)
  const isDeposit = mode === "deposit"

  const submit = async () => {
    const n = Number(value)
    if (!n || n <= 0) return
    setLoading(true)
    if (isDeposit) {
      await deposit(n, method)
    } else {
      await withdraw(n, method)
    }
    setLoading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70" onClick={onClose}>
      <motion.div
        className="mx-auto w-full max-w-md rounded-t-2xl border-t border-border bg-panel p-4 pb-8"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
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

        <div className="flex items-center rounded-xl border border-border bg-card px-4 py-3 focus-within:border-bull/50 transition-colors">
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
            <motion.button
              key={q}
              onClick={() => setValue(String(q))}
              className={`rounded-lg border py-2 text-xs font-bold transition ${
                value === String(q) ? "border-bull bg-bull/15 text-bull" : "border-border bg-card text-foreground"
              }`}
              whileTap={{ scale: 0.93 }}
            >
              {country.symbol.trim()}
              {q.toLocaleString(country.locale)}
            </motion.button>
          ))}
        </div>

        {/* Payment method selector */}
        <p className="mt-4 mb-2 text-[10px] font-bold tracking-wide text-muted-foreground">
          PAYMENT METHOD
        </p>
        <div className="grid grid-cols-5 gap-1.5">
          {METHODS.map((m) => (
            <motion.button
              key={m}
              onClick={() => setMethod(m)}
              className={`rounded-lg border px-1 py-2 text-[10px] font-bold transition ${
                method === m
                  ? "border-bull bg-bull/15 text-bull"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {m}
            </motion.button>
          ))}
        </div>

        <motion.button
          onClick={submit}
          disabled={!value || Number(value) <= 0 || loading}
          className={`mt-4 w-full rounded-xl py-3.5 text-sm font-bold disabled:opacity-40 flex items-center justify-center gap-2 ${
            isDeposit ? "bg-bull text-black glow-green" : "border border-info bg-info/10 text-info"
          }`}
          whileTap={{ scale: 0.97 }}
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          {loading ? "PROCESSING..." : isDeposit ? `ADD MONEY VIA ${method}` : `WITHDRAW VIA ${method}`}
        </motion.button>
      </motion.div>
    </div>
  )
}
