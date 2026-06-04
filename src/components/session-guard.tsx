"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { useCustomer } from "@/lib/customer-store"

export function SessionGuard() {
  const { token, refreshToken, logout, setAccessToken, _hasHydrated } = useCustomer()

  useEffect(() => {
    if (!_hasHydrated || !token) return
    fetch("/api/auth/customer/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        if (r.status !== 401) return

        if (refreshToken) {
          const refreshRes = await fetch("/api/auth/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          }).catch(() => null)

          if (refreshRes?.ok) {
            const data = await refreshRes.json().catch(() => null)
            const newAccessToken = data?.data?.accessToken
            if (newAccessToken) {
              setAccessToken(newAccessToken)
              return
            }
          }
        }

        logout()
        toast.error("Sessão expirada. Faça login novamente.")
      })
      .catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_hasHydrated])

  return null
}
