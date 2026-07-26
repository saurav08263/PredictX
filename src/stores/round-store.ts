import { create } from "zustand"
import type { Coin, Duration } from "@/components/crypto/store"

export type RoundInfo = {
  roundId: string
  coin: Coin
  duration: Duration
  entryPrice: number
  currentPrice: number
  startTime: number
  endTime: number
}

type RoundState = {
  round: RoundInfo | null

  loading: boolean

  setRound: (round: RoundInfo | null) => void

  updateCurrentPrice: (price: number) => void

  fetchRound: (
    coin: Coin,
    duration: Duration
  ) => Promise<void>
}

export const useRoundStore =
  create<RoundState>((set) => ({
    round: null,

    loading: false,

    setRound: (round) =>
      set({
        round,
      }),

    updateCurrentPrice: (price) =>
      set((state) => {
        if (!state.round) return state

        return {
          round: {
            ...state.round,
            currentPrice: price,
          },
        }
      }),

    fetchRound: async (
      coin,
      duration
    ) => {
      try {
        set({
          loading: true,
        })

        const res =
          await fetch(
            `/api/round/current?coin=${coin}&duration=${duration}`
          )

        if (!res.ok) {
          set({
            loading: false,
          })
          return
        }

        const data =
          await res.json()

        set({
          round: {
            roundId: data.roundId,
            coin: data.coin,
            duration: data.duration,
            entryPrice:
              data.entryPrice,
            currentPrice:
              data.currentPrice ??
              data.entryPrice,

            startTime:
              new Date(
                data.startTime
              ).getTime(),

            endTime:
              new Date(
                data.endTime
              ).getTime(),
          },

          loading: false,
        })
      } catch {
        set({
          loading: false,
        })
      }
    },
  }))