"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  Crown,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Trophy,
  Wallet,
  Flame,
  Star,
  Gift,
} from "lucide-react"
import { useCrypto } from "../store"
import { LegalModal, type LegalDoc } from "../legal-modal"

type Mode = "signin" | "signup"
type AuthView = "form" | "phone" | "otp"

export function AuthScreen() {
  const {
    login,
    signup,
    loginWithGoogle,
    sendOtp,
    verifyOtp,
    authLoading,
    authError,
  } = useCrypto()

  const [mode, setMode] = useState<Mode>("signin")
  const [view, setView] = useState<AuthView>("form")

  // Form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [demoOtp, setDemoOtp] = useState<string | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)
  // Legal modal (Privacy Policy / Terms & Conditions) — opened from the
  // "By continuing you agree to our Terms & Privacy Policy" footer.
  const [legalDoc, setLegalDoc] = useState<LegalDoc | null>(null)
  // Read referral code from URL (?ref=CPXXXX) once on first render.
  // Using a lazy initializer avoids the setState-in-effect anti-pattern.
  const [referralCode, setReferralCode] = useState<string | null>(() => {
    if (typeof window === "undefined") return null
    try {
      const params = new URLSearchParams(window.location.search)
      const ref = params.get("ref")
      return ref ? ref.toUpperCase() : null
    } catch {
      return null
    }
  })
  const [showRefInput, setShowRefInput] = useState(() => {
    if (typeof window === "undefined") return false
    try {
      return new URLSearchParams(window.location.search).has("ref")
    } catch {
      return false
    }
  })
  const [refInput, setRefInput] = useState<string>(() => {
    if (typeof window === "undefined") return ""
    try {
      const ref = new URLSearchParams(window.location.search).get("ref")
      return ref ? ref.toUpperCase() : ""
    } catch {
      return ""
    }
  })
  const otpInputRef = useRef<HTMLInputElement | null>(null)

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  const error = localError || authError

  const switchMode = (m: Mode) => {
    setMode(m)
    setView("form")
    setLocalError(null)
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (mode === "signup") {
      if (!name.trim()) {
        setLocalError("Please enter your name")
        return
      }
      if (password.length < 6) {
        setLocalError("Password must be at least 6 characters")
        return
      }
      await signup(name.trim(), email.trim(), password, referralCode || undefined)
    } else {
      if (!email.trim() || !password) {
        setLocalError("Please enter your email and password")
        return
      }
      await login(email.trim(), password)
    }
  }

  const handleGoogle = async () => {
    setLocalError(null)
    await loginWithGoogle(referralCode || undefined)
  }

  const handleSendOtp = async () => {
    setLocalError(null)
    const digits = phone.replace(/\D/g, "")
    if (digits.length < 10) {
      setLocalError("Please enter a valid 10-digit phone number")
      return
    }
    const fullPhone = phone.startsWith("+") ? phone : `+91 ${phone}`
    const res = await sendOtp(fullPhone)
    if (res.success && res.otp) {
      setDemoOtp(res.otp)
      setView("otp")
      setResendCooldown(30)
      setTimeout(() => otpInputRef.current?.focus(), 100)
    }
  }

  const handleVerifyOtp = async () => {
    setLocalError(null)
    if (otp.length !== 6) {
      setLocalError("Please enter the 6-digit code")
      return
    }
    const fullPhone = phone.startsWith("+") ? phone : `+91 ${phone}`
    await verifyOtp(fullPhone, otp, referralCode || undefined)
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return
    setOtp("")
    setDemoOtp(null)
    await handleSendOtp()
  }

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background text-foreground overflow-hidden">
      {/* ────────────────────────────────────────────────────────── */}
      {/* HERO — Bull vs Bear battleground                          */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="relative h-72 overflow-hidden">
        {/* Background image */}
        <Image
          src="/images/bull-bear-hero.png"
          alt="Bull versus bear crypto battle"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover"
        />
        {/* Cinematic gradient overlays */}
       <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent" />

<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(5,8,12,0.15)_100%)]" />

        {/* Animated BULL badge (top-left) */}
        <motion.div
          className="absolute left-5 top-7 flex items-center gap-1.5 rounded-full border border-bull/40 bg-bull/15 px-3 py-1 backdrop-blur-md"
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <TrendingUp className="size-3.5 text-bull" />
          <span className="text-[10px] font-extrabold tracking-wider text-bull">BULL UP</span>
          <motion.span
            className="size-1.5 rounded-full bg-bull"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        </motion.div>

        {/* Animated BEAR badge (top-right) */}
        <motion.div
          className="absolute right-5 top-7 flex items-center gap-1.5 rounded-full border border-bear/40 bg-bear/15 px-3 py-1 backdrop-blur-md"
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          <motion.span
            className="size-1.5 rounded-full bg-bear"
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
          />
          <span className="text-[10px] font-extrabold tracking-wider text-bear">BEAR DOWN</span>
          <TrendingDown className="size-3.5 text-bear" />
        </motion.div>

        {/* Centered brand */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          

          {/* Wordmark */}
          <motion.h1
            className="text-[28px] font-black leading-none tracking-tight"
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            
          </motion.h1>

          {/* Tagline */}
          <motion.div
            className="mt-2 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <span className="h-px w-6 bg-gradient-to-r from-transparent to-gold/60" />
            
            <span className="h-px w-6 bg-gradient-to-l from-transparent to-gold/60" />
          </motion.div>

          {/* Live stats strip */}
         
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* FORM AREA                                                  */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col px-5 pb-8 pt-5">
        {/* Welcome heading */}
        {view !== "otp" && (
          <motion.div
            className="mb-4 text-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <h2 className="text-xl font-extrabold">
              {mode === "signin" ? "Welcome Back, Trader!" : "Join the Battle!"}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {mode === "signin"
                ? "Sign in to continue your winning streak"
                : "Get ₹10,000 welcome bonus on signup"}
            </p>
          </motion.div>
        )}

        {/* Mode toggle (only on form/phone views) */}
        {view !== "otp" && (
          <div className="mb-5 flex rounded-xl border border-border bg-card p-1">
            <button
              onClick={() => switchMode("signin")}
              className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition ${
                mode === "signin" ? "bg-bull text-black glow-green" : "text-muted-foreground"
              }`}
            >
              SIGN IN
            </button>
            <button
              onClick={() => switchMode("signup")}
              className={`flex-1 rounded-lg py-2.5 text-xs font-bold transition ${
                mode === "signup" ? "bg-bull text-black glow-green" : "text-muted-foreground"
              }`}
            >
              SIGN UP
            </button>
          </div>
        )}

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 flex items-center gap-2 rounded-lg border border-bear/40 bg-bear/10 px-3 py-2 text-xs font-semibold text-bear"
            >
              <span className="size-1.5 shrink-0 rounded-full bg-bear" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {/* ═══════════════ FORM VIEW ═══════════════ */}
          {view === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Google sign-in — hero CTA */}
              <motion.button
                onClick={handleGoogle}
                disabled={authLoading}
                whileTap={{ scale: 0.97 }}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white py-3.5 text-sm font-bold text-gray-800 shadow-[0_4px_20px_rgba(255,255,255,0.1)] transition disabled:opacity-60"
              >
                <GoogleIcon className="size-5" />
                Continue with Google
              </motion.button>

              {/* Divider */}
              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[10px] font-bold tracking-widest text-muted-foreground">
                  OR {mode === "signup" ? "SIGN UP WITH EMAIL" : "SIGN IN WITH EMAIL"}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {/* Email/password form */}
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                {mode === "signup" && (
                  <InputField
                    icon={<User className="size-4 text-muted-foreground" />}
                    type="text"
                    placeholder="Full name"
                    value={name}
                    onChange={setName}
                    autoComplete="name"
                  />
                )}
                <InputField
                  icon={<Mail className="size-4 text-muted-foreground" />}
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={setEmail}
                  autoComplete="email"
                />
                <InputField
                  icon={<Lock className="size-4 text-muted-foreground" />}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={setPassword}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  trailingIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  }
                />

                <motion.button
                  type="submit"
                  disabled={authLoading}
                  whileTap={{ scale: 0.97 }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-bull py-3.5 text-sm font-bold text-black glow-green transition disabled:opacity-60"
                >
                  {authLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      {mode === "signup" ? "CREATE ACCOUNT" : "SIGN IN"}
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Phone auth option */}
              <motion.button
                onClick={() => {
                  setView("phone")
                  setLocalError(null)
                }}
                whileTap={{ scale: 0.97 }}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-info/40 bg-info/10 py-3 text-sm font-bold text-info transition"
              >
                <Phone className="size-4" />
                Continue with Mobile Number
              </motion.button>

              {/* Referral code input (only on signup) */}
              {mode === "signup" && (
                <div className="mt-3">
                  {showRefInput ? (
                    <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
                      <Gift className="size-4 text-gold shrink-0" />
                      <input
                        type="text"
                        placeholder="Enter referral code (e.g. CPXXXXXX)"
                        value={refInput}
                        onChange={(e) => {
                          const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12)
                          setRefInput(v)
                          setReferralCode(v || null)
                        }}
                        className="flex-1 bg-transparent text-xs font-semibold uppercase tracking-wider outline-none placeholder:text-muted-foreground placeholder:normal-case"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setShowRefInput(false)
                          if (!refInput) setReferralCode(null)
                        }}
                        className="text-[10px] font-bold text-muted-foreground hover:text-foreground"
                      >
                        DONE
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowRefInput(true)}
                      className="flex w-full items-center justify-center gap-1.5 text-[11px] font-semibold text-muted-foreground hover:text-gold transition"
                    >
                      <Gift className="size-3.5" />
                      {referralCode ? (
                        <span className="text-gold">Referral applied: {referralCode}</span>
                      ) : (
                        <span>Have a referral code? Get ₹2,000 bonus</span>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Feature highlights row */}
              <div className="mt-5 grid grid-cols-3 gap-2">
                <FeaturePill
                  icon={<ShieldCheck className="size-3.5 text-bull" />}
                  label="100% SECURE"
                  tone="bull"
                />
                <FeaturePill
                  icon={<Zap className="size-3.5 text-gold" />}
                  label="INSTANT PAYOUT"
                  tone="gold"
                />
                <FeaturePill
                  icon={<Sparkles className="size-3.5 text-info" />}
                  label="₹10K BONUS"
                  tone="info"
                />
              </div>
            </motion.div>
          )}

          {/* ═══════════════ PHONE VIEW ═══════════════ */}
          {view === "phone" && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <button
                onClick={() => setView("form")}
                className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" /> Back
              </button>

              <div className="text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 12 }}
                  className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-info/30 to-info/10 border border-info/30 glow-info"
                >
                  <Phone className="size-7 text-info" />
                </motion.div>
                <h2 className="text-lg font-extrabold">Enter Mobile Number</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  We'll send you a 6-digit verification code via SMS
                </p>
              </div>

              <div className="flex items-stretch gap-2">
                <div className="flex items-center rounded-xl border border-border bg-card px-3.5 text-sm font-bold text-muted-foreground">
                  🇮🇳 +91
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^\d\s]/g, ""))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendOtp()
                  }}
                  className="flex-1 rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-semibold tracking-wide outline-none focus:border-info transition-colors"
                  maxLength={12}
                />
              </div>

              <motion.button
                onClick={handleSendOtp}
                disabled={authLoading || phone.replace(/\D/g, "").length < 10}
                whileTap={{ scale: 0.97 }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-bull py-3.5 text-sm font-bold text-black glow-green transition disabled:opacity-60"
              >
                {authLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    SEND OTP
                    <ArrowRight className="size-4" />
                  </>
                )}
              </motion.button>

              <p className="text-center text-[10px] text-muted-foreground">
                By continuing you agree to our{" "}
                <button
                  type="button"
                  onClick={() => setLegalDoc("terms")}
                  className="font-semibold text-info hover:underline"
                >
                  Terms
                </button>{" "}
                &{" "}
                <button
                  type="button"
                  onClick={() => setLegalDoc("privacy")}
                  className="font-semibold text-info hover:underline"
                >
                  Privacy Policy
                </button>
              </p>

              <div className="text-center text-[10px] text-muted-foreground">
                Need help?{" "}
                <a
                  href="mailto:cryptosupport24@gmail.com?subject=Login%20Help"
                  className="inline-flex items-center gap-1 font-semibold text-info hover:underline"
                >
                  <Mail className="size-3" />
                  cryptosupport24@gmail.com
                </a>
              </div>
            </motion.div>
          )}

          {/* ═══════════════ OTP VIEW ═══════════════ */}
          {view === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <button
                onClick={() => {
                  setView("phone")
                  setOtp("")
                  setDemoOtp(null)
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" /> Change number
              </button>

              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 12 }}
                  className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-bull/30 to-bull/10 border border-bull/30 glow-green"
                >
                  <ShieldCheck className="size-7 text-bull" />
                </motion.div>
                <h2 className="text-lg font-extrabold">Verify OTP</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Enter the 6-digit code sent to{" "}
                  <span className="font-bold text-foreground">+91 {phone}</span>
                </p>
              </div>

              {/* Demo OTP banner */}
              {demoOtp && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-2 text-center"
                >
                  <p className="text-[10px] font-semibold text-gold">DEMO OTP</p>
                  <span className="font-mono text-2xl font-extrabold tracking-[0.4em] text-gold">
                    {demoOtp}
                  </span>
                  <p className="mt-0.5 text-[9px] text-muted-foreground">
                    (Production would send via SMS)
                  </p>
                </motion.div>
              )}

              <input
                ref={otpInputRef}
                type="text"
                inputMode="numeric"
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleVerifyOtp()
                }}
                className="w-full rounded-xl border border-border bg-card px-4 py-4 text-center text-2xl font-extrabold tracking-[0.5em] outline-none focus:border-bull transition-colors"
                maxLength={6}
              />

              <motion.button
                onClick={handleVerifyOtp}
                disabled={authLoading || otp.length !== 6}
                whileTap={{ scale: 0.97 }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-bull py-3.5 text-sm font-bold text-black glow-green transition disabled:opacity-60"
              >
                {authLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="size-4" /> VERIFY & CONTINUE
                  </>
                )}
              </motion.button>

              <div className="text-center text-xs text-muted-foreground">
                Didn't receive code?{" "}
                {resendCooldown > 0 ? (
                  <span className="font-semibold">Resend in {resendCooldown}s</span>
                ) : (
                  <button
                    onClick={handleResendOtp}
                    className="font-bold text-bull hover:underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <div className="text-center text-[10px] text-muted-foreground">
                Having trouble?{" "}
                <a
                  href="mailto:cryptosupport24@gmail.com?subject=OTP%20Login%20Help"
                  className="inline-flex items-center gap-1 font-semibold text-info hover:underline"
                >
                  <Mail className="size-3" />
                  cryptosupport24@gmail.com
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ────────────────────────────────────────────────────────── */}
        {/* FOOTER — Welcome bonus + testimonials                     */}
        {/* ────────────────────────────────────────────────────────── */}
        <div className="mt-auto pt-6">
          {view === "form" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 via-gold/5 to-transparent p-3.5"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold/20"
                >
                  <Wallet className="size-5 text-gold" />
                </motion.div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-gold">🎉 ₹10,000 WELCOME BONUS</p>
                  <p className="text-[10px] text-muted-foreground">
                    New users get instant bonus credited on signup
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Mini stats */}
          <div className="mt-3 flex items-center justify-around text-center">
            <MiniStat icon={<Star className="size-3 text-gold" />} value="4.8★" label="RATED" />
            <div className="h-8 w-px bg-border" />
            <MiniStat icon={<Flame className="size-3 text-bull" />} value="12L+" label="TRADES" />
            <div className="h-8 w-px bg-border" />
            <MiniStat icon={<Trophy className="size-3 text-gold" />} value="₹11CR" label="PAID OUT" />
          </div>
        </div>
      </div>

      {/* Legal modal — Privacy Policy / Terms & Conditions */}
      {legalDoc && <LegalModal doc={legalDoc} onClose={() => setLegalDoc(null)} />}
    </div>
  )
}

function InputField({
  icon,
  type,
  placeholder,
  value,
  onChange,
  autoComplete,
  trailingIcon,
}: {
  icon: React.ReactNode
  type: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  autoComplete?: string
  trailingIcon?: React.ReactNode
}) {
  return (
    <div className="relative flex items-center">
      <span className="absolute left-3.5">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-border bg-card py-3.5 pl-10 pr-10 text-sm font-semibold outline-none focus:border-bull transition-colors"
      />
      {trailingIcon && <span className="absolute right-3.5">{trailingIcon}</span>}
    </div>
  )
}

function FeaturePill({
  icon,
  label,
  tone,
}: {
  icon: React.ReactNode
  label: string
  tone: "bull" | "gold" | "info"
}) {
  const color =
    tone === "bull"
      ? "border-bull/30 bg-bull/5 text-bull"
      : tone === "gold"
        ? "border-gold/30 bg-gold/5 text-gold"
        : "border-info/30 bg-info/5 text-info"
  return (
    <div className={`flex flex-col items-center gap-1 rounded-xl border ${color} px-2 py-2.5`}>
      {icon}
      <span className="text-[9px] font-bold tracking-wider text-center">{label}</span>
    </div>
  )
}

function MiniStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: string
  label: string
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-1">
        {icon}
        <span className="text-xs font-extrabold">{value}</span>
      </div>
      <span className="text-[9px] font-semibold text-muted-foreground">{label}</span>
    </div>
  )
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}
