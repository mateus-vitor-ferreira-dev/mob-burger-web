"use client"

import { fmtPrice } from "@/lib/utils"
import { useCallback, useEffect, useState } from "react"
import {
  Plus,
  Trash2,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Pencil,
  Check,
  X,
  Download,
} from "lucide-react"
import { useStaff } from "@/lib/staff-store"

interface Zone {
  id: string
  name: string
  fee: number
  active: boolean
}

function ZoneRow({
  zone,
  token,
  onUpdated,
  onDelete,
}: {
  zone: Zone
  token: string
  onUpdated: () => void
  onDelete: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(zone.name)
  const [fee, setFee] = useState(zone.fee.toFixed(2))
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    const newName = name.trim()
    if (newName !== zone.name) {
      // Nome mudou: deleta a antiga e cria a nova para evitar zona duplicada
      await fetch(`/api/backend/admin/delivery-zones/${zone.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      await fetch("/api/backend/admin/delivery-zones", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newName, fee: parseFloat(fee), active: zone.active }),
      })
    } else {
      await fetch("/api/backend/admin/delivery-zones", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newName, fee: parseFloat(fee), active: zone.active }),
      })
    }
    setSaving(false)
    setEditing(false)
    onUpdated()
  }

  async function toggle() {
    await fetch("/api/backend/admin/delivery-zones", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: zone.name, fee: zone.fee, active: !zone.active }),
    })
    onUpdated()
  }

  const inputCls =
    "rounded-lg bg-white/5 px-2 py-1 text-sm text-white ring-1 ring-white/10 outline-none focus:ring-orange-500/50"

  if (editing) {
    return (
      <div
        className="flex items-center gap-3 rounded-2xl p-3"
        style={{ background: "var(--mob-s3)", border: "1px solid rgba(249,115,22,0.3)" }}
      >
        <input
          className={`${inputCls} flex-1`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do bairro"
        />
        <div className="flex items-center gap-1">
          <span className="text-xs text-white/40">R$</span>
          <input
            className={`${inputCls} w-20`}
            type="number"
            min="0"
            step="0.50"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
          />
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-green-400 transition hover:bg-green-500/10 disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        </button>
        <button
          onClick={() => {
            setEditing(false)
            setName(zone.name)
            setFee(zone.fee.toFixed(2))
          }}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-white/40 transition hover:bg-white/5"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div
      className="flex items-center gap-3 rounded-2xl p-3 transition"
      style={{
        background: "var(--mob-s3)",
        border: "1px solid var(--mob-s4)",
        opacity: zone.active ? 1 : 0.5,
      }}
    >
      <div className="flex-1">
        <p className="text-sm font-semibold text-white">{zone.name}</p>
      </div>
      <span className="text-sm font-bold text-orange-400">{fmtPrice(zone.fee)}</span>
      <div className="flex items-center gap-1">
        <button
          onClick={toggle}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-white/40 transition hover:bg-white/5"
          title={zone.active ? "Desativar" : "Ativar"}
        >
          {zone.active ? (
            <ToggleRight className="h-4 w-4 text-green-400" />
          ) : (
            <ToggleLeft className="h-4 w-4" />
          )}
        </button>
        <button
          onClick={() => setEditing(true)}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-white/40 transition hover:bg-white/5 hover:text-white"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(zone.id)}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-white/40 transition hover:bg-red-500/10 hover:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

export default function ZonasPage() {
  const { token } = useStaff()
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState("")
  const [newFee, setNewFee] = useState("")
  const [adding, setAdding] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importMsg, setImportMsg] = useState("")

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    const res = await fetch("/api/backend/admin/delivery-zones", {
      headers: { Authorization: `Bearer ${token}` },
    })
    const json = await res.json()
    setZones(json.data ?? [])
    setLoading(false)
  }, [token])

  useEffect(() => {
    load() // eslint-disable-line react-hooks/set-state-in-effect
  }, [load])

  async function importLavrasBairros() {
    setImporting(true)
    setImportMsg("")
    try {
      // Busca em paralelo para todos os prefixos — mais rápido que sequencial
      const prefixes = ["rua", "avenida", "travessa", "alameda", "praca", "via", "rod"]
      const results = await Promise.allSettled(
        prefixes.map((prefix) =>
          fetch(`https://viacep.com.br/ws/MG/Lavras/${prefix}/json/`)
            .then((r) => (r.ok ? r.json() : []))
            .catch(() => []),
        ),
      )

      const all: string[] = []
      for (const result of results) {
        if (result.status === "fulfilled" && Array.isArray(result.value)) {
          all.push(
            ...result.value.map((d: { bairro?: string }) => d.bairro?.trim() ?? "").filter(Boolean),
          )
        }
      }

      const bairros = [...new Set(all.sort())]
      if (bairros.length === 0) {
        setImportMsg("Nenhum bairro encontrado. Verifique sua conexão.")
        return
      }

      const existing = new Set(zones.map((z) => z.name.toLowerCase()))
      const novos = bairros.filter((b) => !existing.has(b.toLowerCase()))

      // Importa em paralelo — muito mais rápido que one-by-one
      await Promise.allSettled(
        novos.map((bairro) =>
          fetch("/api/backend/admin/delivery-zones", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ name: bairro, fee: 7, active: true }),
          }),
        ),
      )

      setImportMsg(
        novos.length > 0
          ? `${novos.length} bairros importados de ${bairros.length} encontrados. Ajuste as taxas.`
          : "Todos os bairros já estão cadastrados.",
      )
      await load()
    } catch {
      setImportMsg("Erro ao importar bairros. Verifique sua conexão.")
    } finally {
      setImporting(false)
    }
  }

  async function handleAdd() {
    if (!newName.trim() || !newFee) return
    setAdding(true)
    await fetch("/api/backend/admin/delivery-zones", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: newName.trim(), fee: parseFloat(newFee), active: true }),
    })
    setNewName("")
    setNewFee("")
    setShowForm(false)
    setAdding(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover esta zona de entrega?")) return
    await fetch(`/api/backend/admin/delivery-zones/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    load()
  }

  const inputCls =
    "rounded-xl bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 ring-1 ring-white/10 outline-none transition focus:ring-orange-500/50"

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.3em] text-orange-400 uppercase">Gestão</p>
          <h1
            className="leading-none text-white"
            style={{ fontFamily: "var(--font-bebas)", fontSize: "2.5rem", letterSpacing: "0.05em" }}
          >
            Zonas de Entrega
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={importLavrasBairros}
            disabled={importing}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white/60 transition hover:bg-white/10 disabled:opacity-50"
            style={{ border: "1px solid rgba(255,255,255,0.15)" }}
            title="Importa todos os bairros de Lavras-MG via ViaCEP com taxa padrão de R$7,00"
          >
            {importing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Importar Lavras
          </button>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition active:scale-95"
            style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
          >
            <Plus className="h-4 w-4" /> Nova zona
          </button>
        </div>
      </div>

      {importMsg && (
        <p
          className={`mb-3 text-xs ${importMsg.includes("Erro") ? "text-red-400" : "text-green-400"}`}
        >
          {importMsg}
        </p>
      )}

      {/* Formulário nova zona */}
      {showForm && (
        <div
          className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl p-4"
          style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.2)" }}
        >
          <div className="min-w-40 flex-1">
            <label className="mb-1 block text-xs text-white/50">Bairro / Região</label>
            <input
              className={inputCls}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex: Centro"
            />
          </div>
          <div className="w-32">
            <label className="mb-1 block text-xs text-white/50">Taxa (R$)</label>
            <input
              className={inputCls}
              type="number"
              min="0"
              step="0.50"
              value={newFee}
              onChange={(e) => setNewFee(e.target.value)}
              placeholder="5,00"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={adding || !newName.trim() || !newFee}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
          >
            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Adicionar
          </button>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-2xl"
              style={{ background: "var(--mob-s1)" }}
            />
          ))}
        </div>
      ) : zones.length === 0 ? (
        <div className="py-16 text-center text-sm text-white/25">Nenhuma zona cadastrada.</div>
      ) : (
        <div className="space-y-2">
          {zones.map((z) => (
            <ZoneRow key={z.id} zone={z} token={token!} onUpdated={load} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <p className="mt-4 text-xs text-white/20">
        Zonas inativas não aparecem como opção de entrega para o cliente.
      </p>
    </div>
  )
}
