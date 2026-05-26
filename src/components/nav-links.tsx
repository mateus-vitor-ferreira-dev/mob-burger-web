"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function NavLinks() {
  const pathname = usePathname()

  const links = [
    { href: "/", label: "Início" },
    { href: "/cardapio", label: "Cardápio" },
  ]

  return (
    <nav className="flex flex-1 items-center justify-center gap-6">
      {links.map((link) => {
        const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)
        return (
          <Link
            key={link.href}
            href={link.href}
            className="relative pb-0.5 text-sm font-medium transition-colors hover:text-orange-500"
            style={{ color: active ? "#f97316" : "var(--mob-text-secondary)" }}
          >
            {link.label}
            {active && (
              <span
                className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full"
                style={{ background: "linear-gradient(to right, #f97316, #ea580c)" }}
              />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
