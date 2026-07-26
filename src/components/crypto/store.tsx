"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { signInWithPopup } from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"
export type Coin = "BTCUSDT" | "ETHUSDT" | "SOLUSDT"

export interface CoinConfig {
  id: Coin; label: string; icon: string; precision: number
}

export const COUNTRIES = [
  { code: "IN", label: "India", symbol: "₹ ", rate: 85 },
]

export const COINS: CoinConfig[] = [
  { id: "BTCUSDT", label: "Bitcoin", icon: "₿", precision: 2 },
  { id: "ETHUSDT", label: "Ethereum", icon: "Ξ", precision: 2 },
  { id: "SOLUSDT", label: "Solana", icon: "◎", precision: 3 },
]

export const DURATIONS = [5, 10, 20, 30, 40, 50, 60]
export const AMOUNT_OPTIONS = [100, 500, 1000, 5000, 10000]

interface CryptoContextType {

  login: (email: string, password: string) => Promise<void>

signup: (
  name: string,
  email: string,
  password: string,
  referral?: string
) => Promise<any>

loginWithGoogle: (referral?: string) => Promise<any>

sendOtp: (phone: string) => Promise<any>

verifyOtp: (
  phone: string,
  otp: string,
  referral?: string
) => Promise<any>

authLoading: boolean

authError: string | null
  authStatus: "loading" | "authenticated" | "unauthenticated"
  country: any; fmt: any; mounted: boolean; prices: Record<Coin, number>
  currentRound: { timeLeft: number; duration: number; coin: Coin; entryPrice: number }
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>; activeBet: any; lastResult: any
  toasts: any[]; addToast: (msg: string, tone?: string) => void; selectedCoin: CoinConfig; setSelectedCoin: (c: CoinConfig) => void
  placeBet: (direction: "UP" | "DOWN", coin: Coin, duration: number, amount: number) => Promise<void>
  clearLastResult: () => void;
  logout: () => Promise<void>
  userId: string | null
  userName: string
  authMethod: string | null
  email: string | null
  phone: string | null
  twoFactorEnabled: boolean
  setTwoFactorEnabled: React.Dispatch<React.SetStateAction<boolean>>
  transactions: any[]
  recentBets: any[]
  priceHistory: Record<Coin, number[]>
}

const CryptoContext = createContext<CryptoContextType | undefined>(undefined)

export function CryptoProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const [authStatus, setAuthStatus] = useState<
  "loading" | "authenticated" | "unauthenticated"
>("authenticated")
const [authLoading, setAuthLoading] = useState(false)
const [authError, setAuthError] = useState<string | null>(null)
  const [selectedCoin, setSelectedCoin] = useState<CoinConfig>(COINS[0])
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState("Trader")
  const [authMethod, setAuthMethod] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [phone, setPhone] = useState<string | null>(null)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [balance, setBalance] = useState(153000)
  const [activeBet, setActiveBet] = useState<any>(null)
  const [lastResult, setLastResult] = useState<any>(null)
  const [toasts, setToasts] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [recentBets, setRecentBets] = useState<any[]>([])
  
  const [prices, setPrices] = useState<Record<Coin, number>>({ 
    BTCUSDT: 62201.01, 
    ETHUSDT: 3448.21, 
    SOLUSDT: 144.33 
  })

  const [priceHistory] = useState<Record<Coin, number[]>>({
    BTCUSDT: [62201.01], ETHUSDT: [3448.21], SOLUSDT: [144.33]
  })
  
  const [currentRound, setCurrentRound] = useState({ 
    timeLeft: 30, duration: 30, coin: "BTCUSDT" as Coin, entryPrice: 62201.01
  })
  
  const country = COUNTRIES[0]
  const fmt = (amt: number) => `${country.symbol}${Math.round(amt).toLocaleString("en-IN")}`

  const activeBetRef = useRef(activeBet)
  activeBetRef.current = activeBet
  const pricesRef = useRef(prices)
  pricesRef.current = prices
  const selectedCoinRef = useRef(selectedCoin)
  selectedCoinRef.current = selectedCoin

  useEffect(() => { setMounted(true) }, [])

  const addToast = useCallback((msg: string, tone = "info") => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message: msg, tone }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const interval = setInterval(() => {
      setPrices(prev => ({
        BTCUSDT: +(prev.BTCUSDT + (Math.random() - 0.5) * 10).toFixed(2),
        ETHUSDT: +(prev.ETHUSDT + (Math.random() - 0.5) * 1.5).toFixed(2),
        SOLUSDT: +(prev.SOLUSDT + (Math.random() - 0.5) * 0.1).toFixed(2)
      }))
    }, 1000)
    return () => clearInterval(interval)
  }, [mounted])

  useEffect(() => {
    if (!mounted) return
    const timer = setInterval(() => {
      setCurrentRound((prev) => {
        const targetCoin = selectedCoinRef.current.id
        
        if (!prev || prev.coin !== targetCoin) {
          return { timeLeft: 30, duration: 30, coin: targetCoin, entryPrice: pricesRef.current[targetCoin] }
        }

        if (prev.timeLeft > 1) {
          return { ...prev, timeLeft: prev.timeLeft - 1 }
        } else {
          const currentBet = activeBetRef.current
          if (currentBet && currentBet.coin === targetCoin) {
            const finalPrice = pricesRef.current[targetCoin]
            const isWon = (currentBet.direction === "UP" && finalPrice > currentBet.entryPrice) || 
                          (currentBet.direction === "DOWN" && finalPrice < currentBet.entryPrice)
            const payout = isWon ? Math.round(currentBet.amount * 1.8) : 0

            setTimeout(() => {
              if (payout > 0) setBalance(b => b + payout)
              setActiveBet(null)
              setLastResult({ won: isWon, payout })
              
              setTransactions(prevTx => [
                { id: "TX-" + Date.now(), type: isWon ? "WIN" : "LOSS", amount: isWon ? payout : currentBet.amount, title: isWon ? "Prediction Won" : "Prediction Lost", date: "Just Now" },
                ...prevTx
              ])
              addToast(isWon ? `Position Won! +${fmt(payout)}` : "Round Finished", isWon ? "win" : "loss")
            }, 50)
          }
          return { timeLeft: prev.duration, duration: prev.duration, coin: targetCoin, entryPrice: pricesRef.current[targetCoin] }
        }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [mounted, addToast])

  const login = async (email: string, password: string) => {
  setAuthLoading(true)
  setAuthError(null)

  setAuthStatus("authenticated")
  setUserId("USER001")
  setUserName("Trader")
  setEmail(email)
  setAuthMethod("email")

  addToast("Login Successful", "success")

  setAuthLoading(false)
}

const placeBet = useCallback(
  async (
    direction: "UP" | "DOWN",
    coin: Coin,
    duration: number,
    amount: number
  ) => {
    if (balance < amount) {
      addToast("Insufficient Balance ❌", "loss")
      return
    }

    const entryPrice = pricesRef.current[coin]

    setActiveBet({
      direction,
      coin,
      duration,
      amount,
      entryPrice,
    })

    setBalance((prev) => prev - amount)

    setCurrentRound({
      timeLeft: duration,
      duration,
      coin,
      entryPrice,
    })

    addToast(`Position opened: ${direction} 🚀`, "success")
  },
  [balance, addToast]
)

const signup = async () => {
  return { success: false }
}

const loginWithGoogle = async (referral?: string) => {
  try {
    setAuthLoading(true)
    setAuthError(null)

    const result = await signInWithPopup(auth, googleProvider)

    const user = result.user

    setAuthStatus("authenticated")
    setUserId(user.uid)
    setUserName(user.displayName || "Trader")
    setEmail(user.email || "")
    setPhone(user.phoneNumber || "")
    setAuthMethod("google")

    addToast("Google Login Successful", "success")

    return {
      success: true,
      user,
    }
  } catch (err: any) {
    console.error(err)

    setAuthError(err.message)

    return {
      success: false,
      error: err.message,
    }
  } finally {
    setAuthLoading(false)
  }
}

const sendOtp = async () => {
  return { success: false }
}

const verifyOtp = async () => {
  return { success: false }
}
  
  const logout = useCallback(async () => {
    setAuthStatus("unauthenticated")
    setUserId(null)
    setUserName("Trader")
    setAuthMethod(null)
    setEmail(null)
    setPhone(null)
    setTwoFactorEnabled(false)
    addToast("Logged out successfully", "info")
  }, [addToast])

  return (
    <CryptoContext.Provider value={{
      country, fmt, mounted, authStatus, prices, currentRound, balance, setBalance, activeBet, lastResult,
      toasts, addToast, selectedCoin, setSelectedCoin, placeBet, transactions, recentBets, priceHistory,
      
login,
signup,
loginWithGoogle,
sendOtp,
verifyOtp,
authLoading,
authError,
      logout, userId, userName, authMethod, email, phone, twoFactorEnabled, setTwoFactorEnabled,
      clearLastResult: () => setLastResult(null)
    }}>
      {children}
    </CryptoContext.Provider>
  )
}

export function useCrypto() {
  const context = useContext(CryptoContext)
  if (!context) throw new Error("useCrypto error")
  return context
}

export const formatPrice = (p: number, id: string) => (p || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const formatClock = (s: number) => {
  const m = Math.floor(s / 60)
  const r = Math.round(s % 60)
  return `${m}:${r < 10 ? "0" : ""}${r}`
}