"use client"

import { useEffect, useState } from "react"
import { Loader2, Save, Power } from "lucide-react"
import { useStaff } from "@/lib/staff-store"

const DAYS = [
  { key: "seg", label: "Segunda" },
  { key: "ter", label: "Terça" },
  { key: "qua", label: "Quarta" },
  { key: "qui", label: "Quinta" },
  { key: "sex", label: "Sexta" },
  { key: "sab", label: "Sábado" },
  { key: "dom", label: "Domingo" },
] as const

type DayKey = (typeof DAYS)[number]["key"]

interface DaySchedule {
  open: string
  close: string
  closed: boolean
}

interface StoreConfig {
  isOpen: boolean
  whatsappNumber: string
  openingHours: Record<DayKey, DaySchedule>
}

const DEFAULT_HOURS: Record<DayKey, DaySchedule> = {
  seg: { open: "18:00", close: "23:00", closed: false },
  ter: { open: "18:00", close: "23:00", closed: false },
  qua: { open: "18:00", close: "23:00", closed: false },
  qui: { open: "18:00", close: "23:00", closed: false },
  sex: { open: "18:00", close: "00:00", closed: false },
  sab: { open: "12:00", close: "00:00", closed: false },
  dom: { open: "12:00", close: "22:00", closed: false },
}

export default function ConfigPage() {
  const { token } = useStaff()
  const [config, setConfig] = useState<StoreConfig>({
    isOpen: true,
    whatsappNumber: "",
    openingHours: DEFAULT_HOURS,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!token) return
    fetch("/api/backend/admin/config", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          setConfig({
            isOpen: json.data.isOpen ?? true,
            whatsappNumber: json.data.whatsappNumber ?? "",
            openingHours: { ...DEFAULT_HOURS, ...(json.data.openingHours ?? {}) },
          })
        }
      })
      .finally(() => setLoading(false))
  }, [token])

  async function save() {
    setSaving(true)
    await fetch("/api/backend/admin/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(config),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function setDay(key: DayKey, field: keyof DaySchedule, value: string | boolean) {
    setConfig((prev) => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [key]: { ...prev.openingHours[key], [field]: value },
      },
    }))
  }

  const inputCls =
    "rounded-xl bg-white/5 px-3 py-2 text-sm text-white ring-1 ring-white/10 outline-none transition focus:ring-orange-500/50"

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.3em] text-orange-400 uppercase">Gestão</p>
          <h1
            className="leading-none text-white"
            style={{ fontFamily: "var(--font-bebas)", fontSize: "2.5rem", letterSpacing: "0.05em" }}
          >
            Config. da Loja
          </h1>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition active:scale-95 disabled:opacity-60"
          style={{
            background: saved
              ? "linear-gradient(135deg,#22c55e,#16a34a)"
              : "linear-gradient(135deg, #f97316, #ea580c)",
          }}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saved ? "Salvo!" : "Salvar"}
        </button>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Status da loja */}
        <section
          className="rounded-2xl p-5"
          style={{ background: "var(--mob-s3)", border: "1px solid var(--mob-s4)" }}
        >
          <h2 className="mb-4 text-sm font-semibold text-white/70">Status da Loja</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                {config.isOpen ? "Loja aberta" : "Loja fechada"}
              </p>
              <p className="text-xs text-white/30">
                {config.isOpen
                  ? "Clientes podem fazer pedidos agora."
                  : "Pedidos bloqueados até reabrir."}
              </p>
            </div>
            <button
              onClick={() => setConfig((p) => ({ ...p, isOpen: !p.isOpen }))}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition"
              style={
                config.isOpen
                  ? { background: "rgba(34,197,94,0.15)", color: "#4ade80" }
                  : { background: "rgba(239,68,68,0.15)", color: "#f87171" }
              }
            >
              <Power className="h-4 w-4" />
              {config.isOpen ? "Aberta" : "Fechada"}
            </button>
          </div>
        </section>

        {/* WhatsApp */}
        <section
          className="rounded-2xl p-5"
          style={{ background: "var(--mob-s3)", border: "1px solid var(--mob-s4)" }}
        >
          <h2 className="mb-4 text-sm font-semibold text-white/70">WhatsApp</h2>
          <div>
            <label className="mb-1 block text-xs text-white/50">
              Número (DDI + DDD + número) — somente dígitos
            </label>
            <input
              className={`${inputCls} w-full`}
              value={config.whatsappNumber}
              placeholder="5535999999999"
              inputMode="tel"
              maxLength={15}
              onChange={(e) =>
                setConfig((p) => ({ ...p, whatsappNumber: e.target.value.replace(/\D/g, "") }))
              }
            />
          </div>
        </section>

        {/* Horários */}
        <section
          className="rounded-2xl p-5"
          style={{ background: "var(--mob-s3)", border: "1px solid var(--mob-s4)" }}
        >
          <h2 className="mb-4 text-sm font-semibold text-white/70">Horário de Funcionamento</h2>
          <div className="space-y-3">
            {DAYS.map(({ key, label }) => {
              const day = config.openingHours[key]
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-20 text-xs font-medium text-white/60">{label}</span>

                  {/* Fechado toggle */}
                  <button
                    onClick={() => setDay(key, "closed", !day.closed)}
                    className="rounded-lg px-2.5 py-1 text-xs font-semibold transition"
                    style={
                      day.closed
                        ? { background: "rgba(239,68,68,0.15)", color: "#f87171" }
                        : { background: "rgba(34,197,94,0.1)", color: "#4ade80" }
                    }
                  >
                    {day.closed ? "Fechado" : "Aberto"}
                  </button>

                  {!day.closed && (
                    <>
                      <input
                        type="time"
                        className={`${inputCls} w-28`}
                        value={day.open}
                        onChange={(e) => setDay(key, "open", e.target.value)}
                      />
                      <span className="text-xs text-white/30">até</span>
                      <input
                        type="time"
                        className={`${inputCls} w-28`}
                        value={day.close}
                        onChange={(e) => setDay(key, "close", e.target.value)}
                      />
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
