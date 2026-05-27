"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { z } from "zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useGoogleLogin } from "@react-oauth/google"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { formatPhoneBR } from "@/lib/masks"
import { AuthLeftPanel } from "../_components/auth-left-panel"

// ─── Schema ───────────────────────────────────────────────────────────────────

const registerSchema = z
  .object({
    name: z.string().min(2, "Nome muito curto"),
    email: z.string().email("E-mail inválido"),
    phone: z.string().refine((v) => v.replace(/\D/g, "").length >= 10, "Telefone inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string(),
    lgpdConsent: z
      .boolean()
      .refine((v) => v === true, "Você precisa aceitar os termos para continuar"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  })

type RegisterData = z.infer<typeof registerSchema>

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

function OrangeSubmit({
  children,
  loading,
  disabled,
}: {
  children: React.ReactNode
  loading?: boolean
  disabled?: boolean
}) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
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
      Inscrever-se com Google
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

export default function RegisterPage() {
  const router = useRouter()
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [lgpdConsent, setLgpdConsent] = useState(false)

  const form = useForm<RegisterData>({
    resolver: standardSchemaResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      lgpdConsent: false,
    },
  })

  function toggleConsent(checked: boolean) {
    setLgpdConsent(checked)
    form.setValue("lgpdConsent", checked, { shouldValidate: true })
  }

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
        toast.success("Conta criada com sucesso! 🎉")
        router.push("/")
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao autenticar com Google")
      } finally {
        setIsSubmitting(false)
      }
    },
    onError: () => toast.error("Erro ao autenticar com Google"),
  })

  const onRegister = form.handleSubmit(async (data) => {
    setIsSubmitting(true)
    try {
      const r = await fetch("/api/auth/customer/register", {
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

            <div style={{ animation: "mob-slide-in 0.25s ease-out both" }}>
              <Field delay={0}>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white">Crie sua conta 🍔</h2>
                  <p className="mt-1 text-sm text-white/50">É rápido, grátis e sem enrolação.</p>
                </div>
              </Field>

              <Field delay={60}>
                <GoogleButton
                  onClick={() => googleLogin()}
                  disabled={isSubmitting || !lgpdConsent}
                />
              </Field>

              <Divider />

              <form onSubmit={onRegister} className="space-y-4">
                <Field delay={120}>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">
                    Nome completo
                  </label>
                  <input
                    {...form.register("name")}
                    placeholder="Seu nome"
                    disabled={isSubmitting}
                    className={INPUT}
                  />
                  <FieldError msg={form.formState.errors.name?.message} />
                </Field>

                <Field delay={155}>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">E-mail</label>
                  <input
                    {...form.register("email")}
                    type="email"
                    placeholder="seu@email.com"
                    disabled={isSubmitting}
                    className={INPUT}
                  />
                  <FieldError msg={form.formState.errors.email?.message} />
                </Field>

                <Field delay={190}>
                  <label className="mb-1.5 block text-xs font-medium text-white/60">Telefone</label>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.07] px-3 text-sm whitespace-nowrap text-white/70">
                      🇧🇷 +55
                    </div>
                    <Controller
                      name="phone"
                      control={form.control}
                      render={({ field }) => (
                        <input
                          {...field}
                          inputMode="tel"
                          placeholder="(35) 9 9999-9999"
                          disabled={isSubmitting}
                          className={cn(INPUT, "flex-1")}
                          onChange={(e) => field.onChange(formatPhoneBR(e.target.value))}
                        />
                      )}
                    />
                  </div>
                  <FieldError msg={form.formState.errors.phone?.message} />
                </Field>

                <Field delay={225}>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-white/60">
                        Senha
                      </label>
                      <div className="relative">
                        <input
                          {...form.register("password")}
                          type={showPwd ? "text" : "password"}
                          placeholder="••••••••"
                          disabled={isSubmitting}
                          className={cn(INPUT, "pr-10")}
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
                      <FieldError msg={form.formState.errors.password?.message} />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-white/60">
                        Confirmar
                      </label>
                      <div className="relative">
                        <input
                          {...form.register("confirmPassword")}
                          type={showConfirm ? "text" : "password"}
                          placeholder="••••••••"
                          disabled={isSubmitting}
                          className={cn(INPUT, "pr-10")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm((v) => !v)}
                          className="absolute top-3 right-3 text-white/30 hover:text-white/70"
                          aria-label="Alternar visibilidade"
                        >
                          {showConfirm ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <FieldError msg={form.formState.errors.confirmPassword?.message} />
                    </div>
                  </div>
                </Field>

                <Field delay={260}>
                  <label className="flex cursor-pointer items-start gap-3 select-none">
                    <div className="relative mt-0.5 shrink-0">
                      <input
                        type="checkbox"
                        checked={lgpdConsent}
                        onChange={(e) => toggleConsent(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div
                        className="flex h-4 w-4 items-center justify-center rounded border transition-all duration-200"
                        style={{
                          background: lgpdConsent ? "#f97316" : "transparent",
                          borderColor: lgpdConsent ? "#f97316" : "rgba(255,255,255,0.25)",
                        }}
                      >
                        {lgpdConsent && (
                          <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5">
                            <path
                              d="M2 6l3 3 5-5"
                              stroke="#fff"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className="text-xs leading-relaxed text-white/40">
                      Li e concordo com os{" "}
                      <a
                        href="/privacidade"
                        className="text-orange-500 underline underline-offset-2 hover:text-orange-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Termos de Uso
                      </a>{" "}
                      e a{" "}
                      <a
                        href="/privacidade"
                        className="text-orange-500 underline underline-offset-2 hover:text-orange-400"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Política de Privacidade
                      </a>
                      , e autorizo o tratamento dos meus dados conforme a{" "}
                      <span className="text-white/60">LGPD</span>.
                    </span>
                  </label>
                  <FieldError msg={form.formState.errors.lgpdConsent?.message} />
                </Field>

                <Field delay={295}>
                  <OrangeSubmit loading={isSubmitting} disabled={!lgpdConsent}>
                    Criar conta grátis 🚀
                  </OrangeSubmit>
                </Field>

                <Field delay={330}>
                  <p className="text-center text-xs text-white/40">
                    Já tem conta?{" "}
                    <a href="/login" className="font-medium text-orange-500 hover:text-orange-600">
                      Entrar
                    </a>
                  </p>
                </Field>
              </form>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
