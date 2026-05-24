"use client"

import { fmtPrice } from "@/lib/utils"
import { useCallback, useEffect, useState } from "react"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { useStaff } from "@/lib/staff-store"

interface ExpenseItem {
  name: string
  price: number
}

interface Expense {
  id: string
  name: string
  type: "FIXED" | "VARIABLE"
  amount: number
  month: string
  items: ExpenseItem[] | null
  createdAt: string
}

interface ExpenseForm {
  name: string
  type: "FIXED" | "VARIABLE"
  amount: string
  items: ExpenseItem[]
}

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

function currentMonthStr() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function monthLabel(month: string) {
  const [year, m] = month.split("-")
  return `${MONTH_NAMES[parseInt(m) - 1]} ${year}`
}

function prevMonth(month: string) {
  const [y, m] = month.split("-").map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function nextMonth(month: string) {
  const [y, m] = month.split("-").map(Number)
  const d = new Date(y, m, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

function monthRange(month: string) {
  const [year, m] = month.split("-").map(Number)
  const lastDay = new Date(year, m, 0).getDate()
  return { from: `${month}-01`, to: `${month}-${String(lastDay).padStart(2, "0")}T23:59:59` }
}

const inputCls =
  "w-full rounded-xl px-3 py-2.5 text-sm outline-none ring-1 transition focus:ring-orange-500/50"
const inputStyle = {
  background: "rgba(0,0,0,0.25)",
  border: "none",
  color: "white",
  "--tw-ring-color": "rgba(255,255,255,0.12)",
} as React.CSSProperties

const EMPTY_FORM: ExpenseForm = { name: "", type: "FIXED", amount: "", items: [] }

export default function FinanceiroPage() {
  const { token } = useStaff()
  const [month, setMonth] = useState(currentMonthStr())
  const [revenue, setRevenue] = useState<number | null>(null)
  const [revenueLoading, setRevenueLoading] = useState(false)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [expLoading, setExpLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // form state
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ExpenseForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // expanded rows
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  function notify(msg: string, isError = false) {
    if (isError) {
      setError(msg)
      setTimeout(() => setError(""), 4000)
    } else {
      setSuccess(msg)
      setTimeout(() => setSuccess(""), 3000)
    }
  }

  const loadRevenue = useCallback(async () => {
    if (!token) return
    setRevenueLoading(true)
    const { from, to } = monthRange(month)
    const r = await fetch(`/api/backend/admin/stats?from=${from}&to=${to}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const json = await r.json()
    setRevenue(json.data?.revenue?.range ?? json.data?.revenue?.month ?? 0)
    setRevenueLoading(false)
  }, [token, month])

  const loadExpenses = useCallback(async () => {
    if (!token) return
    setExpLoading(true)
    const r = await fetch(`/api/backend/expenses?month=${month}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const json = await r.json()
    setExpenses(json.data ?? [])
    setExpLoading(false)
  }, [token, month])

  useEffect(() => {
    loadRevenue() // eslint-disable-line react-hooks/set-state-in-effect
  }, [loadRevenue])

  useEffect(() => {
    loadExpenses() // eslint-disable-line react-hooks/set-state-in-effect
  }, [loadExpenses])

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const totalFixed = expenses.filter((e) => e.type === "FIXED").reduce((s, e) => s + e.amount, 0)
  const totalVariable = expenses
    .filter((e) => e.type === "VARIABLE")
    .reduce((s, e) => s + e.amount, 0)
  const profit = (revenue ?? 0) - totalExpenses

  function startCreate(type: "FIXED" | "VARIABLE") {
    setEditingId(null)
    setForm({ ...EMPTY_FORM, type })
    setShowForm(true)
  }

  function startEdit(exp: Expense) {
    setEditingId(exp.id)
    setForm({
      name: exp.name,
      type: exp.type,
      amount: String(exp.amount),
      items: exp.items ?? [],
    })
    setShowForm(true)
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  function updateItem(i: number, field: keyof ExpenseItem, value: string) {
    setForm((f) => {
      const items = [...f.items]
      items[i] = { ...items[i], [field]: field === "price" ? parseFloat(value) || 0 : value }
      const amount = items.reduce((s, it) => s + it.price, 0)
      return { ...f, items, amount: amount > 0 ? String(amount.toFixed(2)) : f.amount }
    })
  }

  function addItem() {
    setForm((f) => ({ ...f, items: [...f.items, { name: "", price: 0 }] }))
  }

  function removeItem(i: number) {
    setForm((f) => {
      const items = f.items.filter((_, idx) => idx !== i)
      const amount = items.reduce((s, it) => s + it.price, 0)
      return { ...f, items, amount: items.length > 0 ? String(amount.toFixed(2)) : f.amount }
    })
  }

  async function handleSave() {
    if (!form.name.trim()) {
      notify("Nome é obrigatório.", true)
      return
    }
    if (!form.amount || isNaN(parseFloat(form.amount))) {
      notify("Valor inválido.", true)
      return
    }
    setSaving(true)
    try {
      const body = {
        name: form.name,
        type: form.type,
        amount: parseFloat(form.amount),
        month,
        items: form.items.length > 0 ? form.items : [],
      }
      const url = editingId ? `/api/backend/expenses/${editingId}` : "/api/backend/expenses"
      const r = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const json = await r.json()
      if (!r.ok) throw new Error(json.error?.message ?? "Erro ao salvar")
      notify(editingId ? "Despesa atualizada!" : "Despesa adicionada!")
      cancelForm()
      loadExpenses()
    } catch (e) {
      notify(e instanceof Error ? e.message : "Erro", true)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(exp: Expense) {
    if (!confirm(`Excluir "${exp.name}"?`)) return
    setDeleting(exp.id)
    try {
      await fetch(`/api/backend/expenses/${exp.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      notify("Despesa excluída!")
      loadExpenses()
    } catch {
      notify("Erro ao excluir", true)
    } finally {
      setDeleting(null)
    }
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const fixedExpenses = expenses.filter((e) => e.type === "FIXED")
  const variableExpenses = expenses.filter((e) => e.type === "VARIABLE")

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.3em] text-orange-400 uppercase">Gestão</p>
          <h1
            className="leading-none text-white"
            style={{ fontFamily: "var(--font-bebas)", fontSize: "2.5rem", letterSpacing: "0.05em" }}
          >
            Financeiro
          </h1>
        </div>
        {/* Month nav */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonth(prevMonth(month))}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/40 transition hover:bg-white/5 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span
            className="min-w-36 text-center text-sm font-bold text-white"
            style={{ fontFamily: "var(--font-bebas)", fontSize: "1.1rem", letterSpacing: "0.08em" }}
          >
            {monthLabel(month)}
          </span>
          <button
            onClick={() => setMonth(nextMonth(month))}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white/40 transition hover:bg-white/5 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Feedback */}
      {error && (
        <div
          className="mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-red-400"
          style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)" }}
        >
          <AlertCircle className="h-4 w-4 flex-none" />
          {error}
        </div>
      )}
      {success && (
        <div
          className="mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-green-400"
          style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)" }}
        >
          <Check className="h-4 w-4 flex-none" />
          {success}
        </div>
      )}

      {/* KPI Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div
          className="rounded-2xl p-5"
          style={{ background: "var(--mob-s3)", border: "1px solid var(--mob-s4)" }}
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold tracking-widest text-white/30 uppercase">
              Faturamento
            </p>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{ background: "rgba(249,115,22,0.15)" }}
            >
              <TrendingUp className="h-4 w-4 text-orange-400" />
            </div>
          </div>
          <p
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "var(--font-bebas)", fontSize: "1.8rem", letterSpacing: "0.04em" }}
          >
            {revenueLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-white/30" />
            ) : (
              fmtPrice(revenue ?? 0)
            )}
          </p>
          <p className="mt-0.5 text-xs text-white/30">pedidos entregues / retirados</p>
        </div>

        <div
          className="rounded-2xl p-5"
          style={{ background: "var(--mob-s3)", border: "1px solid var(--mob-s4)" }}
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold tracking-widest text-white/30 uppercase">
              Despesas
            </p>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{ background: "rgba(239,68,68,0.15)" }}
            >
              <TrendingDown className="h-4 w-4 text-red-400" />
            </div>
          </div>
          <p
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "var(--font-bebas)", fontSize: "1.8rem", letterSpacing: "0.04em" }}
          >
            {expLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-white/30" />
            ) : (
              fmtPrice(totalExpenses)
            )}
          </p>
          <p className="mt-0.5 text-xs text-white/30">
            fixas {fmtPrice(totalFixed)} · variáveis {fmtPrice(totalVariable)}
          </p>
        </div>

        <div
          className="rounded-2xl p-5"
          style={{ background: "var(--mob-s3)", border: "1px solid var(--mob-s4)" }}
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold tracking-widest text-white/30 uppercase">Lucro</p>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{ background: profit >= 0 ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)" }}
            >
              <DollarSign
                className="h-4 w-4"
                style={{ color: profit >= 0 ? "#4ade80" : "#f87171" }}
              />
            </div>
          </div>
          <p
            className="text-2xl font-bold"
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "1.8rem",
              letterSpacing: "0.04em",
              color: profit >= 0 ? "#4ade80" : "#f87171",
            }}
          >
            {revenueLoading || expLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-white/30" />
            ) : (
              fmtPrice(profit)
            )}
          </p>
          <p className="mt-0.5 text-xs text-white/30">faturamento − despesas</p>
        </div>
      </div>

      {/* Form inline */}
      {showForm && (
        <div
          className="mb-6 rounded-2xl p-5"
          style={{
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <p
            className="mb-4 font-semibold text-orange-400"
            style={{ fontFamily: "var(--font-bebas)", fontSize: "1.1rem", letterSpacing: "0.06em" }}
          >
            {editingId ? "Editar despesa" : "Nova despesa"}
          </p>

          <div className="mb-4 grid gap-4 sm:grid-cols-3">
            {/* Nome */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-white/50">Nome *</label>
              <input
                className={inputCls}
                style={inputStyle}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Ex: Supermercado, Luz, Gás..."
              />
            </div>
            {/* Tipo */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/50">Tipo</label>
              <div className="flex gap-2">
                {(["FIXED", "VARIABLE"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: t }))}
                    className="flex-1 rounded-xl py-2.5 text-xs font-semibold transition"
                    style={
                      form.type === t
                        ? {
                            background:
                              t === "FIXED" ? "rgba(59,130,246,0.2)" : "rgba(245,158,11,0.2)",
                            color: t === "FIXED" ? "#60a5fa" : "#fbbf24",
                          }
                        : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }
                    }
                  >
                    {t === "FIXED" ? "Fixa" : "Variável"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Itens detalhados */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-white/50">
                Itens detalhados (opcional)
              </label>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs text-orange-400 transition hover:bg-orange-500/10"
              >
                <Plus className="h-3 w-3" /> Adicionar item
              </button>
            </div>
            {form.items.length > 0 && (
              <div className="space-y-2">
                {form.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      className={`${inputCls} flex-1`}
                      style={inputStyle}
                      value={item.name}
                      onChange={(e) => updateItem(i, "name", e.target.value)}
                      placeholder="Nome do item"
                    />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className={`${inputCls} w-32`}
                      style={inputStyle}
                      value={item.price || ""}
                      onChange={(e) => updateItem(i, "price", e.target.value)}
                      placeholder="R$ 0,00"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="flex h-9 w-9 flex-none items-center justify-center rounded-xl text-white/30 transition hover:bg-red-500/10 hover:text-red-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <p className="text-right text-xs text-white/30">
                  Total dos itens: {fmtPrice(form.items.reduce((s, it) => s + it.price, 0))}
                </p>
              </div>
            )}
          </div>

          {/* Valor total */}
          <div className="mb-4 w-48">
            <label className="mb-1.5 block text-xs font-medium text-white/50">
              {form.items.length > 0 ? "Valor total (calculado)" : "Valor (R$) *"}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              className={inputCls}
              style={inputStyle}
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              placeholder="0,00"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition active:scale-95 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {saving ? "Salvando..." : "Salvar"}
            </button>
            <button
              onClick={cancelForm}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-white/50 transition hover:bg-white/5 hover:text-white"
            >
              <X className="h-4 w-4" /> Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Tabelas de despesas */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Despesas Fixas */}
        <ExpenseTable
          title="Despesas Fixas"
          type="FIXED"
          color="#60a5fa"
          bgColor="rgba(59,130,246,0.1)"
          expenses={fixedExpenses}
          total={totalFixed}
          loading={expLoading}
          deleting={deleting}
          expanded={expanded}
          onAdd={() => startCreate("FIXED")}
          onEdit={startEdit}
          onDelete={handleDelete}
          onToggleExpand={toggleExpand}
        />

        {/* Despesas Variáveis */}
        <ExpenseTable
          title="Despesas Variáveis"
          type="VARIABLE"
          color="#fbbf24"
          bgColor="rgba(245,158,11,0.1)"
          expenses={variableExpenses}
          total={totalVariable}
          loading={expLoading}
          deleting={deleting}
          expanded={expanded}
          onAdd={() => startCreate("VARIABLE")}
          onEdit={startEdit}
          onDelete={handleDelete}
          onToggleExpand={toggleExpand}
        />
      </div>
    </div>
  )
}

function ExpenseTable({
  title,
  type,
  color,
  bgColor,
  expenses,
  total,
  loading,
  deleting,
  expanded,
  onAdd,
  onEdit,
  onDelete,
  onToggleExpand,
}: {
  title: string
  type: "FIXED" | "VARIABLE"
  color: string
  bgColor: string
  expenses: Expense[]
  total: number
  loading: boolean
  deleting: string | null
  expanded: Set<string>
  onAdd: () => void
  onEdit: (e: Expense) => void
  onDelete: (e: Expense) => void
  onToggleExpand: (id: string) => void
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{ background: "var(--mob-s3)", border: "1px solid var(--mob-s4)" }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid var(--mob-s4)" }}
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ background: color }} />
          <p className="text-sm font-semibold text-white">{title}</p>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition"
          style={{ background: bgColor, color }}
        >
          <Plus className="h-3.5 w-3.5" /> Adicionar
        </button>
      </div>

      {loading ? (
        <div className="flex h-24 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-white/30" />
        </div>
      ) : expenses.length === 0 ? (
        <div className="py-10 text-center text-xs text-white/25">
          Nenhuma despesa {type === "FIXED" ? "fixa" : "variável"} em {"{"}mês{"}"}.
        </div>
      ) : (
        <div>
          {expenses.map((exp) => {
            const hasItems = (exp.items?.length ?? 0) > 0
            const isExpanded = expanded.has(exp.id)
            return (
              <div key={exp.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white">{exp.name}</p>
                    {hasItems && <p className="text-xs text-white/30">{exp.items!.length} itens</p>}
                  </div>
                  <span className="text-sm font-bold text-white">{fmtPrice(exp.amount)}</span>
                  {hasItems && (
                    <button
                      onClick={() => onToggleExpand(exp.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/5 hover:text-white"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => onEdit(exp)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/5 hover:text-white"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(exp)}
                    disabled={deleting === exp.id}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-white/30 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-30"
                  >
                    {deleting === exp.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                {/* Items expandidos */}
                {hasItems && isExpanded && (
                  <div className="px-5 pb-3">
                    <div
                      className="overflow-hidden rounded-xl"
                      style={{ background: "rgba(0,0,0,0.2)" }}
                    >
                      {exp.items!.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between px-3 py-2 text-xs"
                          style={{
                            borderBottom:
                              i < exp.items!.length - 1
                                ? "1px solid rgba(255,255,255,0.06)"
                                : "none",
                          }}
                        >
                          <span className="text-white/60">{item.name || "—"}</span>
                          <span className="font-medium text-white/80">{fmtPrice(item.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Total */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderTop: "1px solid var(--mob-s4)" }}
      >
        <p className="text-xs font-semibold text-white/30 uppercase">Total</p>
        <p className="text-sm font-bold" style={{ color }}>
          {fmtPrice(total)}
        </p>
      </div>
    </div>
  )
}
