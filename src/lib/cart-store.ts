import { create } from "zustand"

export interface SelectedOption {
  optionItemId: string
  name: string
  additionalPrice: number
}

export interface SelectedExtra {
  extraId: string
  name: string
  price: number
  qty: number
}

export interface CartItem {
  id: string // chave única: productId (sem opções) ou productId:opt1:opt2 (com opções)
  productId: string // ID do produto no banco — usado na criação do pedido
  name: string
  price: string
  priceNum: number
  img?: string
  description?: string
  options?: SelectedOption[]
  extras?: SelectedExtra[]
  observations?: string
}

interface CartEntry extends CartItem {
  qty: number
}

interface CartStore {
  items: CartEntry[]
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  add: (item: CartItem) => void
  increment: (id: string) => void
  decrement: (id: string) => void
  remove: (id: string) => void
  clear: () => void
  count: () => number
  total: () => number
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  add: (item) =>
    set((s) => {
      const existing = s.items.find((i) => i.id === item.id)
      if (existing) {
        return { items: s.items.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i)) }
      }
      return { items: [...s.items, { ...item, qty: 1 }] }
    }),

  increment: (id) =>
    set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)) })),

  decrement: (id) =>
    set((s) => {
      const item = s.items.find((i) => i.id === id)
      if (!item) return s
      if (item.qty === 1) return { items: s.items.filter((i) => i.id !== id) }
      return { items: s.items.map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i)) }
    }),

  remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

  clear: () => set({ items: [] }),

  count: () => get().items.reduce((acc, i) => acc + i.qty, 0),

  total: () => get().items.reduce((acc, i) => acc + i.priceNum * i.qty, 0),
}))
