"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  Crown,
  Wallet,
  Trophy,
  Coins,
  ArrowUpDown,
  ShieldCheck,
  Scale,
  Zap,
  Users,
  TrendingUp,
  Activity,
  X,
} from "lucide-react"
import type { Tab } from "../app-shell"
import { CryptoNews } from "../crypto-news"
import { useCrypto, COINS, formatPrice } from "../store"

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 },
}

const fallbackWinners = [
  { rank: 1, name: "VIPER TRADER", amount: "₹8,75,000", img: "/images/winner-1.png", ring: "border-gold" },
  { rank: 2, name: "CRYPTO KING", amount: "₹6,45,000", img: "/images/winner-2.png", ring: "border-slate-400" },
  { rank: 3, name: "PREDICT PRO", amount: "₹5,20,000", img: "/images/winner-3.png", ring: "border-amber-700" },
]

function RankBadge({ rank }: { rank: number }) {
  const styles = rank === 1 ? "bg-gold text-black" : rank === 2 ? "bg-slate-300 text-black" : "bg-amber-700 text-white"
  return <span className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${styles}`}>{rank}</span>
}

export function HomeScreen({ onNavigate }: { onNavigate: (t: Tab) => void }) {
  const { country, prices, mounted, setSelectedCoin } = useCrypto()
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  return (
    <motion.div className="flex flex-col gap-4 px-4 pb-4 pt-3" variants={container} initial="hidden" animate="show">
      {/* Branding Hero */}
      <motion.div variants={item} className="relative overflow-hidden rounded-2xl border border-border">
        <Image src="/images/bull-bear-hero.png" alt="Hero" width={640} height={260} className="h-40 w-full object-cover" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-gradient-to-b from-black/30 via-transparent to-black/50">
          
      
          
        </div>
      </motion.div>

      {/* 3-GRID CRYPTO TABLE - Exact Original UI (जसा पहिल्या स्क्रीनशॉटमध्ये होता) */}
      <motion.div variants={item} className="grid grid-cols-3 gap-2">
        {COINS.map((coin) => (
          <div
            key={coin.id}
            onClick={() => {
              if (setSelectedCoin) setSelectedCoin(coin)
              onNavigate("predict")
            }}
            className="rounded-xl border border-border bg-card p-2.5 text-center cursor-pointer active:scale-95 transition-transform"
          >
            <span className={`size-7 flex items-center justify-center rounded-full text-sm font-bold mx-auto mb-1 ${
              coin.id === "BTCUSDT" ? "bg-gold/20 text-gold" :
              coin.id === "ETHUSDT" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"
            }`}>
              {coin.icon}
            </span>
            <p className="text-[10px] font-bold text-muted-foreground">{coin.label}</p>
            <p className="text-sm font-extrabold tabular-nums">
              {mounted && prices && prices[coin.id] ? `$${formatPrice(prices[coin.id], coin.id)}` : "$0.00"}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-2 text-[10px] font-semibold tracking-wide text-muted-foreground">
            <Users className="size-3.5 text-bull" /> USERS ONLINE
          </div>
          <p className="mt-1 text-lg font-bold">
            452,102 <span className="ml-1 text-[10px] font-semibold text-bull">● LIVE</span>
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-2 text-[10px] font-semibold tracking-wide text-muted-foreground">
            <Wallet className="size-3.5 text-info" /> PAYOUTS TODAY
          </div>
          <p className="mt-1 text-lg font-bold text-bull text-glow-green">
            {country?.symbol || "₹"} 11,48,75,200
          </p>
        </div>
      </motion.div>

      {/* Live Ticker */}
      <motion.div variants={item} className="flex items-center gap-3 rounded-xl border border-bull/20 bg-bull/5 px-3 py-2">
        <Activity className="size-4 text-bull shrink-0" />
        <div className="overflow-hidden flex-1">
          <motion.p
            className="text-[11px] font-semibold text-bull whitespace-nowrap"
            animate={{ x: [0, -300] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          >
            🔥 Player just won ₹45,000 on UP prediction • 🏆 New streak record: 8 wins • 💰 ₹28,500 withdrawn via UPI • ⚡ 1,247 active predictions
          </motion.p>
        </div>
      </motion.div>

      {/* Promo Banner */}
      <motion.div variants={item} className="relative overflow-hidden rounded-2xl border border-bear/40">
        <Image src="/images/rocket-promo.png" alt="Promo" width={640} height={170} className="h-28 w-full object-cover" />
        <div className="absolute inset-0 flex flex-col justify-center pl-4 bg-gradient-to-r from-black/50 to-transparent">
          <p className="text-[11px] font-bold tracking-wide text-white">INSTANT WITHDRAWAL</p>
          <p className="text-3xl font-extrabold leading-none text-bull text-glow-green">1 SECOND</p>
          <p className="mt-1 text-[11px] font-semibold tracking-wide text-white/80">UPI FAST PAYOUT</p>
        </div>
      </motion.div>

    

      {/* How to Play */}
      <motion.div variants={item} className="rounded-2xl border border-info/30 bg-card p-4">
        <h2 className="mb-4 font-bold tracking-wide">HOW TO PLAY?</h2>
        <div className="flex items-start justify-between gap-2 text-center">
          <div className="flex flex-1 flex-col items-center gap-1">
            <div className="relative flex size-12 items-center justify-center rounded-full border border-border bg-muted"><Coins className="size-6 text-gold" /></div>
            <p className="text-[10px] font-bold text-muted-foreground">CHOOSE COIN</p>
          </div>
          <span className="mt-4 text-muted-foreground">›</span>
          <div className="flex flex-1 flex-col items-center gap-1">
            <div className="relative flex size-12 items-center justify-center rounded-full border border-border bg-muted"><ArrowUpDown className="size-6 text-bull" /></div>
            <p className="text-[10px] font-bold text-muted-foreground">PREDICT UP/DOWN</p>
          </div>
          <span className="mt-4 text-muted-foreground">›</span>
          <div className="flex flex-1 flex-col items-center gap-1">
            <div className="relative flex size-12 items-center justify-center rounded-full border border-border bg-muted"><Wallet className="size-6 text-gold" /></div>
            <p className="text-[10px] font-bold text-muted-foreground">GET 1.8x PROFIT</p>
          </div>
        </div>
      </motion.div>

      {/* Trust Badges */}
      <motion.div variants={item} className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card py-3">
          <ShieldCheck className="size-5 text-bull" />
          <p className="text-[10px] font-bold text-muted-foreground">100% SECURE</p>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card py-3">
          <Scale className="size-5 text-info" />
          <p className="text-[10px] font-bold text-muted-foreground">FAIR PLAY</p>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card py-3">
          <Zap className="size-5 text-gold" />
          <p className="text-[10px] font-bold text-muted-foreground">FAST PAYOUT</p>
        </div>
      </motion.div>

      {/* CTA Button */}
      <motion.div variants={item}>
        <button
          onClick={() => onNavigate("predict")}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-bull py-3.5 text-sm font-bold text-black glow-green transition active:scale-[0.97]"
        >
          <TrendingUp className="size-4" />
          START PREDICTING NOW
        </button>
      </motion.div>

      <motion.div variants={item}>
        <CryptoNews />
      </motion.div>
    </motion.div>
  )
}