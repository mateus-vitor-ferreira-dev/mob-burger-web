"use client"

import { useEffect, useRef, useState } from "react"
import { useCustomer } from "@/lib/customer-store"
import { toast } from "sonner"

const BASE = "/api/auth/customer/favorites"

function authHeaders(token: string) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
}

export function useFavorites() {
  const token = useCustomer((s) => s.token)
  const [ids, setIds] = useState<Set<string>>(new Set())
  const fetched = useRef(false)

  useEffect(() => {
    if (!token || fetched.current) return
    fetched.current = true
    fetch(BASE, { headers: authHeaders(token) })
      .then((r) => r.json())
      .then((body) => {
        if (Array.isArray(body?.data)) setIds(new Set(body.data as string[]))
      })
      .catch(() => {})
  }, [token])

  async function toggle(productId: string) {
    if (!token) {
      toast.error("Faça login para favoritar")
      return
    }
    const wasFav = ids.has(productId)
    setIds((prev) => {
      const next = new Set(prev)
      if (wasFav) next.delete(productId)
      else next.add(productId)
      return next
    })
    try {
      if (wasFav) {
        await fetch(`${BASE}/${productId}`, {
          method: "DELETE",
          headers: authHeaders(token),
        })
      } else {
        await fetch(BASE, {
          method: "POST",
          headers: authHeaders(token),
          body: JSON.stringify({ productId }),
        })
      }
    } catch {
      setIds((prev) => {
        const next = new Set(prev)
        if (wasFav) next.add(productId)
        else next.delete(productId)
        return next
      })
      toast.error("Erro ao atualizar favorito")
    }
  }

  return { isFavorite: (id: string) => ids.has(id), toggle }
}
