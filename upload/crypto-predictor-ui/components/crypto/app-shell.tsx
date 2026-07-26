"use client"

import { useState } from "react"
import { Bell, Home, ClipboardList, Crown, Wallet, User } from "lucide-react"
import { CryptoProvider, useCrypto } from "./store"
import { CountrySelector } from "./country-selector"
import { Toaster } from "./toaster"
import { HomeScreen } from "./screens/home-screen"
import { PredictScreen } from "./screens/predict-screen"
import { BetsScreen } from "./screens/bets-screen"
import { WalletScreen } from "./screens/wallet-screen"
import { ProfileScreen } from "./screens/profile-screen"

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
  const { recentBets } = useCrypto()
  const unread = recentBets.length

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background text-foreground">
      <Toaster />

      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <CountrySelector />
        <h1 className="text-base font-extrabold tracking-wide">
          CRYPTO <span className="text-bull text-glow-green">PREDICTOR</span>
        </h1>
        <button aria-label="Notifications" onClick={() => setTab("bets")} className="relative">
          <Bell className="size-6" />
          <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-bear text-[9px] font-bold text-white">
            {unread}
          </span>
        </button>
      </header>

      {/* Screen content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {tab === "home" && <HomeScreen onNavigate={setTab} />}
        {tab === "predict" && <PredictScreen onNavigate={setTab} />}
        {tab === "bets" && <BetsScreen />}
        {tab === "wallet" && <WalletScreen />}
        {tab === "profile" && <ProfileScreen />}
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
          <span
            className={`-mt-8 flex size-14 items-center justify-center rounded-full bg-bull text-black ${
              tab === "predict" ? "glow-green" : ""
            }`}
          >
            <Crown className="size-7" />
          </span>
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
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 ${active ? "text-bull" : "text-muted-foreground"}`}
    >
      {icon}
      <span className="text-[11px] font-semibold">{label}</span>
    </button>
  )
}

export type { Tab }
