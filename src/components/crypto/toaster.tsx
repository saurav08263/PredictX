"use client"

import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, XCircle, Info } from "lucide-react"
import { useCrypto } from "./store"

export function Toaster() {
  const { toasts } = useCrypto()

  return (
    <div className="pointer-events-none fixed inset-x-0 top-16 z-50 mx-auto flex max-w-md flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => {
          const styles =
            t.tone === "win"
              ? "border-bull/50 bg-bull/15 text-bull"
              : t.tone === "lose"
                ? "border-bear/50 bg-bear/15 text-bear"
                : "border-info/50 bg-info/15 text-info"
          const Icon = t.tone === "win" ? CheckCircle2 : t.tone === "lose" ? XCircle : Info
          return (
            <motion.div
              key={t.id}
              className={`pointer-events-auto flex w-full items-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold shadow-lg backdrop-blur ${styles}`}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Icon className="size-4 shrink-0" />
              <span>{t.msg}</span>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
