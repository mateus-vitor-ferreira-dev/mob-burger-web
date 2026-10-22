"use client"

import { type ReactNode } from "react"
import { useHydrated } from "@/lib/use-hydrated"
import { createPortal } from "react-dom"

/**
 * Renderiza no <body>. Modais e gavetas dentro do conteúdo ficavam presos no
 * stacking context do container (relative z-10) e o header sticky (z-50)
 * aparecia por cima do fundo escurecido.
 */
export function Portal({ children }: { children: ReactNode }) {
  const mounted = useHydrated()
  return mounted ? createPortal(children, document.body) : null
}
