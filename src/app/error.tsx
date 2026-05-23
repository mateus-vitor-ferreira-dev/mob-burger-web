"use client"

import { useEffect } from "react"
import { AlertTriangle, RotateCcw } from "lucide-react"

export default function GlobalError({
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
    <html lang="pt-BR">
      <body style={{ background: "#0c0b09", margin: 0, fontFamily: "sans-serif" }}>
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{ background: "rgba(239,68,68,0.12)", border: "2px solid rgba(239,68,68,0.3)" }}
          >
            <AlertTriangle className="h-10 w-10 text-red-400" />
          </div>
          <div>
            <h1
              style={{
                fontFamily: "sans-serif",
                color: "white",
                fontSize: "1.5rem",
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Algo deu errado
            </h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem" }}>
              Um erro inesperado aconteceu. Tente novamente.
            </p>
          </div>
          <button
            onClick={reset}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              color: "white",
              border: "none",
              borderRadius: 12,
              padding: "12px 24px",
              fontSize: "0.875rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <RotateCcw style={{ width: 16, height: 16 }} />
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  )
}
