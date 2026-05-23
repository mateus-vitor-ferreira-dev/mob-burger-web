"use client"

import { useState, useEffect, useRef } from "react"
import { Utensils, ShoppingBag, MapPin } from "lucide-react"
import Image from "next/image"
import { useMenu } from "@/lib/use-menu"

// ─── Types usados pelo painel ─────────────────────────────────────────────────

interface PanelItem {
  id: string
  name: string
  img: string | null
  cat: string
  price: string
}

const FALLBACK_ITEMS: PanelItem[] = [
  { id: "0", name: "Mob Classic", img: null, cat: "burger", price: "R$ 22,90" },
]

const _STATS_BASE = [
  { Icon: Utensils, key: "items", label: "itens no cardápio" },
  { Icon: ShoppingBag, key: "combos", label: "combos" },
  { Icon: MapPin, key: "sobremesas", label: "sobremesas" },
] as const

const ITEM_H = 68
const WHEEL_H = 340
const WHEEL_INTERVAL = 3000

const SLOTS = [
  { offset: -2, scale: 0.7, opacity: 0.25 },
  { offset: -1, scale: 0.84, opacity: 0.55 },
  { offset: 0, scale: 1.0, opacity: 1.0 },
  { offset: 1, scale: 0.84, opacity: 0.55 },
  { offset: 2, scale: 0.7, opacity: 0.25 },
]

const PLACEHOLDER_BG: Record<string, string> = {
  burger: "radial-gradient(ellipse at 30% 80%, rgba(200,70,0,0.55) 0%, transparent 60%), #0e0a07",
  chicken: "radial-gradient(ellipse at 30% 80%, rgba(200,150,0,0.48) 0%, transparent 60%), #0f0d06",
}

function getItemBg(item: PanelItem): string {
  if (item.img) return `url("${item.img}") center/cover no-repeat`
  return PLACEHOLDER_BG[item.cat] ?? "#0a0a0a"
}

// ─── Ferris Wheel ─────────────────────────────────────────────────────────────

function FerrisWheel({
  items,
  activeIdx,
  onSelect,
}: {
  items: PanelItem[]
  activeIdx: number
  onSelect: (i: number) => void
}) {
  function cyclicDist(i: number) {
    const n = items.length
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
      {items.map((item, i) => {
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
              🍔
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

// ─── Left Panel ───────────────────────────────────────────────────────────────

export function AuthLeftPanel() {
  const { categories } = useMenu()

  // Todos os produtos exceto combos, como painel de itens da roda
  const panelItems: PanelItem[] = categories
    .filter((c) => c.slug !== "combos")
    .flatMap((c) =>
      c.products.map((p) => ({
        id: p.id,
        name: p.name.replace(/^Mob /i, ""),
        img: p.imageUrl,
        cat: c.slug,
        price: `R$ ${p.price.toFixed(2).replace(".", ",")}`,
      })),
    )
    .slice(0, 20) // máximo 20 itens na roda

  const items = panelItems.length > 0 ? panelItems : FALLBACK_ITEMS

  const comboCount = categories.find((c) => c.slug === "combos")?.products.length ?? 0
  const sobremesaCount = categories.find((c) => c.slug === "sobremesas")?.products.length ?? 0
  const totalCount = categories
    .filter((c) => c.slug !== "combos")
    .reduce((s, c) => s + c.products.length, 0)

  const STATS = [
    { value: String(totalCount || 18), label: "itens no cardápio" },
    { value: String(comboCount || 5), label: "combos" },
    { value: String(sobremesaCount || 4), label: "sobremesas" },
  ]

  const [activeIdx, setActiveIdx] = useState(0)
  const [layers, setLayers] = useState<{ a: string | null; b: string | null; front: "a" | "b" }>({
    a: getItemBg(items[0]),
    b: null,
    front: "a",
  })
  const prevIdxRef = useRef(-1)

  useEffect(() => {
    const t = setInterval(() => setActiveIdx((i) => (i + 1) % items.length), WHEEL_INTERVAL)
    return () => clearInterval(t)
  }, [items.length])

  useEffect(() => {
    if (prevIdxRef.current === activeIdx) return
    prevIdxRef.current = activeIdx
    const bg = getItemBg(items[activeIdx] ?? items[0])
    setLayers((prev) =>
      prev.front === "a" ? { a: prev.a, b: bg, front: "b" } : { a: bg, b: prev.b, front: "a" },
    )
  }, [activeIdx, items])

  return (
    <aside
      className="mob-on-dark relative hidden flex-col justify-between overflow-hidden p-12 lg:flex lg:w-[55%]"
      style={{ background: "#0a0a0a" }}
    >
      {/* Background crossfade */}
      <div
        className="absolute inset-0 z-0 transition-opacity duration-[900ms] ease-in-out"
        style={{ background: layers.a ?? "#0a0a0a", opacity: layers.front === "a" ? 1 : 0 }}
      />
      <div
        className="absolute inset-0 z-0 transition-opacity duration-[900ms] ease-in-out"
        style={{ background: layers.b ?? "#0a0a0a", opacity: layers.front === "b" ? 1 : 0 }}
      />
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
          Hambúrgueres artesanais, combos exclusivos e muito sabor —&nbsp;tudo num só lugar.
        </p>

        <FerrisWheel items={items} activeIdx={activeIdx} onSelect={setActiveIdx} />

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
  )
}
