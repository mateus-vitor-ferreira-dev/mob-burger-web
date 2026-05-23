"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useStaff } from "@/lib/staff-store"

export default function AdminLoginPage() {
  const router = useRouter()
  const setStaff = useStaff((s) => s.setStaff)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const json = await r.json()
      if (!r.ok) throw new Error(json.error?.message ?? "Credenciais inválidas")
      const { user, accessToken } = json.data ?? {}
      if (user && accessToken) {
        setStaff({ id: user.id, email: user.email, role: user.role }, accessToken)
        document.cookie = `mob-admin=1; path=/; max-age=${60 * 60 * 8}; SameSite=Strict`
        router.push("/admin")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0908] px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <Image
            src="/mob-logo.png"
            alt="M.O.B"
            width={52}
            height={52}
            className="rounded-xl object-cover"
          />
          <div className="text-center">
            <p className="text-xs font-semibold tracking-[0.3em] text-orange-400 uppercase">
              Painel Administrativo
            </p>
            <p className="text-xs text-white/30">M.O.B — Burgers Pack Co.</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl p-6"
          style={{ background: "var(--mob-s1)", border: "1px solid var(--mob-b1)" }}
        >
          <div>
            <label className="mb-1.5 block text-xs text-white/40">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@mobburger.com.br"
              required
              className="w-full rounded-xl bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/20 ring-1 ring-white/10 transition outline-none focus:ring-orange-500/50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-white/40">Senha</label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl bg-white/5 px-3 py-2.5 pr-10 text-sm text-white placeholder-white/20 ring-1 ring-white/10 transition outline-none focus:ring-orange-500/50"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-white/30 hover:text-white"
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              boxShadow: "0 4px 16px rgba(249,115,22,0.3)",
            }}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  )
}
