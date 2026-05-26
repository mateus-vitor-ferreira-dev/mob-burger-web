"use client"

import { useEffect } from "react"
import { registerSW } from "@/lib/push"
import { SessionGuard } from "./session-guard"

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerSW()
  }, [])

  return (
    <>
      <SessionGuard />
      {children}
    </>
  )
}
