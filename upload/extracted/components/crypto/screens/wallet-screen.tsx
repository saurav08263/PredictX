import { Wallet, ArrowDownToLine, ArrowUpFromLine, ShieldCheck, Zap, Lock } from "lucide-react"

const providers = ["UPI", "Paytm", "G Pay", "PhonePe", "BANK"]

export function WalletScreen() {
  return (
    <div className="flex flex-col gap-4 px-4 pb-4 pt-3">
      {/* Balance hero */}
      <div className="rounded-2xl border border-bull/30 bg-card p-5 text-center glow-green">
        <p className="text-[11px] font-semibold tracking-wide text-muted-foreground">TOTAL BALANCE</p>
        <p className="mt-1 text-4xl font-extrabold text-glow-green">₹28,450.75</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 rounded-xl bg-bull py-3 text-sm font-bold text-black">
            <ArrowDownToLine className="size-4" /> DEPOSIT
          </button>
          <button className="flex items-center justify-center gap-2 rounded-xl border border-info bg-info/10 py-3 text-sm font-bold text-info">
            <ArrowUpFromLine className="size-4" /> WITHDRAW
          </button>
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground">WINNINGS</p>
          <p className="mt-1 text-xl font-bold text-bull">₹12,75,500</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-[10px] font-semibold tracking-wide text-muted-foreground">BONUS</p>
          <p className="mt-1 text-xl font-bold text-gold">₹1,250</p>
        </div>
      </div>

      {/* Payment methods */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <Wallet className="size-5 text-gold" />
          <h2 className="font-bold tracking-wide">PAYMENT METHODS</h2>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {providers.map((p) => (
            <span
              key={p}
              className="rounded-md border border-border bg-panel py-3 text-center text-sm font-bold text-muted-foreground"
            >
              {p}
            </span>
          ))}
        </div>
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
    </div>
  )
}
