import Image from "next/image"
import {
  Crown,
  User,
  Wallet,
  Trophy,
  Coins,
  ArrowUpDown,
  ShieldCheck,
  Scale,
  Zap,
} from "lucide-react"

const winners = [
  { rank: 1, name: "VIPER TRADER", amount: "₹8,75,000", img: "/images/winner-1.png", ring: "border-gold" },
  { rank: 2, name: "CRYPTO KING", amount: "₹6,45,000", img: "/images/winner-2.png", ring: "border-slate-400" },
  { rank: 3, name: "PREDICT PRO", amount: "₹5,20,000", img: "/images/winner-3.png", ring: "border-amber-700" },
]

function RankBadge({ rank }: { rank: number }) {
  const styles =
    rank === 1 ? "bg-gold text-black" : rank === 2 ? "bg-slate-300 text-black" : "bg-amber-700 text-white"
  return (
    <span className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${styles}`}>
      {rank}
    </span>
  )
}

export function HomeScreen() {
  return (
    <div className="flex flex-col gap-4 px-4 pb-4 pt-3">
      {/* Branding */}
      <div className="relative overflow-hidden rounded-2xl border border-border">
        <Image
          src="/images/bull-bear-hero.png"
          alt="Bull versus bear crypto battle"
          width={640}
          height={260}
          className="h-40 w-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <Crown className="size-6 text-gold text-glow-gold" />
          <h1 className="text-2xl font-extrabold leading-none tracking-tight">
            <span className="text-white">CRYPTO</span>{" "}
            <span className="block text-bull text-glow-green">PREDICTOR</span>
          </h1>
          
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-2 text-[10px] font-semibold tracking-wide text-muted-foreground">
            <User className="size-3.5" /> USERS ONLINE
          </div>
          <p className="mt-1 text-lg font-bold">
            4,52,102 <span className="ml-1 text-[10px] font-semibold text-bull">● LIVE</span>
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-2 text-[10px] font-semibold tracking-wide text-muted-foreground">
            <Wallet className="size-3.5 text-info" /> PAYOUTS TODAY
          </div>
          <p className="mt-1 text-lg font-bold text-bull text-glow-green">₹11,48,75,200</p>
        </div>
      </div>

      {/* Promo banner */}
      <div className="relative overflow-hidden rounded-2xl border border-bear/40">
        <Image
          src="/images/rocket-promo.png"
          alt="Instant withdrawal promotion"
          width={640}
          height={170}
          className="h-28 w-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col justify-center pl-4">
          <p className="text-[11px] font-bold tracking-wide text-white">INSTANT WITHDRAWAL</p>
          <p className="text-3xl font-extrabold leading-none text-bull text-glow-green">1 SECOND</p>
          <p className="mt-1 text-[11px] font-semibold tracking-wide text-white/80">UPI FAST PAYOUT</p>
        </div>
      </div>

      {/* Top winners */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="size-5 text-gold" />
            <h2 className="font-bold tracking-wide">TOP WINNERS</h2>
          </div>
          <button className="rounded-md border border-info/50 px-2 py-1 text-[10px] font-bold text-info">
            VIEW ALL
          </button>
        </div>
        <ul className="flex flex-col gap-3">
          {winners.map((w) => (
            <li key={w.rank} className="flex items-center gap-3">
              <RankBadge rank={w.rank} />
              <span className={`overflow-hidden rounded-full border-2 ${w.ring}`}>
                <Image src={w.img} alt={w.name} width={36} height={36} className="size-9 object-cover" />
              </span>
              <span className="flex-1 text-sm font-bold tracking-wide">{w.name}</span>
              <span className="text-sm font-bold text-bull">{w.amount}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* How to play */}
      <div className="rounded-2xl border border-info/30 bg-card p-4">
        <h2 className="mb-4 font-bold tracking-wide">HOW TO PLAY?</h2>
        <div className="flex items-start justify-between gap-2 text-center">
          <Step icon={<Coins className="size-6 text-gold" />} n={1} label={"CHOOSE\nAMOUNT"} />
          <Arrow />
          <Step icon={<ArrowUpDown className="size-6 text-bull" />} n={2} label={"PREDICT\nUP/DOWN"} />
          <Arrow />
          <Step icon={<Wallet className="size-6 text-gold" />} n={3} label={"GET 1.8x\nPROFIT"} />
        </div>
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-3">
        <TrustBadge icon={<ShieldCheck className="size-5 text-bull" />} label={"100%\nSECURE"} />
        <TrustBadge icon={<Scale className="size-5 text-info" />} label={"FAIR\nPLAY"} />
        <TrustBadge icon={<Zap className="size-5 text-gold" />} label={"FAST\nWITHDRAWAL"} />
      </div>
    </div>
  )
}

function Step({ icon, n, label }: { icon: React.ReactNode; n: number; label: string }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1">
      <div className="relative flex size-12 items-center justify-center rounded-full border border-border bg-muted">
        {icon}
        <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-info text-[9px] font-bold text-white">
          {n}
        </span>
      </div>
      <p className="whitespace-pre-line text-[10px] font-bold leading-tight text-muted-foreground">{label}</p>
    </div>
  )
}

function Arrow() {
  return <span className="mt-4 text-muted-foreground">›</span>
}

function TrustBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-card py-3">
      {icon}
      <p className="whitespace-pre-line text-center text-[10px] font-bold leading-tight text-muted-foreground">
        {label}
      </p>
    </div>
  )
}
