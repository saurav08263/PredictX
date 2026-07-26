import { create } from "zustand"

export type Coin =
  | "BTCUSDT"
  | "ETHUSDT"
  | "SOLUSDT"

type PriceState = {
  prices: Record<Coin, number>

  history: Record<Coin, number[]>

  connected: boolean

  setConnected: (v: boolean) => void

  updatePrices: (
    prices: Record<Coin, number>
  ) => void

  clearHistory: () => void
}

const MAX_HISTORY = 60

export const usePriceStore =
  create<PriceState>((set) => ({
    prices: {
      BTCUSDT: 0,
      ETHUSDT: 0,
      SOLUSDT: 0,
    },

    history: {
      BTCUSDT: [],
      ETHUSDT: [],
      SOLUSDT: [],
    },

    connected: false,

    setConnected: (v) =>
      set({
        connected: v,
      }),

    updatePrices: (prices) =>
      set((state) => {
        const nextHistory = {
          ...state.history,
        }

        ;(
          [
            "BTCUSDT",
            "ETHUSDT",
            "SOLUSDT",
          ] as Coin[]
        ).forEach((coin) => {
          const value =
            Number(prices[coin]) || 0

          if (!value) return

          const arr = [
            ...state.history[coin],
            value,
          ]

          if (
            arr.length > MAX_HISTORY
          ) {
            arr.shift()
          }

          nextHistory[coin] = arr
        })

        return {
          prices,
          history: nextHistory,
        }
      }),

    clearHistory: () =>
      set({
        history: {
          BTCUSDT: [],
          ETHUSDT: [],
          SOLUSDT: [],
        },
      }),
  }))