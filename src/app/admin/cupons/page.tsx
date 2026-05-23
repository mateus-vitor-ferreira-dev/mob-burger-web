"use client"

import { useCallback, useEffect, useState } from "react"
import {
  Ticket,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  AlertCircle,
  Loader2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react"
import { useStaff } from "@/lib/staff-store"

type CouponType = "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_DELIVERY"

interface Coupon {
  id: string
  code: string
  type: CouponType
  value: number
  minOrderValue: number
  maxUsesTotal: number | null
  maxUsesPerDay: number | null
  maxUsesPerUser: number | null
  active: boolean
  startsAt: string | null
  expiresAt: string | null
  usageCount: number
}

interface CouponForm {
  code: string
  type: CouponType
  value: string
  minOrderValue: string
  maxUsesTotal: string
  maxUsesPerDay: string
  maxUsesPerUser: string
  active: boolean
  startsAt: string
  expiresAt: string
}

const EMPTY_FORM: CouponForm = {
  code: "",
  type: "PERCENTAGE",
  value: "",
  minOrderValue: "",
  maxUsesTotal: "",
  maxUsesPerDay: "",
  maxUsesPerUser: "",
  active: true,
  startsAt: "",
  expiresAt: "",
}

const TYPE_LABEL: Record<CouponType, string> = {
  PERCENTAGE: "% Percentual",
  FIXED_AMOUNT: "R$ Valor fixo",
  FREE_DELIVERY: "Frete grátis",
}

const TYPE_COLOR: Record<CouponType, string> = {
  PERCENTAGE: "#f97316",
  FIXED_AMOUNT: "#60a5fa",
  FREE_DELIVERY: "#4ade80",
}

function fmtDiscount(coupon: Coupon) {
  if (coupon.type === "PERCENTAGE") return `${coupon.value}% de desconto`
  if (coupon.type === "FIXED_AMOUNT")
    return `R$ ${coupon.value.toFixed(2).replace(".", ",")} de desconto`
  return "Frete grátis"
}

const inputCls =
  "w-full rounded-xl px-3 py-2.5 text-sm outline-none ring-1 transition focus:ring-orange-500/50"
const inputStyle = {
  background: "rgba(0,0,0,0.25)",
  border: "none",
  color: "white",
  "--tw-ring-color": "rgba(255,255,255,0.12)",
} as React.CSSProperties

export default function CuponsPage() {
  const { token } = useStaff()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CouponForm>(EMPTY_FORM)

  function notify(msg: string, isError = false) {
    if (isError) {
      setError(msg)
      setTimeout(() => setError(""), 4000)
    } else {
      setSuccess(msg)
      setTimeout(() => setSuccess(""), 3000)
    }
  }

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    const r = await fetch("/api/backend/coupons", { headers: { Authorization: `Bearer ${token}` } })
    const json = await r.json()
    setCoupons(json.data ?? [])
    setLoading(false)
  }, [token])

  useEffect(() => {
    load() // eslint-disable-line react-hooks/set-state-in-effect
  }, [load])

  function startCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  function startEdit(c: Coupon) {
    setEditingId(c.id)
    setForm({
      code: c.code,
      type: c.type,
      value: c.type === "FREE_DELIVERY" ? "" : String(c.value),
      minOrderValue: c.minOrderValue > 0 ? String(c.minOrderValue) : "",
      maxUsesTotal: c.maxUsesTotal !== null ? String(c.maxUsesTotal) : "",
      maxUsesPerDay: c.maxUsesPerDay !== null ? String(c.maxUsesPerDay) : "",
      maxUsesPerUser: c.maxUsesPerUser !== null ? String(c.maxUsesPerUser) : "",
      active: c.active,
      startsAt: c.startsAt ? c.startsAt.slice(0, 10) : "",
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
    })
    setShowForm(true)
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  function setField<K extends keyof CouponForm>(key: K, val: CouponForm[K]) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  async function handleSave() {
    if (!form.code.trim()) return notify("Código é obrigatório.", true)
    if (
      form.type !== "FREE_DELIVERY" &&
      (!form.value || isNaN(Number(form.value)) || Number(form.value) <= 0)
    )
      return notify("Valor do desconto inválido.", true)
    if (form.type === "PERCENTAGE" && Number(form.value) > 100)
      return notify("Percentual não pode ser maior que 100.", true)

    setSaving(true)
    try {
      const body = {
        code: form.code,
        type: form.type,
        value: form.type === "FREE_DELIVERY" ? 0 : Number(form.value),
        minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : 0,
        maxUsesTotal: form.maxUsesTotal ? Number(form.maxUsesTotal) : null,
        maxUsesPerDay: form.maxUsesPerDay ? Number(form.maxUsesPerDay) : null,
        maxUsesPerUser: form.maxUsesPerUser ? Number(form.maxUsesPerUser) : null,
        active: form.active,
        startsAt: form.startsAt || null,
        expiresAt: form.expiresAt || null,
      }
      const url = editingId ? `/api/backend/coupons/${editingId}` : "/api/backend/coupons"
      const r = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const json = await r.json()
      if (!r.ok) throw new Error(json.error?.message ?? "Erro ao salvar")
      notify(editingId ? "Cupom atualizado!" : "Cupom criado!")
      cancelForm()
      load()
    } catch (e) {
      notify(e instanceof Error ? e.message : "Erro", true)
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(coupon: Coupon) {
    try {
      const r = await fetch(`/api/backend/coupons/${coupon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ active: !coupon.active }),
      })
      if (!r.ok) throw new Error("Erro ao alterar status")
      load()
    } catch (e) {
      notify(e instanceof Error ? e.message : "Erro", true)
    }
  }

  async function handleDelete(coupon: Coupon) {
    if (!confirm(`Excluir cupom "${coupon.code}"?`)) return
    setDeleting(coupon.id)
    try {
      const r = await fetch(`/api/backend/coupons/${coupon.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!r.ok) throw new Error("Erro ao excluir")
      notify("Cupom excluído!")
      load()
    } catch (e) {
      notify(e instanceof Error ? e.message : "Erro ao excluir", true)
    } finally {
      setDeleting(null)
    }
  }

  const labelCls = "mb-1 block text-xs text-white/40"

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.3em] text-orange-400 uppercase">
            Marketing
          </p>
          <h1
            className="leading-none text-white"
            style={{ fontFamily: "var(--font-bebas)", fontSize: "2.5rem", letterSpacing: "0.05em" }}
          >
            Cupons de Desconto
          </h1>
        </div>
        {!showForm && (
          <button
            onClick={startCreate}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition active:scale-95"
            style={{
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              boxShadow: "0 4px 12px rgba(249,115,22,0.3)",
            }}
          >
            <Plus className="h-4 w-4" /> Novo cupom
          </button>
        )}
      </div>

      {error && (
        <div
          className="mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-red-400"
          style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)" }}
        >
          <AlertCircle className="h-4 w-4 flex-none" /> {error}
        </div>
      )}
      {success && (
        <div
          className="mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-green-400"
          style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)" }}
        >
          <Check className="h-4 w-4 flex-none" /> {success}
        </div>
      )}

      {/* Formulário */}
      {showForm && (
        <div
          className="mb-5 rounded-2xl p-5"
          style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p className="mb-4 text-sm font-semibold text-white">
            {editingId ? "Editar cupom" : "Novo cupom"}
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {/* Código */}
            <div>
              <label className={labelCls}>Código</label>
              <input
                className={inputCls}
                style={inputStyle}
                placeholder="Ex: BEMVINDO10"
                value={form.code}
                onChange={(e) => setField("code", e.target.value.toUpperCase())}
              />
            </div>

            {/* Tipo */}
            <div>
              <label className={labelCls}>Tipo</label>
              <select
                className={inputCls}
                style={{ ...inputStyle, appearance: "none" }}
                value={form.type}
                onChange={(e) => setField("type", e.target.value as CouponType)}
              >
                {(Object.keys(TYPE_LABEL) as CouponType[]).map((t) => (
                  <option key={t} value={t} style={{ background: "#1a1815" }}>
                    {TYPE_LABEL[t]}
                  </option>
                ))}
              </select>
            </div>

            {/* Valor (hidden for FREE_DELIVERY) */}
            {form.type !== "FREE_DELIVERY" && (
              <div>
                <label className={labelCls}>
                  {form.type === "PERCENTAGE" ? "Desconto (%)" : "Desconto (R$)"}
                </label>
                <input
                  className={inputCls}
                  style={inputStyle}
                  type="number"
                  min="0"
                  max={form.type === "PERCENTAGE" ? "100" : undefined}
                  placeholder={form.type === "PERCENTAGE" ? "Ex: 10" : "Ex: 5.00"}
                  value={form.value}
                  onChange={(e) => setField("value", e.target.value)}
                />
              </div>
            )}

            {/* Pedido mínimo */}
            <div>
              <label className={labelCls}>Pedido mínimo (R$) — opcional</label>
              <input
                className={inputCls}
                style={inputStyle}
                type="number"
                min="0"
                placeholder="Sem mínimo"
                value={form.minOrderValue}
                onChange={(e) => setField("minOrderValue", e.target.value)}
              />
            </div>

            {/* Limite total */}
            <div>
              <label className={labelCls}>Usos totais máx. — opcional</label>
              <input
                className={inputCls}
                style={inputStyle}
                type="number"
                min="1"
                placeholder="Ilimitado"
                value={form.maxUsesTotal}
                onChange={(e) => setField("maxUsesTotal", e.target.value)}
              />
            </div>

            {/* Limite por dia */}
            <div>
              <label className={labelCls}>Usos por dia máx. — opcional</label>
              <input
                className={inputCls}
                style={inputStyle}
                type="number"
                min="1"
                placeholder="Ex: 20 (primeiras 20 do dia)"
                value={form.maxUsesPerDay}
                onChange={(e) => setField("maxUsesPerDay", e.target.value)}
              />
            </div>

            {/* Limite por usuário */}
            <div>
              <label className={labelCls}>Usos por cliente máx. — opcional</label>
              <input
                className={inputCls}
                style={inputStyle}
                type="number"
                min="1"
                placeholder="Ex: 1 (uso único)"
                value={form.maxUsesPerUser}
                onChange={(e) => setField("maxUsesPerUser", e.target.value)}
              />
            </div>

            {/* Válido de */}
            <div>
              <label className={labelCls}>Válido a partir de — opcional</label>
              <input
                className={inputCls}
                style={inputStyle}
                type="date"
                value={form.startsAt}
                onChange={(e) => setField("startsAt", e.target.value)}
              />
            </div>

            {/* Válido até */}
            <div>
              <label className={labelCls}>Válido até — opcional</label>
              <input
                className={inputCls}
                style={inputStyle}
                type="date"
                value={form.expiresAt}
                onChange={(e) => setField("expiresAt", e.target.value)}
              />
            </div>
          </div>

          {/* Ativo */}
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setField("active", !form.active)}
              className="flex items-center gap-2 text-sm transition"
              style={{ color: form.active ? "#4ade80" : "rgba(255,255,255,0.3)" }}
            >
              {form.active ? (
                <ToggleRight className="h-5 w-5" />
              ) : (
                <ToggleLeft className="h-5 w-5" />
              )}
              {form.active ? "Ativo" : "Inativo"}
            </button>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-white transition disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              Salvar
            </button>
            <button
              onClick={cancelForm}
              className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm text-white/50 transition hover:bg-white/5"
            >
              <X className="h-3.5 w-3.5" /> Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="flex items-center gap-2 py-12 text-white/30">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
        </div>
      ) : coupons.length === 0 ? (
        <div
          className="flex flex-col items-center gap-3 rounded-2xl py-16 text-center"
          style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <Ticket className="h-8 w-8 text-white/15" />
          <p className="text-sm text-white/30">Nenhum cupom cadastrado</p>
        </div>
      ) : (
        <div className="space-y-2">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="flex flex-wrap items-center gap-4 rounded-2xl p-4"
              style={{
                background: "rgba(0,0,0,0.25)",
                border: `1px solid ${coupon.active ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)"}`,
                opacity: coupon.active ? 1 : 0.55,
              }}
            >
              {/* Código + tipo */}
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 flex-none items-center justify-center rounded-xl"
                  style={{
                    background: coupon.active
                      ? `${TYPE_COLOR[coupon.type]}20`
                      : "rgba(255,255,255,0.05)",
                  }}
                >
                  <Ticket
                    className="h-4.5 w-4.5"
                    style={{
                      color: coupon.active ? TYPE_COLOR[coupon.type] : "rgba(255,255,255,0.25)",
                    }}
                  />
                </div>
                <div>
                  <p
                    className="font-bold tracking-widest text-white"
                    style={{
                      fontFamily: "var(--font-bebas)",
                      fontSize: "1.1rem",
                      letterSpacing: "0.12em",
                    }}
                  >
                    {coupon.code}
                  </p>
                  <p className="text-xs text-white/40">{fmtDiscount(coupon)}</p>
                </div>
              </div>

              {/* Limites */}
              <div className="flex flex-wrap gap-2">
                {coupon.maxUsesTotal !== null && (
                  <span
                    className="rounded-lg px-2 py-0.5 text-[10px] text-white/40"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {coupon.usageCount}/{coupon.maxUsesTotal} usos
                  </span>
                )}
                {coupon.maxUsesPerDay !== null && (
                  <span
                    className="rounded-lg px-2 py-0.5 text-[10px] text-white/40"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {coupon.maxUsesPerDay}/dia
                  </span>
                )}
                {coupon.maxUsesPerUser !== null && (
                  <span
                    className="rounded-lg px-2 py-0.5 text-[10px] text-white/40"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {coupon.maxUsesPerUser}× por cliente
                  </span>
                )}
                {coupon.minOrderValue > 0 && (
                  <span
                    className="rounded-lg px-2 py-0.5 text-[10px] text-white/40"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    mín. R$ {coupon.minOrderValue.toFixed(2).replace(".", ",")}
                  </span>
                )}
                {coupon.expiresAt && (
                  <span
                    className="rounded-lg px-2 py-0.5 text-[10px] text-white/40"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    até {new Date(coupon.expiresAt).toLocaleDateString("pt-BR")}
                  </span>
                )}
              </div>

              {/* Uso total (sem limite) */}
              {coupon.maxUsesTotal === null && (
                <span className="text-xs text-white/25">
                  {coupon.usageCount} uso{coupon.usageCount !== 1 ? "s" : ""}
                </span>
              )}

              {/* Ações */}
              <div className="ml-auto flex items-center gap-1">
                <button
                  onClick={() => handleToggle(coupon)}
                  title={coupon.active ? "Desativar" : "Ativar"}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/5 hover:text-white"
                >
                  {coupon.active ? (
                    <ToggleRight className="h-4 w-4 text-green-400" />
                  ) : (
                    <ToggleLeft className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => startEdit(coupon)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/5 hover:text-white"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(coupon)}
                  disabled={deleting === coupon.id}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                >
                  {deleting === coupon.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
