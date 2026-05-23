"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, RotateCcw, Home } from "lucide-react"

export default function MenuError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full"
        style={{ background: "rgba(239,68,68,0.12)", border: "2px solid rgba(239,68,68,0.3)" }}
      >
        <AlertTriangle className="h-8 w-8 text-red-400" />
      </div>
      <div>
        <h2
          className="mb-1 text-white"
          style={{ fontFamily: "var(--font-bebas)", fontSize: "2rem", letterSpacing: "0.05em" }}
        >
          Algo deu errado
        </h2>
        <p className="text-sm text-white/40">Tente novamente ou volte para a página inicial.</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition active:scale-95"
          style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
        >
          <RotateCcw className="h-4 w-4" /> Tentar novamente
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white/60 transition hover:bg-white/5 hover:text-white"
          style={{ border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <Home className="h-4 w-4" /> Início
        </Link>
      </div>
    </div>
  )
}
