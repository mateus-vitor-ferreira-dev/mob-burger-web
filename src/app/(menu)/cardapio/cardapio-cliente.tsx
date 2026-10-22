"use client"

import { useCart, type SelectedExtra, type SelectedOption } from "@/lib/cart-store"
import { useFavorites } from "@/lib/use-favorites"
import {
  MenuInicialProvider,
  useMenu,
  type ComboConfig,
  type MenuCategory as CategoriaDoMenu,
} from "@/lib/use-menu"
import { fmtPrice } from "@/lib/utils"
import { useDialog } from "@/lib/use-dialog"
import { useHydrated } from "@/lib/use-hydrated"
import { Portal } from "@/components/portal"
import {
  CakeSlice,
  Check,
  ChevronRight,
  CupSoda,
  Hamburger,
  Heart,
  Minus,
  Plus,
  Search,
  SearchX,
  ShoppingBag,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useId, useMemo, useRef, useState } from "react"

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
      aria-hidden
      className="flex flex-row overflow-hidden rounded-2xl sm:flex-col"
      style={{ background: "var(--mob-s1)", border: "1px solid var(--mob-b1)" }}
    >
      <div
        className="min-h-36 w-32 flex-none animate-pulse sm:h-48 sm:min-h-0 sm:w-full"
        style={{ background: "var(--mob-s2)" }}
      />
      <div className="flex flex-1 flex-col gap-3 p-4">
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
  const [previewImage, setPreviewImage] = useState<string | null>(item.img)
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const obsId = useId()
  useDialog(true, onClose, panelRef)

  const { categories } = useMenu()
  const productInfoMap = useMemo(() => {
    const map = new Map<
      string,
      { description: string | null; imageUrl: string | null; inStock: boolean }
    >()
    categories.forEach((c) =>
      c.products.forEach((p) =>
        map.set(p.name, {
          description: p.description,
          imageUrl: p.imageUrl,
          inStock: p.inStock ?? true,
        }),
      ),
    )
    return map
  }, [categories])

  const showCheeseSelector = item.cat === "burgers"

  function toggleItem(
    optionId: string,
    itemId: string,
    type: "RADIO" | "CHECKBOX",
    optLabel?: string,
    itemName?: string,
  ) {
    setSelected((prev) => {
      const current = prev[optionId] ?? []
      if (type === "RADIO") return { ...prev, [optionId]: [itemId] }
      if (current.includes(itemId))
        return { ...prev, [optionId]: current.filter((id) => id !== itemId) }
      return { ...prev, [optionId]: [...current, itemId] }
    })
    // Para combos: atualiza preview com imagem do lanche selecionado
    if (item.comboConfig && optLabel?.toLowerCase().includes("lanche") && itemName) {
      const info = productInfoMap.get(itemName)
      if (info?.imageUrl) setPreviewImage(info.imageUrl)
    }
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
    // Celular: bottom sheet colado na base; a partir de 640px: modal centralizado
    <Portal>
      <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
        <div
          aria-hidden
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className="relative flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl outline-none sm:max-h-[85dvh] sm:rounded-2xl"
          style={{ background: "#1a1612", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <div className="flex-1 overflow-y-auto overscroll-contain p-6 pb-4">
            {/* Imagem de preview — dinâmica para combos */}
            {previewImage && (
              <div className="relative -mx-6 -mt-6 mb-5 h-44 w-[calc(100%+3rem)] overflow-hidden sm:h-52">
                <Image
                  src={previewImage}
                  alt=""
                  fill
                  sizes="448px"
                  className="object-cover transition-all duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#1a1612] via-transparent to-transparent" />
              </div>
            )}

            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2
                  id={titleId}
                  className="text-lg font-bold text-white"
                  style={{
                    fontFamily: "var(--font-bebas)",
                    letterSpacing: "0.05em",
                    fontSize: "1.5rem",
                  }}
                >
                  {item.name.replace(/^Mob /i, "")}
                </h2>
                <p className="text-sm leading-relaxed text-white/60">{item.description}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="-mt-1 -mr-2 ml-3 flex h-11 w-11 flex-none items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                <X aria-hidden className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Opções específicas do produto */}
              {item.options.map((opt) => {
                // Para combos: ordenar por preço crescente (incluído primeiro) e mostrar delta
                const sortedItems = item.comboConfig
                  ? [...opt.items].sort((a, b) => a.additionalPrice - b.additionalPrice)
                  : opt.items
                const minOptPrice = item.comboConfig
                  ? Math.min(...opt.items.map((i) => i.additionalPrice))
                  : 0
                return (
                  <div
                    key={opt.id}
                    role={opt.type === "RADIO" ? "radiogroup" : "group"}
                    aria-labelledby={`${titleId}-${opt.id}`}
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <p id={`${titleId}-${opt.id}`} className="text-sm font-semibold text-white">
                        {opt.label}
                      </p>
                      {opt.required && (
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-bold text-orange-400"
                          style={{ background: "rgba(249,115,22,0.15)" }}
                        >
                          Obrigatório
                        </span>
                      )}
                      <span className="text-xs text-white/50">
                        {opt.type === "RADIO" ? "Escolha 1" : "Escolha quantos quiser"}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {sortedItems.map((optItem) => {
                        const isSelected = (selected[opt.id] ?? []).includes(optItem.id)
                        const displayDelta = item.comboConfig
                          ? optItem.additionalPrice - minOptPrice
                          : optItem.additionalPrice
                        const info = item.comboConfig ? productInfoMap.get(optItem.name) : null
                        // Item esgotado: produto explicitamente fora de estoque no menu
                        const isOos = item.comboConfig != null && info != null && !info.inStock
                        return (
                          <button
                            key={optItem.id}
                            type="button"
                            role={opt.type === "RADIO" ? "radio" : "checkbox"}
                            aria-checked={isSelected}
                            onClick={() =>
                              !isOos &&
                              toggleItem(opt.id, optItem.id, opt.type, opt.label, optItem.name)
                            }
                            disabled={isOos}
                            className="flex min-h-12 w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition disabled:cursor-not-allowed disabled:opacity-40"
                            style={{
                              background: isSelected
                                ? "rgba(249,115,22,0.12)"
                                : "rgba(255,255,255,0.04)",
                              border: `1px solid ${isSelected ? "rgba(249,115,22,0.35)" : "rgba(255,255,255,0.07)"}`,
                            }}
                          >
                            {/* Thumbnail */}
                            {info && (
                              <div className="relative h-10 w-10 flex-none overflow-hidden rounded-lg bg-black/40">
                                {info.imageUrl ? (
                                  <Image
                                    src={info.imageUrl}
                                    alt=""
                                    fill
                                    sizes="40px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <span className="flex h-full w-full items-center justify-center">
                                    <Hamburger aria-hidden className="h-5 w-5 text-orange-400/70" />
                                  </span>
                                )}
                              </div>
                            )}
                            {/* Radio */}
                            <div
                              aria-hidden
                              className={`flex h-5 w-5 flex-none items-center justify-center ${opt.type === "RADIO" ? "rounded-full" : "rounded-md"}`}
                              style={{
                                background: isSelected ? "#f97316" : "rgba(255,255,255,0.08)",
                                border: isSelected ? "none" : "1px solid rgba(255,255,255,0.3)",
                              }}
                            >
                              {isSelected && <Check className="h-3 w-3 text-white" />}
                            </div>
                            {/* Nome + descrição */}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm leading-tight font-semibold text-white">
                                {optItem.name.replace(/^Mob /i, "")}
                              </p>
                              {info?.description && (
                                <p className="mt-0.5 line-clamp-1 text-xs leading-tight text-white/55">
                                  {info.description}
                                </p>
                              )}
                            </div>
                            {/* Preço delta / esgotado */}
                            {isOos ? (
                              <span className="shrink-0 text-xs font-semibold text-red-400/70">
                                Esgotado
                              </span>
                            ) : displayDelta > 0 ? (
                              <span className="shrink-0 text-xs font-semibold text-orange-400">
                                +{fmtPrice(displayDelta)}
                              </span>
                            ) : item.comboConfig ? (
                              <span className="shrink-0 text-xs font-semibold text-white/50">
                                incluído
                              </span>
                            ) : null}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}

              {/* Tipo de queijo */}
              {showCheeseSelector && (
                <div role="radiogroup" aria-labelledby={`${titleId}-queijo`}>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <p id={`${titleId}-queijo`} className="text-sm font-semibold text-white">
                      Tipo de queijo
                    </p>
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-bold text-orange-400"
                      style={{ background: "rgba(249,115,22,0.15)" }}
                    >
                      Obrigatório
                    </span>
                    <span className="text-xs text-white/50">Escolha 1</span>
                  </div>
                  <div className="space-y-1.5">
                    {CHEESE_OPTIONS.map((cheese) => {
                      const isSelected = cheeseType === cheese.id
                      return (
                        <button
                          key={cheese.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => setCheeseType(cheese.id)}
                          className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition"
                          style={{
                            background: isSelected
                              ? "rgba(249,115,22,0.12)"
                              : "rgba(255,255,255,0.04)",
                            border: `1px solid ${isSelected ? "rgba(249,115,22,0.35)" : "rgba(255,255,255,0.07)"}`,
                          }}
                        >
                          <div
                            aria-hidden
                            className="flex h-5 w-5 flex-none items-center justify-center rounded-full"
                            style={{
                              background: isSelected ? "#f97316" : "rgba(255,255,255,0.08)",
                              border: isSelected ? "none" : "1px solid rgba(255,255,255,0.3)",
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
                    <span className="text-xs text-white/50">Adicione o quanto quiser</span>
                  </div>
                  <div className="space-y-1.5">
                    {globalExtras.map((extra) => {
                      const qty = extraQtys[extra.id] ?? 0
                      return (
                        <div
                          key={extra.id}
                          className="flex items-center gap-3 rounded-xl py-1.5 pr-1.5 pl-3"
                          style={{
                            background:
                              qty > 0 ? "rgba(249,115,22,0.10)" : "rgba(255,255,255,0.04)",
                            border: `1px solid ${qty > 0 ? "rgba(249,115,22,0.30)" : "rgba(255,255,255,0.07)"}`,
                            transition: "all 0.15s",
                          }}
                        >
                          <span className="flex-1 text-sm text-white">{extra.name}</span>
                          <span className="text-xs font-semibold text-orange-400">
                            +{fmtPrice(extra.price)}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => changeExtraQty(extra.id, -1)}
                              disabled={qty === 0}
                              aria-label={`Remover um ${extra.name}`}
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-orange-400 transition hover:bg-orange-500/20 disabled:opacity-30"
                            >
                              <Minus aria-hidden className="h-4 w-4" />
                            </button>
                            <span
                              aria-live="polite"
                              className="w-5 text-center text-sm font-bold text-white"
                            >
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => changeExtraQty(extra.id, 1)}
                              aria-label={`Adicionar um ${extra.name}`}
                              className="flex h-9 w-9 items-center justify-center rounded-lg text-orange-400 transition hover:bg-orange-500/20"
                            >
                              <Plus aria-hidden className="h-4 w-4" />
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
              <label htmlFor={obsId} className="mb-1.5 block text-xs font-semibold text-white/60">
                Observações deste item (opcional)
              </label>
              <textarea
                id={obsId}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Ex: sem cebola, sem maionese, alergia..."
                rows={2}
                maxLength={200}
                className="w-full resize-none rounded-xl px-3 py-2.5 text-base ring-1 ring-white/10 transition outline-none focus:ring-orange-500/50 sm:text-sm"
                style={{ background: "rgba(255,255,255,0.05)", color: "var(--mob-text-primary)" }}
              />
            </div>

            {/* Progress indicator — combos e seletor de queijo */}
            {(item.comboConfig || showCheeseSelector) &&
              (() => {
                const requiredGroups: { id: string; label: string; filled: boolean }[] = [
                  ...item.options
                    .filter((o) => o.required)
                    .map((o) => ({
                      id: o.id,
                      label: o.label,
                      filled: (selected[o.id]?.length ?? 0) > 0,
                    })),
                  ...(showCheeseSelector
                    ? [{ id: "__cheese__", label: "Queijo", filled: cheeseType !== null }]
                    : []),
                ]
                const filledCount = requiredGroups.filter((g) => g.filled).length
                const allDone = filledCount === requiredGroups.length

                function chipLabel(label: string): { icon: LucideIcon | null; text: string } {
                  if (/^escolha o lanche/i.test(label)) return { icon: Hamburger, text: "Lanche" }
                  if (/^lanche/i.test(label))
                    return { icon: Hamburger, text: label.replace(/^escolha a?o?\s*/i, "") }
                  if (/^escolha a bebida/i.test(label)) return { icon: CupSoda, text: "Bebida" }
                  if (/^bebida/i.test(label)) return { icon: CupSoda, text: label }
                  if (/^escolha a sobremesa/i.test(label))
                    return { icon: CakeSlice, text: "Sobremesa" }
                  if (/^sobremesa/i.test(label)) return { icon: CakeSlice, text: label }
                  if (/queijo/i.test(label)) return { icon: null, text: "Queijo" }
                  return { icon: null, text: label }
                }

                return (
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p aria-live="polite" className="text-xs text-white/60">
                        {allDone
                          ? "Tudo selecionado!"
                          : `${filledCount} de ${requiredGroups.length} obrigatórios`}
                      </p>
                      {/* Mini progress bar */}
                      <div
                        aria-hidden
                        className="h-1 w-24 overflow-hidden rounded-full bg-white/10"
                      >
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${(filledCount / requiredGroups.length) * 100}%`,
                            background: allDone
                              ? "linear-gradient(90deg, #4ade80, #22c55e)"
                              : "linear-gradient(90deg, #f97316, #ea580c)",
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {requiredGroups.map((g) => {
                        const { icon: ChipIcon, text } = chipLabel(g.label)
                        return (
                          <div
                            key={g.id}
                            className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-all"
                            style={
                              g.filled
                                ? {
                                    background: "rgba(249,115,22,0.15)",
                                    color: "#f97316",
                                    border: "1px solid rgba(249,115,22,0.3)",
                                  }
                                : {
                                    background: "rgba(255,255,255,0.04)",
                                    color: "rgba(255,255,255,0.55)",
                                    border: "1px solid rgba(255,255,255,0.07)",
                                  }
                            }
                          >
                            {g.filled ? (
                              <Check aria-hidden className="h-3 w-3 shrink-0" />
                            ) : (
                              <span
                                aria-hidden
                                className="h-3 w-3 shrink-0 text-center leading-none"
                              >
                                ·
                              </span>
                            )}
                            {ChipIcon && <ChipIcon aria-hidden className="h-3.5 w-3.5 shrink-0" />}
                            {text}
                            <span className="sr-only">
                              {g.filled ? " (escolhido)" : " (pendente)"}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}
          </div>

          {/* Rodapé fixo: o botão de adicionar fica sempre à vista enquanto as opções rolam */}
          <div
            className="flex-none border-t px-6 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]"
            style={{ borderColor: "rgba(255,255,255,0.08)", background: "#1a1612" }}
          >
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!canConfirm()}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition disabled:opacity-40"
              style={{ background: "var(--mob-cta-gradient)" }}
            >
              Adicionar à sacola · {fmtPrice(item.priceNum + optionsTotal + extrasTotal)}
            </button>
          </div>
        </div>
      </div>
    </Portal>
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

/** Quantos cards do topo carregam a foto na hora (os que cabem na primeira tela). */
const PRIMEIRAS_FOTOS = 4

function ProductCard({
  item,
  globalExtras,
  destaque = false,
}: {
  item: MenuItem
  globalExtras: GlobalExtra[]
  /** Card do topo da lista: a foto carrega na hora, com prioridade (é o que aparece primeiro). */
  destaque?: boolean
}) {
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
      {/* Celular: card horizontal (foto à esquerda) — o cardápio cabe em bem menos rolagem.
          A partir de 640px volta ao card vertical em grid */}
      <article
        aria-labelledby={`produto-${item.id}`}
        className="group/card relative flex flex-row overflow-hidden rounded-2xl transition-all duration-300 sm:flex-col sm:hover:-translate-y-0.5"
        style={{
          background: "var(--mob-s1)",
          border: "1px solid var(--mob-b1)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
        }}
      >
        {/* Orange top accent */}
        <div
          aria-hidden
          className="absolute top-0 right-0 left-0 z-10 h-0.5"
          style={{ background: "linear-gradient(to right, #f97316, #ea580c)" }}
        />

        {/* Imagem */}
        <div className="relative min-h-36 w-32 flex-none overflow-hidden bg-black/30 sm:h-48 sm:min-h-0 sm:w-full">
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
                alt=""
                fill
                sizes="(max-width: 640px) 128px, (max-width: 1024px) 50vw, 33vw"
                loading={destaque ? "eager" : "lazy"}
                fetchPriority={destaque ? "high" : "auto"}
                className={`object-cover transition-all duration-500 group-hover/card:scale-[1.06] ${imgLoaded || destaque ? "opacity-100" : "opacity-0"} ${!item.inStock ? "brightness-50" : ""}`}
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
              <Hamburger aria-hidden className="h-12 w-12 text-orange-400/40" />
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
            type="button"
            aria-label={`${item.name}: ${fav ? "remover dos favoritos" : "adicionar aos favoritos"}`}
            aria-pressed={fav}
            onClick={(e) => {
              e.stopPropagation()
              toggleFavorite(item.id)
            }}
            className="absolute top-2 right-2 z-10 flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-90 sm:top-2.5 sm:right-2.5"
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
              aria-hidden
              className="h-4 w-4 transition-all"
              fill={fav ? "#fff" : "none"}
              stroke={fav ? "#fff" : "rgba(255,255,255,0.7)"}
            />
          </button>
        </div>

        {/* Info */}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-3 sm:gap-2 sm:p-4">
          <h3
            id={`produto-${item.id}`}
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
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold text-orange-300"
                  style={{ background: "rgba(249,115,22,0.12)" }}
                >
                  <Hamburger aria-hidden className="h-3 w-3" />
                  {item.comboConfig.numBurgers}× lanche
                </span>
              )}
              {item.comboConfig.numDrinks > 0 && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold text-orange-300"
                  style={{ background: "rgba(249,115,22,0.12)" }}
                >
                  <CupSoda aria-hidden className="h-3 w-3" />
                  {item.comboConfig.numDrinks}× bebida
                </span>
              )}
            </div>
          )}

          <div className="mt-auto flex items-center gap-2 pt-1 sm:gap-3 sm:pt-2">
            <div className="shrink-0">
              {item.comboConfig ? (
                <div>
                  <p
                    className={`text-xs leading-none font-semibold ${item.inStock ? "text-white/40" : "text-white/20"}`}
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
              <span className="flex-1 text-right text-xs font-semibold text-white/50">
                Indisponível
              </span>
            ) : (
              <button
                type="button"
                onClick={handleAdd}
                aria-haspopup="dialog"
                aria-label={`Pedir ${item.name}`}
                className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition active:scale-[0.97]"
                style={{
                  background: "var(--mob-cta-gradient)",
                  boxShadow: "0 4px 16px rgba(249,115,22,0.4)",
                }}
              >
                <ShoppingBag aria-hidden className="h-4 w-4" />
                Pedir
              </button>
            )}
          </div>
        </div>
      </article>

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
  const panelRef = useRef<HTMLDivElement>(null)
  // Esc, foco preso, trava de scroll e foco devolvido ao fechar
  useDialog(isOpen, closeCart, panelRef)

  return (
    <Portal>
      {isOpen && (
        <div
          aria-hidden
          className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm"
          onClick={closeCart}
        />
      )}

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Sua sacola"
        tabIndex={-1}
        // Fechada: fora da árvore de acessibilidade e do Tab (antes era só translateX)
        inert={!isOpen}
        className="mob-on-dark fixed top-0 right-0 bottom-0 z-[60] flex w-full max-w-sm flex-col outline-none"
        style={{
          background: "rgba(14,12,10,0.97)",
          borderLeft: "1px solid var(--mob-b1)",
          backdropFilter: "blur(24px)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
          pointerEvents: isOpen ? "auto" : "none",
        }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--mob-b1)" }}
        >
          <div className="flex items-center gap-2">
            <ShoppingBag aria-hidden className="h-5 w-5 text-orange-400" />
            <h2
              className="text-white"
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: "1.4rem",
                letterSpacing: "0.08em",
              }}
            >
              Sua Sacola
            </h2>
          </div>
          <button
            type="button"
            aria-label="Fechar sacola"
            onClick={closeCart}
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/5 hover:text-white"
          >
            <X aria-hidden className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!hasItems ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <ShoppingBag aria-hidden className="h-12 w-12 text-white/10" />
              <p className="text-sm text-white/50">Sua sacola está vazia</p>
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
                      <Image src={entry.img} alt="" fill sizes="56px" className="object-cover" />
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
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      aria-label={
                        entry.qty === 1
                          ? `Remover ${entry.name} da sacola`
                          : `Diminuir quantidade de ${entry.name}`
                      }
                      onClick={() => decrement(entry.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white active:scale-90"
                    >
                      {entry.qty === 1 ? (
                        <Trash2 aria-hidden className="h-4 w-4 text-red-400" />
                      ) : (
                        <Minus aria-hidden className="h-4 w-4" />
                      )}
                    </button>
                    <span
                      aria-live="polite"
                      className="w-5 text-center text-sm font-bold text-white"
                    >
                      {entry.qty}
                    </span>
                    <button
                      type="button"
                      aria-label={`Aumentar quantidade de ${entry.name}`}
                      onClick={() => increment(entry.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-white/60 transition hover:bg-white/10 hover:text-white active:scale-90"
                    >
                      <Plus aria-hidden className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {hasItems && (
          <div
            className="px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
            style={{ borderTop: "1px solid var(--mob-b1)" }}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-white/50">Total</span>
              <span className="text-lg font-bold text-white">{fmtPrice(totalVal)}</span>
            </div>
            <Link
              href="/carrinho"
              className="block w-full rounded-xl py-3.5 text-center text-sm font-bold text-white transition active:scale-[0.98]"
              style={{
                background: "var(--mob-cta-gradient)",
                boxShadow: "0 6px 20px rgba(249,115,22,0.35)",
              }}
            >
              Finalizar pedido
            </Link>
            <button
              type="button"
              onClick={clear}
              className="mt-2 min-h-11 w-full py-2 text-xs text-white/60 transition hover:text-white/80"
            >
              Limpar sacola
            </button>
          </div>
        )}
      </div>
    </Portal>
  )
}

// ─── CartBar ──────────────────────────────────────────────────────────────────

function CartBar() {
  const hydrated = useHydrated()
  const count = useCart((s) => s.count())
  const total = useCart((s) => s.total())

  if (!hydrated || count === 0) return null

  return (
    <div className="fixed right-0 bottom-0 left-0 z-30 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <Link
        href="/carrinho"
        aria-label={`Ver sacola: ${count} ${count === 1 ? "item" : "itens"}, ${fmtPrice(total)}`}
        className="mx-auto flex w-full max-w-lg items-center rounded-2xl px-4 py-3.5 transition active:scale-[0.98]"
        style={{
          background: "var(--mob-cta-gradient)",
          boxShadow: "0 8px 32px rgba(249,115,22,0.4)",
        }}
      >
        <div
          aria-hidden
          className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-white px-1.5 text-xs font-bold text-orange-700"
        >
          {count}
        </div>
        <span aria-hidden className="flex-1 text-center text-sm font-bold text-white">
          Ver sacola
        </span>
        <span aria-hidden className="text-sm font-bold text-white">
          {fmtPrice(total)}
        </span>
        <ChevronRight aria-hidden className="ml-1 h-4 w-4 text-white" />
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
      <div className="mx-auto max-w-7xl px-4 pt-8 pb-32 sm:px-6 sm:pt-10">
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
        {/* Fixo só a partir de 640px: no celular ocupava ~1/3 da tela enquanto rolava */}
        <search
          aria-label="Filtrar cardápio"
          className="mob-on-dark z-20 mb-6 block space-y-3 rounded-2xl p-3 sm:sticky sm:top-[calc(var(--app-header-h,4rem)+0.5rem)] sm:mb-8 sm:space-y-4 sm:p-4"
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
                aria-hidden
                className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                style={{ color: "var(--mob-text-tertiary)" }}
              />
              <input
                type="search"
                aria-label="Buscar no cardápio"
                enterKeyHint="search"
                placeholder="Buscar por nome ou descrição..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={`${inputCls} pr-11 pl-9 [&::-webkit-search-cancel-button]:hidden`}
                style={{ background: "var(--mob-input-bg)", color: "var(--mob-text-primary)" }}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Limpar busca"
                  className="absolute top-1/2 right-0.5 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-white/60 hover:text-white"
                >
                  <X aria-hidden className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-3 sm:w-56">
              <label
                htmlFor="filtro-preco"
                className="text-xs whitespace-nowrap"
                style={{ color: "var(--mob-text-tertiary)" }}
              >
                Até
              </label>
              <input
                id="filtro-preco"
                type="range"
                min={0}
                max={maxPriceLimit}
                step={1}
                value={maxPrice ?? maxPriceLimit}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                aria-valuetext={
                  maxPrice === null || maxPrice >= maxPriceLimit
                    ? "Sem limite de preço"
                    : `Até ${fmtPrice(maxPrice)}`
                }
                className="h-10 flex-1 accent-orange-500"
              />
              <span className="w-14 text-right text-xs font-semibold whitespace-nowrap text-orange-400">
                {maxPrice === null || maxPrice >= maxPriceLimit ? "Máx" : fmtPrice(maxPrice)}
              </span>
            </div>
          </div>

          {/* Pills de categoria — uma linha com rolagem horizontal no celular */}
          <div className="-mx-3 no-scrollbar flex gap-2 overflow-x-auto px-3 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            {/* Pill Favoritos */}
            <button
              type="button"
              aria-pressed={onlyFavs}
              onClick={() => setOnlyFavs((v) => !v)}
              className="flex min-h-10 flex-none items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all"
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
              <Heart aria-hidden className="h-3.5 w-3.5" fill={onlyFavs ? "#fff" : "none"} />
              Favoritos
            </button>

            {categories.map((cat) => {
              const active = category === cat.slug
              return (
                <button
                  key={cat.slug}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategory(cat.slug)}
                  className="min-h-10 flex-none rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all"
                  style={
                    active
                      ? { background: "var(--mob-cta-gradient)", color: "#fff" }
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
              role="status"
              className="ml-auto flex-none self-center pl-2 text-xs whitespace-nowrap"
              style={{ color: "var(--mob-text-tertiary)" }}
            >
              {filtered.length} {filtered.length === 1 ? "item" : "itens"}
            </span>
          </div>
        </search>

        {/* Grid */}
        {menuLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <SearchX aria-hidden className="h-10 w-10 text-white/30" />
            <p className="text-sm text-white/60">
              Nenhum item encontrado para os filtros aplicados.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("")
                setCategory("todos")
                setMaxPrice(null)
                setOnlyFavs(false)
              }}
              className="mt-1 min-h-11 px-4 text-sm font-semibold text-orange-400 hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {filtered.map((item, i) => (
              <ProductCard
                key={item.id}
                item={item}
                globalExtras={globalExtras}
                destaque={i < PRIMEIRAS_FOTOS}
              />
            ))}
          </div>
        )}
      </div>

      <CartDrawer />
      <CartBar />
    </>
  )
}

/**
 * Enquanto o cardápio não monta no navegador (ele lê os filtros da URL), o servidor
 * manda este esqueleto com a altura da tela: o rodapé já nasce no lugar e não pula.
 */
function CardapioEsqueleto() {
  return (
    <div aria-hidden className="mx-auto min-h-[100dvh] max-w-7xl px-4 pt-8 pb-32 sm:px-6 sm:pt-10">
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

/** O cardápio chega do servidor já preenchido; sem ele, a tela busca sozinha. */
export default function CardapioCliente({
  menuInicial,
}: {
  menuInicial: CategoriaDoMenu[] | null
}) {
  return (
    <MenuInicialProvider value={menuInicial}>
      <Suspense fallback={<CardapioEsqueleto />}>
        <CardapioContent />
      </Suspense>
    </MenuInicialProvider>
  )
}
