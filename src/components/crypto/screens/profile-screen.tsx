"use client"

import Image from "next/image"
import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronRight,
  Trophy,
  Gift,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  Flame,
  Target,
  TrendingUp,
  Zap,
  Check,
  Loader2,
  X,
  Copy,
  Star,
  Medal,
  Award,
  Lock,
  KeyRound,
  MessageSquare,
  Mail,
  Phone,
  Globe,
  BellRing,
  QrCode,
  FileText,
  ScrollText,
} from "lucide-react"
import { useCrypto } from "../store"
import { LegalModal, type LegalDoc } from "../legal-modal"

type MenuModal = "achievements" | "refer" | "notifications" | "security" | "help" | "logout" | null

const menu = [
  { id: "achievements" as const, icon: Trophy, label: "My Achievements" },
  { id: "refer" as const, icon: Gift, label: "Refer & Earn" },
  { id: "notifications" as const, icon: Bell, label: "Notifications" },
  { id: "security" as const, icon: Shield, label: "Security & KYC" },
  { id: "help" as const, icon: HelpCircle, label: "Help & Support" },
]

export function ProfileScreen() {
  const {
  wins,
  totalBets,
  winRate,
  fmt,
  profit,
  winnings,
  balance,
  userName,
  userId,
  logout,
  authMethod,
  email,
  phone,
  twoFactorEnabled,
  setTwoFactorEnabled,
} = useCrypto()
  const [activeModal, setActiveModal] = useState<MenuModal>(null)
  const [logoutLoading, setLogoutLoading] = useState(false)

  const handleLogout = async () => {
  setLogoutLoading(true)

  try {
    await logout()
  } catch (error) {
    console.error("Logout failed:", error)
  } finally {
    setLogoutLoading(false)
  }
}

  return (
    <motion.div
      className="flex flex-col gap-4 px-4 pb-4 pt-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Profile header */}
      <div className="flex flex-col items-center rounded-2xl border border-gold/30 bg-card p-5 text-center">
        <motion.span
          className="relative overflow-hidden rounded-full border-2 border-gold glow-gold"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Image src="/images/winner-1.png" alt="Your avatar" width={80} height={80} className="size-20 object-cover" />
        </motion.span>
        <motion.h2
          className="mt-3 flex items-center gap-1.5 text-lg font-extrabold"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {userName}
        </motion.h2>
        <motion.p
          className="text-xs text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          ID: {userId?.slice(0, 8)}...
        </motion.p>

        {/* Trader badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-2 flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-muted-foreground"
        >
          <Target className="size-3" />
          <span className="text-[10px] font-bold">TRADER</span>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          className="mt-4 grid w-full grid-cols-3 gap-2 border-t border-border pt-4"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div>
            <p className="text-lg font-bold text-bull">{wins}</p>
            <p className="text-[10px] text-muted-foreground">WINS</p>
          </div>
          <div>
            <p className="text-lg font-bold">{totalBets}</p>
            <p className="text-[10px] text-muted-foreground">TOTAL BETS</p>
          </div>
          <div>
            <p className="text-lg font-bold text-gold">{winRate}%</p>
            <p className="text-[10px] text-muted-foreground">WIN RATE</p>
          </div>
        </motion.div>

        {/* Profit card */}
        <motion.div
          className="mt-3 grid w-full grid-cols-2 gap-2"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2 rounded-lg border border-bull/20 bg-bull/5 px-3 py-2">
            <TrendingUp className="size-4 text-bull" />
            <div className="text-left">
              <p className="text-sm font-bold text-bull">{fmt(profit)}</p>
              <p className="text-[9px] text-muted-foreground">PROFIT</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-gold/20 bg-gold/5 px-3 py-2">
            <Target className="size-4 text-gold" />
            <div className="text-left">
              <p className="text-sm font-bold">{fmt(winnings)}</p>
              <p className="text-[9px] text-muted-foreground">WINNINGS</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Performance card */}
      <motion.div
        className="rounded-2xl border border-border bg-card p-4"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="mb-3 flex items-center gap-2">
          <Target className="size-5 text-bull" />
          <h2 className="font-bold tracking-wide">PERFORMANCE</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-panel p-3 text-center">
            <p className="text-lg font-bold text-bull">{fmt(winnings)}</p>
            <p className="text-[10px] text-muted-foreground">TOTAL WINNINGS</p>
          </div>
          <div className="rounded-xl border border-border bg-panel p-3 text-center">
            <p className="text-lg font-bold">{fmt(balance, 2)}</p>
            <p className="text-[10px] text-muted-foreground">CURRENT BALANCE</p>
          </div>
        </div>
        {/* Win rate bar */}
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-[10px]">
            <span className="font-semibold text-muted-foreground">WIN RATE</span>
            <span className="font-bold text-bull">{winRate}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-bull"
              initial={{ width: 0 }}
              animate={{ width: `${winRate}%` }}
              transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>

      {/* Menu */}
      <motion.div
        className="overflow-hidden rounded-2xl border border-border bg-card"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {menu.map((m, i) => (
          <button
            key={m.label}
            onClick={() => setActiveModal(m.id)}
            className={`flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm font-semibold transition active:bg-muted/50 ${
              i !== menu.length - 1 ? "border-b border-border/60" : ""
            }`}
          >
            <m.icon className="size-5 text-muted-foreground" />
            <span className="flex-1">{m.label}</span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </button>
        ))}
      </motion.div>

      <motion.button
        onClick={handleLogout}
        disabled={logoutLoading}
        className="flex items-center justify-center gap-2 rounded-2xl border border-bear/40 bg-bear/10 py-3.5 text-sm font-bold text-bear disabled:opacity-60"
        whileTap={{ scale: 0.97 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        {logoutLoading ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
        LOG OUT
      </motion.button>

      {/* Menu modals */}
      <AnimatePresence>
        {activeModal && (
          <MenuModalWrapper
            onClose={() => setActiveModal(null)}
            modal={activeModal}
            userId={userId}
            wins={wins}
            totalBets={totalBets}
            winRate={winRate}
            authMethod={authMethod}
            email={email}
            phone={phone}
            twoFactorEnabled={twoFactorEnabled}
            setTwoFactorEnabled={setTwoFactorEnabled}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function MenuModalWrapper({
  onClose,
  modal,
  userId,
  wins,
  totalBets,
  winRate,
  authMethod,
  email,
  phone,
  twoFactorEnabled,
  setTwoFactorEnabled,
}: {
  onClose: () => void
  modal: Exclude<MenuModal, null>
  userId: string | null
  wins: number
  totalBets: number
  winRate: number
  authMethod: string | null
  email: string | null
  phone: string | null
  twoFactorEnabled: boolean
  setTwoFactorEnabled: (v: boolean) => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 sm:items-center" onClick={onClose}>
      <motion.div
        className="mx-auto w-full max-w-md rounded-t-2xl border border-border bg-panel p-5 pb-8 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <ModalTitle modal={modal} />
          <button onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
          {modal === "achievements" && <AchievementsContent wins={wins} totalBets={totalBets} winRate={winRate} />}
          {modal === "refer" && <ReferContent userId={userId} />}
          {modal === "notifications" && <NotificationsContent />}
          {modal === "security" && (
            <SecurityContent
              authMethod={authMethod}
              email={email}
              phone={phone}
              twoFactorEnabled={twoFactorEnabled}
              setTwoFactorEnabled={setTwoFactorEnabled}
            />
          )}
          {modal === "help" && <HelpContent onClose={onClose} />}
        </div>
      </motion.div>
    </div>
  )
}

function ModalTitle({ modal }: { modal: Exclude<MenuModal, null> }) {
  const map = {
    achievements: { icon: Trophy, label: "Achievements" },
    refer: { icon: Gift, label: "Refer & Earn" },
    notifications: { icon: Bell, label: "Notifications" },
    security: { icon: Shield, label: "Security & KYC" },
    help: { icon: HelpCircle, label: "Help & Support" },
    logout: { icon: LogOut, label: "Log Out" },
  } as const
  const { icon: Icon, label } = map[modal]
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-5 text-bull" />
      <h3 className="font-bold tracking-wide">{label.toUpperCase()}</h3>
    </div>
  )
}

function AchievementsContent({ wins, totalBets, winRate }: { wins: number; totalBets: number; winRate: number }) {
  const achievements = [
    { icon: Medal, label: "First Win", desc: "Win your first prediction", unlocked: wins >= 1, color: "text-bull" },
    { icon: Flame, label: "Hot Streak", desc: "Win 5 predictions", unlocked: wins >= 5, color: "text-gold" },
    { icon: Trophy, label: "Champion", desc: "Win 25 predictions", unlocked: wins >= 25, color: "text-gold" },
    { icon: Star, label: "Rising Star", desc: "Place 10 bets", unlocked: totalBets >= 10, color: "text-info" },
    { icon: Award, label: "Veteran", desc: "Place 100 bets", unlocked: totalBets >= 100, color: "text-bull" },
    { icon: Target, label: "Sharp Shooter", desc: "Reach 60% win rate", unlocked: winRate >= 60, color: "text-bull" },
    { icon: Zap, label: "High Roller", desc: "Place 500 bets", unlocked: totalBets >= 500, color: "text-gold" },
  ]
  return (
    <div className="grid grid-cols-2 gap-3">
      {achievements.map((a) => (
        <div
          key={a.label}
          className={`rounded-xl border p-3 text-center transition ${
            a.unlocked ? "border-bull/30 bg-bull/5" : "border-border bg-muted/30 opacity-60"
          }`}
        >
          <a.icon className={`mx-auto size-7 ${a.unlocked ? a.color : "text-muted-foreground"}`} />
          <p className="mt-1.5 text-xs font-bold">{a.label}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">{a.desc}</p>
          {a.unlocked && (
            <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-bull/20 px-2 py-0.5 text-[9px] font-bold text-bull">
              <Check className="size-2.5" /> UNLOCKED
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

function ReferContent({ userId }: { userId: string | null }) {
  const [referralData, setReferralData] = useState<{
    referralCode: string
    referralLink: string
    friendsJoined: number
    totalEarned: number
    recentReferrals: Array<{ id: string; name: string; avatar: string; joinedAt: string }>
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [shareStatus, setShareStatus] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const fetchReferrals = async () => {
      try {
        const res = await fetch("/api/referrals")
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) setReferralData(data)
      } catch {
        // ignore — fall back to local code below
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchReferrals()
    return () => {
      cancelled = true
    }
  }, [])

  // Fallback referral code (derived from userId) until the API responds
  const fallbackCode = userId ? `CP${userId.slice(0, 6).toUpperCase()}` : "CPDEMO01"
  const referralCode = referralData?.referralCode || fallbackCode
  const referralLink = referralData?.referralLink || `https://cryptopredictor.app/r/${referralCode}`
  const friendsJoined = referralData?.friendsJoined ?? 0
  const totalEarned = referralData?.totalEarned ?? 0

  const handleCopy = () => {
    navigator.clipboard?.writeText(referralLink).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = (platform: "whatsapp" | "telegram" | "more") => {
    const text = `🚀 Join me on PredicTX and get ₹10,000 welcome bonus! Use my referral code ${referralCode}. ${referralLink}`
    try {
      if (platform === "whatsapp") {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
      } else if (platform === "telegram") {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`, "_blank")
      } else {
        // Use native share sheet if available, otherwise copy
        if (navigator.share) {
          navigator.share({ title: "PredicTX", text, url: referralLink }).catch(() => {})
        } else {
          navigator.clipboard?.writeText(text).catch(() => {})
          setShareStatus("Link copied to clipboard")
          setTimeout(() => setShareStatus(null), 2000)
        }
      }
    } catch {
      setShareStatus("Unable to share — link copied instead")
      navigator.clipboard?.writeText(referralLink).catch(() => {})
      setTimeout(() => setShareStatus(null), 2000)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gold/30 bg-gradient-to-br from-gold/10 to-transparent p-4 text-center">
        <Gift className="mx-auto size-10 text-gold" />
        <h4 className="mt-2 text-base font-extrabold text-gold">Earn ₹2,000 per friend!</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          Get ₹2,000 when your friend makes their first deposit. They get ₹1,000 too!
        </p>
      </div>
      <div>
        <p className="mb-1 text-[10px] font-bold tracking-wide text-muted-foreground">YOUR REFERRAL CODE</p>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5">
          <span className="flex-1 font-mono text-sm font-bold tracking-wider text-bull">
            {loading ? "Loading..." : referralCode}
          </span>
          <button
            onClick={handleCopy}
            className="rounded-md bg-bull/20 px-2.5 py-1.5 text-[10px] font-bold text-bull active:scale-95 transition"
            aria-label="Copy referral code"
          >
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          </button>
        </div>
      </div>
      <div>
        <p className="mb-1 text-[10px] font-bold tracking-wide text-muted-foreground">SHARE LINK</p>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5">
          <span className="flex-1 truncate text-xs text-muted-foreground">{referralLink}</span>
          <button
            onClick={handleCopy}
            className="rounded-md bg-info/20 px-2.5 py-1.5 text-[10px] font-bold text-info active:scale-95 transition"
          >
            {copied ? "COPIED" : "COPY"}
          </button>
        </div>
      </div>
      {shareStatus && (
        <p className="text-center text-[10px] font-semibold text-bull">{shareStatus}</p>
      )}
      <div className="grid grid-cols-3 gap-2">
        <ShareBtn label="WhatsApp" emoji="💬" onClick={() => handleShare("whatsapp")} />
        <ShareBtn label="Telegram" emoji="✈️" onClick={() => handleShare("telegram")} />
        <ShareBtn label="More" emoji="⋯" onClick={() => handleShare("more")} />
      </div>
      <div className="rounded-xl border border-border bg-card p-3 text-center">
        <p className="text-[10px] text-muted-foreground">FRIENDS JOINED</p>
        <p className="text-2xl font-extrabold text-bull">{friendsJoined}</p>
        <p className="text-[10px] text-muted-foreground">
          Total earned: <span className="font-bold text-gold">₹{totalEarned.toLocaleString("en-IN")}</span>
        </p>
      </div>
      {referralData && referralData.recentReferrals.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] font-bold tracking-wide text-muted-foreground">RECENT REFERRALS</p>
          <div className="space-y-2">
            {referralData.recentReferrals.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-2 rounded-xl border border-border bg-card p-2"
              >
                <Image src={r.avatar} alt={r.name} width={32} height={32} className="size-8 rounded-full object-cover" />
                <div className="flex-1">
                  <p className="text-xs font-bold">{r.name}</p>
                  <p className="text-[9px] text-muted-foreground">
                    Joined {new Date(r.joinedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
                <span className="rounded-full bg-bull/15 px-2 py-0.5 text-[9px] font-bold text-bull">+₹2,000</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ShareBtn({ label, emoji, onClick }: { label: string; emoji: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card py-2.5 text-[10px] font-bold transition active:scale-95 hover:border-bull/40 hover:bg-bull/5"
    >
      <span className="text-lg">{emoji}</span>
      {label}
    </button>
  )
}

function NotificationsContent() {
  const STORAGE_KEY = "cp_notification_settings"
  const defaultSettings = {
    wins: true,
    losses: false,
    deposits: true,
    withdrawals: true,
    promotions: true,
    news: false,
    priceAlerts: true,
  }
  const [settings, setSettings] = useState(defaultSettings)
  const [loaded, setLoaded] = useState(false)
  const [savedNotice, setSavedNotice] = useState<string | null>(null)

  // Load saved settings from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        setSettings({ ...defaultSettings, ...parsed })
      }
    } catch {
      // ignore corrupt storage
    } finally {
      setLoaded(true)
    }
  }, [])

  const toggle = useCallback((key: keyof typeof defaultSettings) => {
    setSettings((s) => {
      const next = { ...s, [key]: !s[key] }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        setSavedNotice("Saved")
        setTimeout(() => setSavedNotice(null), 1500)
      } catch {
        // ignore quota errors
      }
      return next
    })
  }, [])

  const items = [
    { key: "wins" as const, icon: Trophy, label: "Win notifications", desc: "Get notified when you win" },
    { key: "losses" as const, icon: Target, label: "Loss notifications", desc: "Get notified when you lose" },
    { key: "deposits" as const, icon: TrendingUp, label: "Deposit confirmations", desc: "When deposits are credited" },
    { key: "withdrawals" as const, icon: Zap, label: "Withdrawal updates", desc: "When withdrawals are processed" },
    { key: "promotions" as const, icon: Gift, label: "Promotions & offers", desc: "Special bonus offers" },
    { key: "news" as const, icon: Globe, label: "Crypto news", desc: "Breaking market news" },
    { key: "priceAlerts" as const, icon: BellRing, label: "Price alerts", desc: "BTC, ETH, SOL price moves" },
  ]
  return (
    <div className="space-y-2">
      <AnimatePresence>
        {savedNotice && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 rounded-lg border border-bull/40 bg-bull/10 px-3 py-1.5 text-[10px] font-bold text-bull"
          >
            <Check className="size-3" /> {savedNotice}
          </motion.div>
        )}
      </AnimatePresence>
      {!loaded ? (
        <div className="flex justify-center py-6">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        items.map((item) => (
          <div key={item.key} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
            <item.icon className="size-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-bold">{item.label}</p>
              <p className="text-[10px] text-muted-foreground">{item.desc}</p>
            </div>
            <button
              onClick={() => toggle(item.key)}
              className={`relative h-6 w-11 rounded-full transition ${
                settings[item.key] ? "bg-bull" : "bg-muted"
              }`}
              aria-label={`Toggle ${item.label}`}
              aria-pressed={settings[item.key]}
            >
              <motion.span
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`absolute top-0.5 size-5 rounded-full bg-white shadow ${
                  settings[item.key] ? "right-0.5" : "left-0.5"
                }`}
              />
            </button>
          </div>
        ))
      )}
    </div>
  )
}

function SecurityContent({
  authMethod,
  email,
  phone,
  twoFactorEnabled,
  setTwoFactorEnabled,
}: {
  authMethod: string | null
  email: string | null
  phone: string | null
  twoFactorEnabled: boolean
  setTwoFactorEnabled: (v: boolean) => void
}) {
  const authLabel =
    authMethod === "google" ? "Google Account" :
    authMethod === "phone" ? "Phone Number" :
    authMethod === "email" ? "Email & Password" :
    "Guest"

  // ---- Shared notice ----
  const [notice, setNotice] = useState<{ msg: string; tone: "info" | "error" | "success" } | null>(null)
  const flashNotice = (msg: string, tone: "info" | "error" | "success" = "info") => {
    setNotice({ msg, tone })
    setTimeout(() => setNotice(null), 3500)
  }

  // ---- Change Password flow ----
  const [showPwModal, setShowPwModal] = useState(false)
  const [pwCurrent, setPwCurrent] = useState("")
  const [pwNew, setPwNew] = useState("")
  const [pwConfirm, setPwConfirm] = useState("")
  const [pwLoading, setPwLoading] = useState(false)

  const canChangePassword = authMethod === "email"

  const handleChangePassword = async () => {
    setNotice(null)
    if (!pwCurrent || !pwNew || !pwConfirm) {
      flashNotice("Please fill in all password fields", "error")
      return
    }
    if (pwNew.length < 6) {
      flashNotice("New password must be at least 6 characters", "error")
      return
    }
    if (pwNew !== pwConfirm) {
      flashNotice("New password and confirmation don't match", "error")
      return
    }
    if (pwCurrent === pwNew) {
      flashNotice("New password must be different from current password", "error")
      return
    }
    setPwLoading(true)
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwCurrent, newPassword: pwNew }),
      })
      const data = await res.json()
      if (!res.ok) {
        flashNotice(data.error || "Failed to change password", "error")
        return
      }
      flashNotice("Password changed successfully!", "success")
      setShowPwModal(false)
      setPwCurrent("")
      setPwNew("")
      setPwConfirm("")
    } catch {
      flashNotice("Network error — please try again", "error")
    } finally {
      setPwLoading(false)
    }
  }

  // ---- 2FA flow ----
  type TwoFaStep = "idle" | "setup" | "verifying" | "disabling"
  const [twoFaStep, setTwoFaStep] = useState<TwoFaStep>("idle")
  const [twoFaSecret, setTwoFaSecret] = useState<string | null>(null)
  const [twoFaDemoCode, setTwoFaDemoCode] = useState<string | null>(null)
  const [twoFaOtp, setTwoFaOtp] = useState("")
  const [twoFaLoading, setTwoFaLoading] = useState(false)

  const start2FaSetup = async () => {
    setTwoFaLoading(true)
    setNotice(null)
    try {
      const res = await fetch("/api/auth/2fa/setup", { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        flashNotice(data.error || "Failed to start 2FA setup", "error")
        return
      }
      setTwoFaSecret(data.secret)
      setTwoFaDemoCode(data.demoCode)
      setTwoFaOtp("")
      setTwoFaStep("setup")
    } catch {
      flashNotice("Network error — please try again", "error")
    } finally {
      setTwoFaLoading(false)
    }
  }

  const verify2Fa = async () => {
    if (!twoFaSecret || twoFaOtp.length !== 6) {
      flashNotice("Please enter the 6-digit code", "error")
      return
    }
    setTwoFaLoading(true)
    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: twoFaOtp, secret: twoFaSecret }),
      })
      const data = await res.json()
      if (!res.ok) {
        flashNotice(data.error || "Invalid code — please try again", "error")
        return
      }
      setTwoFactorEnabled(true)
      flashNotice("Two-Factor Authentication enabled!", "success")
      setTwoFaStep("idle")
      setTwoFaSecret(null)
      setTwoFaDemoCode(null)
      setTwoFaOtp("")
    } catch {
      flashNotice("Network error — please try again", "error")
    } finally {
      setTwoFaLoading(false)
    }
  }

  const disable2Fa = async () => {
    if (twoFaOtp.length !== 6) {
      flashNotice("Please enter the 6-digit code from your authenticator app", "error")
      return
    }
    setTwoFaLoading(true)
    try {
      const res = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: twoFaOtp }),
      })
      const data = await res.json()
      if (!res.ok) {
        flashNotice(data.error || "Invalid code — please try again", "error")
        return
      }
      setTwoFactorEnabled(false)
      flashNotice("Two-Factor Authentication disabled.", "info")
      setTwoFaStep("idle")
      setTwoFaOtp("")
    } catch {
      flashNotice("Network error — please try again", "error")
    } finally {
      setTwoFaLoading(false)
    }
  }

  const noticeToneClass =
    notice?.tone === "error" ? "border-bear/40 bg-bear/10 text-bear" :
    notice?.tone === "success" ? "border-bull/40 bg-bull/10 text-bull" :
    "border-info/40 bg-info/10 text-info"

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-bull/30 bg-bull/5 p-3">
        <div className="flex items-center gap-2">
          <Shield className="size-5 text-bull" />
          <p className="text-sm font-bold text-bull">Account Verified</p>
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">
          Your account is verified via {authLabel}.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-3">
        <p className="mb-2 text-[10px] font-bold tracking-wide text-muted-foreground">ACCOUNT DETAILS</p>
        <DetailRow icon={<Mail className="size-4 text-muted-foreground" />} label="Email" value={email || "Not set"} />
        <DetailRow icon={<Phone className="size-4 text-muted-foreground" />} label="Phone" value={phone || "Not set"} />
        <DetailRow icon={<Lock className="size-4 text-muted-foreground" />} label="Sign-in method" value={authLabel} />
      </div>

      <div className="rounded-xl border border-gold/30 bg-gold/5 p-3">
        <div className="flex items-center gap-2">
          <Shield className="size-5 text-gold" />
          <p className="text-sm font-bold text-gold">KYC Status: Verified</p>
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">
          Your identity has been verified. Withdrawal limit: ₹50,000/day.
        </p>
      </div>

      {/* 2FA status pill */}
      <div className={`flex items-center gap-2 rounded-xl border p-3 ${
        twoFactorEnabled ? "border-bull/30 bg-bull/5" : "border-border bg-card"
      }`}>
        <Lock className={`size-5 ${twoFactorEnabled ? "text-bull" : "text-muted-foreground"}`} />
        <div className="flex-1">
          <p className="text-sm font-bold">Two-Factor Authentication</p>
          <p className="text-[10px] text-muted-foreground">
            {twoFactorEnabled ? "Enabled — extra security active" : "Disabled — add an extra layer of security"}
          </p>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
          twoFactorEnabled ? "bg-bull/20 text-bull" : "bg-muted text-muted-foreground"
        }`}>
          {twoFactorEnabled ? "ON" : "OFF"}
        </span>
      </div>

      {notice && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`rounded-lg border px-3 py-2 text-[11px] font-semibold ${noticeToneClass}`}
        >
          {notice.msg}
        </motion.div>
      )}

      {/* Change Password button */}
      <motion.button
        onClick={() => {
          if (!canChangePassword) {
            flashNotice(`Password change is only available for email-auth accounts. You sign in via ${authLabel}.`, "info")
            return
          }
          setShowPwModal(true)
          setNotice(null)
        }}
        whileTap={{ scale: 0.97 }}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-xs font-bold text-muted-foreground hover:border-bull/40 hover:text-bull transition"
      >
        <KeyRound className="size-4" /> Change Password
      </motion.button>

      {/* 2FA button — toggles between enable/disable flow */}
      {twoFactorEnabled ? (
        <>
          {twoFaStep === "disabling" ? (
            <div className="rounded-xl border border-bear/30 bg-bear/5 p-3 space-y-2">
              <p className="text-xs font-bold text-bear">Disable 2FA</p>
              <p className="text-[10px] text-muted-foreground">
                Enter the 6-digit code from your authenticator app to confirm.
              </p>
              <input
                type="text"
                inputMode="numeric"
                placeholder="• • • • • •"
                value={twoFaOtp}
                onChange={(e) => setTwoFaOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-center text-lg font-bold tracking-[0.4em] outline-none focus:border-bear"
                maxLength={6}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setTwoFaStep("idle"); setTwoFaOtp("") }}
                  className="flex-1 rounded-lg border border-border bg-card py-2.5 text-[11px] font-bold"
                >
                  CANCEL
                </button>
                <button
                  onClick={disable2Fa}
                  disabled={twoFaLoading || twoFaOtp.length !== 6}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-bear py-2.5 text-[11px] font-bold text-white disabled:opacity-50"
                >
                  {twoFaLoading ? <Loader2 className="size-3.5 animate-spin" /> : "DISABLE 2FA"}
                </button>
              </div>
            </div>
          ) : (
            <motion.button
              onClick={() => { setTwoFaStep("disabling"); setNotice(null); setTwoFaOtp("") }}
              whileTap={{ scale: 0.97 }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-bear/40 bg-bear/10 py-3 text-xs font-bold text-bear transition"
            >
              <Lock className="size-4" /> Disable Two-Factor Authentication
            </motion.button>
          )}
        </>
      ) : (
        <>
          {twoFaStep === "setup" && twoFaSecret ? (
            <div className="rounded-xl border border-gold/30 bg-gold/5 p-3 space-y-3">
              <div className="flex items-center gap-2">
                <QrCode className="size-5 text-gold" />
                <p className="text-xs font-bold text-gold">Set up Authenticator</p>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Add this secret to Google Authenticator, Authy, or any TOTP app, then enter the 6-digit code it generates.
              </p>
              <div className="rounded-lg border border-border bg-card p-2.5">
                <p className="text-[9px] font-bold tracking-wide text-muted-foreground">SECRET KEY</p>
                <p className="mt-0.5 break-all font-mono text-[11px] font-bold text-foreground">{twoFaSecret}</p>
              </div>
              {twoFaDemoCode && (
                <div className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-center">
                  <p className="text-[9px] font-semibold text-gold">DEMO CODE (current TOTP)</p>
                  <span className="font-mono text-xl font-extrabold tracking-[0.3em] text-gold">{twoFaDemoCode}</span>
                  <p className="mt-0.5 text-[9px] text-muted-foreground">(Refreshes every 30s in a real authenticator)</p>
                </div>
              )}
              <input
                type="text"
                inputMode="numeric"
                placeholder="Enter 6-digit code"
                value={twoFaOtp}
                onChange={(e) => setTwoFaOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-center text-lg font-bold tracking-[0.4em] outline-none focus:border-bull"
                maxLength={6}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setTwoFaStep("idle")
                    setTwoFaSecret(null)
                    setTwoFaDemoCode(null)
                    setTwoFaOtp("")
                  }}
                  className="flex-1 rounded-lg border border-border bg-card py-2.5 text-[11px] font-bold"
                >
                  CANCEL
                </button>
                <button
                  onClick={verify2Fa}
                  disabled={twoFaLoading || twoFaOtp.length !== 6}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-bull py-2.5 text-[11px] font-bold text-black disabled:opacity-50"
                >
                  {twoFaLoading ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />} VERIFY & ENABLE
                </button>
              </div>
            </div>
          ) : (
            <motion.button
              onClick={start2FaSetup}
              disabled={twoFaLoading}
              whileTap={{ scale: 0.97 }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gold/40 bg-card py-3 text-xs font-bold text-gold transition hover:bg-gold/5 disabled:opacity-60"
            >
              {twoFaLoading ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
              Enable Two-Factor Authentication
            </motion.button>
          )}
        </>
      )}

      {/* Change Password modal */}
      <AnimatePresence>
        {showPwModal && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !pwLoading && setShowPwModal(false)}
          >
            <motion.div
              className="w-full max-w-sm rounded-2xl border border-border bg-panel p-5"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-bold tracking-wide">
                  <KeyRound className="size-4 text-bull" /> CHANGE PASSWORD
                </h3>
                <button
                  onClick={() => !pwLoading && setShowPwModal(false)}
                  disabled={pwLoading}
                  aria-label="Close"
                  className="text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-[10px] font-bold tracking-wide text-muted-foreground">CURRENT PASSWORD</label>
                  <input
                    type="password"
                    value={pwCurrent}
                    onChange={(e) => setPwCurrent(e.target.value)}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-semibold outline-none focus:border-bull"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold tracking-wide text-muted-foreground">NEW PASSWORD</label>
                  <input
                    type="password"
                    value={pwNew}
                    onChange={(e) => setPwNew(e.target.value)}
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-semibold outline-none focus:border-bull"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold tracking-wide text-muted-foreground">CONFIRM NEW PASSWORD</label>
                  <input
                    type="password"
                    value={pwConfirm}
                    onChange={(e) => setPwConfirm(e.target.value)}
                    autoComplete="new-password"
                    placeholder="Re-enter new password"
                    className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-semibold outline-none focus:border-bull"
                  />
                </div>
                <button
                  onClick={handleChangePassword}
                  disabled={pwLoading || !pwCurrent || !pwNew || !pwConfirm}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-bull py-2.5 text-xs font-bold text-black disabled:opacity-50"
                >
                  {pwLoading ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                  CHANGE PASSWORD
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-border/40 py-2 last:border-0">
      {icon}
      <span className="flex-1 text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold">{value}</span>
    </div>
  )
}

// Support email — shown to users in Help & Support, used as mailto: target.
const SUPPORT_EMAIL = "cryptosupport24@gmail.com"
const SUPPORT_MAILTO = `mailto:${SUPPORT_EMAIL}?subject=Help%20Request%20from%20Crypto%20Predictor`

function HelpContent({ onClose }: { onClose: () => void }) {
  const [legalDoc, setLegalDoc] = useState<LegalDoc | null>(null)
  const faqs = [
    { q: "How do I place a prediction?", a: "Go to the Predict tab, select time & amount, then tap UP or DOWN. Max 3 taps to place a bet!" },
    { q: "How are winners decided?", a: "If you predict UP and the price goes up by the end of the round, you win 1.8x your stake." },
    { q: "How do I withdraw my winnings?", a: "Go to the Wallet tab, tap Withdraw, enter the amount, and choose your payment method. Withdrawals are instant." },
    { q: "Is there a prediction limit?", a: "No — you can make unlimited predictions. Just make sure you have enough balance for each bet." },
    { q: "Is my money safe?", a: "Yes — all funds are held securely and transactions are encrypted. We use bank-grade security." },
  ]
  const [open, setOpen] = useState<number | null>(0)
  const [notice, setNotice] = useState<{ msg: string; tone: "info" | "success" } | null>(null)

  const flashNotice = (msg: string, tone: "info" | "success" = "info") => {
    setNotice({ msg, tone })
    setTimeout(() => setNotice(null), 3500)
  }

  const handleContact = (type: "chat" | "email" | "call") => {
    if (type === "chat") {
      // Close the help modal so the AI chat panel is visible, then dispatch an event
      // that the AiChat component listens for to auto-open.
      onClose()
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("open-ai-chat"))
      }, 250)
    } else if (type === "email") {
      window.location.href = SUPPORT_MAILTO
      flashNotice("Opening your email app...", "info")
    } else {
      // Real tel: link — opens the phone dialer on mobile
      window.location.href = "tel:+9118001234567"
      flashNotice("Opening dialer...", "info")
    }
  }

  const noticeToneClass =
    notice?.tone === "success" ? "border-bull/40 bg-bull/10 text-bull" : "border-info/40 bg-info/10 text-info"

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-info/30 bg-info/5 p-3">
        <p className="text-xs font-bold text-info">Need help? We're here 24/7</p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">Average response time: under 5 minutes</p>
        <a
          href={SUPPORT_MAILTO}
          className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-info hover:underline"
          onClick={() => flashNotice("Opening your email app...", "info")}
        >
          <Mail className="size-3.5" />
          {SUPPORT_EMAIL}
        </a>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <ContactBtn icon={<MessageSquare className="size-5" />} label="Live Chat" onClick={() => handleContact("chat")} />
        <ContactBtn icon={<Mail className="size-5" />} label="Email" onClick={() => handleContact("email")} />
        <ContactBtn icon={<Phone className="size-5" />} label="Call" onClick={() => handleContact("call")} />
      </div>
      {notice && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`rounded-lg border px-3 py-2 text-[11px] font-semibold ${noticeToneClass}`}
        >
          {notice.msg}
        </motion.div>
      )}
      <div className="space-y-2">
        <p className="text-[10px] font-bold tracking-wide text-muted-foreground">LEGAL DOCUMENTS</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setLegalDoc("terms")}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card py-3 text-[10px] font-bold transition active:scale-95 hover:border-bull/40 hover:bg-bull/5"
          >
            <ScrollText className="size-5 text-info" />
            Terms & Conditions
          </button>
          <button
            onClick={() => setLegalDoc("privacy")}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card py-3 text-[10px] font-bold transition active:scale-95 hover:border-bull/40 hover:bg-bull/5"
          >
            <FileText className="size-5 text-info" />
            Privacy Policy
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-[10px] font-bold tracking-wide text-muted-foreground">FREQUENTLY ASKED QUESTIONS</p>
        {faqs.map((f, i) => (
          <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-2 p-3 text-left"
            >
              <span className="text-xs font-bold">{f.q}</span>
              <ChevronRight className={`size-4 shrink-0 text-muted-foreground transition ${open === i ? "rotate-90" : ""}`} />
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="px-3 pb-3 text-xs text-muted-foreground">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Legal modal — rendered at root level of HelpContent so it overlays everything */}
      {legalDoc && <LegalModal doc={legalDoc} onClose={() => setLegalDoc(null)} />}
    </div>
  )
}

function ContactBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-card py-3 text-[10px] font-bold transition active:scale-95 hover:border-bull/40 hover:bg-bull/5"
    >
      <span className="text-bull">{icon}</span>
      {label}
    </button>
  )
}
