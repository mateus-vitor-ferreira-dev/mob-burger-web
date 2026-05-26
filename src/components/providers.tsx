"use client"

import { useEffect } from "react"
import { ThemeProvider } from "next-themes"
import { registerSW } from "@/lib/push"
import { SessionGuard } from "./session-guard"

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerSW()
  }, [])

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <SessionGuard />
      {children}
    </ThemeProvider>
  )
}
