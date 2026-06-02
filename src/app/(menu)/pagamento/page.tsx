"use client"

import { fmtPrice } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  Lock,
  Tag,
} from "lucide-react"
import { useCart } from "@/lib/cart-store"
import { useDelivery } from "@/lib/delivery-store"
import { useCustomer } from "@/lib/customer-store"

// ─── Steps ────────────────────────────────────────────────────────────────────

function Steps() {
  return (
    <div className="mb-8 flex items-center gap-2">
      {[
        { label: "Sacola", icon: ShoppingBag, href: "/cardapio", done: true },
        { label: "Entrega", icon: MapPin, href: "/carrinho", done: true },
        { label: "Pagamento", icon: Lock, href: null, active: true },
      ].map((step, i) => (
        <div key={step.label} className="flex items-center gap-2">
          {i > 0 && (
            <div
              className="h-px w-6 flex-none"
              style={{
                background:
                  step.done || step.active ? "rgba(249,115,22,0.5)" : "rgba(255,255,255,0.1)",
              }}
            />
          )}
          {step.href ? (
            <Link
              href={step.href}
              className="flex items-center gap-1.5 text-xs text-white/40 transition hover:text-white/70"
            >
              <step.icon className="h-3 w-3" />
              {step.label}
            </Link>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-400">
              <step.icon className="h-3 w-3" />
              {step.label}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Resumo do pedido ─────────────────────────────────────────────────────────

function OrderReview() {
  const items = useCart((s) => s.items)
  const subtotal = useCart((s) => s.total())
  const { customerName, phone, address, deliveryFee, orderType, appliedCoupon } = useDelivery()

  const effectiveDeliveryFee =
    appliedCoupon?.type === "FREE_DELIVERY" ? 0 : orderType === "PICKUP" ? 0 : deliveryFee
  const discount = appliedCoupon
    ? appliedCoupon.type === "FREE_DELIVERY"
      ? orderType === "PICKUP"
        ? 0
        : deliveryFee
      : appliedCoupon.discountAmount
    : 0
  const total = Math.max(
    0,
    subtotal + effectiveDeliveryFee - (appliedCoupon?.type === "FREE_DELIVERY" ? 0 : discount),
  )

  return (
    <div className="space-y-3">
      <div
        className="rounded-2xl p-4"
        style={{ background: "var(--mob-s1)", border: "1px solid var(--mob-b1)" }}
      >
        <p className="mb-3 text-xs font-semibold tracking-widest text-white/30 uppercase">Pedido</p>
        <div className="space-y-2">
          {items.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between gap-2">
              <span className="text-sm text-white/70">
                <span className="font-bold text-orange-400">{entry.qty}×</span>{" "}
                {entry.name.replace("MOB ", "")}
              </span>
              <span className="text-sm font-semibold text-white">
                {fmtPrice(entry.priceNum * entry.qty)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-1.5 border-t pt-3" style={{ borderColor: "var(--mob-b1)" }}>
          <div className="flex justify-between text-xs text-white/40">
            <span>Subtotal</span>
            <span>{fmtPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-xs text-white/40">
            <span>{orderType === "PICKUP" ? "Retirada no local" : "Taxa de entrega"}</span>
            <span
              className={
                appliedCoupon?.type === "FREE_DELIVERY" && orderType !== "PICKUP"
                  ? "line-through"
                  : ""
              }
            >
              {orderType === "PICKUP" ? "Grátis" : fmtPrice(deliveryFee)}
            </span>
            {appliedCoupon?.type === "FREE_DELIVERY" && orderType !== "PICKUP" && (
              <span className="text-green-400">Grátis</span>
            )}
          </div>
          {discount > 0 && appliedCoupon?.type !== "FREE_DELIVERY" && (
            <div className="flex justify-between text-xs text-green-400">
              <span>Desconto</span>
              <span>−{fmtPrice(discount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-bold text-white">Total</span>
            <span
              className="text-white"
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
      </div>

      {appliedCoupon && (
        <div
          className="flex items-center gap-3 rounded-2xl px-4 py-3"
          style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}
        >
          <Tag className="h-4 w-4 flex-none text-green-400" />
          <div>
            <p className="text-xs font-semibold text-green-400">
              Cupom <span className="tracking-widest">{appliedCoupon.code}</span> aplicado
            </p>
            <p className="text-[10px] text-white/30">{appliedCoupon.message}</p>
          </div>
        </div>
      )}

      <div
        className="rounded-2xl p-4"
        style={{ background: "var(--mob-s1)", border: "1px solid var(--mob-b1)" }}
      >
        <div className="mb-2 flex items-center gap-2">
          <User className="h-3.5 w-3.5 text-orange-400" />
          <p className="text-xs font-semibold tracking-widest text-white/30 uppercase">Cliente</p>
        </div>
        <p className="text-sm font-semibold text-white">{customerName}</p>
        {phone && <p className="text-xs text-white/40">{phone}</p>}
      </div>

      <div
        className="rounded-2xl p-4"
        style={{ background: "var(--mob-s1)", border: "1px solid var(--mob-b1)" }}
      >
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-orange-400" />
            <p className="text-xs font-semibold tracking-widest text-white/30 uppercase">
              {orderType === "PICKUP" ? "Retirada" : "Entrega"}
            </p>
          </div>
          <Link
            href="/carrinho"
            className="text-xs text-orange-400 transition hover:text-orange-300"
          >
            Alterar
          </Link>
        </div>
        {orderType === "PICKUP" ? (
          <p className="text-sm text-white/60">Retire no balcão quando o pedido estiver pronto.</p>
        ) : (
          <>
            <p className="text-sm font-medium text-white">
              {address.street}, {address.number}
              {address.complement ? ` — ${address.complement}` : ""}
            </p>
            <p className="mt-0.5 text-xs text-white/40">
              {address.neighborhood} · {address.city}/{address.state} · CEP {address.cep}
            </p>
          </>
        )}
      </div>

      <div className="flex items-center justify-center gap-1.5 py-1">
        <Lock className="h-3 w-3 text-white/20" />
        <p className="text-xs text-white/20">Pedido processado com segurança</p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PagamentoPage() {
  const router = useRouter()
  const items = useCart((s) => s.items)
  const isComplete = useDelivery((s) => s.isComplete)
  const {
    address,
    zoneId,
    orderType,
    paymentMethod,
    needsChange,
    changeFor,
    orderNotes,
    phone: deliveryPhone,
  } = useDelivery()
  const { token, _hasHydrated, customer, updatePhone } = useCustomer()

  const [fetchError, setFetchError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [savePhonePrompt, setSavePhonePrompt] = useState(false)
  const [savingPhone, setSavingPhone] = useState(false)
  const initiated = useRef(false)

  useEffect(() => {
    setMounted(true) // eslint-disable-line react-hooks/set-state-in-effect
  }, [])

  async function createOrder(): Promise<string> {
    const params = new URLSearchParams(window.location.search)
    const retryOrderId = params.get("retry_order_id")
    if (retryOrderId) return retryOrderId

    const mappedItems = items.map((item) => ({
      productId: item.productId ?? item.id,
      quantity: item.qty,
      observations: item.observations || undefined,
      options: (item.options ?? []).map((o) => ({ optionItemId: o.optionItemId })),
      extras: (item.extras ?? []).map((e) => ({ extraId: e.extraId, qty: e.qty })),
    }))

    if (mappedItems.length === 0) throw new Error("Sacola vazia.")

    const couponCode =
      useDelivery.getState().appliedCoupon?.code || params.get("coupon") || undefined
    const methodMap: Record<string, string> = {
      CASH: "CASH_ON_DELIVERY",
      PIX: "PIX_ON_DELIVERY",
      CARD: "CARD_ON_DELIVERY",
    }
    const backendMethod = methodMap[paymentMethod] ?? paymentMethod

    const res = await fetch("/api/backend/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        type: orderType,
        paymentMethod: backendMethod,
        items: mappedItems,
        couponCode,
        ...(paymentMethod === "CASH" && needsChange && changeFor ? { changeFor } : {}),
        ...(orderNotes ? { notes: orderNotes } : {}),
        ...(orderType === "DELIVERY"
          ? {
              delivery: {
                street: address.street,
                number: address.number,
                neighborhood: address.neighborhood,
                complement: address.complement || undefined,
                zoneId: zoneId || undefined,
              },
            }
          : {}),
      }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error?.message ?? "Erro ao criar pedido.")
    return json.data.id
  }

  function friendlyError(msg: string): string {
    if (/internal server error/i.test(msg) || /500/i.test(msg)) {
      return "Ops! Algo deu errado no nosso sistema. Por favor, tente novamente em instantes."
    }
    if (/network|fetch|failed to fetch/i.test(msg)) {
      return "Sem conexão com a internet. Verifique sua rede e tente novamente."
    }
    return msg
  }

  async function initPayment() {
    setFetchError(null)
    initiated.current = true
    try {
      const orderId = await createOrder()
      const payRes = await fetch("/api/backend/payments/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId }),
      })
      const payJson = await payRes.json()
      if (!payRes.ok) throw new Error(payJson.error?.message ?? "Erro ao iniciar pagamento.")
      useDelivery
        .getState()
        .set({ appliedCoupon: null, orderNotes: "", needsChange: false, changeFor: null })
      useCart.getState().clear()
      router.push(`/pedido/confirmado?order_id=${orderId}`)
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Erro ao iniciar checkout."
      setFetchError(friendlyError(raw))
    }
  }

  useEffect(() => {
    if (!mounted || !_hasHydrated) return
    if (items.length === 0) {
      router.push("/cardapio")
      return
    }
    if (!isComplete()) {
      router.push("/carrinho")
      return
    }
    if (!token) {
      router.push("/login?returnTo=/pagamento")
      return
    }
    if (initiated.current) return
    initiated.current = true

    // Usuário Google sem telefone no perfil: pede para salvar o número informado no formulário
    if (!customer?.phone && deliveryPhone.trim()) {
      setSavePhonePrompt(true) // eslint-disable-line react-hooks/set-state-in-effect
      return
    }

    initPayment()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, _hasHydrated])

  async function handleSavePhone() {
    setSavingPhone(true)
    try {
      const res = await fetch("/api/backend/auth/customer/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ phone: deliveryPhone }),
      })
      if (res.ok) updatePhone(deliveryPhone)
    } catch {}
    setSavingPhone(false)
    setSavePhonePrompt(false)
    initPayment()
  }

  function handleDismissSavePhone() {
    setSavePhonePrompt(false)
    router.push("/perfil")
  }

  if (!mounted) return null

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 pb-16">
      <div className="mb-2 flex items-center gap-4">
        <Link
          href="/carrinho"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-white/50 transition hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1
          className="leading-none text-white"
          style={{
            fontFamily: "var(--font-bebas)",
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            letterSpacing: "0.05em",
          }}
        >
          Pagamento
        </h1>
      </div>

      <Steps />

      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <OrderReview />

        <div>
          {fetchError && (
            <div
              className="space-y-4 rounded-2xl px-5 py-5"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-none text-red-400" />
                <div>
                  <p className="text-sm font-semibold text-red-400">
                    Erro no nosso sistema — não foi você!
                  </p>
                  <p className="mt-1 text-sm text-white/60">
                    Houve uma instabilidade do nosso lado. Seu pedido não foi cobrado. Tente
                    novamente em instantes.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  initiated.current = false
                  initPayment()
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
              >
                Tentar novamente
              </button>
              <Link
                href="/carrinho"
                className="block text-center text-xs text-white/40 transition hover:text-white/60"
              >
                Voltar e revisar pedido
              </Link>
            </div>
          )}

          {!fetchError && !savePhonePrompt && (
            <div className="flex flex-col items-center justify-center gap-3 py-24">
              <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
              <p className="text-xs text-white/25">Confirmando pedido...</p>
            </div>
          )}
        </div>
      </div>

      {savePhonePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-sm rounded-2xl p-6"
            style={{ background: "var(--mob-s2)", border: "1px solid var(--mob-b1)" }}
          >
            <div className="mb-1 flex items-center gap-2">
              <Phone className="h-4 w-4 text-orange-400" />
              <p className="text-xs font-semibold tracking-widest text-white/30 uppercase">
                Telefone
              </p>
            </div>
            <p className="mt-3 text-sm font-semibold text-white">Salvar número no perfil?</p>
            <p className="mt-1 text-sm text-white/50">
              Deseja usar <span className="font-semibold text-white">{deliveryPhone}</span> como seu
              telefone padrão?
            </p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={handleSavePhone}
                disabled={savingPhone}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #f97316, #ea580c)",
                  boxShadow: "0 4px 16px rgba(249,115,22,0.4)",
                }}
              >
                {savingPhone ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sim, salvar"}
              </button>
              <button
                onClick={handleDismissSavePhone}
                disabled={savingPhone}
                className="flex flex-1 items-center justify-center rounded-xl py-3 text-sm font-semibold text-white/50 transition hover:text-white/70 disabled:opacity-50"
                style={{ border: "1px solid var(--mob-b1)" }}
              >
                Ir ao perfil
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
