"use client"

import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { z } from "zod"
import {
  Eye,
  EyeOff,
  Utensils,
  ShoppingBag,
  MapPin,
  Loader2,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useGoogleLogin } from "@react-oauth/google"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { MENU_ITEMS, DESSERTS, TOTAL_ITEMS } from "@/data/menu"

// ─── Schemas ────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
})

const registerSchema = z
  .object({
    name: z.string().min(2, "Nome muito curto"),
    email: z.string().email("E-mail inválido"),
    phone: z.string().min(10, "Telefone inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  })

const forgotSchema = z.object({
  email: z.string().email("E-mail inválido"),
})

type LoginData = z.infer<typeof loginSchema>
type RegisterData = z.infer<typeof registerSchema>
type ForgotData = z.infer<typeof forgotSchema>

// ─── Constants ───────────────────────────────────────────────────────────────

const STATS = [
  { Icon: Utensils, value: String(TOTAL_ITEMS), label: "itens no cardápio" },
  { Icon: ShoppingBag, value: "300+", label: "pedidos hoje" },
  { Icon: MapPin, value: String(DESSERTS.length), label: "sobremesas" },
]

// ─── Ferris wheel config ─────────────────────────────────────────────────────

const ITEM_H = 68 // slot height — deve ser >= altura real do item ativo
const WHEEL_H = 340 // 5 slots × 68px = 340
const WHEEL_INTERVAL = 3000

const SLOTS = [
  { offset: -2, scale: 0.7, opacity: 0.25 },
  { offset: -1, scale: 0.84, opacity: 0.55 },
  { offset: 0, scale: 1.0, opacity: 1.0 },
  { offset: 1, scale: 0.84, opacity: 0.55 },
  { offset: 2, scale: 0.7, opacity: 0.25 },
]

// Gradientes placeholder por categoria — usados quando item.img === null.
// Quando a foto chegar, preencha item.img em src/data/menu.ts e o background
// trocará automaticamente para url("...") center/cover.
const PLACEHOLDER_BG: Record<string, string> = {
  burger: "radial-gradient(ellipse at 30% 80%, rgba(200,70,0,0.55) 0%, transparent 60%), #0e0a07",
  chicken: "radial-gradient(ellipse at 30% 80%, rgba(200,150,0,0.48) 0%, transparent 60%), #0f0d06",
}

function getItemBg(item: (typeof MENU_ITEMS)[number]): string {
  if (item.img) return `url("${item.img}") center/cover no-repeat`
  return PLACEHOLDER_BG[item.cat] ?? "#0a0a0a"
}

const INPUT =
  "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 " +
  "transition-all placeholder:text-gray-300 disabled:opacity-60 disabled:cursor-not-allowed"

// ─── Primitives ──────────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="mt-1 text-xs text-red-500">{msg}</p>
}

function Divider() {
  return (
    <div className="relative my-5">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200" />
      </div>
      <div className="relative flex justify-center">
        <span className="px-3 text-xs text-gray-400" style={{ background: "#fafaf8" }}>
          ou use seu e-mail
        </span>
      </div>
    </div>
  )
}

function OrangeSubmit({ children, loading }: { children: React.ReactNode; loading?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
      style={{
        background: "linear-gradient(135deg, #f97316, #ea580c)",
        boxShadow: "0 4px 16px rgba(249,115,22,0.28)",
      }}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}

function GoogleButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  children: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <GoogleIcon />
      {children}
    </button>
  )
}

// animated field wrapper — stagger via delay prop
function Field({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <div
      style={{
        animation: "mob-field-in 0.35s ease-out both",
        animationDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// ─── Ferris wheel component ───────────────────────────────────────────────────

function FerrisWheel({
  activeIdx,
  onSelect,
}: {
  activeIdx: number
  onSelect: (i: number) => void
}) {
  function cyclicDist(i: number) {
    const n = MENU_ITEMS.length
    const d = (((i - activeIdx) % n) + n) % n
    return d > n / 2 ? d - n : d
  }

  return (
    <div
      className="relative my-4 overflow-hidden"
      style={{
        height: WHEEL_H,
        maskImage:
          "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 18%, black 35%, black 65%, rgba(0,0,0,0.6) 82%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 18%, black 35%, black 65%, rgba(0,0,0,0.6) 82%, transparent 100%)",
      }}
    >
      {MENU_ITEMS.map((item, i) => {
        const d = cyclicDist(i)
        if (Math.abs(d) > 2) return null
        const slot = SLOTS.find((s) => s.offset === d)!
        const isActive = d === 0
        const top = WHEEL_H / 2 + d * ITEM_H - ITEM_H / 2

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => !isActive && onSelect(i)}
            className="absolute right-0 left-0 flex items-center gap-3.5"
            style={{
              top,
              transform: `scale(${slot.scale})`,
              opacity: slot.opacity,
              zIndex: isActive ? 5 : 4 - Math.abs(d),
              transition:
                "transform 0.55s cubic-bezier(.4,0,.2,1), opacity 0.55s cubic-bezier(.4,0,.2,1), top 0.55s cubic-bezier(.4,0,.2,1)",
              padding: isActive ? "10px 18px" : "8px 14px",
              background: isActive ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)",
              border: `1.5px solid ${isActive ? "rgba(255,255,255,0.35)" : "transparent"}`,
              borderRadius: "12px",
              backdropFilter: isActive ? "blur(4px)" : "none",
              cursor: isActive ? "default" : "pointer",
              transformOrigin: "center center",
            }}
          >
            <span
              style={{
                fontSize: isActive ? "28px" : "20px",
                lineHeight: 1,
                transition: "font-size 0.4s ease",
                flexShrink: 0,
              }}
            >
              {item.emoji}
            </span>
            <div className="flex flex-col gap-0.5">
              <span
                style={{
                  fontSize: isActive ? "1rem" : "0.875rem",
                  fontWeight: isActive ? 700 : 500,
                  color: "#fff",
                  transition: "font-size 0.4s ease",
                  textShadow: "0 1px 6px rgba(0,0,0,0.45)",
                }}
              >
                {item.name}
              </span>
              {isActive && (
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "rgba(255,255,255,0.85)",
                    textShadow: "0 1px 6px rgba(0,0,0,0.4)",
                  }}
                >
                  {item.price}
                </span>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.082 17.64 11.773 17.64 9.2z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z"
      />
    </svg>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AuthPage() {
  const router = useRouter()

  const [activeIdx, setActiveIdx] = useState(0)
  const [layers, setLayers] = useState<{ a: string | null; b: string | null; front: "a" | "b" }>({
    a: getItemBg(MENU_ITEMS[0]),
    b: null,
    front: "a",
  })
  const prevIdxRef = useRef(-1)

  // auto-rotate
  useEffect(() => {
    const t = setInterval(() => setActiveIdx((i) => (i + 1) % MENU_ITEMS.length), WHEEL_INTERVAL)
    return () => clearInterval(t)
  }, [])

  // crossfade when active item changes
  useEffect(() => {
    if (prevIdxRef.current === activeIdx) return
    prevIdxRef.current = activeIdx
    const bg = getItemBg(MENU_ITEMS[activeIdx])
    setLayers((prev) =>
      prev.front === "a" ? { a: prev.a, b: bg, front: "b" } : { a: bg, b: prev.b, front: "a" },
    )
  }, [activeIdx])

  const [tab, setTab] = useState<"login" | "register">("register")
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [forgotView, setForgotView] = useState<"hidden" | "form" | "sent">("hidden")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loginForm = useForm<LoginData>({ resolver: standardSchemaResolver(loginSchema) })
  const registerForm = useForm<RegisterData>({ resolver: standardSchemaResolver(registerSchema) })
  const forgotForm = useForm<ForgotData>({ resolver: standardSchemaResolver(forgotSchema) })

  const googleLogin = useGoogleLogin({
    onSuccess: async (res) => {
      setIsSubmitting(true)
      try {
        const r = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: res.access_token }),
        })
        if (!r.ok) throw new Error("Erro ao autenticar com Google")
        toast.success("Login realizado com sucesso!")
        router.push("/")
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao autenticar com Google")
      } finally {
        setIsSubmitting(false)
      }
    },
    onError: () => toast.error("Erro ao autenticar com Google"),
  })

  const onLogin = loginForm.handleSubmit(async (data) => {
    setIsSubmitting(true)
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!r.ok) {
        const body = (await r.json().catch(() => ({}))) as { message?: string }
        throw new Error(body.message ?? "Credenciais inválidas")
      }
      toast.success("Bem-vindo de volta! 🔥")
      router.push("/")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao fazer login")
    } finally {
      setIsSubmitting(false)
    }
  })

  const onRegister = registerForm.handleSubmit(async (data) => {
    setIsSubmitting(true)
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!r.ok) {
        const body = (await r.json().catch(() => ({}))) as { message?: string }
        throw new Error(body.message ?? "Erro ao criar conta")
      }
      toast.success("Conta criada com sucesso! 🎉")
      router.push("/")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao criar conta")
    } finally {
      setIsSubmitting(false)
    }
  })

  const onForgot = forgotForm.handleSubmit(async (data) => {
    setIsSubmitting(true)
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      setForgotView("sent")
      toast.success("Link enviado! Verifique seu e-mail.")
    } catch {
      toast.error("Erro ao enviar link de recuperação")
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <>
      <style>{`
        @keyframes mob-field-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes mob-slide-in {
          from { opacity: 0; transform: translateX(14px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <div className="flex min-h-screen">
        {/* ── Left panel ──────────────────────────────────────────── */}
        <aside
          className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex lg:w-[55%]"
          style={{ background: "#0a0a0a" }}
        >
          {/* Background crossfade — camada A */}
          <div
            className="absolute inset-0 z-0 transition-opacity duration-[900ms] ease-in-out"
            style={{ background: layers.a ?? "#0a0a0a", opacity: layers.front === "a" ? 1 : 0 }}
          />
          {/* Background crossfade — camada B */}
          <div
            className="absolute inset-0 z-0 transition-opacity duration-[900ms] ease-in-out"
            style={{ background: layers.b ?? "#0a0a0a", opacity: layers.front === "b" ? 1 : 0 }}
          />
          {/* Overlay escuro para legibilidade */}
          <div
            className="absolute inset-0 z-[1]"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.50) 50%, rgba(0,0,0,0.65) 100%)",
            }}
          />

          {/* Brand */}
          <header className="relative z-[2] flex items-center gap-3">
            <Image
              src="/mob-logo.png"
              alt="M.O.B"
              width={40}
              height={40}
              className="rounded-xl object-cover"
            />
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-white">M.O.B</p>
              <p className="text-xs text-white/70">Burgers Pack Co.</p>
            </div>
          </header>

          {/* Hero + Ferris wheel */}
          <div className="relative z-[2] flex flex-1 flex-col justify-center pb-10">
            <h1
              className="mb-2 leading-none text-white"
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: "clamp(3.5rem, 6vw, 6rem)",
                letterSpacing: "0.03em",
                textShadow: "0 2px 16px rgba(0,0,0,0.55)",
              }}
            >
              Encontre seu
              <br />
              <span style={{ color: "#f97316" }}>lanche.</span>
            </h1>
            <p
              className="mb-2 max-w-xs text-sm leading-relaxed text-white/90"
              style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}
            >
              Hambúrgueres artesanais, combos exclusivos e muito sabor —&nbsp; tudo num só lugar.
            </p>

            <FerrisWheel activeIdx={activeIdx} onSelect={setActiveIdx} />

            {/* Stats */}
            <div className="mt-2 flex gap-2.5">
              {STATS.map(({ value, label }) => (
                <div
                  key={label}
                  className="flex-1 rounded-xl border border-white/[0.18] p-3"
                  style={{ background: "rgba(255,255,255,0.10)", backdropFilter: "blur(6px)" }}
                >
                  <p className="mb-0.5 text-xl leading-none font-bold text-white">{value}</p>
                  <p className="text-xs leading-snug text-white/65">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-[2] text-xs text-white/50 italic">
            &ldquo;Chega de delivery genérico. Peça o seu MOB agora.&rdquo;
          </p>
        </aside>

        {/* ── Right panel ─────────────────────────────────────────── */}
        <main
          className="flex flex-1 items-center justify-center overflow-y-auto p-6 lg:p-12"
          style={{ background: "#fafaf8" }}
        >
          <div className="w-full max-w-[400px] py-8">
            {/* Mobile brand */}
            <div className="mb-8 flex items-center gap-2 lg:hidden">
              <Image
                src="/mob-logo.png"
                alt="M.O.B"
                width={32}
                height={32}
                className="rounded-lg object-cover"
              />
              <span className="text-sm font-semibold tracking-wider">M.O.B</span>
            </div>

            {/* ── Forgot password ─────────────────────────────────── */}
            {forgotView !== "hidden" ? (
              <div style={{ animation: "mob-slide-in 0.3s ease-out both" }}>
                {forgotView === "form" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setForgotView("hidden")}
                      className="mb-8 flex items-center gap-1.5 text-xs text-gray-400 transition-colors hover:text-gray-600"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Voltar para o login
                    </button>

                    <Field delay={0}>
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Recuperar senha 🔑</h2>
                        <p className="mt-1 text-sm text-gray-500">
                          Informe seu e-mail e enviaremos um link para redefinir sua senha.
                        </p>
                      </div>
                    </Field>

                    <form onSubmit={onForgot} className="space-y-4">
                      <Field delay={60}>
                        <label className="mb-1.5 block text-xs font-medium text-gray-600">
                          E-mail
                        </label>
                        <input
                          {...forgotForm.register("email")}
                          type="email"
                          placeholder="seu@email.com"
                          disabled={isSubmitting}
                          className={INPUT}
                        />
                        <FieldError msg={forgotForm.formState.errors.email?.message} />
                      </Field>

                      <Field delay={120}>
                        <OrangeSubmit loading={isSubmitting}>
                          Enviar link de recuperação
                        </OrangeSubmit>
                      </Field>
                    </form>
                  </>
                ) : (
                  /* Sent confirmation */
                  <div className="py-10 text-center">
                    <div
                      className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
                      style={{ background: "rgba(249,115,22,0.10)" }}
                    >
                      <CheckCircle2 className="h-8 w-8" style={{ color: "#f97316" }} />
                    </div>
                    <h2 className="mb-2 text-xl font-bold text-gray-900">Link enviado!</h2>
                    <p className="mb-1 text-sm text-gray-500">Verifique sua caixa de entrada em</p>
                    <p className="mb-8 text-sm font-semibold text-gray-800">
                      {forgotForm.getValues("email")}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotView("hidden")
                        forgotForm.reset()
                      }}
                      className="mx-auto flex items-center gap-1.5 text-sm font-medium text-orange-500 transition-colors hover:text-orange-600"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Voltar para o login
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Tabs */}
                <div className="mb-8 flex rounded-xl border border-gray-200/50 bg-gray-100/80 p-1">
                  {(["login", "register"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={cn(
                        "flex-1 rounded-[10px] py-2.5 text-sm font-medium transition-all duration-200",
                        tab === t
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-400 hover:text-gray-600",
                      )}
                    >
                      {t === "login" ? "Entrar" : "Cadastrar"}
                    </button>
                  ))}
                </div>

                {/* ── Login ──────────────────────────────────────── */}
                {tab === "login" && (
                  <div style={{ animation: "mob-slide-in 0.25s ease-out both" }}>
                    <Field delay={0}>
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Bem-vindo de volta 🔥</h2>
                        <p className="mt-1 text-sm text-gray-500">
                          Acesse sua conta e faça seu pedido.
                        </p>
                      </div>
                    </Field>

                    <Field delay={60}>
                      <GoogleButton onClick={() => googleLogin()} disabled={isSubmitting}>
                        Entrar com Google
                      </GoogleButton>
                    </Field>

                    <Divider />

                    <form onSubmit={onLogin} className="space-y-4">
                      <Field delay={120}>
                        <label className="mb-1.5 block text-xs font-medium text-gray-600">
                          E-mail
                        </label>
                        <input
                          {...loginForm.register("email")}
                          type="email"
                          placeholder="seu@email.com"
                          disabled={isSubmitting}
                          className={INPUT}
                        />
                        <FieldError msg={loginForm.formState.errors.email?.message} />
                      </Field>

                      <Field delay={160}>
                        <div className="mb-1.5 flex items-center justify-between">
                          <label className="text-xs font-medium text-gray-600">Senha</label>
                          <button
                            type="button"
                            onClick={() => setForgotView("form")}
                            className="text-xs text-orange-500 hover:text-orange-600"
                          >
                            Esqueceu a senha?
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            {...loginForm.register("password")}
                            type={showPwd ? "text" : "password"}
                            placeholder="••••••••"
                            disabled={isSubmitting}
                            className={cn(INPUT, "pr-11")}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPwd((v) => !v)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                            aria-label="Alternar visibilidade"
                          >
                            {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <FieldError msg={loginForm.formState.errors.password?.message} />
                      </Field>

                      <Field delay={210}>
                        <OrangeSubmit loading={isSubmitting}>Entrar</OrangeSubmit>
                      </Field>

                      <Field delay={240}>
                        <p className="text-center text-sm text-gray-500">
                          Não tem conta?{" "}
                          <button
                            type="button"
                            onClick={() => setTab("register")}
                            className="font-medium text-orange-500 hover:text-orange-600"
                          >
                            Cadastre-se
                          </button>
                        </p>
                      </Field>
                    </form>
                  </div>
                )}

                {/* ── Register ───────────────────────────────────── */}
                {tab === "register" && (
                  <div style={{ animation: "mob-slide-in 0.25s ease-out both" }}>
                    <Field delay={0}>
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Crie sua conta 🍔</h2>
                        <p className="mt-1 text-sm text-gray-500">
                          É rápido, grátis e sem enrolação.
                        </p>
                      </div>
                    </Field>

                    <Field delay={60}>
                      <GoogleButton onClick={() => googleLogin()} disabled={isSubmitting}>
                        Inscrever-se no Google
                      </GoogleButton>
                    </Field>

                    <Divider />

                    <form onSubmit={onRegister} className="space-y-4">
                      <Field delay={120}>
                        <label className="mb-1.5 block text-xs font-medium text-gray-600">
                          Nome completo
                        </label>
                        <input
                          {...registerForm.register("name")}
                          placeholder="Seu nome"
                          disabled={isSubmitting}
                          className={INPUT}
                        />
                        <FieldError msg={registerForm.formState.errors.name?.message} />
                      </Field>

                      <Field delay={155}>
                        <label className="mb-1.5 block text-xs font-medium text-gray-600">
                          E-mail
                        </label>
                        <input
                          {...registerForm.register("email")}
                          type="email"
                          placeholder="seu@email.com"
                          disabled={isSubmitting}
                          className={INPUT}
                        />
                        <FieldError msg={registerForm.formState.errors.email?.message} />
                      </Field>

                      <Field delay={190}>
                        <label className="mb-1.5 block text-xs font-medium text-gray-600">
                          Telefone
                        </label>
                        <div className="flex gap-2">
                          <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 text-sm whitespace-nowrap text-gray-600">
                            🇧🇷 +55
                          </div>
                          <input
                            {...registerForm.register("phone")}
                            type="tel"
                            placeholder="(35) 9999-9999"
                            disabled={isSubmitting}
                            className={cn(INPUT, "flex-1")}
                          />
                        </div>
                        <FieldError msg={registerForm.formState.errors.phone?.message} />
                      </Field>

                      <Field delay={225}>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-600">
                              Senha
                            </label>
                            <div className="relative">
                              <input
                                {...registerForm.register("password")}
                                type={showPwd ? "text" : "password"}
                                placeholder="••••••••"
                                disabled={isSubmitting}
                                className={cn(INPUT, "pr-10")}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPwd((v) => !v)}
                                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                                aria-label="Alternar visibilidade"
                              >
                                {showPwd ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                            <FieldError msg={registerForm.formState.errors.password?.message} />
                          </div>

                          <div>
                            <label className="mb-1.5 block text-xs font-medium text-gray-600">
                              Confirmar
                            </label>
                            <div className="relative">
                              <input
                                {...registerForm.register("confirmPassword")}
                                type={showConfirm ? "text" : "password"}
                                placeholder="••••••••"
                                disabled={isSubmitting}
                                className={cn(INPUT, "pr-10")}
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirm((v) => !v)}
                                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                                aria-label="Alternar visibilidade"
                              >
                                {showConfirm ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                            <FieldError
                              msg={registerForm.formState.errors.confirmPassword?.message}
                            />
                          </div>
                        </div>
                      </Field>

                      <Field delay={260}>
                        <OrangeSubmit loading={isSubmitting}>Criar conta grátis 🚀</OrangeSubmit>
                      </Field>

                      <Field delay={330}>
                        <p className="text-center text-xs text-gray-400">
                          Já tem conta?{" "}
                          <button
                            type="button"
                            onClick={() => setTab("login")}
                            className="font-medium text-orange-500 hover:text-orange-600"
                          >
                            Entrar
                          </button>
                        </p>
                      </Field>

                      <Field delay={350}>
                        <p className="text-center text-xs text-gray-400/70">
                          Ao criar conta, você concorda com os{" "}
                          <a href="#" className="underline underline-offset-2 hover:text-gray-500">
                            Termos de Uso
                          </a>{" "}
                          e a{" "}
                          <a href="#" className="underline underline-offset-2 hover:text-gray-500">
                            Política de Privacidade
                          </a>
                          .
                        </p>
                      </Field>
                    </form>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
