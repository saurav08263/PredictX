import { useBetStore } from "@/store/bet-store"

export const useActiveBet = () =>
useBetStore(s => s.activeBet)

export const useBetHistory = () =>
useBetStore(s => s.history)

export const useLastResult = () =>
useBetStore(s => s.lastResult)

export const useBet = () =>
useBetStore()