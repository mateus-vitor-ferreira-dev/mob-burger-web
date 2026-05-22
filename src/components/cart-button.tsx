"use client"

import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/cart-store"

export function CartButton() {
  const count = useCart((s) => s.count())

  return (
    <Link
      href="/carrinho"
      className="relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all active:scale-95"
      style={{
        background: "linear-gradient(135deg, #f97316, #ea580c)",
        boxShadow: "0 4px 12px rgba(249,115,22,0.25)",
      }}
    >
      <ShoppingBag className="h-4 w-4" />
      Carrinho
      {count > 0 && (
        <span
          className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
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
