import { usePriceStore } from "@/store/price-store"

export function usePrices() {
  return usePriceStore(
    (state) => state.prices
  )
}

export function usePriceHistory() {
  return usePriceStore(
    (state) => state.history
  )
}