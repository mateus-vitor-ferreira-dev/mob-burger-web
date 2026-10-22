"use client"

import { useSyncExternalStore } from "react"

/**
 * false no servidor e no primeiro render de hidratação, true depois.
 * Para o que depende de dados do localStorage (sacola, sessão) não divergir do HTML do servidor.
 */
export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}
