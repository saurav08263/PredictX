import { useRoundStore } from "@/store/round-store"

export function useRound() {
  return useRoundStore(
    (s) => s.round
  )
}

export function useFetchRound() {
  return useRoundStore(
    (s) => s.fetchRound
  )
}