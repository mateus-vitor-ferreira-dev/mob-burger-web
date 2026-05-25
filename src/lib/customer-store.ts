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
  _hasHydrated: boolean
  setHasHydrated: (v: boolean) => void
  setCustomer: (customer: Customer, token: string) => void
  updateAddress: (address: CustomerAddress) => void
  updateAvatar: (avatarUrl: string) => void
  logout: () => void
  isLoggedIn: () => boolean
  hasAddress: () => boolean
}

export const useCustomer = create<CustomerStore>()(
  persist(
    (set, get) => ({
      customer: null,
      token: null,
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),

      setCustomer: (customer, token) => set({ customer, token }),

      updateAddress: (address) =>
        set((s) => ({
          customer: s.customer ? { ...s.customer, address } : null,
        })),

      updateAvatar: (avatarUrl) =>
        set((s) => ({
          customer: s.customer ? { ...s.customer, avatarUrl } : null,
        })),

      logout: () => set({ customer: null, token: null }),

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
