"use client"

import { useEffect } from "react"

/**
 * Publica a altura real do header sticky em --app-header-h. Ela muda quando o
 * aviso de "loja fechada" aparece, e elementos sticky abaixo do header (filtros do
 * cardápio) e as âncoras precisam saber disso para não ficarem por baixo dele.
 */
export function HeaderHeight({ targetId }: { targetId: string }) {
  useEffect(() => {
    const header = document.getElementById(targetId)
    if (!header) return
    const root = document.documentElement
    const update = () => root.style.setProperty("--app-header-h", `${header.offsetHeight}px`)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(header)
    return () => {
      observer.disconnect()
      root.style.removeProperty("--app-header-h")
    }
  }, [targetId])

  return null
}
