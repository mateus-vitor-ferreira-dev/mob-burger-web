"use client"

import { Suspense, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2, CheckCircle2, ArrowLeft, Lock } from "lucide-react"
import Link from "next/link"
import { AuthLeftPanel } from "../_components/auth-left-panel"

const INPUT =
  "w-full rounded-xl px-4 py-3 text-sm text-white " +
  "bg-white/[0.07] border border-white/15 " +
  "focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/60 " +
  "transition-all placeholder:text-white/25 disabled:opacity-60 pr-11"

function RedefinirSenhaContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token") ?? ""

  const [newPwd, setNewPwd] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="text-center">
          <p className="mb-4 text-sm text-white/50">Link inválido ou expirado.</p>
          <Link href="/login" className="text-sm font-medium text-orange-500 hover:text-orange-400">
            Voltar para o login
          </Link>
        </div>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (newPwd.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.")
      return
    }
    if (newPwd !== confirm) {
      setError("As senhas não coincidem.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: newPwd }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error?.message ?? "Token inválido ou expirado.")
      setDone(true)
      setTimeout(() => router.push("/login"), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao redefinir senha.")
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="text-center">
          <div
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: "rgba(249,115,22,0.10)" }}
          >
            <CheckCircle2 className="h-8 w-8 text-orange-400" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-white">Senha redefinida!</h2>
          <p className="text-sm text-white/50">Redirecionando para o login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <AuthLeftPanel />

      <main className="flex flex-1 items-center justify-center overflow-y-auto p-6 lg:p-12">
        <div className="w-full max-w-[400px] py-8">
          <Link
            href="/login"
            className="mb-8 flex items-center gap-1.5 text-xs text-white/40 transition-colors hover:text-white/70"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar para o login
          </Link>

          <div className="mb-6">
            <div
              className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ background: "rgba(249,115,22,0.10)" }}
            >
              <Lock className="h-6 w-6 text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Nova senha</h2>
            <p className="mt-1 text-sm text-white/50">
              Escolha uma senha forte de pelo menos 6 caracteres.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              {
                label: "Nova senha",
                value: newPwd,
                set: setNewPwd,
                show: showNew,
                toggle: () => setShowNew((v) => !v),
              },
              {
                label: "Confirmar senha",
                value: confirm,
                set: setConfirm,
                show: showConfirm,
                toggle: () => setShowConfirm((v) => !v),
              },
            ].map(({ label, value, set, show, toggle }) => (
              <div key={label}>
                <label className="mb-1.5 block text-xs font-medium text-white/60">{label}</label>
                <div className="relative">
                  <input
                    type={show ? "text" : "password"}
                    className={INPUT}
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={toggle}
                    className="absolute top-3 right-3 text-white/30 hover:text-white/70"
                    aria-label="Alternar visibilidade"
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            ))}

            {error && (
              <p
                className="rounded-xl px-3 py-2 text-xs text-red-400"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-70"
              style={{
                background: "linear-gradient(135deg, #f97316, #ea580c)",
                boxShadow: "0 4px 16px rgba(249,115,22,0.28)",
              }}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Redefinindo..." : "Redefinir senha"}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense>
      <RedefinirSenhaContent />
    </Suspense>
  )
}
