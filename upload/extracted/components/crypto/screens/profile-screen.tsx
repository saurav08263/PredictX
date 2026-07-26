import Image from "next/image"
import {
  ChevronRight,
  Trophy,
  Gift,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  Crown,
} from "lucide-react"

const menu = [
  { icon: Trophy, label: "My Achievements" },
  { icon: Gift, label: "Refer & Earn" },
  { icon: Bell, label: "Notifications" },
  { icon: Shield, label: "Security & KYC" },
  { icon: HelpCircle, label: "Help & Support" },
]

export function ProfileScreen() {
  return (
    <div className="flex flex-col gap-4 px-4 pb-4 pt-3">
      {/* Profile header */}
      <div className="flex flex-col items-center rounded-2xl border border-gold/30 bg-card p-5 text-center">
        <span className="relative overflow-hidden rounded-full border-2 border-gold glow-gold">
          <Image src="/images/winner-1.png" alt="Your avatar" width={80} height={80} className="size-20 object-cover" />
        </span>
        <h2 className="mt-3 flex items-center gap-1.5 text-lg font-extrabold">
          VIPER TRADER <Crown className="size-4 text-gold" />
        </h2>
        <p className="text-xs text-muted-foreground">ID: #5489756 • Joined 2024</p>
        <div className="mt-4 grid w-full grid-cols-3 gap-2 border-t border-border pt-4">
          <div>
            <p className="text-lg font-bold text-bull">248</p>
            <p className="text-[10px] text-muted-foreground">WINS</p>
          </div>
          <div>
            <p className="text-lg font-bold">312</p>
            <p className="text-[10px] text-muted-foreground">TOTAL BETS</p>
          </div>
          <div>
            <p className="text-lg font-bold text-gold">79%</p>
            <p className="text-[10px] text-muted-foreground">WIN RATE</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {menu.map((m, i) => (
          <button
            key={m.label}
            className={`flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm font-semibold ${
              i !== menu.length - 1 ? "border-b border-border/60" : ""
            }`}
          >
            <m.icon className="size-5 text-muted-foreground" />
            <span className="flex-1">{m.label}</span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </button>
        ))}
      </div>

      <button className="flex items-center justify-center gap-2 rounded-2xl border border-bear/40 bg-bear/10 py-3.5 text-sm font-bold text-bear">
        <LogOut className="size-4" /> LOG OUT
      </button>
    </div>
  )
}
