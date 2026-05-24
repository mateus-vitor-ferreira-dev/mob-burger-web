"use client"

import { fmtPrice } from "@/lib/utils"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Clock,
  ChefHat,
  Package,
  Bike,
  Home,
  XCircle,
  AlertTriangle,
} from "lucide-react"
import { useCustomer } from "@/lib/customer-store"

interface OrderTracking {
  id: string
  orderNumber: number
  status: string
  type: "DELIVERY" | "PICKUP"
  totalPrice: number
  createdAt: string
  customer: { id: string; name: string }
  items: { id: string; quantity: number; product: { name: string } }[]
  delivery?: { street: string; number: string; neighborhood: string }
}

const ETA: Record<string, string> = {
  AWAITING_PAYMENT: "Confirmando pagamento...",
  CONFIRMED: "~40 min",
  PREPARING: "~25 min",
  READY: "Pronto!",
  OUT_FOR_DELIVERY: "~15 min",
  DELIVERED: "Entregue!",
  PICKED_UP: "Retirado!",
}

const STEPS: { status: string; label: string; icon: React.ElementType; delivery?: boolean }[] = [
  { status: "CONFIRMED", label: "Confirmado", icon: CheckCircle2 },
  { status: "PREPARING", label: "Em preparo", icon: ChefHat },
  { status: "READY", label: "Pronto", icon: Package },
  { status: "OUT_FOR_DELIVERY", label: "Saiu para entrega", icon: Bike, delivery: true },
  { status: "DELIVERED", label: "Entregue", icon: Home, delivery: true },
  { status: "PICKED_UP", label: "Retirado", icon: Home, delivery: false },
]

const STATUS_ORDER = [
  "AWAITING_PAYMENT",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "PICKED_UP",
]

function getStepIndex(status: string) {
  return STATUS_ORDER.indexOf(status)
}

export default function AcompanharPage() {
  const params = useParams()
  const id = params.id as string
  const { token, customer } = useCustomer()

  const [order, setOrder] = useState<OrderTracking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState("")

  async function handleCancel() {
    if (!token) return
    if (!confirm("Tem certeza que deseja cancelar este pedido?")) return
    setCancelling(true)
    setCancelError("")
    try {
      const r = await fetch(`/api/backend/orders/${id}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await r.json()
      if (!r.ok) throw new Error(json.error?.message ?? "Erro ao cancelar")
      setOrder((o) => (o ? { ...o, status: "CANCELLED" } : o))
    } catch (e) {
      setCancelError(e instanceof Error ? e.message : "Erro ao cancelar")
    } finally {
      setCancelling(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/backend/orders/${id}`)
        if (!res.ok) {
          setError(true)
          setLoading(false)
          return
        }
        const json = await res.json()
        if (!cancelled) {
          setOrder(json.data)
          setLoading(false)
        }
      } catch {
        if (!cancelled) {
          setError(true)
          setLoading(false)
        }
      }
    }

    fetchOrder()

    // SSE para atualizações em tempo real
    let sseController: AbortController | null = null
    let reconnectTimer: ReturnType<typeof setTimeout>

    async function connectSSE() {
      sseController = new AbortController()
      try {
        const res = await fetch(`/api/backend/orders/${id}/stream`, {
          signal: sseController.signal,
          headers: { Accept: "text/event-stream" },
        })
        if (!res.body) return

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""

        while (!cancelled) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() ?? ""
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue
            try {
              const evt = JSON.parse(line.slice(6))
              if ((evt.type === "status_update" || evt.type === "new_order") && evt.order) {
                setOrder(evt.order)
              }
            } catch {}
          }
        }
        reader.cancel()
      } catch {
        // AbortError ao desmontar — ignora; outros erros reconectam
      }

      if (!cancelled) {
        reconnectTimer = setTimeout(connectSSE, 5000)
      }
    }

    connectSSE()

    return () => {
      cancelled = true
      sseController?.abort()
      clearTimeout(reconnectTimer)
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <XCircle className="h-12 w-12 text-red-400/50" />
        <p className="text-sm text-white/40">Pedido não encontrado.</p>
        <Link href="/cardapio" className="text-sm text-orange-400 hover:underline">
          Ir para o cardápio
        </Link>
      </div>
    )
  }

  const isCancelled = order.status === "CANCELLED"
  const isDone = ["DELIVERED", "PICKED_UP"].includes(order.status)
  const currentIdx = getStepIndex(order.status)

  const visibleSteps = STEPS.filter((s) => {
    if (order.type === "DELIVERY") return s.delivery !== false
    return s.delivery !== true
  })

  return (
    <main className="mx-auto max-w-lg px-6 py-10 pb-16">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-white/50 transition hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="text-xs font-semibold tracking-[0.25em] text-orange-400 uppercase">
            Pedido #{String(order.orderNumber).padStart(4, "0")}
          </p>
          <h1
            className="leading-none text-white"
            style={{ fontFamily: "var(--font-bebas)", fontSize: "2rem", letterSpacing: "0.05em" }}
          >
            Acompanhar pedido
          </h1>
        </div>
      </div>

      {/* ETA + Cancel */}
      {!isCancelled && !isDone && ETA[order.status] && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-400" />
            <span className="text-sm font-semibold text-orange-400">
              Estimativa: {ETA[order.status]}
            </span>
          </div>
          {token &&
            customer &&
            order.customer.id === customer.id &&
            ["AWAITING_PAYMENT", "CONFIRMED"].includes(order.status) && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-400/10 disabled:opacity-50"
              >
                {cancelling ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                Cancelar pedido
              </button>
            )}
        </div>
      )}

      {cancelError && (
        <div
          className="mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-red-400"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          <AlertTriangle className="h-4 w-4 flex-none" /> {cancelError}
        </div>
      )}

      {/* Status card */}
      <div
        className="mb-6 rounded-2xl p-5"
        style={{ background: "var(--mob-s1)", border: "1px solid var(--mob-b1)" }}
      >
        {isCancelled ? (
          <div className="flex items-center gap-3">
            <XCircle className="h-8 w-8 flex-none text-red-400" />
            <div>
              <p className="font-semibold text-red-400">Pedido cancelado</p>
              <p className="text-xs text-white/30">Entre em contato caso tenha dúvidas.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleSteps.map((step, idx) => {
              const stepIdx = getStepIndex(step.status)
              const done = stepIdx < currentIdx || isDone
              const active = step.status === order.status

              return (
                <div key={step.status} className="flex items-center gap-3">
                  {/* Linha conectora */}
                  <div className="flex flex-col items-center">
                    <div
                      className="flex h-9 w-9 flex-none items-center justify-center rounded-full transition-all"
                      style={{
                        background:
                          done || active ? "rgba(249,115,22,0.18)" : "rgba(255,255,255,0.05)",
                        border: `2px solid ${done || active ? "#f97316" : "rgba(255,255,255,0.1)"}`,
                      }}
                    >
                      <step.icon
                        className="h-4 w-4"
                        style={{ color: done || active ? "#f97316" : "rgba(255,255,255,0.2)" }}
                      />
                    </div>
                    {idx < visibleSteps.length - 1 && (
                      <div
                        className="mt-1 h-4 w-0.5"
                        style={{ background: done ? "#f97316" : "rgba(255,255,255,0.08)" }}
                      />
                    )}
                  </div>

                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{
                        color: active
                          ? "#f97316"
                          : done
                            ? "rgba(255,255,255,0.7)"
                            : "rgba(255,255,255,0.2)",
                      }}
                    >
                      {step.label}
                    </p>
                    {active && (
                      <p className="flex items-center gap-1 text-xs text-white/30">
                        <Clock className="h-3 w-3" /> Atualizando em tempo real...
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Itens */}
      <div
        className="mb-4 space-y-2 rounded-2xl p-5"
        style={{ background: "var(--mob-s1)", border: "1px solid var(--mob-b1)" }}
      >
        <p className="mb-3 text-xs font-semibold tracking-widest text-white/30 uppercase">
          Itens do pedido
        </p>
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between text-sm">
            <span className="text-white/70">
              <span className="font-bold text-orange-400">{item.quantity}×</span>{" "}
              {item.product.name.replace(/^Mob /i, "")}
            </span>
          </div>
        ))}
        <div
          className="flex items-center justify-between border-t pt-2 text-sm font-bold text-white"
          style={{ borderColor: "var(--mob-b1)" }}
        >
          <span>Total</span>
          <span>{fmtPrice(order.totalPrice)}</span>
        </div>
      </div>

      {/* Endereço */}
      {order.delivery && (
        <div
          className="rounded-2xl p-4 text-sm text-white/40"
          style={{ background: "var(--mob-s1)", border: "1px solid var(--mob-b1)" }}
        >
          📍 {order.delivery.street}, {order.delivery.number} — {order.delivery.neighborhood}
        </div>
      )}
    </main>
  )
}
