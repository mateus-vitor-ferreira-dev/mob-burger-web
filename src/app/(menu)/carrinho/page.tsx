"use client"

import { fmtPrice } from "@/lib/utils"
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
  Store,
  Bike,
  Loader2,
  X,
} from "lucide-react"
import { useCart, type CartItem as CartItemType } from "@/lib/cart-store"
import { useDelivery } from "@/lib/delivery-store"
import { useCustomer } from "@/lib/customer-store"

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

function CartItemRow({ entry }: { entry: CartItemType & { qty: number } }) {
  const increment = useCart((s) => s.increment)
  const decrement = useCart((s) => s.decrement)

  return (
    <div
      className="flex items-center gap-4 rounded-2xl p-4"
      style={{ background: "var(--mob-card-solid)", border: "1px solid var(--mob-b1)" }}
    >
      {/* Imagem */}
      <div className="relative h-20 w-20 flex-none overflow-hidden rounded-xl bg-black/30">
        {entry.img && <Image src={entry.img} alt={entry.name} fill className="object-cover" />}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p
          className="leading-tight"
          style={{
            fontFamily: "var(--font-bebas)",
            fontSize: "1.1rem",
            letterSpacing: "0.06em",
            color: "var(--mob-text-primary)",
          }}
        >
          {entry.name.replace(/^Mob /i, "")}
        </p>
        {entry.options && entry.options.length > 0 && (
          <p
            className="mt-0.5 text-[11px] leading-relaxed"
            style={{ color: "var(--mob-text-tertiary)" }}
          >
            {entry.options.map((o) => o.name).join(" · ")}
          </p>
        )}
        {entry.observations && (
          <p
            className="mt-0.5 text-[11px] leading-relaxed italic"
            style={{ color: "var(--mob-text-tertiary)" }}
          >
            &quot;{entry.observations}&quot;
          </p>
        )}
        {entry.description && !entry.options?.length && !entry.observations && (
          <p
            className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed"
            style={{ color: "var(--mob-text-tertiary)" }}
          >
            {entry.description}
          </p>
        )}
        <p className="mt-1.5 text-sm font-bold text-orange-400">
          {fmtPrice(entry.priceNum * entry.qty)}
        </p>
      </div>

      {/* Qty */}
      <div className="flex items-center">
        <div
          className="flex items-center gap-2 rounded-xl px-2 py-1"
          style={{ background: "rgba(249,115,22,0.10)", border: "1px solid rgba(249,115,22,0.2)" }}
        >
          <button
            onClick={() => decrement(entry.id)}
            className="flex h-6 w-6 items-center justify-center rounded-lg text-orange-400 transition hover:bg-orange-500/20 active:scale-90"
          >
            {entry.qty === 1 ? (
              <Trash2 className="h-3 w-3 text-red-400" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
          </button>
          <span className="w-5 text-center text-sm font-bold text-white">{entry.qty}</span>
          <button
            onClick={() => increment(entry.id)}
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
        style={{ background: "var(--mob-s1)", border: "1px solid var(--mob-b1)" }}
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
        style={{ background: "var(--mob-s1)", border: "1px solid var(--mob-b1)" }}
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

function DeliveryForm({
  zones,
  onZoneDetected,
}: {
  zones: DeliveryZone[]
  onZoneDetected: (zoneId: string, fee: number, name: string) => void
}) {
  const { customerName, phone, address, set, setAddress } = useDelivery()
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState("")
  const [zoneNotice, setZoneNotice] = useState("")
  const numberRef = useRef<HTMLInputElement>(null)

  async function fetchCep(raw: string) {
    const digits = raw.replace(/\D/g, "")
    if (digits.length !== 8) return
    setCepLoading(true)
    setCepError("")
    setZoneNotice("")
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

      // Auto-detecta zona de entrega pelo bairro
      if (data.bairro && zones.length > 0) {
        const bairro = data.bairro.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
        const match = zones.find((z) => {
          const name = z.name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
          return bairro.includes(name) || name.includes(bairro.split(" ").pop() ?? "")
        })
        if (match) {
          onZoneDetected(match.id, match.fee, match.name)
          setZoneNotice(
            `Taxa de entrega para ${match.name}: ${match.fee === 0 ? "Grátis" : fmtPrice(match.fee)}`,
          )
        } else {
          setZoneNotice("Bairro fora da área de entrega. Verifique com a loja.")
        }
      }
      numberRef.current?.focus()
    } catch {
      setCepError("Erro ao buscar CEP.")
    } finally {
      setCepLoading(false)
    }
  }

  const cardStyle = { background: "var(--mob-card-solid)", border: "1px solid var(--mob-b1)" }
  const inputCls =
    "w-full rounded-xl px-3 py-2.5 text-sm outline-none ring-1 ring-white/10 transition focus:ring-orange-500/50"
  const inputStyle = { background: "var(--mob-input-bg)", color: "var(--mob-text-primary)" }

  return (
    <div className="space-y-4">
      {/* Dados pessoais */}
      <div className="space-y-3 rounded-2xl p-4" style={cardStyle}>
        <div className="flex items-center gap-2">
          <User className="h-3.5 w-3.5 text-orange-400" />
          <p
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: "var(--mob-text-tertiary)" }}
          >
            Seus dados
          </p>
        </div>
        <input
          className={inputCls}
          style={inputStyle}
          placeholder="Nome completo"
          value={customerName}
          onChange={(e) => set({ customerName: e.target.value })}
        />
        <input
          className={inputCls}
          style={inputStyle}
          placeholder="Telefone (11) 99999-9999"
          value={phone}
          onChange={(e) => set({ phone: maskPhone(e.target.value) })}
          inputMode="tel"
        />
      </div>

      {/* Endereço */}
      <div className="space-y-3 rounded-2xl p-4" style={cardStyle}>
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-orange-400" />
          <p className="text-xs font-semibold tracking-widest text-white/30 uppercase">
            Endereço de entrega
          </p>
        </div>

        <div className="flex gap-2">
          <input
            className={`${inputCls} flex-1`}
            style={inputStyle}
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
        {zoneNotice && (
          <p
            className="text-xs"
            style={{ color: zoneNotice.includes("fora") ? "#f87171" : "#4ade80" }}
          >
            📍 {zoneNotice}
          </p>
        )}

        <input
          className={inputCls}
          style={inputStyle}
          placeholder="Rua / Avenida"
          value={address.street}
          onChange={(e) => setAddress({ street: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-2">
          <input
            ref={numberRef}
            className={inputCls}
            style={inputStyle}
            placeholder="Número"
            value={address.number}
            onChange={(e) => setAddress({ number: e.target.value })}
          />
          <input
            className={inputCls}
            style={inputStyle}
            placeholder="Complemento"
            value={address.complement}
            onChange={(e) => setAddress({ complement: e.target.value })}
          />
        </div>

        <input
          className={inputCls}
          style={inputStyle}
          placeholder="Bairro"
          value={address.neighborhood}
          onChange={(e) => setAddress({ neighborhood: e.target.value })}
        />

        <div className="grid grid-cols-[1fr_80px] gap-2">
          <input
            className={inputCls}
            style={inputStyle}
            placeholder="Cidade"
            value={address.city}
            onChange={(e) => setAddress({ city: e.target.value })}
          />
          <input
            className={inputCls}
            style={inputStyle}
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

interface DeliveryZone {
  id: string
  name: string
  fee: number
}

export default function CarrinhoPage() {
  const router = useRouter()
  const items = useCart((s) => s.items)
  const subtotal = useCart((s) => s.total())
  const count = useCart((s) => s.count())
  const isComplete = useDelivery((s) => s.isComplete)
  const orderType = useDelivery((s) => s.orderType)
  const customer = useCustomer((s) => s.customer)
  const hasAddress = useCustomer((s) => s.hasAddress())
  const { set, setAddress, setZone, zoneId, deliveryFee, customerName, phone } = useDelivery()
  const [mounted, setMounted] = useState(false)
  const [editingAddress, setEditingAddress] = useState(false)
  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [storeOpen, setStoreOpen] = useState(true)
  const [couponCode, setCouponCode] = useState("")
  const [couponApplied, setCouponApplied] = useState<{
    code: string
    type: string
    discountAmount: number
    message: string
  } | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState("")

  useEffect(() => {
    setMounted(true) // eslint-disable-line react-hooks/set-state-in-effect
  }, [])

  const token = useCustomer((s) => s.token)
  const setCustomer = useCustomer((s) => s.setCustomer)

  // Busca zonas de entrega e status da loja
  useEffect(() => {
    if (!mounted) return
    fetch("/api/backend/menu/delivery-zones")
      .then((r) => r.json())
      .then((j) => setZones(j.data ?? []))
      .catch(() => {})
    fetch("/api/backend/menu/status")
      .then((r) => r.json())
      .then((j) => setStoreOpen(j.data?.isOpen ?? true))
      .catch(() => {})
  }, [mounted])

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

  async function applyCoupon() {
    const code = couponCode.trim().toUpperCase()
    if (!code) return
    setCouponLoading(true)
    setCouponError("")
    try {
      const r = await fetch("/api/backend/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          code,
          itemsTotal: subtotal,
          deliveryFee: orderType === "PICKUP" ? 0 : deliveryFee,
        }),
      })
      const json = await r.json()
      if (!r.ok) {
        setCouponError(json.error?.message ?? "Cupom inválido.")
        setCouponApplied(null)
        return
      }
      setCouponApplied({ code, ...json.data })
    } catch {
      setCouponError("Erro ao validar cupom.")
    } finally {
      setCouponLoading(false)
    }
  }

  function removeCoupon() {
    setCouponApplied(null)
    setCouponCode("")
    setCouponError("")
  }

  const effectiveDeliveryFee =
    couponApplied?.type === "FREE_DELIVERY" ? 0 : orderType === "PICKUP" ? 0 : deliveryFee
  const discount = couponApplied
    ? couponApplied.type === "FREE_DELIVERY"
      ? orderType === "PICKUP"
        ? 0
        : deliveryFee
      : couponApplied.discountAmount
    : 0
  const total = Math.max(
    0,
    subtotal + effectiveDeliveryFee - (couponApplied?.type === "FREE_DELIVERY" ? 0 : discount),
  )

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

      {/* Banner loja fechada */}
      {!storeOpen && (
        <div
          className="mb-6 flex items-center gap-3 rounded-2xl px-5 py-4"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}
        >
          <span className="text-xl">🔒</span>
          <div>
            <p className="text-sm font-semibold text-red-400">Loja fechada no momento</p>
            <p className="text-xs text-white/40">
              Não é possível finalizar pedidos agora. Volte durante o horário de funcionamento.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        {/* Itens */}
        <div className="space-y-4">
          {items.map((entry) => (
            <CartItemRow key={entry.id} entry={entry} />
          ))}

          {/* Cupom */}
          <div
            className="rounded-2xl px-4 py-3"
            style={{ background: "var(--mob-s1)", border: "1px solid var(--mob-b1)" }}
          >
            {couponApplied ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-green-400">
                    🎟 Cupom <span className="tracking-widest">{couponApplied.code}</span> aplicado
                  </p>
                  <p className="text-[10px] text-white/30">{couponApplied.message}</p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-white/30 transition hover:text-red-400"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-xl px-3 py-2 text-sm placeholder-white/30 ring-1 ring-white/10 transition outline-none focus:ring-orange-500/50"
                  style={{ background: "rgba(0,0,0,0.25)", color: "white" }}
                  placeholder="Código do cupom"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase())
                    setCouponError("")
                  }}
                  onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                />
                <button
                  onClick={applyCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-white transition disabled:opacity-50"
                  style={{
                    background: "rgba(249,115,22,0.15)",
                    border: "1px solid rgba(249,115,22,0.3)",
                  }}
                >
                  {couponLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Aplicar"}
                </button>
              </div>
            )}
            {couponError && <p className="mt-1.5 text-xs text-red-400">{couponError}</p>}
          </div>

          {/* Resumo de valores */}
          <div
            className="space-y-2 rounded-2xl px-4 py-3"
            style={{ background: "var(--mob-s1)", border: "1px solid var(--mob-b1)" }}
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">Subtotal</span>
              <span className="text-white/70">{fmtPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">
                {orderType === "PICKUP"
                  ? "Retirada no local"
                  : `Taxa de entrega${zoneId && zones.find((z) => z.id === zoneId) ? ` · ${zones.find((z) => z.id === zoneId)!.name}` : ""}`}
              </span>
              <span
                className={`${couponApplied?.type === "FREE_DELIVERY" && orderType !== "PICKUP" ? "text-white/30 line-through" : "text-white/70"}`}
              >
                {orderType === "PICKUP"
                  ? "Grátis"
                  : zoneId
                    ? deliveryFee === 0
                      ? "Grátis"
                      : fmtPrice(deliveryFee)
                    : "—"}
              </span>
              {couponApplied?.type === "FREE_DELIVERY" && orderType !== "PICKUP" && (
                <span className="text-sm text-green-400">Grátis</span>
              )}
            </div>
            {discount > 0 && couponApplied?.type !== "FREE_DELIVERY" && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-400">Desconto</span>
                <span className="text-green-400">−{fmtPrice(discount)}</span>
              </div>
            )}
            <div
              className="flex items-center justify-between border-t pt-2"
              style={{ borderColor: "var(--mob-b1)" }}
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
          {/* Toggle Entrega / Retirada */}
          <div
            className="flex rounded-2xl p-1"
            style={{ background: "var(--mob-s1)", border: "1px solid var(--mob-b1)" }}
          >
            {(["DELIVERY", "PICKUP"] as const).map((type) => {
              const active = orderType === type
              return (
                <button
                  key={type}
                  onClick={() => set({ orderType: type })}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all"
                  style={
                    active
                      ? { background: "linear-gradient(135deg, #f97316, #ea580c)", color: "#fff" }
                      : { color: "rgba(255,255,255,0.4)" }
                  }
                >
                  {type === "DELIVERY" ? (
                    <>
                      <Bike className="h-4 w-4" /> Entrega
                    </>
                  ) : (
                    <>
                      <Store className="h-4 w-4" /> Retirada
                    </>
                  )}
                </button>
              )
            })}
          </div>

          {orderType === "PICKUP" ? (
            <div
              className="space-y-3 rounded-2xl p-4"
              style={{ background: "var(--mob-s1)", border: "1px solid var(--mob-b1)" }}
            >
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-orange-400" />
                <p className="text-xs font-semibold tracking-widest text-white/30 uppercase">
                  Seus dados
                </p>
              </div>
              <input
                className="w-full rounded-xl px-3 py-2.5 text-sm ring-1 ring-white/10 transition outline-none focus:ring-orange-500/50"
                style={{ background: "var(--mob-input-bg)", color: "var(--mob-text-primary)" }}
                placeholder="Nome completo"
                value={customerName}
                onChange={(e) => set({ customerName: e.target.value })}
              />
              <input
                className="w-full rounded-xl px-3 py-2.5 text-sm ring-1 ring-white/10 transition outline-none focus:ring-orange-500/50"
                style={{ background: "var(--mob-input-bg)", color: "var(--mob-text-primary)" }}
                placeholder="Telefone (11) 99999-9999"
                inputMode="tel"
                value={phone}
                onChange={(e) => set({ phone: maskPhone(e.target.value) })}
              />
              <div
                className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3"
                style={{
                  background: "rgba(249,115,22,0.08)",
                  border: "1px solid rgba(249,115,22,0.2)",
                }}
              >
                <Store className="h-4 w-4 flex-none text-orange-400" />
                <p className="text-xs text-orange-300">
                  Retire no balcão quando seu pedido estiver pronto. Avisaremos pelo WhatsApp!
                </p>
              </div>
            </div>
          ) : hasAddress && !editingAddress ? (
            <AddressConfirmation onEdit={() => setEditingAddress(true)} />
          ) : (
            <DeliveryForm zones={zones} onZoneDetected={(id, fee) => setZone(id, fee)} />
          )}
          <button
            onClick={() =>
              router.push(
                `/pagamento${couponApplied ? `?coupon=${encodeURIComponent(couponApplied.code)}` : ""}`,
              )
            }
            disabled={!isComplete() || !storeOpen}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              boxShadow: "0 6px 20px rgba(249,115,22,0.35)",
            }}
          >
            {!storeOpen ? "Loja fechada" : "Ir para pagamento"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </main>
  )
}
