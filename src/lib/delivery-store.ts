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
  orderType: "DELIVERY" | "PICKUP"
  customerName: string
  phone: string
  address: DeliveryAddress
  zoneId: string
  deliveryFee: number
  set: (
    patch: Partial<Omit<DeliveryStore, "set" | "setAddress" | "setZone" | "isComplete">>,
  ) => void
  setAddress: (patch: Partial<DeliveryAddress>) => void
  setZone: (zoneId: string, fee: number) => void
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
      orderType: "DELIVERY",
      customerName: "",
      phone: "",
      address: emptyAddress,
      zoneId: "",
      deliveryFee: 0,

      set: (patch) => set(patch),

      setAddress: (patch) => set((s) => ({ address: { ...s.address, ...patch } })),

      setZone: (zoneId, fee) => set({ zoneId, deliveryFee: fee }),

      isComplete: () => {
        const { orderType, customerName, phone, address, zoneId } = get()
        if (!customerName.trim() || !phone.trim()) return false
        if (orderType === "PICKUP") return true
        return !!(
          address.cep &&
          address.street &&
          address.number &&
          address.neighborhood &&
          address.city &&
          address.state &&
          zoneId
        )
      },
    }),
    { name: "mob-delivery" },
  ),
)
