"use client"

import { motion } from "framer-motion"
import { useCrypto } from "./store"

export function WinCelebration() {
  const { winEvent, clearWinEvent } = useCrypto()

  if (!winEvent) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Confetti particles */}
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute size-2 rounded-full"
          style={{
            backgroundColor: ["#2fe07a", "#ffd700", "#ff6b6b", "#4ecdc4", "#a855f7"][i % 5],
            left: `${Math.random() * 100}%`,
            top: "-5%",
          }}
          initial={{ y: 0, x: 0, opacity: 1 }}
          animate={{
            y: window.innerHeight * 1.2,
            x: (Math.random() - 0.5) * 200,
            opacity: [1, 1, 0],
            rotate: Math.random() * 720,
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 0.5,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Win text */}
      <motion.div
        className="text-center pointer-events-auto"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.3 }}
      >
        <motion.div
          className="text-6xl mb-3"
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          🏆
        </motion.div>
        <h2 className="text-3xl font-extrabold text-bull text-glow-green">YOU WON!</h2>
      </motion.div>

      {/* Auto-dismiss */}
      <motion.div
        className="absolute"
        animate={{ opacity: 0 }}
        transition={{ delay: 3.5 }}
        onAnimationComplete={clearWinEvent}
      />
    </motion.div>
  )
}
