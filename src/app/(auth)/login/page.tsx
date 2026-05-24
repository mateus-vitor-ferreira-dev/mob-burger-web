"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { z } from "zod"
import { Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useGoogleLogin } from "@react-oauth/google"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { AuthLeftPanel } from "../_components/auth-left-panel"
import { useCustomer } from "@/lib/customer-store"
import { useStaff } from "@/lib/staff-store"

// ─── Schemas ─────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
})

const forgotSchema = z.object({
  email: z.string().email("E-mail inválido"),
})

type LoginData = z.infer<typeof loginSchema>
type ForgotData = z.infer<typeof forgotSchema>

// ─── Primitives ──────────────────────────────────────────────────────────────

const INPUT =
  "w-full rounded-xl px-4 py-3 text-sm text-white " +
  "bg-white/[0.07] border border-white/15 " +
  "focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/60 " +
  "transition-all placeholder:text-white/25 disabled:opacity-60 disabled:cursor-not-allowed"

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="mt-1 text-xs text-red-500">{msg}</p>
}

function Divider() {
  return (
    <div className="my-5 flex items-center gap-3">
      <div className="flex-1 border-t border-white/10" />
      <span className="text-xs text-white/30">ou use seu e-mail</span>
      <div className="flex-1 border-t border-white/10" />
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

function GoogleButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/[0.07] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/[0.12] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <GoogleIcon />
      Entrar com Google
    </button>
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

function Field({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <div style={{ animation: "mob-field-in 0.35s ease-out both", animationDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter()
  const setCustomer = useCustomer((s) => s.setCustomer)
  const setStaff = useStaff((s) => s.setStaff)
  const [showPwd, setShowPwd] = useState(false)
  const [forgotView, setForgotView] = useState<"hidden" | "form" | "sent">("hidden")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loginForm = useForm<LoginData>({ resolver: standardSchemaResolver(loginSchema) })
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
        const json = (await r.json().catch(() => ({}))) as {
          error?: { message?: string }
          data?: {
            customer?: { id: string; name: string; email: string; phone?: string }
            accessToken?: string
          }
        }
        if (!r.ok) throw new Error(json.error?.message ?? "Erro ao autenticar com Google")
        const { customer: c, accessToken } = json.data ?? {}
        if (c && accessToken) {
          setCustomer({ id: c.id, name: c.name, email: c.email, phone: c.phone ?? "" }, accessToken)
        }
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
      // Tenta login de cliente primeiro
      const customerRes = await fetch("/api/auth/customer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const customerJson = (await customerRes.json().catch(() => ({}))) as {
        error?: { message?: string }
        data?: {
          customer?: { id: string; name: string; email: string; phone?: string }
          accessToken?: string
        }
      }

      if (customerRes.ok) {
        const { customer: c, accessToken } = customerJson.data ?? {}
        if (c && accessToken) {
          setCustomer({ id: c.id, name: c.name, email: c.email, phone: c.phone ?? "" }, accessToken)
        }
        toast.success("Bem-vindo de volta! 🔥")
        router.push("/")
        return
      }

      // Se falhou, tenta login de staff (admin/atendente)
      const staffRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const staffJson = (await staffRes.json().catch(() => ({}))) as {
        error?: { message?: string }
        data?: {
          user?: { id: string; email: string; role: "ADMIN" | "ATTENDANT" }
          accessToken?: string
        }
      }

      if (staffRes.ok) {
        const { user, accessToken } = staffJson.data ?? {}
        if (user && accessToken) {
          setStaff({ id: user.id, email: user.email, role: user.role }, accessToken)
          document.cookie = `mob-admin=1; path=/; max-age=${60 * 60 * 8}; SameSite=Strict${location.protocol === "https:" ? "; Secure" : ""}` // eslint-disable-line react-hooks/immutability
        }
        toast.success("Bem-vindo ao painel! 🔥")
        router.push("/admin")
        return
      }

      throw new Error("E-mail ou senha inválidos")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao fazer login")
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
        <AuthLeftPanel />

        <main
          className="flex flex-1 items-center justify-center overflow-y-auto p-6 lg:p-12"
          style={{ background: "transparent" }}
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
              <span className="text-sm font-semibold tracking-wider text-white">M.O.B</span>
            </div>

            {/* ── Forgot password ─────────────────────────────────── */}
            {forgotView !== "hidden" ? (
              <div style={{ animation: "mob-slide-in 0.3s ease-out both" }}>
                {forgotView === "form" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setForgotView("hidden")}
                      className="mb-8 flex items-center gap-1.5 text-xs text-white/40 transition-colors hover:text-white/70"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" /> Voltar para o login
                    </button>
                    <Field delay={0}>
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold text-white">Recuperar senha 🔑</h2>
                        <p className="mt-1 text-sm text-white/50">
                          Informe seu e-mail e enviaremos um link para redefinir sua senha.
                        </p>
                      </div>
                    </Field>
                    <form onSubmit={onForgot} className="space-y-4">
                      <Field delay={60}>
                        <label className="mb-1.5 block text-xs font-medium text-white/60">
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
                  <div className="py-10 text-center">
                    <div
                      className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
                      style={{ background: "rgba(249,115,22,0.10)" }}
                    >
                      <CheckCircle2 className="h-8 w-8" style={{ color: "#f97316" }} />
                    </div>
                    <h2 className="mb-2 text-xl font-bold text-white">Link enviado!</h2>
                    <p className="mb-1 text-sm text-white/50">Verifique sua caixa de entrada em</p>
                    <p className="mb-8 text-sm font-semibold text-white/80">
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
                      <ArrowLeft className="h-3.5 w-3.5" /> Voltar para o login
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ animation: "mob-slide-in 0.25s ease-out both" }}>
                <Field delay={0}>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white">Bem-vindo de volta 🔥</h2>
                    <p className="mt-1 text-sm text-white/50">
                      Acesse sua conta e faça seu pedido.
                    </p>
                  </div>
                </Field>

                <Field delay={60}>
                  <GoogleButton onClick={() => googleLogin()} disabled={isSubmitting} />
                </Field>

                <Divider />

                <form onSubmit={onLogin} className="space-y-4">
                  <Field delay={120}>
                    <label className="mb-1.5 block text-xs font-medium text-white/60">E-mail</label>
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
                      <label className="text-xs font-medium text-white/60">Senha</label>
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
                        className="absolute top-3 right-3 text-white/30 hover:text-white/70"
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
                    <p className="text-center text-sm text-white/50">
                      Não tem conta?{" "}
                      <a
                        href="/register"
                        className="font-medium text-orange-500 hover:text-orange-600"
                      >
                        Cadastre-se
                      </a>
                    </p>
                  </Field>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
