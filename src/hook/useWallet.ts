import { useWalletStore } from "@/store/wallet-store"

export const useBalance = () =>
useWalletStore(s=>s.balance)

export const useWallet = () =>
useWalletStore()