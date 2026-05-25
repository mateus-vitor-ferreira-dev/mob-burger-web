"use client"

import { useEffect, useRef } from "react"
import { create } from "zustand"
import { useCustomer } from "@/lib/customer-store"
import { toast } from "sonner"

const BASE = "/api/auth/customer/favorites"

function authHeaders(token: string) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
}

interface FavoritesStore {
  ids: Set<string>
  fetched: boolean
  setFetched: () => void
  setIds: (ids: string[]) => void
  add: (id: string) => void
  remove: (id: string) => void
  isFavorite: (id: string) => boolean
}

const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  ids: new Set(),
  fetched: false,
  setFetched: () => set({ fetched: true }),
  setIds: (ids) => set({ ids: new Set(ids) }),
  add: (id) => set((s) => ({ ids: new Set([...s.ids, id]) })),
  remove: (id) =>
    set((s) => {
      const next = new Set(s.ids)
      next.delete(id)
      return { ids: next }
    }),
  isFavorite: (id) => get().ids.has(id),
}))

export function useFavorites() {
  const token = useCustomer((s) => s.token)
  const { fetched, setFetched, setIds, add, remove, isFavorite } = useFavoritesStore()
  const loading = useRef(false)

  useEffect(() => {
    if (!token || fetched || loading.current) return
    loading.current = true
    setFetched()
    fetch(BASE, { headers: authHeaders(token) })
      .then((r) => r.json())
      .then((body) => {
        if (Array.isArray(body?.data)) setIds(body.data as string[])
      })
      .catch(() => {})
      .finally(() => {
        loading.current = false
      })
  }, [token, fetched, setFetched, setIds])

  async function toggle(productId: string) {
    if (!token) {
      toast.error("Faça login para favoritar")
      return
    }
    const wasFav = isFavorite(productId)
    if (wasFav) remove(productId)
    else add(productId)

    try {
      if (wasFav) {
        await fetch(`${BASE}/${productId}`, { method: "DELETE", headers: authHeaders(token) })
      } else {
        await fetch(BASE, {
          method: "POST",
          headers: authHeaders(token),
          body: JSON.stringify({ productId }),
        })
      }
    } catch {
      if (wasFav) add(productId)
      else remove(productId)
      toast.error("Erro ao atualizar favorito")
    }
  }

  return { isFavorite, toggle }
}
