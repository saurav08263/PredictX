"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react"
import { useCrypto, type Coin } from "./store"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

export function AiChat() {
  const { prices, balance } = useCrypto()
  console.log("AI CHAT PRICES:", prices)
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Listen for "open-ai-chat" events from other components (e.g., Help & Support modal)
  useEffect(() => {
    const handleOpen = () => setOpen(true)
    window.addEventListener("open-ai-chat", handleOpen)
    return () => window.removeEventListener("open-ai-chat", handleOpen)
  }, [])

  const sendMessage = useCallback(async () => {
    const msg = input.trim()
    if (!msg || loading) return

    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: msg }])
    setLoading(true)

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          context: {
            price: prices.BTCUSDT,
            change: prices.BTCUSDT,
            balance,
          },
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to get response")
      }

      const data = await res.json()
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't process that. Please try again." },
      ])
    } finally {
      setLoading(false)
    }
  }, [input, loading, prices, balance])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Floating chat button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-24 right-4 z-30 flex size-12 items-center justify-center rounded-full border border-gold/40 bg-card shadow-lg shadow-gold/20 sm:right-8"
        aria-label={open ? "Close AI chat" : "Open AI chat"}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="size-5 text-foreground" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="size-5 text-gold" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-x-4 bottom-36 z-30 mx-auto flex max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl sm:right-8 sm:left-auto sm:w-80"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-3">
              <Bot className="size-5 text-gold" />
              <div className="flex-1">
                <p className="text-sm font-bold">AI Trading Assistant</p>
                <p className="text-[9px] text-muted-foreground">Ask about price movements & predictions</p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close chat" className="text-muted-foreground">
                <X className="size-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 max-h-72 custom-scrollbar">
              {messages.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <Bot className="size-8 text-gold/50" />
                  <p className="text-[11px] text-muted-foreground">
                    Hi! I can help you understand Bitcoin price movements. Ask me anything!
                  </p>
                </div>
              )}

              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  className={`mb-3 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className={`flex max-w-[85%] items-start gap-1.5 rounded-xl px-3 py-2 ${
                      m.role === "user"
                        ? "bg-bull/15 text-foreground"
                        : "bg-card text-foreground"
                    }`}
                  >
                    {m.role === "assistant" && <Bot className="mt-0.5 size-3.5 shrink-0 text-gold" />}
                    <p className="text-[11px] leading-relaxed">{m.content}</p>
                    {m.role === "user" && <User className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="mb-3 flex justify-start">
                  <div className="flex items-center gap-2 rounded-xl bg-card px-3 py-2">
                    <Loader2 className="size-3.5 animate-spin text-gold" />
                    <span className="text-[10px] text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-border bg-card p-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about BTC price..."
                  disabled={loading}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none disabled:opacity-50"
                />
                <motion.button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="flex size-8 items-center justify-center rounded-lg bg-gold text-black disabled:opacity-40"
                  aria-label="Send message"
                  whileTap={{ scale: 0.9 }}
                >
                  <Send className="size-3.5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
