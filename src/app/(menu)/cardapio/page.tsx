"use client"

import { useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Search, X, ShoppingBag, Plus, Minus, Trash2, ChevronRight } from "lucide-react"
import { ALL_ITEMS, MAX_PRICE, type AnyItem } from "@/data/menu"
import { useCart } from "@/lib/cart-store"

// ─── Tipos e constantes ───────────────────────────────────────────────────────

type Category = "todos" | "burger" | "chicken" | "combo" | "sobremesa" | "bebida"

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "burger", label: "Burgers" },
  { id: "chicken", label: "Chicken" },
  { id: "combo", label: "Combos" },
  { id: "sobremesa", label: "Sobremesas" },
  { id: "bebida", label: "Bebidas" },
]

// ─── Utilitário ───────────────────────────────────────────────────────────────

function fmtPrice(n: number) {
  return `R$ ${n.toFixed(2).replace(".", ",")}`
}

// ─── ProductCard ─────────────────────────────────────────────────────────────

function ProductCard({ item }: { item: AnyItem }) {
  const add = useCart((s) => s.add)
  const items = useCart((s) => s.items)
  const increment = useCart((s) => s.increment)
  const decrement = useCart((s) => s.decrement)
  const entry = items.find((i) => i.id === item.id)

  return (
    <div
      className="group/card relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:translate-y-[-2px]"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
      }}
    >
      {/* Orange top accent */}
      <div
        className="absolute top-0 right-0 left-0 z-10 h-[2px]"
        style={{ background: "linear-gradient(to right, #f97316, #ea580c)" }}
      />

      {/* Imagem */}
      <div className="relative h-48 w-full overflow-hidden bg-black/30">
        {item.img ? (
          <Image
            src={item.img}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover/card:scale-[1.06]"
            unoptimized
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              background:
                "radial-gradient(ellipse at 50% 60%, rgba(249,115,22,0.12) 0%, transparent 70%)",
            }}
          >
            <span className="text-6xl opacity-40">{item.emoji}</span>
          </div>
        )}
        {/* Badge */}
        {item.badge && (
          <span
            className="absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-white uppercase"
            style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
          >
            {item.badge}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3
          className="leading-none text-white"
          style={{ fontFamily: "var(--font-bebas)", fontSize: "1.25rem", letterSpacing: "0.07em" }}
        >
          {item.name.replace("MOB ", "")}
        </h3>

        <p className="line-clamp-2 text-[11px] leading-relaxed text-white/40">
          {item.ingredients.join(" · ")}
        </p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-base font-bold text-orange-400">{item.price}</span>

          {/* Controle de quantidade / botão adicionar */}
          {entry ? (
            <div
              className="flex items-center gap-2 rounded-xl px-2 py-1"
              style={{
                background: "rgba(249,115,22,0.15)",
                border: "1px solid rgba(249,115,22,0.3)",
              }}
            >
              <button
                onClick={() => decrement(item.id)}
                className="flex h-6 w-6 items-center justify-center rounded-lg text-orange-400 transition hover:bg-orange-500/20 active:scale-90"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="w-4 text-center text-sm font-bold text-white">{entry.qty}</span>
              <button
                onClick={() => increment(item.id)}
                className="flex h-6 w-6 items-center justify-center rounded-lg text-orange-400 transition hover:bg-orange-500/20 active:scale-90"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() =>
                add({
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  priceNum: item.priceNum,
                  img: item.img,
                })
              }
              className="flex h-8 w-8 items-center justify-center rounded-xl text-white transition active:scale-90"
              style={{
                background: "linear-gradient(135deg, #f97316, #ea580c)",
                boxShadow: "0 4px 12px rgba(249,115,22,0.3)",
              }}
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── CartDrawer ───────────────────────────────────────────────────────────────

function CartDrawer() {
  const { isOpen, closeCart, items, increment, decrement, clear, total } = useCart()

  const totalVal = total()
  const hasItems = items.length > 0

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={closeCart} />
      )}

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 bottom-0 z-50 flex w-full max-w-sm flex-col"
        style={{
          background: "rgba(14,12,10,0.97)",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(24px)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-orange-400" />
            <span
              className="text-white"
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: "1.4rem",
                letterSpacing: "0.08em",
              }}
            >
              Sua Sacola
            </span>
          </div>
          <button
            onClick={closeCart}
            className="rounded-lg p-1.5 text-white/40 transition hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Itens */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!hasItems ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <ShoppingBag className="h-12 w-12 text-white/10" />
              <p className="text-sm text-white/30">Sua sacola está vazia</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center gap-3 rounded-xl p-3"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  {/* Thumb */}
                  <div className="relative h-14 w-14 flex-none overflow-hidden rounded-lg bg-black/30">
                    {entry.img && (
                      <Image
                        src={entry.img}
                        alt={entry.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    )}
                  </div>

                  {/* Nome + preço */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">
                      {entry.name.replace("MOB ", "")}
                    </p>
                    <p className="text-xs text-orange-400">
                      {fmtPrice(entry.priceNum * entry.qty)}
                    </p>
                  </div>

                  {/* Qty controls */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => decrement(entry.id)}
                      className="flex h-6 w-6 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white active:scale-90"
                    >
                      {entry.qty === 1 ? (
                        <Trash2 className="h-3 w-3 text-red-400" />
                      ) : (
                        <Minus className="h-3 w-3" />
                      )}
                    </button>
                    <span className="w-5 text-center text-sm font-bold text-white">
                      {entry.qty}
                    </span>
                    <button
                      onClick={() => increment(entry.id)}
                      className="flex h-6 w-6 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white active:scale-90"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer com total */}
        {hasItems && (
          <div className="px-5 py-5" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-white/50">Total</span>
              <span className="text-lg font-bold text-white">{fmtPrice(totalVal)}</span>
            </div>
            <Link
              href="/carrinho"
              className="block w-full rounded-xl py-3.5 text-center text-sm font-bold text-white transition active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #f97316, #ea580c)",
                boxShadow: "0 6px 20px rgba(249,115,22,0.35)",
              }}
            >
              Finalizar pedido
            </Link>
            <button
              onClick={clear}
              className="mt-2 w-full py-2 text-xs text-white/30 transition hover:text-white/50"
            >
              Limpar sacola
            </button>
          </div>
        )}
      </div>
    </>
  )
}

// ─── CartBar (flutuante, estilo iFood) ────────────────────────────────────────

function CartBar() {
  const count = useCart((s) => s.count())
  const total = useCart((s) => s.total())

  if (count === 0) return null

  return (
    <div className="fixed right-0 bottom-0 left-0 z-30 px-4 pb-4">
      <Link
        href="/carrinho"
        className="mx-auto flex w-full max-w-lg items-center rounded-2xl px-4 py-3.5 transition active:scale-[0.98]"
        style={{
          background: "linear-gradient(135deg, #f97316, #ea580c)",
          boxShadow: "0 8px 32px rgba(249,115,22,0.4)",
        }}
      >
        {/* Contador */}
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-orange-600"
          style={{ background: "rgba(255,255,255,0.25)" }}
        >
          {count}
        </div>

        <span className="flex-1 text-center text-sm font-bold text-white">Ver sacola</span>

        <span className="text-sm font-bold text-white/80">{fmtPrice(total)}</span>
        <ChevronRight className="ml-1 h-4 w-4 text-white/80" />
      </Link>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CardapioPage() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<Category>(() => {
    const cat = searchParams.get("cat")
    const valid: Category[] = ["burger", "chicken", "combo", "sobremesa", "bebida"]
    return valid.includes(cat as Category) ? (cat as Category) : "todos"
  })
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE)

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return ALL_ITEMS.filter((item) => {
      if (category !== "todos" && item.cat !== category) return false
      if (item.priceNum > maxPrice) return false
      if (!q) return true
      return (
        item.name.toLowerCase().includes(q) ||
        item.ingredients.some((ing) => ing.toLowerCase().includes(q))
      )
    })
  }, [query, category, maxPrice])

  return (
    <>
      <main className="mx-auto max-w-7xl px-6 pt-10 pb-32">
        {/* ── Título ── */}
        <div className="mb-8">
          <p className="mb-1 text-xs font-semibold tracking-[0.3em] text-orange-400 uppercase">
            Burgers Pack Co.
          </p>
          <h1
            className="leading-none text-white"
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "clamp(3rem, 6vw, 5rem)",
              letterSpacing: "0.05em",
            }}
          >
            Cardápio
          </h1>
        </div>

        {/* ── Filtros ── */}
        <div
          className="sticky top-[64px] z-20 mb-8 space-y-4 rounded-2xl p-4"
          style={{
            background: "rgba(12,11,9,0.85)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {/* Busca + preço */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Campo de busca */}
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Buscar por nome ou ingrediente..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-xl bg-white/5 py-2.5 pr-4 pl-9 text-sm text-white placeholder-white/25 ring-1 ring-white/10 transition outline-none focus:ring-orange-500/50"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-white/30 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Slider de preço */}
            <div className="flex shrink-0 items-center gap-3 sm:w-56">
              <span className="text-xs whitespace-nowrap text-white/40">Até</span>
              <input
                type="range"
                min={0}
                max={MAX_PRICE}
                step={1}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="flex-1 accent-orange-500"
              />
              <span className="w-16 text-right text-xs font-semibold whitespace-nowrap text-orange-400">
                {fmtPrice(maxPrice)}
              </span>
            </div>
          </div>

          {/* Pills de categoria */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const active = category === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className="rounded-full px-4 py-1.5 text-xs font-semibold transition-all"
                  style={
                    active
                      ? { background: "linear-gradient(135deg, #f97316, #ea580c)", color: "#fff" }
                      : {
                          background: "rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.5)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }
                  }
                >
                  {cat.label}
                </button>
              )
            })}
            <span className="ml-auto self-center text-xs text-white/25">
              {filtered.length} {filtered.length === 1 ? "item" : "itens"}
            </span>
          </div>
        </div>

        {/* ── Grid de produtos ── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <p className="text-4xl">🔍</p>
            <p className="text-sm text-white/30">
              Nenhum item encontrado para os filtros aplicados.
            </p>
            <button
              onClick={() => {
                setQuery("")
                setCategory("todos")
                setMaxPrice(MAX_PRICE)
              }}
              className="mt-1 text-xs text-orange-400 hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>

      <CartDrawer />
      <CartBar />
    </>
  )
}
