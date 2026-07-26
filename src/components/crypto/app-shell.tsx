"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Home, ClipboardList, Crown, Wallet, User, Loader2 } from "lucide-react"
import { CryptoProvider, useCrypto } from "./store"
import { CountrySelector } from "./country-selector"
import { Toaster } from "./toaster"
import { HomeScreen } from "./screens/home-screen"
import PredictScreen from "./screens/predict-screen"
import { BetsScreen } from "./screens/bets-screen"
import { WalletScreen } from "./screens/wallet-screen"
import { ProfileScreen } from "./screens/profile-screen"
import { AuthScreen } from "./screens/auth-screen"
import { AiChat } from "./ai-chat"
import { WinCelebration } from "./win-celebration"

type Tab = "home" | "bets" | "predict" | "wallet" | "profile"

export function AppShell() {
  return (
    <CryptoProvider>
      <Shell />
    </CryptoProvider>
  )
}

function Shell() {
  const [tab, setTab] = useState<Tab>("predict")
  const { recentBets, wsConnected, authStatus, mounted } = useCrypto()
 const unread = (recentBets || []).filter((b) => b.status === "PENDING").length

  // While checking auth on first mount, show a branded loader
  if (!mounted || authStatus === "loading") {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center bg-background text-foreground">
        <motion.div
          initial={{ scale: 0.7, opacity: 0, rotate: -20 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="mb-3 flex size-14 items-center justify-center rounded-full bg-gold/20 glow-gold"
        >
          <Crown className="size-7 text-gold" />
        </motion.div>
        <h1 className="text-xl font-extrabold tracking-tight">
          <span className="text-bull text-glow-green">PredicTX</span>
        </h1>
        <Loader2 className="mt-4 size-5 animate-spin text-bull" />
      </div>
    )
  }

  // Not authenticated — show the login screen
  if (authStatus === "unauthenticated") {
    return <AuthScreen />
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background text-foreground">
      <Toaster />
      <WinCelebration />

      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <CountrySelector />
        <h1 className="text-base font-extrabold tracking-wide flex items-center gap-1.5">
          <span className="text-bull text-glow-green">PredicTX</span>
          {wsConnected && (
            <span className="flex items-center gap-0.5 rounded border border-bull/30 bg-bull/10 px-1.5 py-0.5 text-[8px] font-bold text-bull">
              <span className="size-1 rounded-full bg-bull animate-pulse" />LIVE
            </span>
          )}
        </h1>
        <button aria-label="Notifications" onClick={() => setTab("bets")} className="relative">
          <Bell className="size-6" />
          {unread > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-bear text-[9px] font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </header>

      {/* Screen content */}
      <main className="flex-1 overflow-y-auto pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {tab === "home" && <HomeScreen onNavigate={setTab} />}
            {tab === "predict" && <PredictScreen onNavigate={setTab} />}
          {tab === "bets" && <BetsScreen onNavigate={setTab} />}
            {tab === "wallet" && <WalletScreen />}
            {tab === "profile" && <ProfileScreen />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-md items-end justify-between border-t border-border bg-panel px-6 pb-4 pt-3">
        <NavItem icon={<Home className="size-5" />} label="Home" active={tab === "home"} onClick={() => setTab("home")} />
        <NavItem
          icon={<ClipboardList className="size-5" />}
          label="My Bets"
          active={tab === "bets"}
          onClick={() => setTab("bets")}
        />
        <button onClick={() => setTab("predict")} className="flex flex-col items-center gap-1">
          <motion.span
            className={`-mt-8 flex size-14 items-center justify-center rounded-full bg-bull text-black ${
              tab === "predict" ? "glow-green" : ""
            }`}
            whileTap={{ scale: 0.9 }}
          >
            <Crown className="size-7" />
          </motion.span>
          <span className={`text-[11px] font-bold ${tab === "predict" ? "text-bull" : "text-muted-foreground"}`}>
            Predict
          </span>
        </button>
        <NavItem
          icon={<Wallet className="size-5" />}
          label="Wallet"
          active={tab === "wallet"}
          onClick={() => setTab("wallet")}
        />
        <NavItem
          icon={<User className="size-5" />}
          label="Profile"
          active={tab === "profile"}
          onClick={() => setTab("profile")}
        />
      </nav>

      {/* AI Chat floating button */}
      <AiChat />
    </div>
  )
}

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 ${active ? "text-bull" : "text-muted-foreground"}`}
      whileTap={{ scale: 0.9 }}
    >
      {icon}
      <span className="text-[11px] font-semibold">{label}</span>
    </motion.button>
  )
}

export type { Tab }
