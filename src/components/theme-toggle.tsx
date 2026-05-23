"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true) // eslint-disable-line react-hooks/set-state-in-effect
  }, [])
  if (!mounted) return <div className="h-9 w-9" />

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex h-9 w-9 items-center justify-center rounded-xl transition-all hover:scale-105 active:scale-95"
      style={{
        background: "var(--mob-s2)",
        border: "1px solid var(--mob-b1)",
      }}
      title={isDark ? "Modo claro" : "Modo escuro"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-orange-400" />
      ) : (
        <Moon className="h-4 w-4 text-orange-500" />
      )}
    </button>
  )
}
