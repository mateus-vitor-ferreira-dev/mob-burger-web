"use client"

import { useEffect, useState } from "react"

export function StoreStatusBanner() {
  const [open, setOpen] = useState<boolean | null>(null)

  useEffect(() => {
    fetch("/api/backend/menu/status")
      .then((r) => r.json())
      .then((j) => setOpen(j.data?.isOpen ?? true))
      .catch(() => setOpen(true))
  }, [])

  if (open !== false) return null

  return (
    <div
      className="flex items-center justify-center gap-2 py-2 text-xs font-semibold"
      style={{
        background: "rgba(239,68,68,0.08)",
        borderBottom: "1px solid rgba(239,68,68,0.18)",
      }}
    >
      <span>🔒</span>
      <span className="text-red-400">Loja fechada no momento — pedidos indisponíveis</span>
    </div>
  )
}
