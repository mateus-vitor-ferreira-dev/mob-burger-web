"use client"

import { fmtPrice } from "@/lib/utils"
import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  ToggleLeft,
  ToggleRight,
  Upload,
  Loader2,
  Settings2,
  Check,
  GripVertical,
  RefreshCw,
  ChevronDown,
} from "lucide-react"
import { useStaff } from "@/lib/staff-store"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface Category {
  id: string
  name: string
}

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

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  active: boolean
  category: { id: string; name: string }
}

// ─── Combo config ─────────────────────────────────────────────────────────────

const ALLOWED_SLUGS_OPTIONS = [
  { value: "burgers", label: "Burgers" },
  { value: "chicken", label: "Chicken" },
]

function ComboConfigSection({ productId, token }: { productId: string; token: string }) {
  const [open, setOpen] = useState(false)
  const [numBurgers, setNumBurgers] = useState("2")
  const [numDrinks, setNumDrinks] = useState("2")
  const [allowedSlugs, setAllowedSlugs] = useState<string[]>(["burgers", "chicken"])
  const [includeDrinks, setIncludeDrinks] = useState(true)
  const [numDesserts, setNumDesserts] = useState("0")
  const [includeDesserts, setIncludeDesserts] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const inputCls =
    "rounded-lg bg-white/5 px-2 py-1.5 text-xs text-white ring-1 ring-white/10 outline-none focus:ring-orange-500/50"

  function toggleSlug(slug: string) {
    setAllowedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    )
  }

  async function sync() {
    if (allowedSlugs.length === 0) return
    setSaving(true)
    await fetch(`/api/backend/admin/products/${productId}/combo-config`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        numBurgers: parseInt(numBurgers) || 1,
        numDrinks: parseInt(numDrinks) || 0,
        drinkCostPrice: 5.5,
        allowedSlugs,
        ...(includeDrinks && parseInt(numDrinks) > 0 ? { drinkSlugs: ["bebidas"] } : {}),
        ...(includeDesserts && parseInt(numDesserts) > 0
          ? { numDesserts: parseInt(numDesserts), dessertSlugs: ["sobremesas"] }
          : { numDesserts: 0 }),
      }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div
      className="mt-1 rounded-xl"
      style={{ background: "rgba(249,115,22,0.05)", border: "1px solid rgba(249,115,22,0.15)" }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left"
      >
        <span className="text-xs font-semibold tracking-widest text-orange-400/70 uppercase">
          Configurar Combo
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-orange-400/50 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="space-y-3 px-3 pb-3">
          <p className="text-[10px] text-white/30">
            Ao salvar, o preço do produto é zerado e as opções de personalização são recriadas com
            lanches, bebidas e sobremesas disponíveis. O valor total é calculado pela soma dos itens
            escolhidos.
          </p>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="mb-1 block text-[10px] text-white/40">Qtd. Lanches</label>
              <input
                className={`${inputCls} w-full`}
                type="number"
                min="1"
                max="8"
                value={numBurgers}
                onChange={(e) => setNumBurgers(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] text-white/40">Qtd. Bebidas</label>
              <input
                className={`${inputCls} w-full`}
                type="number"
                min="0"
                max="8"
                value={numDrinks}
                onChange={(e) => setNumDrinks(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] text-white/40">Qtd. Sobremesas</label>
              <input
                className={`${inputCls} w-full`}
                type="number"
                min="0"
                max="8"
                value={numDesserts}
                onChange={(e) => setNumDesserts(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <label className="flex cursor-pointer items-center gap-1.5 text-[10px] text-white/40">
              <input
                type="checkbox"
                checked={includeDrinks}
                onChange={(e) => setIncludeDrinks(e.target.checked)}
              />
              Cliente escolhe bebida
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 text-[10px] text-white/40">
              <input
                type="checkbox"
                checked={includeDesserts}
                onChange={(e) => setIncludeDesserts(e.target.checked)}
              />
              Cliente escolhe sobremesa
            </label>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] text-white/40">Categorias de lanches</label>
            <div className="flex gap-2">
              {ALLOWED_SLUGS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => toggleSlug(opt.value)}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
                  style={
                    allowedSlugs.includes(opt.value)
                      ? { background: "rgba(249,115,22,0.2)", color: "#f97316" }
                      : { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" }
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={sync}
            disabled={saving || allowedSlugs.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold text-white transition disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : saved ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            {saved ? "Sincronizado!" : "Salvar e sincronizar opções"}
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Opções de produto ────────────────────────────────────────────────────────

function ProductOptions({ productId, token }: { productId: string; token: string }) {
  const [options, setOptions] = useState<ProductOption[]>([])
  const [loading, setLoading] = useState(true)
  const [newLabel, setNewLabel] = useState("")
  const [newType, setNewType] = useState<"RADIO" | "CHECKBOX">("RADIO")
  const [newRequired, setNewRequired] = useState(true)
  const [addingOption, setAddingOption] = useState(false)
  const [newItems, setNewItems] = useState<Record<string, { name: string; price: string }>>({})

  const inputCls =
    "rounded-lg bg-white/5 px-2 py-1.5 text-xs text-white ring-1 ring-white/10 outline-none focus:ring-orange-500/50"

  const load = useCallback(async () => {
    const res = await fetch(`/api/backend/admin/products/${productId}/options`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const json = await res.json()
    setOptions(json.data ?? [])
    setLoading(false)
  }, [productId, token])

  useEffect(() => {
    load() // eslint-disable-line react-hooks/set-state-in-effect
  }, [load])

  async function addOption() {
    if (!newLabel.trim()) return
    setAddingOption(true)
    await fetch(`/api/backend/admin/products/${productId}/options`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ label: newLabel.trim(), type: newType, required: newRequired }),
    })
    setNewLabel("")
    setAddingOption(false)
    load()
  }

  async function deleteOption(optionId: string) {
    await fetch(`/api/backend/admin/products/${productId}/options/${optionId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    load()
  }

  async function addItem(optionId: string) {
    const item = newItems[optionId]
    if (!item?.name.trim()) return
    await fetch(`/api/backend/admin/products/${productId}/options/${optionId}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: item.name.trim(),
        additionalPrice: parseFloat(item.price || "0"),
      }),
    })
    setNewItems((p) => ({ ...p, [optionId]: { name: "", price: "" } }))
    load()
  }

  async function deleteItem(optionId: string, itemId: string) {
    await fetch(`/api/backend/admin/products/${productId}/options/${optionId}/items/${itemId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    load()
  }

  if (loading)
    return (
      <div className="flex justify-center py-3">
        <Loader2 className="h-4 w-4 animate-spin text-orange-400" />
      </div>
    )

  return (
    <div
      className="mt-2 space-y-3 rounded-xl p-3"
      style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      <ComboConfigSection productId={productId} token={token} />

      <p className="text-xs font-semibold tracking-widest text-white/30 uppercase">
        Opções de personalização
      </p>

      {options.map((opt) => (
        <div
          key={opt.id}
          className="space-y-2 rounded-lg p-3"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex items-center gap-2">
            <span className="flex-1 text-xs font-semibold text-white">{opt.label}</span>
            <span
              className="rounded-full px-2 py-0.5 text-[10px]"
              style={{ background: "rgba(249,115,22,0.15)", color: "#f97316" }}
            >
              {opt.type === "RADIO" ? "Único" : "Múltiplo"}
              {opt.required ? " · Obrigatório" : ""}
            </span>
            <button
              onClick={() => deleteOption(opt.id)}
              className="text-white/20 transition hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-1 pl-2">
            {opt.items.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <span className="flex-1 text-xs text-white/60">{item.name}</span>
                {item.additionalPrice > 0 && (
                  <span className="text-[10px] text-orange-400">
                    +{fmtPrice(item.additionalPrice)}
                  </span>
                )}
                <button
                  onClick={() => deleteItem(opt.id, item.id)}
                  className="text-white/20 transition hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            {/* Novo item */}
            <div className="flex items-center gap-1.5 pt-1">
              <input
                className={`${inputCls} flex-1`}
                placeholder="Nome do item"
                value={newItems[opt.id]?.name ?? ""}
                onChange={(e) =>
                  setNewItems((p) => ({ ...p, [opt.id]: { ...p[opt.id], name: e.target.value } }))
                }
                onKeyDown={(e) => e.key === "Enter" && addItem(opt.id)}
              />
              <input
                className={`${inputCls} w-16`}
                placeholder="R$"
                type="number"
                min="0"
                step="0.50"
                value={newItems[opt.id]?.price ?? ""}
                onChange={(e) =>
                  setNewItems((p) => ({ ...p, [opt.id]: { ...p[opt.id], price: e.target.value } }))
                }
              />
              <button
                onClick={() => addItem(opt.id)}
                className="flex h-6 w-6 items-center justify-center rounded-lg text-orange-400 transition hover:bg-orange-500/20"
              >
                <Check className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Nova opção */}
      <div className="flex flex-wrap items-end gap-2 pt-1">
        <input
          className={`${inputCls} min-w-32 flex-1`}
          placeholder="Nome do grupo (ex: Ponto da carne)"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
        />
        <select
          className={inputCls}
          value={newType}
          onChange={(e) => setNewType(e.target.value as "RADIO" | "CHECKBOX")}
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <option value="RADIO" style={{ background: "#1a1612" }}>
            Único (radio)
          </option>
          <option value="CHECKBOX" style={{ background: "#1a1612" }}>
            Múltiplo (checkbox)
          </option>
        </select>
        <label className="flex cursor-pointer items-center gap-1.5 text-xs text-white/50">
          <input
            type="checkbox"
            checked={newRequired}
            onChange={(e) => setNewRequired(e.target.checked)}
          />
          Obrigatório
        </label>
        <button
          onClick={addOption}
          disabled={addingOption || !newLabel.trim()}
          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
          style={{ background: "rgba(249,115,22,0.2)", border: "1px solid rgba(249,115,22,0.3)" }}
        >
          {addingOption ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Plus className="h-3 w-3" />
          )}
          Adicionar grupo
        </button>
      </div>
    </div>
  )
}

// ─── Sortable product row ─────────────────────────────────────────────────────

function SortableProductRow({
  p,
  token,
  toggling,
  deleting,
  expandedOptions,
  draggable,
  onToggle,
  onEdit,
  onOptions,
  onDelete,
}: {
  p: Product
  token: string
  toggling: string | null
  deleting: string | null
  expandedOptions: string | null
  draggable: boolean
  onToggle: (id: string) => void
  onEdit: (p: Product) => void
  onOptions: (id: string) => void
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: p.id,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className="flex items-center gap-3 rounded-2xl p-3 transition"
        style={{
          background: "var(--mob-s3)",
          border: "1px solid var(--mob-s4)",
          opacity: p.active ? 1 : 0.5,
        }}
      >
        {draggable && (
          <button
            {...attributes}
            {...listeners}
            className="flex-none cursor-grab touch-none text-white/20 hover:text-white/50 active:cursor-grabbing"
            tabIndex={-1}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
        <div className="relative h-12 w-12 flex-none overflow-hidden rounded-xl bg-black/30">
          {p.imageUrl ? (
            <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl opacity-30">
              🍔
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{p.name}</p>
          {p.description && <p className="truncate text-xs text-white/30">{p.description}</p>}
        </div>
        <span className="shrink-0 text-sm font-bold text-orange-400">{fmtPrice(p.price)}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggle(p.id)}
            disabled={toggling === p.id}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-white/40 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
            title={p.active ? "Desativar" : "Ativar"}
          >
            {toggling === p.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : p.active ? (
              <ToggleRight className="h-4 w-4 text-green-400" />
            ) : (
              <ToggleLeft className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => onEdit(p)}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-white/40 transition hover:bg-white/5 hover:text-white"
            title="Editar"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onOptions(p.id)}
            className="flex h-8 w-8 items-center justify-center rounded-xl transition hover:bg-white/5"
            style={{ color: expandedOptions === p.id ? "#f97316" : "rgba(255,255,255,0.4)" }}
            title="Opções de personalização"
          >
            <Settings2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(p.id)}
            disabled={deleting === p.id}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-white/40 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
            title="Remover"
          >
            {deleting === p.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
      {expandedOptions === p.id && <ProductOptions productId={p.id} token={token} />}
    </div>
  )
}

// ─── Sortable category group ──────────────────────────────────────────────────

function SortableCategoryGroup({
  cat,
  items,
  token,
  toggling,
  deleting,
  expandedOptions,
  draggable,
  onToggle,
  onEdit,
  onOptions,
  onDelete,
  onReorder,
}: {
  cat: Category
  items: Product[]
  token: string
  toggling: string | null
  deleting: string | null
  expandedOptions: string | null
  draggable: boolean
  onToggle: (id: string) => void
  onEdit: (p: Product) => void
  onOptions: (id: string) => void
  onDelete: (id: string) => void
  onReorder: (catId: string, newItems: Product[]) => void
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((p) => p.id === active.id)
    const newIndex = items.findIndex((p) => p.id === over.id)
    const newItems = arrayMove(items, oldIndex, newIndex)
    onReorder(cat.id, newItems)
    await fetch("/api/backend/admin/products/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ items: newItems.map((p, i) => ({ id: p.id, position: i + 1 })) }),
    })
  }

  return (
    <section>
      <p className="mb-3 text-xs font-semibold tracking-widest text-orange-400 uppercase">
        {cat.name}
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((p) => (
              <SortableProductRow
                key={p.id}
                p={p}
                token={token}
                toggling={toggling}
                deleting={deleting}
                expandedOptions={expandedOptions}
                draggable={draggable}
                onToggle={onToggle}
                onEdit={onEdit}
                onOptions={onOptions}
                onDelete={onDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  )
}

// ─── Modal criar / editar ─────────────────────────────────────────────────────

function ProductModal({
  product,
  categories,
  token,
  onSave,
  onClose,
}: {
  product: Product | null
  categories: Category[]
  token: string
  onSave: () => void
  onClose: () => void
}) {
  const isEdit = !!product
  const [name, setName] = useState(product?.name ?? "")
  const [description, setDescription] = useState(product?.description ?? "")
  const [price, setPrice] = useState(product?.price.toFixed(2) ?? "")
  const [categoryId, setCategoryId] = useState(product?.category.id ?? categories[0]?.id ?? "")
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "")
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append("image", file)
    form.append("name", name || "produto")
    const res = await fetch("/api/upload/product", { method: "POST", body: form })
    const json = await res.json()
    if (json.url) setImageUrl(json.url)
    else setError(json.error ?? "Erro no upload")
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!name.trim() || !categoryId || !price) {
      setError("Preencha nome, categoria e preço.")
      return
    }
    setSaving(true)
    const body = {
      name: name.trim(),
      description: description.trim() || null,
      price: parseFloat(price),
      categoryId,
      imageUrl: imageUrl.trim() || null,
    }
    const url = isEdit
      ? `/api/backend/admin/products/${product!.id}`
      : "/api/backend/admin/products"
    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setError(j.error?.message ?? "Erro ao salvar produto.")
      setSaving(false)
      return
    }
    onSave()
  }

  const inputCls =
    "w-full rounded-xl bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 ring-1 ring-white/10 outline-none transition focus:ring-orange-500/50"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-lg rounded-2xl p-6"
        style={{ background: "#1a1612", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <h2
          className="mb-5 leading-none text-white"
          style={{ fontFamily: "var(--font-bebas)", fontSize: "1.8rem", letterSpacing: "0.06em" }}
        >
          {isEdit ? "Editar Produto" : "Novo Produto"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <label className="mb-1 block text-xs text-white/50">Nome *</label>
            <input
              className={inputCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Mob Classic"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="mb-1 block text-xs text-white/50">Descrição</label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ingredientes ou descrição do produto"
            />
          </div>

          {/* Categoria + Preço */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-white/50">Categoria *</label>
              <select
                className={inputCls}
                style={{ background: "rgba(255,255,255,0.05)" }}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id} style={{ background: "#1a1612" }}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-white/50">Preço (R$) *</label>
              <input
                className={inputCls}
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0,00"
                required
              />
            </div>
          </div>

          {/* Imagem */}
          <div>
            <label className="mb-1 block text-xs text-white/50">Imagem</label>
            <div className="flex gap-2">
              <input
                className={`${inputCls} flex-1`}
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="/burgers/nome-do-produto.png"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-white/60 transition hover:bg-white/10 disabled:opacity-50"
                style={{ border: "1px solid rgba(255,255,255,0.1)" }}
              >
                {uploading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
                Upload
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
              />
            </div>

            {imageUrl && (
              <div className="relative mt-2 h-24 w-24 overflow-hidden rounded-xl bg-black/30">
                <Image src={imageUrl} alt="preview" fill className="object-cover" unoptimized />
              </div>
            )}
          </div>

          {error && (
            <p className="rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm text-white/50 transition hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-white transition disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isEdit ? "Salvar alterações" : "Criar produto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProdutosPage() {
  const { token } = useStaff()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [catFilter, setCatFilter] = useState("")
  const [modalProduct, setModalProduct] = useState<Product | null | "new">(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)
  const [expandedOptions, setExpandedOptions] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    const [pRes, cRes] = await Promise.all([
      fetch("/api/backend/admin/products", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/backend/admin/categories", { headers: { Authorization: `Bearer ${token}` } }),
    ])
    const [pJson, cJson] = await Promise.all([pRes.json(), cRes.json()])
    setProducts(pJson.data ?? [])
    setCategories(cJson.data ?? [])
    setLoading(false)
  }, [token])

  useEffect(() => {
    load() // eslint-disable-line react-hooks/set-state-in-effect
  }, [load])

  useEffect(() => {
    const cat = new URLSearchParams(window.location.search).get("cat")
    if (cat) setCatFilter(cat) // eslint-disable-line react-hooks/set-state-in-effect
  }, [])

  async function handleToggle(id: string) {
    setToggling(id)
    await fetch(`/api/backend/admin/products/${id}/toggle`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    })
    setToggling(null)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover este produto?")) return
    setDeleting(id)
    await fetch(`/api/backend/admin/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    setDeleting(null)
    load()
  }

  function handleReorder(catId: string, newItems: Product[]) {
    setProducts((prev) => [...prev.filter((p) => p.category.id !== catId), ...newItems])
  }

  const filtered = products.filter((p) => {
    if (catFilter && p.category.id !== catFilter) return false
    if (!query) return true
    return p.name.toLowerCase().includes(query.toLowerCase())
  })

  // Agrupar por categoria para exibição
  const grouped = categories
    .map((cat) => ({
      cat,
      items: filtered.filter((p) => p.category.id === cat.id),
    }))
    .filter((g) => g.items.length > 0)

  const inputCls =
    "rounded-xl px-3 py-2 text-sm text-white placeholder-white/40 outline-none ring-1 ring-white/10 transition focus:ring-orange-500/60"

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.3em] text-orange-400 uppercase">Gestão</p>
          <h1
            className="leading-none text-white"
            style={{ fontFamily: "var(--font-bebas)", fontSize: "2.5rem", letterSpacing: "0.05em" }}
          >
            Produtos
          </h1>
        </div>
        <button
          onClick={() => setModalProduct("new")}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition active:scale-95"
          style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
        >
          <Plus className="h-4 w-4" /> Novo produto
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-5 flex flex-wrap gap-3">
        <div className="relative min-w-48 flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            className={`${inputCls} w-full pl-9`}
            style={{ background: "rgba(0,0,0,0.35)" }}
            placeholder="Buscar produto..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <select
          className={inputCls}
          style={{ background: "rgba(0,0,0,0.35)", color: "white" }}
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
        >
          <option value="" style={{ background: "#1a1815" }}>
            Todas as categorias
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id} style={{ background: "#1a1815" }}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <p className="mb-4 text-xs text-white/25">
        {filtered.length} {filtered.length === 1 ? "produto" : "produtos"}
      </p>

      {/* Lista agrupada */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-2xl"
              style={{ background: "var(--mob-s1)" }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-white/25">Nenhum produto encontrado.</div>
      ) : (
        <div className="space-y-8">
          {grouped.map(({ cat, items }) => (
            <SortableCategoryGroup
              key={cat.id}
              cat={cat}
              items={items}
              token={token!}
              toggling={toggling}
              deleting={deleting}
              expandedOptions={expandedOptions}
              draggable={!query}
              onToggle={handleToggle}
              onEdit={setModalProduct}
              onOptions={(id) => setExpandedOptions(expandedOptions === id ? null : id)}
              onDelete={handleDelete}
              onReorder={handleReorder}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {modalProduct !== null && (
        <ProductModal
          product={modalProduct === "new" ? null : modalProduct}
          categories={categories}
          token={token!}
          onSave={() => {
            setModalProduct(null)
            load()
          }}
          onClose={() => setModalProduct(null)}
        />
      )}
    </div>
  )
}
