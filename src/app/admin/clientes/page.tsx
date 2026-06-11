"use client"

import { useCallback, useEffect, useState } from "react"
import { Search, Phone, Mail, ShoppingBag, UserCircle2, X, Calendar } from "lucide-react"
import { useStaff } from "@/lib/staff-store"

interface Customer {
  id: string
  name: string
  email: string
  phone: string | null
  googleId: string | null
  defaultAddress: {
    street?: string
    number?: string
    neighborhood?: string
    complement?: string
  } | null
  createdAt: string
  _count: { orders: number }
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export default function ClientesPage() {
  const { token } = useStaff()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 350)
    return () => clearTimeout(t)
  }, [query])

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    const params = new URLSearchParams()
    if (debouncedQuery) params.set("search", debouncedQuery)
    const r = await fetch(`/api/backend/admin/customers?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const json = await r.json()
    setCustomers(json.data ?? [])
    setLoading(false)
  }, [token, debouncedQuery])

  useEffect(() => {
    load() // eslint-disable-line react-hooks/set-state-in-effect
  }, [load])

  return (
    <div className="p-6">
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-[0.3em] text-orange-400 uppercase">Gestão</p>
        <h1
          className="leading-none text-white"
          style={{ fontFamily: "var(--font-bebas)", fontSize: "2.5rem", letterSpacing: "0.05em" }}
        >
          Clientes
        </h1>
      </div>

      {/* Busca */}
      <div className="relative mb-5 max-w-md">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          className="w-full rounded-xl py-2.5 pr-9 pl-9 text-sm text-white placeholder-white/30 ring-1 ring-white/10 transition outline-none focus:ring-orange-500/60"
          style={{ background: "rgba(0,0,0,0.35)" }}
          placeholder="Buscar por nome, telefone ou e-mail..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-white/30 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Contagem */}
      {!loading && customers.length > 0 && (
        <p className="mb-3 text-xs text-white/25">
          {customers.length} {customers.length === 1 ? "cliente" : "clientes"} encontrado
          {customers.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Lista */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl"
              style={{ background: "var(--mob-s1)" }}
            />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div className="py-16 text-center text-sm text-white/25">
          {debouncedQuery ? "Nenhum cliente encontrado." : "Digite para buscar clientes."}
        </div>
      ) : (
        <div className="space-y-2">
          {customers.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl p-4"
              style={{
                background: "var(--mob-s3)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid var(--mob-s4)",
              }}
            >
              <div className="flex flex-wrap items-start gap-4">
                {/* Avatar placeholder */}
                <div
                  className="flex h-10 w-10 flex-none items-center justify-center rounded-full"
                  style={{ background: "rgba(249,115,22,0.12)" }}
                >
                  <UserCircle2 className="h-5 w-5 text-orange-400/70" />
                </div>

                {/* Dados */}
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-sm font-semibold text-white">{c.name}</p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <a
                      href={`mailto:${c.email}`}
                      className="inline-flex items-center gap-1 text-[11px] text-white/40 transition hover:text-white"
                    >
                      <Mail className="h-3 w-3" />
                      {c.email}
                    </a>

                    {c.phone ? (
                      <a
                        href={`https://wa.me/55${c.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-green-400/80 transition hover:text-green-400"
                      >
                        <Phone className="h-3 w-3" />
                        {c.phone}
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-white/20">
                        <Phone className="h-3 w-3" />
                        Sem telefone
                      </span>
                    )}
                  </div>

                  {c.defaultAddress && (
                    <p className="text-[11px] text-white/25">
                      📍{" "}
                      {[
                        c.defaultAddress.street,
                        c.defaultAddress.number,
                        c.defaultAddress.complement,
                        c.defaultAddress.neighborhood,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                </div>

                {/* Badges */}
                <div className="flex flex-col items-end gap-1.5">
                  <div
                    className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                    style={{ background: "rgba(249,115,22,0.12)", color: "#f97316" }}
                  >
                    <ShoppingBag className="h-3 w-3" />
                    {c._count.orders} {c._count.orders === 1 ? "pedido" : "pedidos"}
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-white/20">
                    <Calendar className="h-3 w-3" />
                    desde {fmtDate(c.createdAt)}
                  </div>

                  {c.googleId && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white/30"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      Google
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
