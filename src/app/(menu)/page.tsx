"use client"

import React, { useEffect, useRef, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { MENU_ITEMS, COMBOS, DRINKS, DESSERTS } from "@/data/menu"

// ─── Card data ────────────────────────────────────────────────────────────────

const CATEGORY_CARDS = [
  {
    id: "burgers",
    label: "Burgers",
    sublabel: `${MENU_ITEMS.filter((i) => i.cat === "burger").length} itens`,
    img: "/burgers/mob-beast.png",
    href: "/cardapio?cat=burger",
  },
  {
    id: "chicken",
    label: "Chicken",
    sublabel: `${MENU_ITEMS.filter((i) => i.cat === "chicken").length} itens`,
    img: "/burgers/mob-chicken-full.png",
    href: "/cardapio?cat=chicken",
  },
  {
    id: "sobremesas",
    label: "Sobremesas",
    sublabel: `${DESSERTS.length} itens`,
    img: "/burgers/sobremesa-mob-bombom-de-morango.png",
    href: "/cardapio?cat=sobremesa",
  },
  {
    id: "bebidas",
    label: "Bebidas",
    sublabel: `${DRINKS.length} itens`,
    img: "/burgers/coca-cola.png",
    href: "/cardapio?cat=bebida",
  },
]

const COMBO_IMGS = [
  "/burgers/combo-mob-combo-classico.png",
  "/burgers/combo-mob-combo-premium.png",
  "/burgers/combo-mob-combo-sweet.png",
  "/burgers/combo-mob-para-2.png",
  "/burgers/combo-mob-familia.png",
]

// ─── MenuCard — glassmorphism landscape ──────────────────────────────────────

interface MenuCardProps {
  img: string
  label: string
  sublabel: string
  href?: string
}

function MenuCard({ img, label, sublabel, href }: MenuCardProps) {
  const inner = (
    <div
      className="group/card relative h-[240px] w-full overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.025]"
      style={{
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Food photo */}
      <div className="absolute inset-x-0 top-0 z-[1]" style={{ bottom: 62 }}>
        <Image
          src={img}
          alt={label}
          fill
          sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover/card:scale-[1.08]"
          style={{ objectPosition: "center center" }}
          unoptimized
        />
      </div>

      {/* Orange top accent */}
      <div
        className="absolute top-0 right-0 left-0 z-20 h-[2.5px]"
        style={{ background: "linear-gradient(to right, #f97316, #ea580c)" }}
      />

      {/* Gradient veil */}
      <div
        className="pointer-events-none absolute inset-x-0 z-[2]"
        style={{
          top: "42%",
          bottom: 62,
          background: "linear-gradient(to bottom, transparent 0%, rgba(10,8,6,0.7) 100%)",
        }}
      />

      {/* Frosted glass text bar */}
      <div
        className="absolute right-0 bottom-0 left-0 z-[3] h-[62px] px-4 py-3"
        style={{
          background: "rgba(10,8,6,0.72)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <p
          className="leading-none text-white"
          style={{ fontFamily: "var(--font-bebas)", fontSize: "1.4rem", letterSpacing: "0.07em" }}
        >
          {label}
        </p>
        <p className="mt-0.5 text-[10px] tracking-widest text-white/40 uppercase">{sublabel}</p>
      </div>

      {/* Orange glow on hover */}
      <div
        className="pointer-events-none absolute inset-0 z-[4] rounded-2xl opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
        style={{ boxShadow: "inset 0 0 0 1px rgba(249,115,22,0.4)" }}
      />
    </div>
  )

  if (href)
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    )
  return <div className="cursor-default">{inner}</div>
}

// ─── Carousel ─────────────────────────────────────────────────────────────────

function Carousel({
  children,
  startDelay = 0,
}: {
  children: React.ReactNode
  startDelay?: number
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    containScroll: false,
  })
  const [paused, setPaused] = useState(false)
  const emblaApiRef = useRef(emblaApi)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => {
    emblaApiRef.current = emblaApi
  }, [emblaApi])

  useEffect(() => {
    if (paused) return
    const timeoutId = setTimeout(() => {
      intervalRef.current = setInterval(() => emblaApiRef.current?.scrollNext(), 4500)
    }, startDelay)
    return () => {
      clearTimeout(timeoutId)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [startDelay, paused])

  const slides = React.Children.toArray(children)

  const arrowCls =
    "absolute top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/75 ring-1 ring-white/10 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-orange-600 hover:ring-orange-500/40 active:scale-90"

  function handleManualNav(action: () => void) {
    setPaused(true)
    action()
  }

  return (
    <div className="group relative px-12">
      <button
        onClick={() => handleManualNav(() => emblaApi?.scrollPrev())}
        className={`${arrowCls} left-1.5`}
      >
        <ChevronLeft className="h-4 w-4 text-white" />
      </button>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="-ml-4 flex touch-pan-x">
          {slides.map((child, i) => (
            <div key={i} className="min-w-0 flex-none basis-[85%] pl-4 sm:basis-1/2 lg:basis-1/3">
              {child}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => handleManualNav(() => emblaApi?.scrollNext())}
        className={`${arrowCls} right-1.5`}
      >
        <ChevronRight className="h-4 w-4 text-white" />
      </button>
    </div>
  )
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="mb-8 text-center">
      <h2
        className="leading-none text-white"
        style={{
          fontFamily: "var(--font-bebas)",
          fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
          letterSpacing: "0.1em",
        }}
      >
        {title}
      </h2>
      {/* Accent underline */}
      <div
        className="mx-auto mt-2 h-[2px] w-10 rounded-full"
        style={{ background: "linear-gradient(to right, #f97316, #ea580c)" }}
      />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative h-[520px] w-full overflow-hidden lg:h-[580px]">
        <Image
          src="/images/mob-banner.png"
          alt="MOB Burger"
          fill
          priority
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(12,11,9,0.93) 0%, rgba(12,11,9,0.72) 45%, rgba(12,11,9,0.28) 100%)",
          }}
        />
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

      {/* ── Carrosséis ───────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl space-y-16 px-6 py-16">
        {/* ── Categorias ─────────────────────────────────────────── */}
        <section>
          <SectionTitle title="Categorias" />
          <Carousel startDelay={0}>
            {CATEGORY_CARDS.map((cat) => (
              <MenuCard
                key={cat.id}
                img={cat.img}
                label={cat.label}
                sublabel={cat.sublabel}
                href={cat.href}
              />
            ))}
          </Carousel>
        </section>

        {/* ── Combos ─────────────────────────────────────────────── */}
        <section>
          <SectionTitle title="Combos da Casa" />
          <Carousel startDelay={1750}>
            {COMBOS.map((combo, i) => (
              <MenuCard
                key={combo.id}
                img={COMBO_IMGS[i] ?? COMBO_IMGS[0]}
                label={combo.name.replace("MOB ", "")}
                sublabel={combo.price}
                href="/cardapio?cat=combo"
              />
            ))}
          </Carousel>
        </section>
      </div>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.05] px-6 py-8 text-center">
        <p className="text-xs text-white/20">
          © {new Date().getFullYear()} M.O.B — Burgers Pack Co. Todos os direitos reservados.
        </p>
      </footer>
    </main>
  )
}
