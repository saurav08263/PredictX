import { useAuthStore } from "@/store/auth-store"

export const useAuth = () =>
useAuthStore()

export const useUser = () =>
useAuthStore(
s=>s.user
)

export const useAuthStatus = () =>
useAuthStore(
s=>s.status
)