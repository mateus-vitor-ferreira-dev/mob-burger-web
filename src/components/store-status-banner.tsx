"use client"

import { useEffect, useState } from "react"
import { Lock } from "lucide-react"

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
      role="status"
      className="flex items-center justify-center gap-2 px-4 py-2 text-center text-xs font-semibold"
      style={{
        background: "rgba(239,68,68,0.08)",
        borderBottom: "1px solid rgba(239,68,68,0.18)",
      }}
    >
      <Lock aria-hidden className="h-3.5 w-3.5 flex-none text-red-400" />
      <span className="text-red-400">Loja fechada no momento — pedidos indisponíveis</span>
    </div>
  )
}
