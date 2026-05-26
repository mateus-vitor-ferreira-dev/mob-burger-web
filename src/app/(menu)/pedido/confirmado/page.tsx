"use client"

import { fmtPrice } from "@/lib/utils"
import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, ArrowRight, Loader2, XCircle, Clock } from "lucide-react"
import { useCart } from "@/lib/cart-store"

interface OrderData {
  id: string
  orderNumber: number
  status: string
  totalPrice: number
  items: { id: string; quantity: number; product: { name: string } }[]
}

function PedidoConfirmadoContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order_id")
  const redirectStatus = searchParams.get("redirect_status")
  const clearCart = useCart((s) => s.clear)

  const [status, setStatus] = useState<"loading" | "success" | "processing" | "failed" | "error">(
    "loading",
  )
  const [order, setOrder] = useState<OrderData | null>(null)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!orderId) {
      setStatus("error")
      return
    }

    if (redirectStatus === "failed") {
      setStatus("failed")
      return
    }

    // Busca o pedido para exibir detalhes
    fetch(`/api/backend/orders/${orderId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const o = json?.data
        if (!o) {
          setStatus("error")
          return
        }
        setOrder(o)
        if (o.paymentStatus === "PAID" || o.status === "CONFIRMED") {
          clearCart()
          setStatus("success")
        } else if (o.paymentStatus === "PENDING" || o.status === "AWAITING_PAYMENT") {
          setStatus("processing")
          let attempts = 0
          const MAX = 40 // 40 × 3s = 2 min
          const interval = setInterval(async () => {
            attempts++
            try {
              const r2 = await fetch(`/api/backend/orders/${orderId}`)
              const json2 = await r2.json()
              const o2 = json2?.data
              if (o2?.paymentStatus === "PAID" || o2?.status === "CONFIRMED") {
                clearInterval(interval)
                clearCart()
                setStatus("success")
                setOrder(o2)
              } else if (attempts >= MAX) {
                clearInterval(interval)
              }
            } catch {
              if (attempts >= MAX) clearInterval(interval)
            }
          }, 3000)
        } else {
          setStatus("failed")
        }
      })
      .catch(() => setStatus("error"))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, redirectStatus])
  /* eslint-enable react-hooks/set-state-in-effect */

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
        <p className="text-sm text-white/30">Confirmando seu pedido...</p>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-white/50">Não foi possível confirmar o pedido.</p>
        <Link href="/cardapio" className="text-sm text-orange-400 hover:underline">
          Voltar ao cardápio
        </Link>
      </div>
    )
  }

  if (status === "failed") {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <div
          className="w-full max-w-md rounded-3xl p-10"
          style={{
            background: "var(--mob-s1)",
            border: "1px solid var(--mob-b1)",
          }}
        >
          <div className="mb-6 flex justify-center">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full"
              style={{
                background: "rgba(239,68,68,0.12)",
                border: "2px solid rgba(239,68,68,0.3)",
              }}
            >
              <XCircle className="h-10 w-10 text-red-400" />
            </div>
          </div>
          <h1
            className="mb-2 text-white"
            style={{ fontFamily: "var(--font-bebas)", fontSize: "2.5rem", letterSpacing: "0.05em" }}
          >
            Pagamento recusado
          </h1>
          <p className="mb-8 text-sm text-white/50">
            Não foi possível processar o pagamento. Tente novamente ou use outro método.
          </p>
          <Link
            href={orderId ? `/pagamento?retry_order_id=${orderId}` : "/carrinho"}
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition active:scale-95"
            style={{
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              boxShadow: "0 6px 20px rgba(249,115,22,0.35)",
            }}
          >
            Tentar novamente <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    )
  }

  const isProcessing = status === "processing"

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <div
        className="w-full max-w-md rounded-3xl p-8"
        style={{ background: "var(--mob-s1)", border: "1px solid var(--mob-b1)" }}
      >
        {/* Ícone */}
        <div className="mb-6 flex justify-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{
              background: isProcessing ? "rgba(249,115,22,0.12)" : "rgba(34,197,94,0.12)",
              border: `2px solid ${isProcessing ? "rgba(249,115,22,0.3)" : "rgba(34,197,94,0.3)"}`,
            }}
          >
            {isProcessing ? (
              <Clock className="h-10 w-10 text-orange-400" />
            ) : (
              <CheckCircle className="h-10 w-10 text-green-400" />
            )}
          </div>
        </div>

        <h1
          className="mb-1 text-white"
          style={{ fontFamily: "var(--font-bebas)", fontSize: "2.5rem", letterSpacing: "0.05em" }}
        >
          {isProcessing ? "Aguardando confirmação" : "Pedido confirmado!"}
        </h1>

        <p className="mb-1 text-sm text-white/50">
          {isProcessing
            ? "Seu pagamento está sendo processado. Você receberá uma confirmação em breve."
            : "Seu pedido já está na fila da cozinha!"}
        </p>

        {order && (
          <>
            <p className="mb-4 text-xs text-white/30">Pedido #{order.orderNumber}</p>

            {/* Itens */}
            <div
              className="mb-4 space-y-1.5 rounded-2xl p-4 text-left"
              style={{
                background: "var(--mob-s1)",
                border: "1px solid var(--mob-b1)",
              }}
            >
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-white/70">
                    <span className="font-bold text-orange-400">{item.quantity}×</span>{" "}
                    {item.product.name.replace("MOB ", "")}
                  </span>
                </div>
              ))}
              <div
                className="flex justify-between border-t pt-2 text-sm font-bold text-white"
                style={{ borderColor: "var(--mob-b1)" }}
              >
                <span>Total</span>
                <span>{fmtPrice(order.totalPrice)}</span>
              </div>
            </div>
          </>
        )}

        <div className="flex flex-col gap-3">
          {orderId && !isProcessing && (
            <Link
              href={`/acompanhar/${orderId}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white transition active:scale-95"
              style={{
                background: "linear-gradient(135deg, #f97316, #ea580c)",
                boxShadow: "0 6px 20px rgba(249,115,22,0.35)",
              }}
            >
              Acompanhar pedido <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          <Link
            href="/cardapio"
            className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition active:scale-95"
            style={{
              color: "rgba(255,255,255,0.5)",
              border: "1px solid var(--mob-b1)",
            }}
          >
            Fazer novo pedido
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function PedidoConfirmadoPage() {
  return (
    <Suspense>
      <PedidoConfirmadoContent />
    </Suspense>
  )
}
