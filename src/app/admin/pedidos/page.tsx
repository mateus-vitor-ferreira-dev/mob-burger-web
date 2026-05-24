"use client"

import { fmtPrice } from "@/lib/utils"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  Search,
  X,
  Printer,
  RefreshCw,
  ChevronDown,
  Loader2,
  CheckCircle,
  Radio,
  Calendar,
  Download,
  Bike,
  Phone,
} from "lucide-react"
import { useStaff } from "@/lib/staff-store"

function exportCSV(orders: Order[]) {
  const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`
  const header = [
    "Nº",
    "Data",
    "Cliente",
    "Telefone",
    "Status",
    "Tipo",
    "Pagamento",
    "Itens",
    "Total",
  ]
  const rows = orders.map((o) => [
    String(o.orderNumber).padStart(4, "0"),
    new Date(o.createdAt).toLocaleString("pt-BR"),
    o.customer.name,
    o.customer.phone ?? "",
    STATUS_LABEL[o.status] ?? o.status,
    o.delivery ? "Entrega" : "Retirada",
    o.paymentMethod,
    o.items.map((i) => `${i.quantity}x ${i.product.name.replace(/^Mob /i, "")}`).join("; "),
    o.totalPrice.toFixed(2).replace(".", ","),
  ])
  const csv = [header, ...rows].map((r) => r.map(esc).join(";")).join("\n")
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `pedidos-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function playNewOrderBeep() {
  try {
    const ctx = new AudioContext()
    const t = ctx.currentTime
    ;[0, 0.18].forEach((offset) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = "sine"
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0, t + offset)
      gain.gain.linearRampToValueAtTime(0.35, t + offset + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.22)
      osc.start(t + offset)
      osc.stop(t + offset + 0.22)
    })
  } catch {
    // AudioContext pode ser bloqueado antes de interação do usuário
  }
}

function fmtDate(d: string) {
  return new Date(d).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const STATUS_LABEL: Record<string, string> = {
  AWAITING_PAYMENT: "Aguardando pagamento",
  CONFIRMED: "Confirmado",
  PREPARING: "Em preparo",
  READY: "Pronto",
  OUT_FOR_DELIVERY: "Saiu p/ entrega",
  DELIVERED: "Entregue",
  PICKED_UP: "Retirado",
  CANCELLED: "Cancelado",
}

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  AWAITING_PAYMENT: { bg: "rgba(245,158,11,0.15)", text: "#f59e0b" },
  CONFIRMED: { bg: "rgba(59,130,246,0.15)", text: "#60a5fa" },
  PREPARING: { bg: "rgba(249,115,22,0.15)", text: "#f97316" },
  READY: { bg: "rgba(139,92,246,0.15)", text: "#a78bfa" },
  OUT_FOR_DELIVERY: { bg: "rgba(6,182,212,0.15)", text: "#22d3ee" },
  DELIVERED: { bg: "rgba(34,197,94,0.15)", text: "#4ade80" },
  PICKED_UP: { bg: "rgba(34,197,94,0.15)", text: "#4ade80" },
  CANCELLED: { bg: "rgba(239,68,68,0.15)", text: "#f87171" },
}

const NEXT_STATUS: Record<string, string[]> = {
  AWAITING_PAYMENT: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["OUT_FOR_DELIVERY", "PICKED_UP", "CANCELLED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "CANCELLED"],
}

const FILTER_STATUSES = [
  { value: "", label: "Todos" },
  { value: "AWAITING_PAYMENT", label: "Aguardando pagamento" },
  { value: "CONFIRMED", label: "Confirmado" },
  { value: "PREPARING", label: "Em preparo" },
  { value: "READY", label: "Pronto" },
  { value: "OUT_FOR_DELIVERY", label: "Saiu p/ entrega" },
  { value: "DELIVERED", label: "Entregue" },
  { value: "CANCELLED", label: "Cancelado" },
]

interface Driver {
  id: string
  name: string
  phone: string
  active: boolean
}

interface OrderItem {
  id: string
  quantity: number
  unitPrice: number
  product: { name: string }
}
interface Order {
  id: string
  orderNumber: number
  status: string
  paymentStatus: string
  paymentMethod: string
  totalPrice: number
  createdAt: string
  customer: { name: string; phone?: string }
  items: OrderItem[]
  delivery?: { street: string; number: string; neighborhood: string; complement?: string }
  driver?: { id: string; name: string; phone: string } | null
}

// ─── Print receipt ────────────────────────────────────────────────────────────

function browserPrint(order: Order) {
  const w = 320
  const lines: string[] = [
    `<div style="font-family:monospace;font-size:12px;width:${w}px;padding:8px">`,
    `<div style="text-align:center;font-size:16px;font-weight:bold;margin-bottom:4px">M.O.B BURGER</div>`,
    `<div style="text-align:center;font-size:11px;margin-bottom:8px">Pedido #${String(order.orderNumber).padStart(4, "0")} — ${fmtDate(order.createdAt)}</div>`,
    `<hr style="border-top:1px dashed #000;margin:6px 0"/>`,
    `<div><b>Cliente:</b> ${order.customer.name}</div>`,
    order.customer.phone ? `<div><b>Tel:</b> ${order.customer.phone}</div>` : "",
    order.delivery
      ? `<div><b>Endereço:</b> ${order.delivery.street}, ${order.delivery.number}${order.delivery.complement ? ` - ${order.delivery.complement}` : ""} — ${order.delivery.neighborhood}</div>`
      : "",
    `<hr style="border-top:1px dashed #000;margin:6px 0"/>`,
    ...order.items.map(
      (item) =>
        `<div style="display:flex;justify-content:space-between"><span>${item.quantity}x ${item.product.name.replace("MOB ", "")}</span><span>${fmtPrice(item.unitPrice * item.quantity)}</span></div>`,
    ),
    `<hr style="border-top:1px dashed #000;margin:6px 0"/>`,
    `<div style="display:flex;justify-content:space-between;font-weight:bold;font-size:13px"><span>TOTAL</span><span>${fmtPrice(order.totalPrice)}</span></div>`,
    `<div style="text-align:center;margin-top:8px;font-size:10px">Obrigado pela preferência!</div>`,
    `</div>`,
  ]
  const win = window.open("", "_blank", "width=400,height=600")
  if (!win) return
  win.document.write(
    `<html><head><title>Pedido #${order.orderNumber}</title><style>@media print{body{margin:0}}</style></head><body>${lines.join("")}</body></html>`,
  )
  win.document.close()
  win.focus()
  win.print()
  win.close()
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_COLOR[status] ?? { bg: "rgba(128,128,128,0.15)", text: "#888" }
  return (
    <span
      className="rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap"
      style={{ background: c.bg, color: c.text }}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}

// ─── StatusChanger ────────────────────────────────────────────────────────────

function StatusChanger({
  order,
  token,
  onUpdated,
}: {
  order: Order
  token: string
  onUpdated: () => void
}) {
  const nexts = NEXT_STATUS[order.status] ?? []
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  if (nexts.length === 0) return <StatusBadge status={order.status} />

  async function change(status: string) {
    setLoading(true)
    await fetch(`/api/backend/orders/${order.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    })
    setLoading(false)
    setOpen(false)
    onUpdated()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition hover:opacity-80 disabled:opacity-50"
        style={{
          background: STATUS_COLOR[order.status]?.bg,
          color: STATUS_COLOR[order.status]?.text,
        }}
      >
        {STATUS_LABEL[order.status]}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute top-8 right-0 z-20 min-w-max space-y-1 rounded-xl p-2"
            style={{
              background: "#1a1815",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            }}
          >
            {nexts.map((s) => (
              <button
                key={s}
                onClick={() => change(s)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition hover:bg-white/5"
                style={{ color: STATUS_COLOR[s]?.text ?? "#fff" }}
              >
                <div
                  className="h-2 w-2 flex-none rounded-full"
                  style={{ background: STATUS_COLOR[s]?.text }}
                />
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type PrintState = "idle" | "printing" | "done" | "error"

export default function PedidosPage() {
  const { token } = useStaff()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [maxPrice, setMaxPrice] = useState(500)
  const [maxPriceInData, setMaxPriceInData] = useState(500)
  const [printStates, setPrintStates] = useState<Record<string, PrintState>>({})
  const [queue, setQueue] = useState<{ orders: Order[]; current: number } | null>(null)
  const cancelQueueRef = useRef(false)
  const [sseStatus, setSseStatus] = useState<"connecting" | "live" | "offline">("connecting")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const PAGE_SIZE = 30
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null)
  const [assigning, setAssigning] = useState(false)

  const load = useCallback(() => {
    if (!token) return
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter) params.set("status", statusFilter)
    params.set("page", String(page))
    params.set("limit", String(PAGE_SIZE))
    fetch(`/api/backend/orders?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((json) => {
        const data: Order[] = json.data?.orders ?? json.data ?? []
        setOrders(data)
        setTotalPages(json.data?.pages ?? 1)
        setTotalOrders(json.data?.total ?? data.length)
        const max = Math.max(...data.map((o) => o.totalPrice), 500)
        setMaxPriceInData(Math.ceil(max))
        setMaxPrice(Math.ceil(max))
      })
      .finally(() => setLoading(false))
  }, [token, statusFilter, page])

  useEffect(() => {
    load() // eslint-disable-line react-hooks/set-state-in-effect
  }, [load])

  const loadDrivers = useCallback(async () => {
    if (!token) return
    const r = await fetch("/api/backend/drivers", { headers: { Authorization: `Bearer ${token}` } })
    const json = await r.json()
    setDrivers((json.data ?? []).filter((d: Driver) => d.active))
  }, [token])

  useEffect(() => {
    loadDrivers() // eslint-disable-line react-hooks/set-state-in-effect
  }, [loadDrivers])

  // ─── SSE — atualizações em tempo real ──────────────────────────────────────
  useEffect(() => {
    if (!token) return
    let cancelled = false
    let reconnectTimer: ReturnType<typeof setTimeout>

    async function connect() {
      setSseStatus("connecting")
      try {
        const res = await fetch("/api/backend/orders/stream", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok || !res.body) throw new Error("no body")

        setSseStatus("live")
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
              if (evt.type === "new_order") {
                playNewOrderBeep()
                load()
              } else if (evt.type === "status_update" && evt.order) {
                setOrders((prev) => prev.map((o) => (o.id === evt.order.id ? evt.order : o)))
              }
            } catch {}
          }
        }
        reader.cancel()
      } catch {}

      if (!cancelled) {
        setSseStatus("offline")
        reconnectTimer = setTimeout(connect, 4000)
      }
    }

    connect()
    return () => {
      cancelled = true
      clearTimeout(reconnectTimer)
    }
  }, [token, load])

  async function handlePrint(order: Order) {
    setPrintStates((s) => ({ ...s, [order.id]: "printing" }))
    try {
      const res = await fetch(`/api/backend/orders/${order.id}/print`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setPrintStates((s) => ({ ...s, [order.id]: "done" }))
        setTimeout(() => setPrintStates((s) => ({ ...s, [order.id]: "idle" })), 2500)
        return
      }
      // Impressora não configurada ou offline → fallback silencioso
      browserPrint(order)
    } catch {
      browserPrint(order)
    } finally {
      setPrintStates((s) => {
        if (s[order.id] === "printing") return { ...s, [order.id]: "idle" }
        return s
      })
    }
  }

  async function printAllQueued() {
    // FIFO: ordena pelo mais antigo primeiro (ordem de chegada)
    const fifo = [...filtered].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
    if (fifo.length === 0) return

    cancelQueueRef.current = false
    setQueue({ orders: fifo, current: 0 })

    for (let i = 0; i < fifo.length; i++) {
      if (cancelQueueRef.current) break
      setQueue({ orders: fifo, current: i + 1 })
      await handlePrint(fifo[i])
    }

    setQueue(null)
  }

  function cancelQueue() {
    cancelQueueRef.current = true
    setQueue(null)
  }

  async function handleAssignDriver(orderId: string, driverId: string) {
    setAssigning(true)
    try {
      const r = await fetch(`/api/backend/orders/${orderId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ driverId }),
      })
      if (!r.ok) {
        const json = await r.json()
        throw new Error(json.error?.message ?? "Erro ao designar entregador")
      }
      setAssigningOrderId(null)
      load()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao designar entregador")
    } finally {
      setAssigning(false)
    }
  }

  const filtered = orders.filter((o) => {
    if (o.totalPrice > maxPrice) return false
    if (dateFrom && new Date(o.createdAt) < new Date(dateFrom)) return false
    if (dateTo && new Date(o.createdAt) > new Date(dateTo + "T23:59:59")) return false
    if (!query) return true
    const q = query.toLowerCase()
    return o.customer.name.toLowerCase().includes(q) || String(o.orderNumber).includes(q)
  })

  const inputCls =
    "rounded-xl px-3 py-2 text-sm text-white placeholder-white/40 outline-none ring-1 transition focus:ring-orange-500/60"
  const inputInlineStyle = { background: "rgba(0,0,0,0.35)", ringColor: "rgba(255,255,255,0.2)" }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.3em] text-orange-400 uppercase">Gestão</p>
          <h1
            className="leading-none text-white"
            style={{ fontFamily: "var(--font-bebas)", fontSize: "2.5rem", letterSpacing: "0.05em" }}
          >
            Pedidos
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Fila de impressão */}
          {queue ? (
            <div
              className="flex items-center gap-3 rounded-xl px-3 py-2"
              style={{
                background: "rgba(249,115,22,0.1)",
                border: "1px solid rgba(249,115,22,0.25)",
              }}
            >
              <Loader2 className="h-4 w-4 animate-spin text-orange-400" />
              <span className="text-sm text-orange-400">
                Imprimindo {queue.current}/{queue.orders.length}
              </span>
              <button
                onClick={cancelQueue}
                className="rounded-lg p-0.5 text-white/40 transition hover:text-red-400"
                title="Cancelar fila"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={printAllQueued}
              disabled={filtered.length === 0}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/50 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              title="Imprime os pedidos visíveis em ordem de chegada (FIFO)"
            >
              <Printer className="h-4 w-4" />
              Imprimir fila
              {filtered.length > 0 && (
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-bold text-orange-400"
                  style={{ background: "rgba(249,115,22,0.15)" }}
                >
                  {filtered.length}
                </span>
              )}
            </button>
          )}

          {/* Indicador SSE */}
          <div className="flex items-center gap-1.5 rounded-xl px-3 py-2">
            <Radio
              className="h-3.5 w-3.5 flex-none"
              style={{
                color:
                  sseStatus === "live"
                    ? "#4ade80"
                    : sseStatus === "offline"
                      ? "#f87171"
                      : "#f59e0b",
              }}
            />
            <span
              className="text-xs"
              style={{
                color:
                  sseStatus === "live"
                    ? "#4ade80"
                    : sseStatus === "offline"
                      ? "#f87171"
                      : "#f59e0b",
              }}
            >
              {sseStatus === "live"
                ? "Ao vivo"
                : sseStatus === "offline"
                  ? "Reconectando..."
                  : "Conectando..."}
            </span>
          </div>

          <button
            onClick={() => exportCSV(filtered)}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/50 transition hover:bg-white/5 hover:text-white disabled:opacity-30"
            title="Exportar pedidos visíveis como CSV"
          >
            <Download className="h-4 w-4" /> CSV
          </button>

          <button
            onClick={load}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/50 transition hover:bg-white/5 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" /> Atualizar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-48 flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/60" />
          <input
            className={`${inputCls} w-full pl-9`}
            style={inputInlineStyle}
            placeholder="Nome do cliente ou nº do pedido..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={inputCls}
          style={{ background: "rgba(0,0,0,0.35)", color: "white" }}
        >
          {FILTER_STATUSES.map((s) => (
            <option key={s.value} value={s.value} style={{ background: "#1a1815" }}>
              {s.label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <span className="text-xs whitespace-nowrap text-white/40">Até</span>
          <input
            type="range"
            min={0}
            max={maxPriceInData}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-24 accent-orange-500"
          />
          <span className="text-xs font-semibold whitespace-nowrap text-orange-400">
            {fmtPrice(maxPrice)}
          </span>
        </div>

        {/* Filtro de data */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 flex-none text-white/30" />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-xl px-2 py-1.5 text-xs text-white ring-1 ring-white/10 outline-none focus:ring-orange-500/50"
            style={{ background: "rgba(0,0,0,0.35)" }}
          />
          <span className="text-xs text-white/30">—</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-xl px-2 py-1.5 text-xs text-white ring-1 ring-white/10 outline-none focus:ring-orange-500/50"
            style={{ background: "rgba(0,0,0,0.35)" }}
          />
          {(dateFrom || dateTo) && (
            <button
              onClick={() => {
                setDateFrom("")
                setDateTo("")
              }}
              className="text-white/30 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Contagem */}
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-white/25">
          {filtered.length} de {totalOrders} {totalOrders === 1 ? "pedido" : "pedidos"}
          {totalPages > 1 && ` · página ${page}/${totalPages}`}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg px-3 py-1 text-xs text-white/50 transition hover:bg-white/5 disabled:opacity-30"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}
            >
              ← Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg px-3 py-1 text-xs text-white/50 transition hover:bg-white/5 disabled:opacity-30"
              style={{ border: "1px solid rgba(255,255,255,0.1)" }}
            >
              Próxima →
            </button>
          </div>
        )}
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-2xl"
              style={{ background: "var(--mob-s1)" }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-white/25">Nenhum pedido encontrado.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl p-4"
              style={{
                background: "var(--mob-s3)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid var(--mob-s4)",
              }}
            >
              <div className="flex flex-wrap items-start gap-3">
                {/* Número + data */}
                <div className="w-16 flex-none">
                  <p
                    className="text-base font-bold text-orange-400"
                    style={{ fontFamily: "var(--font-bebas)", letterSpacing: "0.05em" }}
                  >
                    #{String(order.orderNumber).padStart(4, "0")}
                  </p>
                  <p className="text-[10px] text-white/30">{fmtDate(order.createdAt)}</p>
                </div>

                {/* Cliente + itens */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">{order.customer.name}</p>
                  <p className="truncate text-xs text-white/40">
                    {order.items
                      .map((i) => `${i.quantity}× ${i.product.name.replace("MOB ", "")}`)
                      .join(", ")}
                  </p>
                </div>

                {/* Total */}
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{fmtPrice(order.totalPrice)}</p>
                  <p className="text-[10px] text-white/30">{order.paymentMethod}</p>
                </div>

                {/* Status */}
                <StatusChanger order={order} token={token!} onUpdated={load} />

                {/* Print */}
                {(() => {
                  const ps = printStates[order.id] ?? "idle"
                  return (
                    <button
                      onClick={() => handlePrint(order)}
                      disabled={ps === "printing"}
                      className="flex h-8 w-8 flex-none items-center justify-center rounded-xl transition disabled:opacity-50"
                      style={
                        ps === "done"
                          ? { color: "#4ade80", background: "rgba(34,197,94,0.1)" }
                          : { color: "rgba(255,255,255,0.4)" }
                      }
                      title={ps === "done" ? "Enviado!" : "Imprimir pedido"}
                    >
                      {ps === "printing" && <Loader2 className="h-4 w-4 animate-spin" />}
                      {ps === "done" && <CheckCircle className="h-4 w-4" />}
                      {ps === "idle" && <Printer className="h-4 w-4" />}
                    </button>
                  )
                })()}
              </div>

              {/* Endereço + entregador (delivery) */}
              {order.delivery && (
                <div className="mt-2 space-y-1">
                  <p className="text-[11px] text-white/25">
                    📍 {order.delivery.street}, {order.delivery.number}
                    {order.delivery.complement ? ` — ${order.delivery.complement}` : ""}
                    {" · "}
                    {order.delivery.neighborhood}
                  </p>
                  <div className="flex items-center gap-2">
                    {order.driver && (
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Bike className="h-3 w-3 text-cyan-400" />
                        <span className="text-cyan-400">{order.driver.name}</span>
                        <span className="text-white/20">·</span>
                        <Phone className="h-2.5 w-2.5 text-white/20" />
                        <span className="text-white/25">{order.driver.phone}</span>
                      </div>
                    )}
                    {!["DELIVERED", "PICKED_UP", "CANCELLED"].includes(order.status) && (
                      <div className="relative">
                        <button
                          onClick={() =>
                            setAssigningOrderId(assigningOrderId === order.id ? null : order.id)
                          }
                          className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] text-white/30 transition hover:bg-white/5 hover:text-cyan-400"
                          style={{ border: "1px solid rgba(255,255,255,0.07)" }}
                        >
                          <Bike className="h-2.5 w-2.5" />
                          {order.driver ? "Trocar" : "Designar entregador"}
                        </button>
                        {assigningOrderId === order.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setAssigningOrderId(null)}
                            />
                            <div
                              className="absolute bottom-full left-0 z-20 mb-1 min-w-40 rounded-xl p-1.5"
                              style={{
                                background: "#1a1815",
                                border: "1px solid rgba(255,255,255,0.1)",
                                boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                              }}
                            >
                              {drivers.length === 0 ? (
                                <p className="px-3 py-2 text-[10px] text-white/30">
                                  Nenhum entregador ativo
                                </p>
                              ) : (
                                drivers.map((d) => (
                                  <button
                                    key={d.id}
                                    onClick={() => handleAssignDriver(order.id, d.id)}
                                    disabled={assigning}
                                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-white/60 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
                                  >
                                    {order.driver?.id === d.id ? (
                                      <span className="text-[10px] text-cyan-400">✓</span>
                                    ) : (
                                      <Bike className="h-3 w-3 text-white/20" />
                                    )}
                                    {d.name}
                                    {assigning && (
                                      <Loader2 className="ml-auto h-3 w-3 animate-spin" />
                                    )}
                                  </button>
                                ))
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
