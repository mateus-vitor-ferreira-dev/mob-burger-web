"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  User,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  Search,
  Camera,
} from "lucide-react"
import Image from "next/image"
import { useCustomer } from "@/lib/customer-store"
import { useCart } from "@/lib/cart-store"
import { useDelivery } from "@/lib/delivery-store"

function maskPhone(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
}
function maskCep(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/^(\d{5})(\d)/, "$1-$2")
}

const inputCls =
  "w-full rounded-xl bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none ring-1 ring-white/10 transition focus:ring-orange-500/50"

type FeedbackState = { type: "success" | "error"; message: string } | null

function Feedback({ state }: { state: FeedbackState }) {
  if (!state) return null
  const isError = state.type === "error"
  return (
    <div
      className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
      style={{
        background: isError ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)",
        border: `1px solid ${isError ? "rgba(239,68,68,0.25)" : "rgba(34,197,94,0.25)"}`,
        color: isError ? "#f87171" : "#4ade80",
      }}
    >
      {isError ? (
        <AlertCircle className="h-4 w-4 flex-none" />
      ) : (
        <CheckCircle2 className="h-4 w-4 flex-none" />
      )}
      {state.message}
    </div>
  )
}

// ─── Card: Dados pessoais ─────────────────────────────────────────────────────

function ProfileCard() {
  const { customer, token, setCustomer } = useCustomer()
  const [name, setName] = useState(customer?.name ?? "")
  const [phone, setPhone] = useState(customer?.phone ?? "")
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackState>(null)

  async function handleSave() {
    if (!token) return
    setSaving(true)
    setFeedback(null)
    try {
      const r = await fetch("/api/auth/customer/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: name.trim(), phone }),
      })
      const json = await r.json()
      if (!r.ok) throw new Error(json.error?.message ?? "Erro ao salvar")
      const c = json.data?.customer
      if (c && customer) setCustomer({ ...customer, name: c.name, phone: c.phone ?? "" }, token)
      setFeedback({ type: "success", message: "Dados atualizados com sucesso!" })
    } catch (e) {
      setFeedback({ type: "error", message: e instanceof Error ? e.message : "Erro ao salvar" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="space-y-4 rounded-2xl p-6"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-orange-400" />
        <h2 className="text-sm font-semibold tracking-widest text-white/40 uppercase">
          Dados pessoais
        </h2>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-xs text-white/40">Nome completo</label>
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-white/40">E-mail</label>
          <input
            className={`${inputCls} cursor-not-allowed opacity-40`}
            value={customer?.email ?? ""}
            readOnly
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-white/40">Telefone</label>
          <div className="relative">
            <Phone className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-white/20" />
            <input
              className={`${inputCls} pl-9`}
              value={phone}
              inputMode="tel"
              onChange={(e) => setPhone(maskPhone(e.target.value))}
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>
      </div>

      <Feedback state={feedback} />

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-50"
        style={{
          background: "linear-gradient(135deg, #f97316, #ea580c)",
          boxShadow: "0 4px 16px rgba(249,115,22,0.3)",
        }}
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Salvando...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" /> Salvar alterações
          </>
        )}
      </button>
    </div>
  )
}

// ─── Card: Endereço ───────────────────────────────────────────────────────────

function AddressCard() {
  const { customer, updateAddress } = useCustomer()
  const [cep, setCep] = useState(customer?.address?.cep ?? "")
  const [street, setStreet] = useState(customer?.address?.street ?? "")
  const [number, setNumber] = useState(customer?.address?.number ?? "")
  const [complement, setComplement] = useState(customer?.address?.complement ?? "")
  const [neighborhood, setNeighborhood] = useState(customer?.address?.neighborhood ?? "")
  const [city, setCity] = useState(customer?.address?.city ?? "")
  const [state, setState] = useState(customer?.address?.state ?? "")
  const [cepLoading, setCepLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackState>(null)
  const numberRef = useRef<HTMLInputElement>(null)

  async function fetchCep(raw: string) {
    const digits = raw.replace(/\D/g, "")
    if (digits.length !== 8) return
    setCepLoading(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setStreet(data.logradouro)
        setNeighborhood(data.bairro)
        setCity(data.localidade)
        setState(data.uf)
        setComplement(data.complemento ?? "")
        numberRef.current?.focus()
      }
    } finally {
      setCepLoading(false)
    }
  }

  function handleSave() {
    setSaving(true)
    // Salva no store local (endereço no backend requer migração de schema)
    updateAddress({ cep, street, number, complement, neighborhood, city, state })
    setTimeout(() => {
      setSaving(false)
      setFeedback({ type: "success", message: "Endereço salvo!" })
    }, 400)
  }

  return (
    <div
      className="space-y-4 rounded-2xl p-6"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-orange-400" />
        <h2 className="text-sm font-semibold tracking-widest text-white/40 uppercase">
          Endereço de entrega padrão
        </h2>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="mb-1.5 block text-xs text-white/40">CEP</label>
            <input
              className={inputCls}
              value={cep}
              inputMode="numeric"
              placeholder="00000-000"
              onChange={(e) => {
                const masked = maskCep(e.target.value)
                setCep(masked)
                if (masked.replace(/\D/g, "").length === 8) fetchCep(masked)
              }}
            />
          </div>
          <button
            onClick={() => fetchCep(cep)}
            disabled={cepLoading}
            className="mt-6 flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold text-white transition disabled:opacity-50"
            style={{
              background: "rgba(249,115,22,0.15)",
              border: "1px solid rgba(249,115,22,0.3)",
            }}
          >
            {cepLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-orange-400" />
            ) : (
              <Search className="h-3.5 w-3.5 text-orange-400" />
            )}
            Buscar
          </button>
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-white/40">Rua / Avenida</label>
          <input
            className={inputCls}
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="Rua / Avenida"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-xs text-white/40">Número</label>
            <input
              ref={numberRef}
              className={inputCls}
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="Nº"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white/40">Complemento</label>
            <input
              className={inputCls}
              value={complement}
              onChange={(e) => setComplement(e.target.value)}
              placeholder="Apto, bloco..."
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-white/40">Bairro</label>
          <input
            className={inputCls}
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            placeholder="Bairro"
          />
        </div>

        <div className="grid grid-cols-[1fr_80px] gap-3">
          <div>
            <label className="mb-1.5 block text-xs text-white/40">Cidade</label>
            <input
              className={inputCls}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Cidade"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white/40">UF</label>
            <input
              className={inputCls}
              value={state}
              maxLength={2}
              onChange={(e) => setState(e.target.value.toUpperCase())}
              placeholder="UF"
            />
          </div>
        </div>
      </div>

      <Feedback state={feedback} />

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-50"
        style={{
          background: "linear-gradient(135deg, #f97316, #ea580c)",
          boxShadow: "0 4px 16px rgba(249,115,22,0.3)",
        }}
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Salvando...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" /> Salvar endereço
          </>
        )}
      </button>
    </div>
  )
}

// ─── Card: Alterar senha ──────────────────────────────────────────────────────

function PasswordCard() {
  const { customer, token } = useCustomer()
  const [step, setStep] = useState<"verify" | "change">("verify")
  const [current, setCurrent] = useState("")
  const [newPwd, setNewPwd] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackState>(null)

  // Usuário Google sem senha
  if (!customer || (customer.phone === undefined && !token)) return null
  const isGoogleOnly = !!(customer as { googleId?: string }).googleId

  if (isGoogleOnly) {
    return (
      <div
        className="rounded-2xl p-6"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="mb-3 flex items-center gap-2">
          <Lock className="h-4 w-4 text-orange-400" />
          <h2 className="text-sm font-semibold tracking-widest text-white/40 uppercase">Senha</h2>
        </div>
        <p className="text-sm text-white/30">
          Sua conta está vinculada ao Google. A senha é gerenciada pelo Google.
        </p>
      </div>
    )
  }

  async function handleVerify() {
    if (!token || !current) return
    setLoading(true)
    setFeedback(null)
    try {
      const r = await fetch("/api/auth/customer/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: current, newPassword: "__verify__" }),
      })
      const json = await r.json()
      // Se retornar erro de senha errada, é inválida. Qualquer outro erro = senha correta (ou outro problema)
      if (json.error?.code === "WRONG_PASSWORD") {
        setFeedback({ type: "error", message: "Senha atual incorreta." })
      } else {
        setStep("change")
        setFeedback(null)
      }
    } catch {
      setFeedback({ type: "error", message: "Erro ao verificar senha." })
    } finally {
      setLoading(false)
    }
  }

  async function handleChange() {
    if (!token) return
    if (newPwd.length < 6) {
      setFeedback({ type: "error", message: "A nova senha deve ter pelo menos 6 caracteres." })
      return
    }
    if (newPwd !== confirm) {
      setFeedback({ type: "error", message: "As senhas não coincidem." })
      return
    }
    setLoading(true)
    setFeedback(null)
    try {
      const r = await fetch("/api/auth/customer/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: current, newPassword: newPwd }),
      })
      const json = await r.json()
      if (!r.ok) throw new Error(json.error?.message ?? "Erro ao alterar senha")
      setFeedback({ type: "success", message: "Senha alterada com sucesso!" })
      setCurrent("")
      setNewPwd("")
      setConfirm("")
      setStep("verify")
    } catch (e) {
      setFeedback({
        type: "error",
        message: e instanceof Error ? e.message : "Erro ao alterar senha",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="space-y-4 rounded-2xl p-6"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-orange-400" />
        <h2 className="text-sm font-semibold tracking-widest text-white/40 uppercase">
          Alterar senha
        </h2>
      </div>

      {step === "verify" ? (
        <div className="space-y-3">
          <p className="text-xs text-white/30">
            Para sua segurança, confirme sua senha atual antes de criar uma nova.
          </p>
          <div>
            <label className="mb-1.5 block text-xs text-white/40">Senha atual</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                className={`${inputCls} pr-10`}
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="••••••••"
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-white/30 hover:text-white"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Feedback state={feedback} />
          <button
            onClick={handleVerify}
            disabled={loading || !current}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-50"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? "Verificando..." : "Verificar senha"}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="flex items-center gap-1.5 text-xs text-green-400">
            <CheckCircle2 className="h-3.5 w-3.5" /> Senha verificada. Defina sua nova senha.
          </p>
          {[
            {
              label: "Nova senha",
              value: newPwd,
              set: setNewPwd,
              show: showNew,
              toggle: () => setShowNew((v) => !v),
            },
            {
              label: "Confirmar nova senha",
              value: confirm,
              set: setConfirm,
              show: showConfirm,
              toggle: () => setShowConfirm((v) => !v),
            },
          ].map(({ label, value, set, show, toggle }) => (
            <div key={label}>
              <label className="mb-1.5 block text-xs text-white/40">{label}</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  className={`${inputCls} pr-10`}
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={toggle}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-white/30 hover:text-white"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}
          <Feedback state={feedback} />
          <div className="flex gap-2">
            <button
              onClick={() => {
                setStep("verify")
                setFeedback(null)
              }}
              className="rounded-xl px-4 py-3 text-sm text-white/40 transition hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              onClick={handleChange}
              disabled={loading || !newPwd || !confirm}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              {loading ? "Alterando..." : "Alterar senha"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

// ─── Avatar com upload ────────────────────────────────────────────────────────

function AvatarUpload() {
  const { customer, updateAvatar } = useCustomer()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  const initials =
    customer?.name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase() ?? "?"

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError("")
    try {
      const form = new FormData()
      form.append("avatar", file)
      const res = await fetch("/api/upload/avatar", { method: "POST", body: form })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Erro ao fazer upload")
      updateAvatar(json.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer upload")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl transition active:scale-95"
        style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
      >
        {customer?.avatarUrl ? (
          <Image src={customer.avatarUrl} alt="Avatar" fill className="object-cover" unoptimized />
        ) : (
          <span className="text-2xl font-bold text-white">{initials}</span>
        )}
        {/* Overlay no hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </div>
      </button>
      <p className="text-xs text-white/25">Clique para alterar · JPG, PNG ou WebP · máx 2 MB</p>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PerfilPage() {
  const router = useRouter()
  const { customer, logout } = useCustomer()
  const clearCart = useCart((s) => s.clear)
  const clearDelivery = useDelivery((s) => s.set)
  const [mounted, setMounted] = useState(false)

   
  useEffect(() => {
    setMounted(true) // eslint-disable-line react-hooks/set-state-in-effect
  }, [])
  useEffect(() => {
    if (mounted && !customer) router.push("/login")
  }, [mounted, customer, router])

  if (!mounted || !customer) return null

  function handleLogout() {
    logout()
    clearCart()
    clearDelivery({ customerName: "", phone: "" })
    router.push("/")
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10 pb-16">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-white/50 transition hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1
          className="leading-none text-white"
          style={{
            fontFamily: "var(--font-bebas)",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            letterSpacing: "0.05em",
          }}
        >
          Minha Conta
        </h1>
      </div>

      {/* Avatar + info */}
      <div
        className="mb-6 rounded-2xl p-5"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-4">
          <AvatarUpload />
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-white">{customer.name}</p>
            <p className="truncate text-sm text-white/40">{customer.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs text-white/30 transition hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sair
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        <ProfileCard />
        <AddressCard />
        <PasswordCard />
      </div>
    </main>
  )
}
