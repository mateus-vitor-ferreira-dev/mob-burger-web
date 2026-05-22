import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface DeliveryAddress {
  cep: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
}

interface DeliveryStore {
  customerName: string
  phone: string
  address: DeliveryAddress
  set: (patch: Partial<Omit<DeliveryStore, "set" | "setAddress">>) => void
  setAddress: (patch: Partial<DeliveryAddress>) => void
  isComplete: () => boolean
}

const emptyAddress: DeliveryAddress = {
  cep: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
}

export const useDelivery = create<DeliveryStore>()(
  persist(
    (set, get) => ({
      customerName: "",
      phone: "",
      address: emptyAddress,

      set: (patch) => set(patch),

      setAddress: (patch) => set((s) => ({ address: { ...s.address, ...patch } })),

      isComplete: () => {
        const { customerName, phone, address } = get()
        return !!(
          customerName.trim() &&
          phone.trim() &&
          address.cep &&
          address.street &&
          address.number &&
          address.neighborhood &&
          address.city &&
          address.state
        )
      },
    }),
    { name: "mob-delivery" },
  ),
)
