"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Search,
  ChevronRight,
  MapPin,
  User,
  CheckCircle2,
  Pencil,
} from "lucide-react"
import { useCart } from "@/lib/cart-store"
import { useDelivery } from "@/lib/delivery-store"
import { useCustomer, DELIVERY_FEE } from "@/lib/customer-store"
import { ALL_ITEMS } from "@/data/menu"

function fmtPrice(n: number) {
  return `R$ ${n.toFixed(2).replace(".", ",")}`
}

function maskPhone(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
}

function maskCep(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/^(\d{5})(\d)/, "$1-$2")
}

// ─── Item expandido ───────────────────────────────────────────────────────────

function CartItem({ id, qty }: { id: string; qty: number }) {
  const item = ALL_ITEMS.find((i) => i.id === id)
  const increment = useCart((s) => s.increment)
  const decrement = useCart((s) => s.decrement)
  if (!item) return null

  return (
    <div
      className="flex items-center gap-4 rounded-2xl p-4"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Imagem */}
      <div className="relative h-20 w-20 flex-none overflow-hidden rounded-xl bg-black/30">
        {item.img && (
          <Image src={item.img} alt={item.name} fill className="object-cover" unoptimized />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p
          className="leading-tight text-white"
          style={{ fontFamily: "var(--font-bebas)", fontSize: "1.1rem", letterSpacing: "0.06em" }}
        >
          {item.name.replace("MOB ", "")}
        </p>
        <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-white/35">
          {item.ingredients.join(" · ")}
        </p>
        <p className="mt-1.5 text-sm font-bold text-orange-400">{fmtPrice(item.priceNum * qty)}</p>
      </div>

      {/* Qty — alinhado ao centro verticalmente */}
      <div className="flex items-center">
        <div
          className="flex items-center gap-2 rounded-xl px-2 py-1"
          style={{ background: "rgba(249,115,22,0.10)", border: "1px solid rgba(249,115,22,0.2)" }}
        >
          <button
            onClick={() => decrement(id)}
            className="flex h-6 w-6 items-center justify-center rounded-lg text-orange-400 transition hover:bg-orange-500/20 active:scale-90"
          >
            {qty === 1 ? (
              <Trash2 className="h-3 w-3 text-red-400" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
          </button>
          <span className="w-5 text-center text-sm font-bold text-white">{qty}</span>
          <button
            onClick={() => increment(id)}
            className="flex h-6 w-6 items-center justify-center rounded-lg text-orange-400 transition hover:bg-orange-500/20 active:scale-90"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Confirmação de endereço ──────────────────────────────────────────────────

function AddressConfirmation({ onEdit }: { onEdit: () => void }) {
  const address = useCustomer((s) => s.customer?.address)
  const customerName = useCustomer((s) => s.customer?.name)
  const phone = useCustomer((s) => s.customer?.phone)

  if (!address) return null

  return (
    <div className="space-y-4">
      {/* Dados pessoais — somente leitura */}
      <div
        className="space-y-2 rounded-2xl p-4"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-2">
          <User className="h-3.5 w-3.5 text-orange-400" />
          <p className="text-xs font-semibold tracking-widest text-white/30 uppercase">
            Seus dados
          </p>
        </div>
        <p className="text-sm font-semibold text-white">{customerName}</p>
        <p className="text-xs text-white/40">{phone}</p>
      </div>

      {/* Endereço confirmação */}
      <div
        className="rounded-2xl p-4"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-orange-400" />
            <p className="text-xs font-semibold tracking-widest text-white/30 uppercase">
              Endereço de entrega
            </p>
          </div>
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs text-white/40 transition hover:bg-white/5 hover:text-white"
          >
            <Pencil className="h-3 w-3" />
            Alterar
          </button>
        </div>

        <p className="text-sm font-medium text-white">
          {address.street}, {address.number}
          {address.complement ? ` — ${address.complement}` : ""}
        </p>
        <p className="mt-0.5 text-xs text-white/40">
          {address.neighborhood} · {address.city}/{address.state}
        </p>
        <p className="mt-0.5 text-xs text-white/30">CEP {address.cep}</p>

        <div
          className="mt-4 flex items-center gap-2 rounded-xl px-3 py-2.5"
          style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}
        >
          <CheckCircle2 className="h-4 w-4 flex-none text-green-400" />
          <p className="text-xs text-green-400">Entrega confirmada neste endereço</p>
        </div>
      </div>
    </div>
  )
}

// ─── Formulário de dados e entrega ────────────────────────────────────────────

function DeliveryForm() {
  const { customerName, phone, address, set, setAddress } = useDelivery()
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState("")
  const numberRef = useRef<HTMLInputElement>(null)

  async function fetchCep(raw: string) {
    const digits = raw.replace(/\D/g, "")
    if (digits.length !== 8) return
    setCepLoading(true)
    setCepError("")
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data = await res.json()
      if (data.erro) {
        setCepError("CEP não encontrado.")
        return
      }
      setAddress({
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf,
        complement: data.complemento ?? "",
      })
      numberRef.current?.focus()
    } catch {
      setCepError("Erro ao buscar CEP.")
    } finally {
      setCepLoading(false)
    }
  }

  const inputCls =
    "w-full rounded-xl bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none ring-1 ring-white/10 transition focus:ring-orange-500/50"

  return (
    <div className="space-y-4">
      {/* Dados pessoais */}
      <div
        className="space-y-3 rounded-2xl p-4"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-2">
          <User className="h-3.5 w-3.5 text-orange-400" />
          <p className="text-xs font-semibold tracking-widest text-white/30 uppercase">
            Seus dados
          </p>
        </div>
        <input
          className={inputCls}
          placeholder="Nome completo"
          value={customerName}
          onChange={(e) => set({ customerName: e.target.value })}
        />
        <input
          className={inputCls}
          placeholder="Telefone (11) 99999-9999"
          value={phone}
          onChange={(e) => set({ phone: maskPhone(e.target.value) })}
          inputMode="tel"
        />
      </div>

      {/* Endereço */}
      <div
        className="space-y-3 rounded-2xl p-4"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-orange-400" />
          <p className="text-xs font-semibold tracking-widest text-white/30 uppercase">
            Endereço de entrega
          </p>
        </div>

        <div className="flex gap-2">
          <input
            className={`${inputCls} flex-1`}
            placeholder="CEP 00000-000"
            value={address.cep}
            inputMode="numeric"
            onChange={(e) => {
              const masked = maskCep(e.target.value)
              setAddress({ cep: masked })
              if (masked.replace(/\D/g, "").length === 8) fetchCep(masked)
            }}
          />
          <button
            type="button"
            onClick={() => fetchCep(address.cep)}
            disabled={cepLoading}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-white transition disabled:opacity-50"
            style={{
              background: "rgba(249,115,22,0.15)",
              border: "1px solid rgba(249,115,22,0.3)",
            }}
          >
            <Search className="h-3.5 w-3.5 text-orange-400" />
            {cepLoading ? "..." : "Buscar"}
          </button>
        </div>
        {cepError && <p className="text-xs text-red-400">{cepError}</p>}

        <input
          className={inputCls}
          placeholder="Rua / Avenida"
          value={address.street}
          onChange={(e) => setAddress({ street: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-2">
          <input
            ref={numberRef}
            className={inputCls}
            placeholder="Número"
            value={address.number}
            onChange={(e) => setAddress({ number: e.target.value })}
          />
          <input
            className={inputCls}
            placeholder="Complemento"
            value={address.complement}
            onChange={(e) => setAddress({ complement: e.target.value })}
          />
        </div>

        <input
          className={inputCls}
          placeholder="Bairro"
          value={address.neighborhood}
          onChange={(e) => setAddress({ neighborhood: e.target.value })}
        />

        <div className="grid grid-cols-[1fr_80px] gap-2">
          <input
            className={inputCls}
            placeholder="Cidade"
            value={address.city}
            onChange={(e) => setAddress({ city: e.target.value })}
          />
          <input
            className={inputCls}
            placeholder="UF"
            value={address.state}
            maxLength={2}
            onChange={(e) => setAddress({ state: e.target.value.toUpperCase() })}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CarrinhoPage() {
  const router = useRouter()
  const items = useCart((s) => s.items)
  const subtotal = useCart((s) => s.total())
  const count = useCart((s) => s.count())
  const isComplete = useDelivery((s) => s.isComplete)
  const customer = useCustomer((s) => s.customer)
  const hasAddress = useCustomer((s) => s.hasAddress())
  const { set, setAddress } = useDelivery()
  const [mounted, setMounted] = useState(false)
  const [editingAddress, setEditingAddress] = useState(false)

   
  useEffect(() => {
    setMounted(true) // eslint-disable-line react-hooks/set-state-in-effect
  }, [])

  const token = useCustomer((s) => s.token)
  const setCustomer = useCustomer((s) => s.setCustomer)

  // Busca dados frescos da API e pré-preenche o formulário
  useEffect(() => {
    if (!token) return

    fetch("/api/auth/customer/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const c = json?.data?.customer
        if (!c) return
        setCustomer({ id: c.id, name: c.name, email: c.email, phone: c.phone ?? "" }, token)
        set({ customerName: c.name, phone: c.phone ?? "" })
        if (customer?.address) setAddress(customer.address)
      })
      .catch(() => {
        // fallback: usa dados em cache
        if (customer) {
          set({ customerName: customer.name, phone: customer.phone })
          if (customer.address) setAddress(customer.address)
        }
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted])

  useEffect(() => {
    if (mounted && items.length === 0) router.push("/cardapio")
  }, [mounted, items.length, router])

  if (!mounted || items.length === 0) return null

  const total = subtotal + DELIVERY_FEE

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 pb-16">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/cardapio"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-white/50 transition hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1
            className="leading-none text-white"
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              letterSpacing: "0.05em",
            }}
          >
            Sua Sacola
          </h1>
          <p className="text-xs text-white/30">
            {count} {count === 1 ? "item" : "itens"}
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        {/* Itens */}
        <div className="space-y-4">
          {items.map((entry) => (
            <CartItem key={entry.id} id={entry.id} qty={entry.qty} />
          ))}

          {/* Resumo de valores */}
          <div
            className="space-y-2 rounded-2xl px-4 py-3"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">Subtotal</span>
              <span className="text-white/70">{fmtPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">Taxa de entrega</span>
              <span className="text-white/70">{fmtPrice(DELIVERY_FEE)}</span>
            </div>
            <div
              className="flex items-center justify-between border-t pt-2"
              style={{ borderColor: "rgba(255,255,255,0.07)" }}
            >
              <span className="text-sm font-bold text-white">Total</span>
              <span
                className="font-bold text-white"
                style={{
                  fontFamily: "var(--font-bebas)",
                  fontSize: "1.4rem",
                  letterSpacing: "0.05em",
                }}
              >
                {fmtPrice(total)}
              </span>
            </div>
          </div>

          <Link
            href="/cardapio"
            className="flex items-center gap-2 text-xs text-orange-400 transition hover:text-orange-300"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Adicionar mais itens
          </Link>
        </div>

        {/* Dados + endereço */}
        <div className="space-y-4">
          {hasAddress && !editingAddress ? (
            <AddressConfirmation onEdit={() => setEditingAddress(true)} />
          ) : (
            <DeliveryForm />
          )}
          <button
            onClick={() => router.push("/pagamento")}
            disabled={!isComplete()}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              boxShadow: "0 6px 20px rgba(249,115,22,0.35)",
            }}
          >
            Ir para pagamento
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </main>
  )
}
