import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface StaffUser {
  id: string
  email: string
  role: "ADMIN" | "ATTENDANT"
}

interface StaffStore {
  staff: StaffUser | null
  token: string | null
  setStaff: (staff: StaffUser, token: string) => void
  logout: () => void
  isLoggedIn: () => boolean
}

export const useStaff = create<StaffStore>()(
  persist(
    (set, get) => ({
      staff: null,
      token: null,
      setStaff: (staff, token) => set({ staff, token }),
      logout: () => {
        set({ staff: null, token: null })
        if (typeof document !== "undefined") {
          document.cookie = `mob-admin=; path=/; max-age=0; SameSite=Strict${location.protocol === "https:" ? "; Secure" : ""}`
        }
      },
      isLoggedIn: () => !!get().token,
    }),
    { name: "mob-staff" },
  ),
)
