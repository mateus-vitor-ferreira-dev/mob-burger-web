"use client"

import Link from "next/link"
import Image from "next/image"
import { User } from "lucide-react"
import { useCustomer } from "@/lib/customer-store"

export function UserMenu() {
  const customer = useCustomer((s) => s.customer)

  return (
    // Link (e não botão com router.push): abre em nova aba, mostra o destino e funciona sem JS
    <Link
      href="/perfil"
      aria-label={customer ? `Minha conta (${customer.name})` : "Entrar na sua conta"}
      className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl text-white/60 transition hover:ring-2 hover:ring-orange-500/50"
      style={{ border: "1px solid var(--mob-s3)" }}
    >
      {customer?.avatarUrl ? (
        <Image src={customer.avatarUrl} alt="" fill sizes="44px" className="object-cover" />
      ) : customer ? (
        <span className="text-xs font-bold text-orange-400">
          {customer.name.split(" ")[0][0].toUpperCase()}
        </span>
      ) : (
        <User aria-hidden className="h-5 w-5" />
      )}

      {customer && (
        <span
          aria-hidden
          className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-400 ring-2 ring-black"
        />
      )}
    </Link>
  )
}
