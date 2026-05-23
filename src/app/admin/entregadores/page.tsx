"use client"

import { useCallback, useEffect, useState } from "react"
import { Bike, Plus, Pencil, Trash2, Check, X, AlertCircle, Loader2, Phone } from "lucide-react"
import { useStaff } from "@/lib/staff-store"

interface Driver {
  id: string
  name: string
  phone: string
  active: boolean
}

function maskPhone(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
}

const inputCls =
  "w-full rounded-xl px-3 py-2.5 text-sm outline-none ring-1 transition focus:ring-orange-500/50"
const inputStyle = {
  background: "rgba(0,0,0,0.25)",
  border: "none",
  color: "white",
  "--tw-ring-color": "rgba(255,255,255,0.12)",
} as React.CSSProperties

export default function EntregadoresPage() {
  const { token } = useStaff()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: "", phone: "" })

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
    const r = await fetch("/api/backend/drivers", { headers: { Authorization: `Bearer ${token}` } })
    const json = await r.json()
    setDrivers(json.data ?? [])
    setLoading(false)
  }, [token])

  useEffect(() => {
    load() // eslint-disable-line react-hooks/set-state-in-effect
  }, [load])

  function startCreate() {
    setEditingId(null)
    setForm({ name: "", phone: "" })
    setShowForm(true)
  }

  function startEdit(d: Driver) {
    setEditingId(d.id)
    setForm({ name: d.name, phone: maskPhone(d.phone) })
    setShowForm(true)
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setForm({ name: "", phone: "" })
  }

  async function handleSave() {
    const phone = form.phone.replace(/\D/g, "")
    if (!form.name.trim()) return notify("Nome é obrigatório.", true)
    if (phone.length < 10) return notify("Telefone inválido.", true)
    setSaving(true)
    try {
      const url = editingId ? `/api/backend/drivers/${editingId}` : "/api/backend/drivers"
      const r = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: form.name.trim(), phone }),
      })
      const json = await r.json()
      if (!r.ok) throw new Error(json.error?.message ?? "Erro ao salvar")
      notify(editingId ? "Entregador atualizado!" : "Entregador cadastrado!")
      cancelForm()
      load()
    } catch (e) {
      notify(e instanceof Error ? e.message : "Erro", true)
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(driver: Driver) {
    try {
      const r = await fetch(`/api/backend/drivers/${driver.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ active: !driver.active }),
      })
      if (!r.ok) throw new Error("Erro ao alterar status")
      load()
    } catch (e) {
      notify(e instanceof Error ? e.message : "Erro", true)
    }
  }

  async function handleDelete(driver: Driver) {
    if (!confirm(`Excluir entregador "${driver.name}"?`)) return
    setDeleting(driver.id)
    try {
      const r = await fetch(`/api/backend/drivers/${driver.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!r.ok) throw new Error("Erro ao excluir")
      notify("Entregador excluído!")
      load()
    } catch (e) {
      notify(e instanceof Error ? e.message : "Erro ao excluir", true)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.3em] text-orange-400 uppercase">
            Logística
          </p>
          <h1
            className="leading-none text-white"
            style={{ fontFamily: "var(--font-bebas)", fontSize: "2.5rem", letterSpacing: "0.05em" }}
          >
            Entregadores
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
            <Plus className="h-4 w-4" /> Novo entregador
          </button>
        )}
      </div>

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

      {showForm && (
        <div
          className="mb-5 rounded-2xl p-5"
          style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <p className="mb-4 text-sm font-semibold text-white">
            {editingId ? "Editar entregador" : "Novo entregador"}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-white/40">Nome completo</label>
              <input
                className={inputCls}
                style={inputStyle}
                placeholder="Ex: Carlos Silva"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/40">WhatsApp</label>
              <input
                className={inputCls}
                style={inputStyle}
                placeholder="(37) 99999-9999"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: maskPhone(e.target.value) }))}
              />
            </div>
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

      {loading ? (
        <div className="flex items-center gap-2 py-12 text-white/30">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
        </div>
      ) : drivers.length === 0 ? (
        <div
          className="flex flex-col items-center gap-3 rounded-2xl py-16 text-center"
          style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <Bike className="h-8 w-8 text-white/15" />
          <p className="text-sm text-white/30">Nenhum entregador cadastrado</p>
        </div>
      ) : (
        <div className="space-y-2">
          {drivers.map((driver) => (
            <div
              key={driver.id}
              className="flex items-center gap-4 rounded-2xl p-4"
              style={{
                background: "rgba(0,0,0,0.25)",
                border: `1px solid ${driver.active ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)"}`,
                opacity: driver.active ? 1 : 0.55,
              }}
            >
              <div
                className="flex h-10 w-10 flex-none items-center justify-center rounded-xl"
                style={{
                  background: driver.active ? "rgba(249,115,22,0.12)" : "rgba(255,255,255,0.05)",
                }}
              >
                <Bike
                  className={`h-5 w-5 ${driver.active ? "text-orange-400" : "text-white/25"}`}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{driver.name}</p>
                <div className="mt-0.5 flex items-center gap-1 text-xs text-white/40">
                  <Phone className="h-3 w-3" />
                  {maskPhone(driver.phone)}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleToggle(driver)}
                  title={driver.active ? "Desativar" : "Ativar"}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/5 hover:text-white"
                >
                  {driver.active ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => startEdit(driver)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/5 hover:text-white"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(driver)}
                  disabled={deleting === driver.id}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                >
                  {deleting === driver.id ? (
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
