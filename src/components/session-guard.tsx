"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { useCustomer } from "@/lib/customer-store"

export function SessionGuard() {
  const { token, logout, _hasHydrated } = useCustomer()

  useEffect(() => {
    if (!_hasHydrated || !token) return
    fetch("/api/auth/customer/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (r.status === 401) {
          logout()
          toast.error("Sessão expirada. Faça login novamente.")
        }
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated])

  return null
}
