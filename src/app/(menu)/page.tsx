"use client"

import { useCallback } from "react"
import useEmblaCarousel from "embla-carousel-react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { MENU_ITEMS, COMBOS, DRINKS, DESSERTS } from "@/data/menu"

// ─── Category data ────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    id: "burgers",
    label: "Burgers",
    emoji: "🍔",
    count: MENU_ITEMS.filter((i) => i.cat === "burger").length,
    href: "/cardapio?cat=burgers",
    from: "#3a1500",
    to: "#1a0800",
  },
  {
    id: "chicken",
    label: "Chicken",
    emoji: "🍗",
    count: MENU_ITEMS.filter((i) => i.cat === "chicken").length,
    href: "/cardapio?cat=chicken",
    from: "#3b2000",
    to: "#1c1000",
  },
  {
    id: "combos",
    label: "Combos",
    emoji: "🎁",
    count: COMBOS.length,
    href: "/cardapio?cat=combos",
    from: "#2a0e0e",
    to: "#150808",
  },
  {
    id: "bebidas",
    label: "Bebidas",
    emoji: "🥤",
    count: DRINKS.length,
    href: "/cardapio?cat=bebidas",
    from: "#0e1f2e",
    to: "#081018",
  },
  {
    id: "sobremesas",
    label: "Sobremesas",
    emoji: "🍫",
    count: DESSERTS.length,
    href: "/cardapio?cat=sobremesas",
    from: "#2a0e1e",
    to: "#15080f",
  },
]

// ─── Embla wrapper ────────────────────────────────────────────────────────────

function Carousel({ children, className }: { children: React.ReactNode; className?: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    dragFree: true,
  })

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  return (
    <div className="group/carousel relative">
      {/* Track */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className={cn("flex", className)}>{children}</div>
      </div>

      {/* Prev button */}
      <button
        type="button"
        onClick={scrollPrev}
        aria-label="Anterior"
        className="absolute top-1/2 -left-4 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 opacity-0 transition-all duration-200 group-hover/carousel:opacity-100 hover:border-white/30"
        style={{ background: "rgba(12,11,9,0.9)", backdropFilter: "blur(8px)" }}
      >
        <ChevronLeft className="h-4 w-4 text-white" />
      </button>

      {/* Next button */}
      <button
        type="button"
        onClick={scrollNext}
        aria-label="Próximo"
        className="absolute top-1/2 -right-4 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 opacity-0 transition-all duration-200 group-hover/carousel:opacity-100 hover:border-white/30"
        style={{ background: "rgba(12,11,9,0.9)", backdropFilter: "blur(8px)" }}
      >
        <ChevronRight className="h-4 w-4 text-white" />
      </button>
    </div>
  )
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionTitle({
  title,
  href,
  linkLabel,
}: {
  title: string
  href?: string
  linkLabel?: string
}) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <h2
        className="leading-none text-white"
        style={{
          fontFamily: "var(--font-bebas)",
          fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
          letterSpacing: "0.06em",
        }}
      >
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-xs font-medium text-orange-400 transition-colors hover:text-orange-300"
        >
          {linkLabel ?? "Ver todos"}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative h-[520px] w-full overflow-hidden lg:h-[580px]">
        {/* Burger photo */}
        <Image
          src="/images/mob-banner.png"
          alt="MOB Burger"
          fill
          priority
          className="object-cover object-center"
        />

        {/* Dark overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(12,11,9,0.92) 0%, rgba(12,11,9,0.75) 45%, rgba(12,11,9,0.30) 100%)",
          }}
        />

        {/* Text block */}
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-6">
            <p className="mb-2 text-xs font-semibold tracking-[0.3em] text-orange-400 uppercase">
              Burgers Pack Co.
            </p>
            <h1
              className="mb-4 leading-none text-white"
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: "clamp(4rem, 8vw, 7.5rem)",
                letterSpacing: "0.03em",
                textShadow: "0 2px 24px rgba(0,0,0,0.6)",
              }}
            >
              Sabor que
              <br />
              <span style={{ color: "#f97316" }}>vale a fama.</span>
            </h1>
            <p className="mb-8 max-w-xs text-sm leading-relaxed text-white/70">
              Hambúrgueres artesanais smashados na chapa, combos exclusivos e muito sabor — feito na
              hora, sem frescura.
            </p>
            <Link
              href="/cardapio"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all active:scale-95"
              style={{
                background: "linear-gradient(135deg, #f97316, #ea580c)",
                boxShadow: "0 6px 20px rgba(249,115,22,0.35)",
              }}
            >
              Ver cardápio completo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl space-y-16 px-6 py-14">
        {/* ── Categorias carousel ────────────────────────────────── */}
        <section>
          <SectionTitle title="Categorias" href="/cardapio" />
          <Carousel className="gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={cat.href}
                className="group/card embla__slide w-[200px] flex-none"
              >
                <div
                  className="relative h-[160px] overflow-hidden rounded-2xl border border-white/[0.07] transition-all duration-300 group-hover/card:scale-[1.02] group-hover/card:border-orange-500/40"
                  style={{
                    background: `linear-gradient(160deg, ${cat.from} 0%, ${cat.to} 100%)`,
                  }}
                >
                  {/* Emoji */}
                  <span
                    className="absolute top-4 right-4 leading-none opacity-70 transition-all duration-300 group-hover/card:scale-110 group-hover/card:opacity-100"
                    style={{ fontSize: "52px" }}
                  >
                    {cat.emoji}
                  </span>

                  {/* Orange accent line */}
                  <div
                    className="absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-300 group-hover/card:w-full"
                    style={{ background: "linear-gradient(to right, #f97316, #ea580c)" }}
                  />

                  {/* Text */}
                  <div className="absolute right-0 bottom-0 left-0 p-4">
                    <p
                      className="leading-none text-white"
                      style={{
                        fontFamily: "var(--font-bebas)",
                        fontSize: "1.4rem",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {cat.label}
                    </p>
                    <p className="mt-0.5 text-[11px] text-white/40">
                      {cat.count} {cat.count === 1 ? "item" : "itens"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </Carousel>
        </section>

        {/* ── Combos carousel ────────────────────────────────────── */}
        <section>
          <SectionTitle title="Combos da Casa" href="/cardapio?cat=combos" linkLabel="Ver combos" />
          <Carousel className="gap-4">
            {COMBOS.map((combo) => (
              <div key={combo.id} className="embla__slide w-[260px] flex-none">
                <div
                  className="group/combo relative h-full overflow-hidden rounded-2xl border border-white/[0.07] p-5 transition-all duration-300 hover:border-orange-500/30"
                  style={{ background: "rgba(255,255,255,0.04)" }}
                >
                  {/* Ribbon */}
                  <div
                    className="absolute top-0 right-0 rounded-bl-xl px-3 py-1 text-[10px] font-bold tracking-widest text-black"
                    style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
                  >
                    COMBO
                  </div>

                  {/* ID */}
                  <p className="mb-2 text-[10px] font-medium tracking-[0.2em] text-orange-500/70">
                    {combo.id}
                  </p>

                  {/* Name */}
                  <h3
                    className="mb-3 leading-tight text-white"
                    style={{
                      fontFamily: "var(--font-bebas)",
                      fontSize: "1.25rem",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {combo.name}
                  </h3>

                  {/* Save badge */}
                  <p className="mb-4 inline-flex items-center gap-1 rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-[11px] font-medium text-green-400">
                    ✓ {combo.save}
                  </p>

                  {/* Price */}
                  <div className="flex items-end justify-between">
                    <p
                      className="leading-none"
                      style={{
                        fontFamily: "var(--font-bebas)",
                        fontSize: "2.2rem",
                        color: "#f97316",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {combo.price}
                    </p>

                    <button
                      type="button"
                      className="rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all active:scale-95"
                      style={{
                        background: "linear-gradient(135deg, #f97316, #ea580c)",
                        boxShadow: "0 4px 12px rgba(249,115,22,0.25)",
                      }}
                    >
                      Pedir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </section>
      </div>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] px-6 py-8 text-center">
        <p className="text-xs text-white/25">
          © {new Date().getFullYear()} M.O.B — Burgers Pack Co. Todos os direitos reservados.
        </p>
      </footer>
    </main>
  )
}
