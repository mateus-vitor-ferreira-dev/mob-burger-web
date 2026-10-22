"use client"

import { useEffect, useRef, type RefObject } from "react"

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Contador global: modal aberto por cima de outro não destrava o scroll antes da hora
let scrollLocks = 0

/**
 * Comportamento padrão de diálogo modal enquanto `open` for true:
 * foco vai para dentro, Tab fica preso no painel, Esc fecha, o scroll
 * da página trava e, ao fechar, o foco volta para quem abriu.
 */
export function useDialog(
  open: boolean,
  onClose: () => void,
  panelRef: RefObject<HTMLElement | null>,
) {
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    const opener = document.activeElement as HTMLElement | null

    if (scrollLocks++ === 0) document.documentElement.style.overflow = "hidden"

    // Foca o primeiro controle (normalmente o botão de fechar) ou o próprio painel
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE)
    ;(first ?? panel)?.focus({ preventScroll: true })

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation()
        onCloseRef.current()
        return
      }
      if (e.key !== "Tab" || !panel) return
      const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null,
      )
      if (items.length === 0) return
      const firstItem = items[0]
      const lastItem = items[items.length - 1]
      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault()
        lastItem.focus()
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault()
        firstItem.focus()
      }
    }
    document.addEventListener("keydown", onKey)

    return () => {
      document.removeEventListener("keydown", onKey)
      scrollLocks = Math.max(0, scrollLocks - 1)
      if (scrollLocks === 0) document.documentElement.style.overflow = ""
      opener?.focus?.({ preventScroll: true })
    }
  }, [open, panelRef])
}
