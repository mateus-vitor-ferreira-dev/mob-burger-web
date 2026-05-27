"use client"

import { fmtPrice } from "@/lib/utils"
import { Suspense, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  Search,
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ChevronRight,
  Check,
  Heart,
} from "lucide-react"
import { useCart, type SelectedOption, type SelectedExtra } from "@/lib/cart-store"
import { useMenu, type ComboConfig } from "@/lib/use-menu"
import { useFavorites } from "@/lib/use-favorites"

// ─── Types ────────────────────────────────────────────────────────────────────

interface OptionItem {
  id: string
  name: string
  additionalPrice: number
}

interface ProductOption {
  id: string
  label: string
  type: "RADIO" | "CHECKBOX"
  required: boolean
  items: OptionItem[]
}

interface MenuItem {
  id: string
  name: string
  description: string
  price: string
  priceNum: number
  img: string | null
  cat: string
  inStock: boolean
  options: ProductOption[]
  comboConfig?: ComboConfig | null
}

interface MenuCategory {
  slug: string
  name: string
}

interface GlobalExtra {
  id: string
  name: string
  price: number
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProductCardSkeleton() {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-2xl"
      style={{ background: "var(--mob-s1)", border: "1px solid var(--mob-b1)" }}
    >
      <div className="h-48 w-full animate-pulse" style={{ background: "var(--mob-s2)" }} />
      <div className="flex flex-col gap-3 p-4">
        <div
          className="h-5 w-3/4 animate-pulse rounded-lg"
          style={{ background: "var(--mob-s2)" }}
        />
        <div className="space-y-1.5">
          <div
            className="h-3 w-full animate-pulse rounded"
            style={{ background: "var(--mob-s2)" }}
          />
          <div
            className="h-3 w-2/3 animate-pulse rounded"
            style={{ background: "var(--mob-s2)" }}
          />
        </div>
        <div className="mt-1 flex items-center justify-between">
          <div
            className="h-5 w-16 animate-pulse rounded-lg"
            style={{ background: "var(--mob-s2)" }}
          />
          <div
            className="h-8 w-8 animate-pulse rounded-xl"
            style={{ background: "var(--mob-s2)" }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── OptionsModal ─────────────────────────────────────────────────────────────

const CHEESE_OPTIONS = [
  { id: "cheese-cheddar", name: "Cheddar" },
  { id: "cheese-mussarela", name: "Mussarela" },
]

function OptionsModal({
  item,
  globalExtras,
  onConfirm,
  onClose,
}: {
  item: MenuItem
  globalExtras: GlobalExtra[]
  onConfirm: (selected: SelectedOption[], extras: SelectedExtra[], observations: string) => void
  onClose: () => void
}) {
  const [selected, setSelected] = useState<Record<string, string[]>>({})
  const [extraQtys, setExtraQtys] = useState<Record<string, number>>({})
  const [observations, setObservations] = useState("")
  const [cheeseType, setCheeseType] = useState<string | null>(null)

  const showCheeseSelector = item.cat === "burgers"

  function toggleItem(optionId: string, itemId: string, type: "RADIO" | "CHECKBOX") {
    setSelected((prev) => {
      const current = prev[optionId] ?? []
      if (type === "RADIO") return { ...prev, [optionId]: [itemId] }
      if (current.includes(itemId))
        return { ...prev, [optionId]: current.filter((id) => id !== itemId) }
      return { ...prev, [optionId]: [...current, itemId] }
    })
  }

  function changeExtraQty(extraId: string, delta: number) {
    setExtraQtys((prev) => {
      const next = Math.max(0, (prev[extraId] ?? 0) + delta)
      if (next === 0) {
        const { [extraId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [extraId]: next }
    })
  }

  function canConfirm() {
    const optionsOk = item.options.every(
      (opt) => !opt.required || (selected[opt.id]?.length ?? 0) > 0,
    )
    const cheeseOk = !showCheeseSelector || cheeseType !== null
    return optionsOk && cheeseOk
  }

  function handleConfirm() {
    const selectedOptions: SelectedOption[] = item.options.flatMap((opt) =>
      (selected[opt.id] ?? []).map((itemId) => {
        const optItem = opt.items.find((i) => i.id === itemId)!
        return {
          optionItemId: itemId,
          name: optItem.name,
          additionalPrice: optItem.additionalPrice,
        }
      }),
    )
    if (showCheeseSelector && cheeseType) {
      const cheese = CHEESE_OPTIONS.find((c) => c.id === cheeseType)!
      selectedOptions.push({
        optionItemId: cheeseType,
        name: `Queijo ${cheese.name}`,
        additionalPrice: 0,
      })
    }
    const selectedExtras: SelectedExtra[] = globalExtras
      .filter((e) => (extraQtys[e.id] ?? 0) > 0)
      .map((e) => ({ extraId: e.id, name: e.name, price: e.price, qty: extraQtys[e.id] }))
    onConfirm(selectedOptions, selectedExtras, observations.trim())
  }

  const optionsTotal = item.options
    .flatMap((opt) =>
      (selected[opt.id] ?? []).map(
        (id) => opt.items.find((i) => i.id === id)?.additionalPrice ?? 0,
      ),
    )
    .reduce((a, b) => a + b, 0)

  const extrasTotal = globalExtras.reduce((sum, e) => sum + e.price * (extraQtys[e.id] ?? 0), 0)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl p-6"
        style={{ background: "#1a1612", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3
              className="text-lg font-bold text-white"
              style={{
                fontFamily: "var(--font-bebas)",
                letterSpacing: "0.05em",
                fontSize: "1.5rem",
              }}
            >
              {item.name.replace(/^Mob /i, "")}
            </h3>
            <p className="text-xs text-white/40">{item.description}</p>
          </div>
          <button onClick={onClose} className="ml-3 text-white/30 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Opções específicas do produto */}
          {item.options.map((opt) => (
            <div key={opt.id}>
              <div className="mb-2 flex items-center gap-2">
                <p className="text-sm font-semibold text-white">{opt.label}</p>
                {opt.required && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold text-orange-400"
                    style={{ background: "rgba(249,115,22,0.15)" }}
                  >
                    Obrigatório
                  </span>
                )}
                <span className="text-[10px] text-white/30">
                  {opt.type === "RADIO" ? "Escolha 1" : "Escolha quantos quiser"}
                </span>
              </div>
              <div className="space-y-1.5">
                {opt.items.map((optItem) => {
                  const isSelected = (selected[opt.id] ?? []).includes(optItem.id)
                  return (
                    <button
                      key={optItem.id}
                      onClick={() => toggleItem(opt.id, optItem.id, opt.type)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition"
                      style={{
                        background: isSelected ? "rgba(249,115,22,0.12)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${isSelected ? "rgba(249,115,22,0.35)" : "rgba(255,255,255,0.07)"}`,
                      }}
                    >
                      <div
                        className="flex h-5 w-5 flex-none items-center justify-center rounded-full"
                        style={{
                          background: isSelected ? "#f97316" : "rgba(255,255,255,0.08)",
                          border: isSelected ? "none" : "1px solid rgba(255,255,255,0.15)",
                        }}
                      >
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className="flex-1 text-sm text-white">{optItem.name}</span>
                      {optItem.additionalPrice > 0 && (
                        <span className="text-xs font-semibold text-orange-400">
                          +{fmtPrice(optItem.additionalPrice)}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Tipo de queijo */}
          {showCheeseSelector && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <p className="text-sm font-semibold text-white">Tipo de queijo</p>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold text-orange-400"
                  style={{ background: "rgba(249,115,22,0.15)" }}
                >
                  Obrigatório
                </span>
                <span className="text-[10px] text-white/30">Escolha 1</span>
              </div>
              <div className="space-y-1.5">
                {CHEESE_OPTIONS.map((cheese) => {
                  const isSelected = cheeseType === cheese.id
                  return (
                    <button
                      key={cheese.id}
                      onClick={() => setCheeseType(cheese.id)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition"
                      style={{
                        background: isSelected ? "rgba(249,115,22,0.12)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${isSelected ? "rgba(249,115,22,0.35)" : "rgba(255,255,255,0.07)"}`,
                      }}
                    >
                      <div
                        className="flex h-5 w-5 flex-none items-center justify-center rounded-full"
                        style={{
                          background: isSelected ? "#f97316" : "rgba(255,255,255,0.08)",
                          border: isSelected ? "none" : "1px solid rgba(255,255,255,0.15)",
                        }}
                      >
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className="flex-1 text-sm text-white">{cheese.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Adicionais globais */}
          {globalExtras.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <p className="text-sm font-semibold text-white">Adicionais</p>
                <span className="text-[10px] text-white/30">Adicione o quanto quiser</span>
              </div>
              <div className="space-y-1.5">
                {globalExtras.map((extra) => {
                  const qty = extraQtys[extra.id] ?? 0
                  return (
                    <div
                      key={extra.id}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                      style={{
                        background: qty > 0 ? "rgba(249,115,22,0.10)" : "rgba(255,255,255,0.04)",
                        border: `1px solid ${qty > 0 ? "rgba(249,115,22,0.30)" : "rgba(255,255,255,0.07)"}`,
                        transition: "all 0.15s",
                      }}
                    >
                      <span className="flex-1 text-sm text-white">{extra.name}</span>
                      <span className="text-xs font-semibold text-orange-400">
                        +{fmtPrice(extra.price)}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => changeExtraQty(extra.id, -1)}
                          disabled={qty === 0}
                          className="flex h-6 w-6 items-center justify-center rounded-lg text-orange-400 transition hover:bg-orange-500/20 disabled:opacity-30"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-4 text-center text-sm font-bold text-white">{qty}</span>
                        <button
                          onClick={() => changeExtraQty(extra.id, 1)}
                          className="flex h-6 w-6 items-center justify-center rounded-lg text-orange-400 transition hover:bg-orange-500/20"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Observações por item */}
        <div className="mt-4">
          <p className="mb-1.5 text-xs font-semibold text-white/30">
            Observações deste item (opcional)
          </p>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Ex: sem cebola, sem maionese, alergia..."
            rows={2}
            maxLength={200}
            className="w-full resize-none rounded-xl px-3 py-2.5 text-sm ring-1 ring-white/10 transition outline-none focus:ring-orange-500/50"
            style={{ background: "rgba(255,255,255,0.05)", color: "var(--mob-text-primary)" }}
          />
        </div>

        <button
          onClick={handleConfirm}
          disabled={!canConfirm()}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
        >
          Adicionar à sacola · {fmtPrice(item.priceNum + optionsTotal + extrasTotal)}
        </button>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function comboMinPrice(item: MenuItem): number {
  if (!item.comboConfig) return item.priceNum
  const requiredMin = item.options
    .filter((opt) => opt.required && opt.items.length > 0)
    .reduce((sum, opt) => {
      const min = Math.min(...opt.items.map((i) => i.additionalPrice))
      return sum + (isFinite(min) ? min : 0)
    }, 0)
  return item.priceNum + requiredMin
}

// ─── ProductCard ─────────────────────────────────────────────────────────────

function ProductCard({ item, globalExtras }: { item: MenuItem; globalExtras: GlobalExtra[] }) {
  const add = useCart((s) => s.add)
  const { isFavorite, toggle: toggleFavorite } = useFavorites()
  const [showModal, setShowModal] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const fav = isFavorite(item.id)

  function handleAdd() {
    setShowModal(true)
  }

  function handleModalConfirm(
    selectedOptions: SelectedOption[],
    selectedExtras: SelectedExtra[],
    observations: string,
  ) {
    const optionsPrice = selectedOptions.reduce((sum, o) => sum + o.additionalPrice, 0)
    const extrasPrice = selectedExtras.reduce((sum, e) => sum + e.price * e.qty, 0)
    const totalNum = item.priceNum + optionsPrice + extrasPrice
    const obsSlug = observations ? `:obs:${observations.slice(0, 20).replace(/\s+/g, "_")}` : ""
    const extrasSlug = selectedExtras.length
      ? `:x:${selectedExtras
          .map((e) => `${e.extraId}x${e.qty}`)
          .sort()
          .join(":")}`
      : ""
    const cartId = selectedOptions.length
      ? `${item.id}:${selectedOptions
          .map((o) => o.optionItemId)
          .sort()
          .join(":")}${extrasSlug}${obsSlug}`
      : `${item.id}${extrasSlug}${obsSlug}`
    add({
      id: cartId,
      productId: item.id,
      name: item.name,
      price: fmtPrice(totalNum),
      priceNum: totalNum,
      img: item.img ?? undefined,
      description: item.description,
      options: selectedOptions,
      extras: selectedExtras.length ? selectedExtras : undefined,
      observations: observations || undefined,
    })
    setShowModal(false)
  }

  return (
    <>
      <div
        className="group/card relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:translate-y-[-2px]"
        style={{
          background: "var(--mob-s1)",
          border: "1px solid var(--mob-b1)",
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
            <>
              {!imgLoaded && (
                <div
                  className="absolute inset-0 animate-pulse"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(249,115,22,0.07) 0%, rgba(10,8,6,0.9) 100%)",
                  }}
                />
              )}
              <Image
                src={item.img}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className={`object-cover transition-all duration-500 group-hover/card:scale-[1.06] ${imgLoaded ? "opacity-100" : "opacity-0"} ${!item.inStock ? "brightness-50" : ""}`}
                onLoad={() => setImgLoaded(true)}
              />
            </>
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 60%, rgba(249,115,22,0.12) 0%, transparent 70%)",
              }}
            >
              <span className="text-6xl opacity-40">🍔</span>
            </div>
          )}
          {!item.inStock && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="rounded-full px-3 py-1 text-xs font-bold tracking-widest text-white uppercase"
                style={{
                  background: "rgba(0,0,0,0.7)",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                Esgotado
              </span>
            </div>
          )}

          {/* Coração — favoritar */}
          <button
            aria-label={fav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            onClick={(e) => {
              e.stopPropagation()
              toggleFavorite(item.id)
            }}
            className="absolute top-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full transition-all active:scale-90"
            style={{
              background: fav ? "rgba(220,0,0,0.85)" : "rgba(0,0,0,0.55)",
              backdropFilter: "blur(6px)",
              boxShadow: fav ? "0 0 12px rgba(220,0,0,0.5)" : "none",
              border: fav
                ? "1.5px solid rgba(255,80,80,0.6)"
                : "1.5px solid rgba(255,255,255,0.15)",
            }}
          >
            <Heart
              className="h-4 w-4 transition-all"
              fill={fav ? "#fff" : "none"}
              stroke={fav ? "#fff" : "rgba(255,255,255,0.7)"}
            />
          </button>
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3
            className="leading-none text-white"
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "1.25rem",
              letterSpacing: "0.07em",
            }}
          >
            {item.name.replace(/^Mob /i, "")}
          </h3>

          {item.description && (
            <p className="line-clamp-2 text-[13px] leading-relaxed font-medium text-white/70">
              {item.description}
            </p>
          )}

          {item.comboConfig && (
            <div className="flex flex-wrap gap-1">
              {item.comboConfig.numBurgers > 0 && (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-orange-300"
                  style={{ background: "rgba(249,115,22,0.12)" }}
                >
                  🍔 {item.comboConfig.numBurgers}× lanche
                </span>
              )}
              {item.comboConfig.numDrinks > 0 && (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-orange-300"
                  style={{ background: "rgba(249,115,22,0.12)" }}
                >
                  🥤 {item.comboConfig.numDrinks}× bebida
                </span>
              )}
            </div>
          )}

          <div className="mt-auto flex items-center gap-3 pt-2">
            <div className="shrink-0">
              {item.comboConfig ? (
                <div>
                  <p
                    className={`text-[10px] leading-none font-semibold ${item.inStock ? "text-white/40" : "text-white/20"}`}
                  >
                    a partir de
                  </p>
                  <span
                    className={`text-base font-bold ${item.inStock ? "text-orange-400" : "text-white/30"}`}
                  >
                    {fmtPrice(comboMinPrice(item))}
                  </span>
                </div>
              ) : (
                <span
                  className={`text-base font-bold ${item.inStock ? "text-orange-400" : "text-white/30"}`}
                >
                  {item.price}
                </span>
              )}
            </div>

            {!item.inStock ? (
              <span className="flex-1 text-right text-xs font-semibold text-white/30">
                Indisponível
              </span>
            ) : (
              <button
                onClick={handleAdd}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition active:scale-[0.97]"
                style={{
                  background: "linear-gradient(135deg, #f97316, #ea580c)",
                  boxShadow: "0 4px 16px rgba(249,115,22,0.4)",
                }}
              >
                <ShoppingBag className="h-4 w-4" />
                Pedir
              </button>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <OptionsModal
          item={item}
          globalExtras={globalExtras}
          onConfirm={handleModalConfirm}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}

// ─── CartDrawer ───────────────────────────────────────────────────────────────

function CartDrawer() {
  const { isOpen, closeCart, items, increment, decrement, clear, total } = useCart()

  const totalVal = total()
  const hasItems = items.length > 0

  // Fecha com ESC
  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeCart()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [isOpen, closeCart])

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={closeCart} />
      )}

      <div
        className="mob-on-dark fixed top-0 right-0 bottom-0 z-50 flex w-full max-w-sm flex-col"
        style={{
          background: "rgba(14,12,10,0.97)",
          borderLeft: "1px solid var(--mob-b1)",
          backdropFilter: "blur(24px)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--mob-b1)" }}
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
            aria-label="Fechar sacola"
            onClick={closeCart}
            className="rounded-lg p-1.5 text-white/40 transition hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

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
                  style={{ background: "var(--mob-s1)", border: "1px solid var(--mob-b1)" }}
                >
                  <div className="relative h-14 w-14 flex-none overflow-hidden rounded-lg bg-black/30">
                    {entry.img && (
                      <Image src={entry.img} alt={entry.name} fill className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">
                      {entry.name.replace(/^Mob /i, "")}
                    </p>
                    <p className="text-xs text-orange-400">
                      {fmtPrice(entry.priceNum * entry.qty)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      aria-label={
                        entry.qty === 1 ? "Remover item da sacola" : "Diminuir quantidade"
                      }
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
                      aria-label="Aumentar quantidade"
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

        {hasItems && (
          <div className="px-5 py-5" style={{ borderTop: "1px solid var(--mob-b1)" }}>
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

// ─── CartBar ──────────────────────────────────────────────────────────────────

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
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-orange-600"
          style={{ background: "var(--mob-t25)" }}
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

function CardapioContent() {
  const searchParams = useSearchParams()
  const { categories: rawCats, loading: menuLoading } = useMenu()

  const allItems = useMemo<MenuItem[]>(
    () =>
      rawCats.flatMap((cat) =>
        cat.products.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description ?? "",
          price: `R$ ${p.price.toFixed(2).replace(".", ",")}`,
          priceNum: p.price,
          img: p.imageUrl,
          cat: cat.slug,
          inStock: p.inStock ?? true,
          options: (p.options ?? []) as ProductOption[],
          comboConfig: p.comboConfig ?? null,
        })),
      ),
    [rawCats],
  )

  const categories = useMemo<MenuCategory[]>(
    () => [
      { slug: "todos", name: "Todos" },
      ...rawCats.map((c) => ({ slug: c.slug, name: c.name })),
    ],
    [rawCats],
  )

  const maxPriceLimit = useMemo(
    () => Math.ceil(Math.max(...allItems.map((i) => i.priceNum), 50)),
    [allItems],
  )

  const [globalExtras, setGlobalExtras] = useState<GlobalExtra[]>([])

  useEffect(() => {
    fetch("/api/backend/extras")
      .then((r) => r.json())
      .then((j) => setGlobalExtras(j.data ?? []))
      .catch(() => {})
  }, [])

  const { isFavorite } = useFavorites()
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState(() => searchParams.get("cat") ?? "todos")
  const [maxPrice, setMaxPrice] = useState<number | null>(null)
  const [onlyFavs, setOnlyFavs] = useState(false)

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return allItems.filter((item) => {
      if (onlyFavs && !isFavorite(item.id)) return false
      if (category !== "todos" && item.cat !== category) return false
      if (maxPrice !== null && item.priceNum > maxPrice) return false
      if (!q) return true
      return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
    })
  }, [allItems, query, category, maxPrice, onlyFavs, isFavorite])

  const inputCls =
    "w-full rounded-xl py-2.5 text-sm ring-1 ring-white/10 transition outline-none focus:ring-orange-500/50"

  return (
    <>
      <main className="mx-auto max-w-7xl px-6 pt-10 pb-32">
        {/* Título */}
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

        {/* Filtros */}
        <div
          className="mob-on-dark sticky top-[64px] z-20 mb-8 space-y-4 rounded-2xl p-4"
          style={{
            background: "rgba(12,11,9,0.85)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid var(--mob-b1)",
          }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search
                className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                style={{ color: "var(--mob-text-tertiary)" }}
              />
              <input
                type="text"
                placeholder="Buscar por nome ou descrição..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={`${inputCls} pr-4 pl-9`}
                style={{ background: "var(--mob-input-bg)", color: "var(--mob-text-primary)" }}
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

            <div className="flex shrink-0 items-center gap-3 sm:w-56">
              <span
                className="text-xs whitespace-nowrap"
                style={{ color: "var(--mob-text-tertiary)" }}
              >
                Até
              </span>
              <input
                type="range"
                min={0}
                max={maxPriceLimit}
                step={1}
                value={maxPrice ?? maxPriceLimit}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="flex-1 accent-orange-500"
              />
              <span className="w-14 text-right text-xs font-semibold whitespace-nowrap text-orange-400">
                {maxPrice === null || maxPrice >= maxPriceLimit ? "Máx" : fmtPrice(maxPrice)}
              </span>
            </div>
          </div>

          {/* Pills de categoria */}
          <div className="flex flex-wrap gap-2">
            {/* Pill Favoritos */}
            <button
              onClick={() => setOnlyFavs((v) => !v)}
              className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all"
              style={
                onlyFavs
                  ? {
                      background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                      color: "#fff",
                      boxShadow: "0 2px 10px rgba(220,38,38,0.4)",
                    }
                  : {
                      background: "var(--mob-pill-inactive-bg)",
                      color: "var(--mob-pill-inactive-text)",
                      border: "1px solid var(--mob-b1)",
                    }
              }
            >
              <Heart className="h-3 w-3" fill={onlyFavs ? "#fff" : "none"} />
              Favoritos
            </button>

            {categories.map((cat) => {
              const active = category === cat.slug
              return (
                <button
                  key={cat.slug}
                  onClick={() => setCategory(cat.slug)}
                  className="rounded-full px-4 py-1.5 text-xs font-semibold transition-all"
                  style={
                    active
                      ? { background: "linear-gradient(135deg, #f97316, #ea580c)", color: "#fff" }
                      : {
                          background: "var(--mob-pill-inactive-bg)",
                          color: "var(--mob-pill-inactive-text)",
                          border: "1px solid var(--mob-b1)",
                        }
                  }
                >
                  {cat.name}
                </button>
              )
            })}
            <span
              className="ml-auto self-center text-xs"
              style={{ color: "var(--mob-text-tertiary)" }}
            >
              {filtered.length} {filtered.length === 1 ? "item" : "itens"}
            </span>
          </div>
        </div>

        {/* Grid */}
        {menuLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <p className="text-4xl">🔍</p>
            <p className="text-sm text-white/30">
              Nenhum item encontrado para os filtros aplicados.
            </p>
            <button
              onClick={() => {
                setQuery("")
                setCategory("todos")
                setMaxPrice(null)
                setOnlyFavs(false)
              }}
              className="mt-1 text-xs text-orange-400 hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <ProductCard key={item.id} item={item} globalExtras={globalExtras} />
            ))}
          </div>
        )}
      </main>

      <CartDrawer />
      <CartBar />
    </>
  )
}

export default function CardapioPage() {
  return (
    <Suspense>
      <CardapioContent />
    </Suspense>
  )
}
