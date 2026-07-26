"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Newspaper, RefreshCw, AlertCircle, ExternalLink } from "lucide-react"

type NewsItem = {
  title: string
  snippet: string
  url: string
  source: string
  date: string
}

export function CryptoNews() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNews = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/ai/news")

      if (!res.ok) {
        throw new Error("Failed to fetch news")
      }

      const data = await res.json()
      setNews(data.news || [])
    } catch (err) {
      setError("Could not fetch news. Try again.")
      console.error("Crypto News fetch error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Newspaper className="size-5 text-info" />
          <h2 className="font-bold tracking-wide">CRYPTO NEWS</h2>
        </div>
        <motion.button
          onClick={fetchNews}
          disabled={loading}
          className="flex items-center gap-1 rounded-md border border-info/40 bg-info/10 px-2 py-1 text-[10px] font-bold text-info disabled:opacity-50"
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className={`size-3 ${loading ? "animate-spin" : ""}`} />
          {news.length > 0 ? "REFRESH" : "LOAD"}
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 py-4"
          >
            <div className="size-2 animate-pulse rounded-full bg-info" />
            <div className="size-2 animate-pulse rounded-full bg-info [animation-delay:0.2s]" />
            <div className="size-2 animate-pulse rounded-full bg-info [animation-delay:0.4s]" />
            <span className="text-[10px] text-muted-foreground">Fetching latest news...</span>
          </motion.div>
        )}

        {error && !loading && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 py-2"
          >
            <AlertCircle className="size-3.5 text-bear" />
            <span className="text-[10px] text-bear">{error}</span>
          </motion.div>
        )}

        {news.length > 0 && !loading && (
          <motion.ul
            key="news"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3"
          >
            {news.map((item, i) => (
              <motion.li
                key={i}
                className="flex flex-col gap-1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-1.5 text-sm font-bold leading-tight tracking-wide transition hover:text-info"
                >
                  <span className="flex-1">{item.title}</span>
                  <ExternalLink className="mt-0.5 size-3 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                </a>
                <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
                  {item.snippet}
                </p>
                <div className="flex items-center gap-2 text-[9px] text-muted-foreground/70">
                  <span>{item.source}</span>
                  {item.date && (
                    <>
                      <span>·</span>
                      <span>{item.date}</span>
                    </>
                  )}
                </div>
                {i < news.length - 1 && <div className="mt-1 border-b border-border" />}
              </motion.li>
            ))}
          </motion.ul>
        )}

        {news.length === 0 && !loading && !error && (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[10px] text-muted-foreground"
          >
            Tap LOAD to get the latest crypto and Bitcoin news.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
