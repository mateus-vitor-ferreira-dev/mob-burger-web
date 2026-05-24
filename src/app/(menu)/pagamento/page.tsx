"use client"

import { fmtPrice } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, AlertCircle, MapPin, User, ShoppingBag, Lock } from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { useCart } from "@/lib/cart-store"
import { useDelivery } from "@/lib/delivery-store"
import { useCustomer } from "@/lib/customer-store"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const STRIPE_APPEARANCE = {
  theme: "night" as const,
  variables: {
    colorPrimary: "#f97316",
    colorBackground: "#110f0d",
    colorText: "#ffffff",
    colorTextSecondary: "var(--mob-t50)",
    colorDanger: "#ef4444",
    borderRadius: "12px",
    fontFamily: "inherit",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": {
      border: "1px solid var(--mob-s3)",
      backgroundColor: "var(--mob-s2)",
      boxShadow: "none",
    },
    ".Input:focus": {
      border: "1px solid rgba(249,115,22,0.5)",
      boxShadow: "0 0 0 3px rgba(249,115,22,0.12)",
    },
    ".Label": {
      color: "var(--mob-t40)",
      fontSize: "11px",
      fontWeight: "600",
      letterSpacing: "0.08em",
      textTransform: "uppercase",
    },
    ".Tab": {
      border: "1px solid var(--mob-b1)",
      backgroundColor: "var(--mob-s1)",
    },
    ".Tab--selected": {
      border: "1px solid rgba(249,115,22,0.4)",
      backgroundColor: "rgba(249,115,22,0.08)",
    },
    ".Tab:hover": { backgroundColor: "var(--mob-s2)" },
  },
}

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
  const { customerName, phone, address, deliveryFee, orderType } = useDelivery()
  const total = subtotal + (orderType === "PICKUP" ? 0 : deliveryFee)

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
            <span>{orderType === "PICKUP" ? "Grátis" : fmtPrice(deliveryFee)}</span>
          </div>
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
        <p className="text-xs text-white/20">Pagamento processado com segurança pelo Stripe</p>
      </div>
    </div>
  )
}

// ─── Formulário Stripe ────────────────────────────────────────────────────────

function PaymentForm({ orderId, total }: { orderId: string; total: number }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError(null)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/pedido/confirmado?order_id=${orderId}`,
      },
    })

    if (error) {
      setError(error.message ?? "Erro ao processar pagamento.")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div
        className="rounded-2xl p-5"
        style={{ background: "var(--mob-s1)", border: "1px solid var(--mob-b1)" }}
      >
        <p className="mb-5 text-xs font-semibold tracking-widest text-white/30 uppercase">
          Forma de pagamento
        </p>
        <PaymentElement options={{ layout: "tabs" }} />
      </div>

      {error && (
        <div
          className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm text-red-400"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          <AlertCircle className="mt-0.5 h-4 w-4 flex-none" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-bold text-white transition active:scale-[0.98] disabled:opacity-50"
        style={{
          background: "linear-gradient(135deg, #f97316, #ea580c)",
          boxShadow: "0 6px 24px rgba(249,115,22,0.4)",
        }}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Processando...
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" /> Pagar {fmtPrice(total)}
          </>
        )}
      </button>
    </form>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PagamentoPage() {
  const router = useRouter()
  const items = useCart((s) => s.items)
  const subtotal = useCart((s) => s.total())
  const isComplete = useDelivery((s) => s.isComplete)
  const { address, zoneId, deliveryFee, orderType } = useDelivery()
  const total = subtotal + (orderType === "PICKUP" ? 0 : deliveryFee)
  const { token } = useCustomer()

  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const initiated = useRef(false)

  useEffect(() => {
    setMounted(true) // eslint-disable-line react-hooks/set-state-in-effect
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (items.length === 0) {
      router.push("/cardapio")
      return
    }
    if (!isComplete()) {
      router.push("/carrinho")
      return
    }
    if (!token) {
      router.push("/login")
      return
    }
    if (initiated.current) return
    initiated.current = true

    async function initPayment() {
      try {
        // Mapeia itens do carrinho — productId já é o ID real do banco
        const mappedItems = items.map((item) => ({
          productId: item.productId ?? item.id,
          quantity: item.qty,
          observations: item.observations || undefined,
          options: (item.options ?? []).map((o) => ({ optionItemId: o.optionItemId })),
        }))

        if (mappedItems.length === 0) throw new Error("Sacola vazia.")

        // 3. Cria o pedido
        const couponCode = new URLSearchParams(window.location.search).get("coupon") || undefined
        const orderRes = await fetch("/api/backend/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            type: orderType,
            paymentMethod: "CARD",
            items: mappedItems,
            couponCode,
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
        const orderJson = await orderRes.json()
        if (!orderRes.ok) throw new Error(orderJson.error?.message ?? "Erro ao criar pedido.")
        const createdOrderId: string = orderJson.data.id

        // 4. Cria o PaymentIntent vinculado ao pedido
        const payRes = await fetch("/api/backend/payments/intent", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ orderId: createdOrderId }),
        })
        const payJson = await payRes.json()
        if (!payRes.ok) throw new Error(payJson.error?.message ?? "Erro ao iniciar pagamento.")

        setOrderId(createdOrderId)
        setClientSecret(payJson.data.clientSecret)
      } catch (e) {
        setFetchError(e instanceof Error ? e.message : "Erro ao iniciar checkout.")
      }
    }

    initPayment()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted])

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
              className="flex items-center gap-3 rounded-2xl px-4 py-4 text-sm text-red-400"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              <AlertCircle className="h-4 w-4 flex-none" /> {fetchError}
            </div>
          )}

          {!clientSecret && !fetchError && (
            <div className="flex flex-col items-center justify-center gap-3 py-24">
              <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
              <p className="text-xs text-white/25">Preparando checkout seguro...</p>
            </div>
          )}

          {clientSecret && orderId && (
            <Elements
              stripe={stripePromise}
              options={{ clientSecret, appearance: STRIPE_APPEARANCE }}
            >
              <PaymentForm orderId={orderId} total={total} />
            </Elements>
          )}
        </div>
      </div>
    </main>
  )
}
