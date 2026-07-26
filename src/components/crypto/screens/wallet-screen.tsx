"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  ShieldCheck,
  Zap,
  Lock,
  TrendingDown,
  Clock,
  Trophy,
  Coins,
} from "lucide-react"
import { useCrypto } from "../store"
import { AmountModal } from "../amount-modal"

const providers = ["UPI", "Paytm", "G Pay", "PhonePe", "BANK"]

function getTransactionIcon(type: string) {
  switch (type) {
    case "DEPOSIT":
      return <ArrowDownToLine className="size-4 text-bull" />
    case "WITHDRAWAL":
      return <ArrowUpFromLine className="size-4 text-info" />
    case "BET_PLACED":
      return <Coins className="size-4 text-gold" />
    case "BET_WON":
      return <Trophy className="size-4 text-bull" />
    case "BET_LOST":
      return <TrendingDown className="size-4 text-bear" />
    default:
      return <Wallet className="size-4 text-muted-foreground" />
  }
}

function getTransactionLabel(type: string) {
  switch (type) {
    case "DEPOSIT":
      return "Deposit"
    case "WITHDRAWAL":
      return "Withdrawal"
    case "BET_PLACED":
      return "Bet Placed"
    case "BET_WON":
      return "Bet Won"
    case "BET_LOST":
      return "Bet Lost"
    default:
      return type || "Transaction"
  }
}

function getTransactionColor(type: string) {
  switch (type) {
    case "DEPOSIT":
    case "BET_WON":
      return "text-bull"
    case "WITHDRAWAL":
    case "BET_PLACED":
    case "BET_LOST":
      return "text-bear"
    default:
      return "text-foreground"
  }
}

function timeAgo(dateStr: string, mounted: boolean) {
  if (!mounted || !dateStr) return "Just now"
  try {
    const now = Date.now()
    const then = new Date(dateStr).getTime()
    if (isNaN(then)) return "Just now"
    const diff = Math.max(0, now - then)
    if (diff < 60_000) return "Just now"
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
    return `${Math.floor(diff / 86_400_000)}d ago`
  } catch {
    return "Just now"
  }
}

export function WalletScreen() {
  const { fmt, mounted, balance, winnings, bonus, transactions = [], country } = useCrypto()
  const [modal, setModal] = useState<{ mode: "deposit" | "withdraw"; method?: string } | null>(null)

  // Safe checks for country variables
  const currencySymbol = country?.symbol?.trim() || "₹"
  const currentLocale = country?.locale || "en-IN"
  const safeTransactions = transactions || []

  return (
    <motion.div
      className="flex flex-col gap-4 px-4 pb-4 pt-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Balance hero */}
      <motion.div
        className="rounded-2xl border border-bull/30 bg-card p-5 text-center glow-green"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <p className="text-[11px] font-semibold tracking-wide text-muted-foreground">TOTAL BALANCE</p>
        <p className="mt-1 text-4xl font-extrabold text-glow-green">{fmt ? fmt(balance || 0, 2) : `₹${(balance || 0).toLocaleString(currentLocale)}`}</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <motion.button
            onClick={() => setModal({ mode: "deposit" })}
            className="flex items-center justify-center gap-2 rounded-xl bg-bull py-3 text-sm font-bold text-black"
            whileTap={{ scale: 0.95 }}
          >
            <ArrowDownToLine className="size-4" /> DEPOSIT
          </motion.button>
          <motion.button
            onClick={() => setModal({ mode: "withdraw" })}
            className="flex items-center justify-center gap-2 rounded-xl border border-info bg-info/10 py-3 text-sm font-bold text-info"
            whileTap={{ scale: 0.95 }}
          >
            <ArrowUpFromLine className="size-4" /> WITHDRAW
          </motion.button>
        </div>
      </motion.div>

      {/* Breakdown */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          className="rounded-xl border border-border bg-card p-4"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground">WINNINGS</p>
          <p className="mt-1 text-xl font-bold text-bull">{fmt ? fmt(winnings || 0) : `₹${(winnings || 0).toLocaleString(currentLocale)}`}</p>
        </motion.div>
        <motion.div
          className="rounded-xl border border-border bg-card p-4"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground">BONUS</p>
          <p className="mt-1 text-xl font-bold text-gold">{fmt ? fmt(bonus || 0) : `₹${(bonus || 0).toLocaleString(currentLocale)}`}</p>
        </motion.div>
      </div>

      {/* Payment methods */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <Wallet className="size-5 text-gold" />
          <h2 className="font-bold tracking-wide">PAYMENT METHODS</h2>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {providers.map((p) => (
            <motion.button
              key={p}
              onClick={() => setModal({ mode: "deposit", method: p })}
              className="rounded-md border border-border bg-panel py-2.5 text-center text-[10px] font-bold text-muted-foreground transition active:scale-95 hover:border-bull hover:text-bull"
              whileTap={{ scale: 0.95 }}
            >
              {p}
            </motion.button>
          ))}
        </div>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">
          Tap any method to deposit instantly
        </p>
      </div>

      {/* Transaction history */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="size-5 text-info" />
            <h2 className="font-bold tracking-wide">TRANSACTIONS</h2>
          </div>
          <span className="text-[10px] font-bold text-bull">{safeTransactions.length} TOTAL</span>
        </div>
        {safeTransactions.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No transactions yet — deposit to get started!
          </p>
        ) : (
          <ul className="flex max-h-72 flex-col overflow-y-auto custom-scrollbar">
            {safeTransactions.map((tx, i) => (
              <motion.li
                key={tx?.id || i}
                className="flex items-center gap-3 border-b border-border/60 py-3 last:border-0"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <span className="flex size-9 items-center justify-center rounded-full bg-muted">
                  {getTransactionIcon(tx?.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold">{getTransactionLabel(tx?.type)}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {timeAgo(tx?.createdAt || tx?.date, mounted)}
                    {tx?.method && ` · ${tx.method}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${getTransactionColor(tx?.type)}`}>
                    {tx?.type === "DEPOSIT" || tx?.type === "BET_WON" || tx?.type === "WIN" ? "+" : "-"}
                    {currencySymbol}{(tx?.amount || 0).toLocaleString(currentLocale)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Bal: {currencySymbol}{(tx?.balanceAfter || tx?.amount || 0).toLocaleString(currentLocale)}
                  </p>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </div>

      {/* Trust strip */}
      <div className="flex items-center justify-around rounded-2xl border border-gold/30 bg-card px-4 py-3 text-[11px] font-bold">
        <span className="flex items-center gap-1.5 text-gold">
          <ShieldCheck className="size-4" /> 100% FAIR
        </span>
        <span className="flex items-center gap-1.5 text-bull">
          <Zap className="size-4" /> LIVE DATA
        </span>
        <span className="flex items-center gap-1.5 text-info">
          <Lock className="size-4" /> SECURE
        </span>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <AmountModal
            mode={modal.mode}
            defaultMethod={modal.method}
            onClose={() => setModal(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}