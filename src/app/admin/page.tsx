"use client"

import { useEffect, useState } from "react"
import {
  TrendingUp,
  ShoppingBag,
  CreditCard,
  Smartphone,
  CheckCircle,
  Calendar,
} from "lucide-react"
import { useStaff } from "@/lib/staff-store"

function fmtPrice(n: number) {
  return `R$ ${n.toFixed(2).replace(".", ",")}`
}

const STATUS_LABEL: Record<string, string> = {
  AWAITING_PAYMENT: "Aguardando pagamento",
  CONFIRMED: "Confirmado",
  PREPARING: "Em preparo",
  READY: "Pronto",
  OUT_FOR_DELIVERY: "Saiu para entrega",
  DELIVERED: "Entregue",
  PICKED_UP: "Retirado",
  CANCELLED: "Cancelado",
}

const STATUS_COLOR: Record<string, string> = {
  AWAITING_PAYMENT: "#f59e0b",
  CONFIRMED: "#3b82f6",
  PREPARING: "#f97316",
  READY: "#8b5cf6",
  OUT_FOR_DELIVERY: "#06b6d4",
  DELIVERED: "#22c55e",
  PICKED_UP: "#22c55e",
  CANCELLED: "#ef4444",
}

interface Stats {
  revenue: { today: number; week: number; month: number; allTime: number; range: number | null }
  byPaymentMethod: { method: string; revenue: number; count: number }[]
  byStatus: { status: string; count: number }[]
  todayOrders: number
  rangeOrders: number | null
}

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string
  value: string
  sub?: string
  icon: React.ElementType
  color: string
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "var(--mob-s3)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid var(--mob-s4)",
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold tracking-widest text-white/30 uppercase">{label}</p>
        <div
          className="flex h-8 w-8 items-center justify-center rounded-xl"
          style={{ background: `${color}20` }}
        >
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
      </div>
      <p
        className="text-2xl font-bold text-white"
        style={{ fontFamily: "var(--font-bebas)", fontSize: "1.8rem", letterSpacing: "0.04em" }}
      >
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-white/30">{sub}</p>}
    </div>
  )
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function AdminDashboard() {
  const { token } = useStaff()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [rangeActive, setRangeActive] = useState(false)

  useEffect(() => {
    if (!token) return
    setLoading(true) // eslint-disable-line react-hooks/set-state-in-effect
    const qs = rangeActive && from && to ? `?from=${from}&to=${to}T23:59:59` : ""
    fetch(`/api/backend/admin/stats${qs}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((json) => {
        if (json.data) setStats(json.data)
      })
      .finally(() => setLoading(false))
  }, [token, rangeActive, from, to])

  const card = stats?.byPaymentMethod.find((m) => m.method === "CARD")
  const pix = stats?.byPaymentMethod.find((m) => m.method === "PIX")

  const inputCls =
    "rounded-xl px-3 py-1.5 text-xs text-white ring-1 ring-white/10 outline-none transition focus:ring-orange-500/50"

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.3em] text-orange-400 uppercase">
            Mob Burger
          </p>
          <h1
            className="leading-none text-white"
            style={{ fontFamily: "var(--font-bebas)", fontSize: "2.5rem", letterSpacing: "0.05em" }}
          >
            Dashboard
          </h1>
        </div>
        {/* Filtro de período */}
        <div className="flex flex-wrap items-center gap-2">
          <Calendar className="h-4 w-4 text-white/30" />
          <input
            type="date"
            className={inputCls}
            style={{ background: "rgba(0,0,0,0.35)" }}
            value={from}
            max={todayStr()}
            onChange={(e) => setFrom(e.target.value)}
          />
          <span className="text-xs text-white/30">até</span>
          <input
            type="date"
            className={inputCls}
            style={{ background: "rgba(0,0,0,0.35)" }}
            value={to}
            max={todayStr()}
            onChange={(e) => setTo(e.target.value)}
          />
          {from && to ? (
            <button
              onClick={() => setRangeActive((v) => !v)}
              className="rounded-xl px-3 py-1.5 text-xs font-semibold transition"
              style={
                rangeActive
                  ? { background: "rgba(249,115,22,0.2)", color: "#f97316" }
                  : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }
              }
            >
              {rangeActive ? "Período ativo" : "Aplicar período"}
            </button>
          ) : null}
          {rangeActive && (
            <button
              onClick={() => {
                setRangeActive(false)
                setFrom("")
                setTo("")
              }}
              className="text-xs text-white/30 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl"
              style={{ background: "var(--mob-s1)" }}
            />
          ))}
        </div>
      ) : (
        <>
          {/* KPIs de receita */}
          <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {rangeActive && stats?.revenue.range !== null ? (
              <>
                <KpiCard
                  label="Período"
                  value={fmtPrice(stats?.revenue.range ?? 0)}
                  sub={`${stats?.rangeOrders ?? 0} pedidos`}
                  icon={Calendar}
                  color="#f97316"
                />
                <KpiCard
                  label="Hoje"
                  value={fmtPrice(stats?.revenue.today ?? 0)}
                  sub={`${stats?.todayOrders ?? 0} pedidos`}
                  icon={ShoppingBag}
                  color="#f59e0b"
                />
                <KpiCard
                  label="Este mês"
                  value={fmtPrice(stats?.revenue.month ?? 0)}
                  icon={TrendingUp}
                  color="#8b5cf6"
                />
                <KpiCard
                  label="Total geral"
                  value={fmtPrice(stats?.revenue.allTime ?? 0)}
                  icon={CheckCircle}
                  color="#22c55e"
                />
              </>
            ) : (
              <>
                <KpiCard
                  label="Hoje"
                  value={fmtPrice(stats?.revenue.today ?? 0)}
                  sub={`${stats?.todayOrders ?? 0} pedidos`}
                  icon={ShoppingBag}
                  color="#f97316"
                />
                <KpiCard
                  label="Esta semana"
                  value={fmtPrice(stats?.revenue.week ?? 0)}
                  icon={TrendingUp}
                  color="#3b82f6"
                />
                <KpiCard
                  label="Este mês"
                  value={fmtPrice(stats?.revenue.month ?? 0)}
                  icon={TrendingUp}
                  color="#8b5cf6"
                />
                <KpiCard
                  label="Total geral"
                  value={fmtPrice(stats?.revenue.allTime ?? 0)}
                  icon={CheckCircle}
                  color="#22c55e"
                />
              </>
            )}
          </div>

          {/* Pagamentos por método */}
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div
              className="rounded-2xl p-5"
              style={{
                background: "var(--mob-s3)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid var(--mob-s4)",
              }}
            >
              <p className="mb-4 text-xs font-semibold tracking-widest text-white/30 uppercase">
                Receita por método
              </p>
              <div className="space-y-3">
                {[
                  { label: "Cartão", icon: CreditCard, data: card, color: "#3b82f6" },
                  { label: "PIX", icon: Smartphone, data: pix, color: "#22c55e" },
                ].map(({ label, icon: Icon, data, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 flex-none items-center justify-center rounded-xl"
                      style={{ background: `${color}18` }}
                    >
                      <Icon className="h-4 w-4" style={{ color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-white">{label}</p>
                        <p className="text-sm font-bold text-white">
                          {fmtPrice(data?.revenue ?? 0)}
                        </p>
                      </div>
                      <p className="text-xs text-white/30">{data?.count ?? 0} transações</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pedidos por status */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: "var(--mob-s3)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid var(--mob-s4)",
              }}
            >
              <p className="mb-4 text-xs font-semibold tracking-widest text-white/30 uppercase">
                Pedidos por status
              </p>
              <div className="space-y-2">
                {(stats?.byStatus ?? [])
                  .filter((s) => s.count > 0)
                  .sort((a, b) => b.count - a.count)
                  .map((s) => (
                    <div key={s.status} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 flex-none rounded-full"
                          style={{ background: STATUS_COLOR[s.status] ?? "#888" }}
                        />
                        <p className="text-xs text-white/60">
                          {STATUS_LABEL[s.status] ?? s.status}
                        </p>
                      </div>
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-bold"
                        style={{
                          background: `${STATUS_COLOR[s.status] ?? "#888"}20`,
                          color: STATUS_COLOR[s.status] ?? "#888",
                        }}
                      >
                        {s.count}
                      </span>
                    </div>
                  ))}
                {(stats?.byStatus ?? []).every((s) => s.count === 0) && (
                  <p className="text-xs text-white/25">Nenhum pedido ainda.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
