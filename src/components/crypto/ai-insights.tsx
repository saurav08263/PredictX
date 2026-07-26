"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, RefreshCw, AlertCircle } from "lucide-react"
import { useCrypto, type Coin } from "./store"

export function AiInsights({ coin: propCoin }: { coin?: Coin }) {
  const { prices, priceHistory } = useCrypto()
  const selectedCoin = propCoin || "BTCUSDT"
  const price = prices[selectedCoin]
  const history = priceHistory[selectedCoin] || []
  const change = history.length > 1 ? price - history[0] : 0

  const [insight, setInsight] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInsight = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price,
          change,
          history: history.slice(-10),
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to get AI insight")
      }

      const data = await res.json()
      setInsight(data.insight)
    } catch (err) {
      setError("Could not generate insight. Try again.")
      console.error("AI Insights fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [price, change, history])

  return (
    <div className="rounded-xl border border-info/30 bg-card p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-gold" />
          <h3 className="text-[11px] font-bold tracking-wide text-gold">AI INSIGHT</h3>
        </div>
        <motion.button
          onClick={fetchInsight}
          disabled={loading}
          className="flex items-center gap-1 rounded-md border border-info/40 bg-info/10 px-2 py-1 text-[10px] font-bold text-info disabled:opacity-50"
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className={`size-3 ${loading ? "animate-spin" : ""}`} />
          {insight ? "REFRESH" : "ANALYZE"}
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 py-2"
          >
            <div className="size-2 animate-pulse rounded-full bg-gold" />
            <div className="size-2 animate-pulse rounded-full bg-gold [animation-delay:0.2s]" />
            <div className="size-2 animate-pulse rounded-full bg-gold [animation-delay:0.4s]" />
            <span className="text-[10px] text-muted-foreground">Analyzing market data...</span>
          </motion.div>
        )}

        {error && !loading && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 py-1"
          >
            <AlertCircle className="size-3.5 text-bear" />
            <span className="text-[10px] text-bear">{error}</span>
          </motion.div>
        )}

        {insight && !loading && !error && (
          <motion.p
            key="insight"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-xs leading-relaxed text-foreground/90"
          >
            {insight}
          </motion.p>
        )}

        {!insight && !loading && !error && (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[10px] text-muted-foreground"
          >
            Tap ANALYZE to get an AI-powered prediction insight based on current market data.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
