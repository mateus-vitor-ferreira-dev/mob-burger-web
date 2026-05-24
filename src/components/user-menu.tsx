"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { User } from "lucide-react"
import { useCustomer } from "@/lib/customer-store"

export function UserMenu() {
  const router = useRouter()
  const customer = useCustomer((s) => s.customer)

  return (
    <button
      onClick={() => router.push("/perfil")}
      className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl text-white/60 transition hover:ring-2 hover:ring-orange-500/50"
      style={{ border: "1px solid var(--mob-s3)" }}
      title={customer ? "Minha conta" : "Entrar"}
    >
      {customer?.avatarUrl ? (
        <Image src={customer.avatarUrl} alt={customer.name} fill className="object-cover" />
      ) : customer ? (
        <span className="text-xs font-bold text-orange-400">
          {customer.name.split(" ")[0][0].toUpperCase()}
        </span>
      ) : (
        <User className="h-4 w-4" />
      )}

      {customer && (
        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-400 ring-2 ring-black" />
      )}
    </button>
  )
}
