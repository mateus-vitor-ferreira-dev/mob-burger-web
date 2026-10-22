"use client"

import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/cart-store"
import { useHydrated } from "@/lib/use-hydrated"

export function CartButton() {
  const hydrated = useHydrated()
  const storedCount = useCart((s) => s.count())
  const count = hydrated ? storedCount : 0

  return (
    <Link
      href="/carrinho"
      aria-label={count > 0 ? `Sacola, ${count} ${count === 1 ? "item" : "itens"}` : "Sacola vazia"}
      className="relative flex h-11 w-11 items-center justify-center rounded-xl text-white transition-all active:scale-95"
      style={{
        background: "var(--mob-cta-gradient)",
        boxShadow: "0 4px 12px rgba(249,115,22,0.25)",
      }}
    >
      <ShoppingBag aria-hidden className="h-5 w-5" />
      {count > 0 && (
        <span
          aria-hidden
          className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{
            background: "#dc0000",
            border: "2px solid #fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
          }}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  )
}
