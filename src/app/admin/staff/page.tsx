"use client"

import { useCallback, useEffect, useState } from "react"
import { Plus, Trash2, Loader2, Shield, User } from "lucide-react"
import { useStaff } from "@/lib/staff-store"

interface StaffUser {
  id: string
  email: string
  role: "ADMIN" | "ATTENDANT"
  createdAt: string
}

export default function StaffPage() {
  const { token, staff: me } = useStaff()
  const [users, setUsers] = useState<StaffUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"ADMIN" | "ATTENDANT">("ATTENDANT")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    const res = await fetch("/api/backend/admin/staff", {
      headers: { Authorization: `Bearer ${token}` },
    })
    const json = await res.json()
    setUsers(json.data ?? [])
    setLoading(false)
  }, [token])

  useEffect(() => {
    load() // eslint-disable-line react-hooks/set-state-in-effect
  }, [load])

  async function handleCreate() {
    setError("")
    if (!email.trim() || password.length < 6) {
      setError("E-mail e senha (mín. 6 caracteres) são obrigatórios.")
      return
    }
    setSaving(true)
    const res = await fetch("/api/backend/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email: email.trim(), password, role }),
    })
    const json = await res.json()
    if (!res.ok) {
      setError(json.error?.message ?? "Erro ao criar usuário.")
      setSaving(false)
      return
    }
    setEmail("")
    setPassword("")
    setRole("ATTENDANT")
    setShowForm(false)
    setSaving(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover este usuário?")) return
    setDeleting(id)
    await fetch(`/api/backend/admin/staff/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    setDeleting(null)
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
            Equipe
          </h1>
        </div>
        {me?.role === "ADMIN" && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition active:scale-95"
            style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
          >
            <Plus className="h-4 w-4" /> Novo usuário
          </button>
        )}
      </div>

      {/* Formulário */}
      {showForm && (
        <div
          className="mb-5 space-y-3 rounded-2xl p-5"
          style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.2)" }}
        >
          <p className="text-sm font-semibold text-white">Novo usuário da equipe</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              className={`${inputCls} w-full`}
              placeholder="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className={`${inputCls} w-full`}
              placeholder="Senha (mín. 6 caracteres)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              className={inputCls}
              value={role}
              onChange={(e) => setRole(e.target.value as "ADMIN" | "ATTENDANT")}
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <option value="ATTENDANT" style={{ background: "#1a1612" }}>
                Atendente
              </option>
              <option value="ADMIN" style={{ background: "#1a1612" }}>
                Admin
              </option>
            </select>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Criar
            </button>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-2xl"
              style={{ background: "var(--mob-s1)" }}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center gap-3 rounded-2xl p-4"
              style={{ background: "var(--mob-s3)", border: "1px solid var(--mob-s4)" }}
            >
              <div
                className="flex h-9 w-9 flex-none items-center justify-center rounded-xl"
                style={{
                  background:
                    u.role === "ADMIN" ? "rgba(249,115,22,0.15)" : "rgba(255,255,255,0.05)",
                }}
              >
                {u.role === "ADMIN" ? (
                  <Shield className="h-4 w-4 text-orange-400" />
                ) : (
                  <User className="h-4 w-4 text-white/40" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">{u.email}</p>
                <p className="text-xs text-white/30">
                  {u.role === "ADMIN" ? "Admin" : "Atendente"} · desde{" "}
                  {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
              {u.id === me?.id && (
                <span
                  className="rounded-full px-2.5 py-0.5 text-[10px] font-bold text-orange-400"
                  style={{ background: "rgba(249,115,22,0.15)" }}
                >
                  Você
                </span>
              )}
              {me?.role === "ADMIN" && u.id !== me?.id && (
                <button
                  onClick={() => handleDelete(u.id)}
                  disabled={deleting === u.id}
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-white/40 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                >
                  {deleting === u.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
