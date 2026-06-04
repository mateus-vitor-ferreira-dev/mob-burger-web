import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CustomerAddress {
  cep: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  avatarUrl?: string
  address?: CustomerAddress
}

interface CustomerStore {
  customer: Customer | null
  token: string | null
  refreshToken: string | null
  _hasHydrated: boolean
  setHasHydrated: (v: boolean) => void
  setCustomer: (customer: Customer, accessToken: string, refreshToken?: string) => void
  setAccessToken: (accessToken: string) => void
  updateAddress: (address: CustomerAddress) => void
  updateAvatar: (avatarUrl: string) => void
  updatePhone: (phone: string) => void
  logout: () => void
  isLoggedIn: () => boolean
  hasAddress: () => boolean
}

export const useCustomer = create<CustomerStore>()(
  persist(
    (set, get) => ({
      customer: null,
      token: null,
      refreshToken: null,
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),

      setCustomer: (customer, accessToken, refreshToken) =>
        set({ customer, token: accessToken, refreshToken: refreshToken ?? null }),

      setAccessToken: (accessToken) => set({ token: accessToken }),

      updateAddress: (address) =>
        set((s) => ({
          customer: s.customer ? { ...s.customer, address } : null,
        })),

      updateAvatar: (avatarUrl) =>
        set((s) => ({
          customer: s.customer ? { ...s.customer, avatarUrl } : null,
        })),

      updatePhone: (phone) =>
        set((s) => ({
          customer: s.customer ? { ...s.customer, phone } : null,
        })),

      logout: () => set({ customer: null, token: null, refreshToken: null }),

      isLoggedIn: () => !!get().token,

      hasAddress: () => {
        const a = get().customer?.address
        return !!(a?.street && a?.number && a?.neighborhood && a?.city)
      },
    }),
    {
      name: "mob-customer",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)
