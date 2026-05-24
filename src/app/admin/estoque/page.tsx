"use client"

import { useCallback, useEffect, useState } from "react"
import {
  PackageSearch,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  AlertCircle,
  Loader2,
  AlertTriangle,
  FlaskConical,
  ChevronDown,
} from "lucide-react"
import { useStaff } from "@/lib/staff-store"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Ingredient {
  id: string
  name: string
  unit: string
  quantity: number
  minQuantity: number
}

interface Product {
  id: string
  name: string
}

interface ProductIngredient {
  id: string
  ingredientId: string
  quantity: number
  ingredient: Ingredient
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-xl px-3 py-2.5 text-sm outline-none ring-1 transition focus:ring-orange-500/50"
const inputStyle = {
  background: "rgba(0,0,0,0.25)",
  border: "none",
  color: "white",
  "--tw-ring-color": "rgba(255,255,255,0.12)",
} as React.CSSProperties

const cardStyle = {
  background: "var(--mob-s1)",
  border: "1px solid var(--mob-b1)",
  backdropFilter: "blur(16px)",
}

// ─── IngredientRow ────────────────────────────────────────────────────────────

function IngredientRow({
  ingredient,
  token,
  onUpdated,
  onDeleted,
}: {
  ingredient: Ingredient
  token: string
  onUpdated: (i: Ingredient) => void
  onDeleted: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState({
    name: ingredient.name,
    unit: ingredient.unit,
    quantity: String(ingredient.quantity),
    minQuantity: String(ingredient.minQuantity),
  })

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/backend/admin/inventory/ingredients/${ingredient.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: form.name.trim(),
          unit: form.unit.trim(),
          quantity: parseFloat(form.quantity) || 0,
          minQuantity: parseFloat(form.minQuantity) || 0,
        }),
      })
      if (!res.ok) throw new Error()
      const { data } = await res.json()
      onUpdated(data)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Excluir "${ingredient.name}"?`)) return
    setDeleting(true)
    try {
      await fetch(`/api/backend/admin/inventory/ingredients/${ingredient.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      onDeleted(ingredient.id)
    } finally {
      setDeleting(false)
    }
  }

  const isLow = ingredient.quantity <= ingredient.minQuantity && ingredient.minQuantity > 0

  if (editing) {
    return (
      <tr style={{ borderBottom: "1px solid var(--mob-b1)" }}>
        <td className="px-4 py-3">
          <input
            className={inputCls}
            style={inputStyle}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </td>
        <td className="px-4 py-3">
          <input
            className={inputCls}
            style={inputStyle}
            value={form.unit}
            onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
          />
        </td>
        <td className="px-4 py-3">
          <input
            type="number"
            min="0"
            step="0.01"
            className={inputCls}
            style={inputStyle}
            value={form.quantity}
            onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
          />
        </td>
        <td className="px-4 py-3">
          <input
            type="number"
            min="0"
            step="0.01"
            className={inputCls}
            style={inputStyle}
            value={form.minQuantity}
            onChange={(e) => setForm((f) => ({ ...f, minQuantity: e.target.value }))}
          />
        </td>
        <td className="px-4 py-3">
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-green-400 transition hover:bg-green-500/10 disabled:opacity-40"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/5 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr style={{ borderBottom: "1px solid var(--mob-b1)" }} className="group">
      <td className="px-4 py-3 text-sm font-medium text-white">
        <div className="flex items-center gap-2">
          {isLow && <AlertTriangle className="h-3.5 w-3.5 flex-none text-amber-400" />}
          {ingredient.name}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-white/50">{ingredient.unit}</td>
      <td className="px-4 py-3 text-sm">
        <span
          className={
            ingredient.quantity === 0
              ? "font-bold text-red-400"
              : isLow
                ? "font-semibold text-amber-400"
                : "text-white"
          }
        >
          {ingredient.quantity}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-white/50">{ingredient.minQuantity || "—"}</td>
      <td className="px-4 py-3">
        <div className="flex gap-2 opacity-0 transition group-hover:opacity-100">
          <button
            onClick={() => setEditing(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/5 hover:text-white"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
          >
            {deleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── AddIngredientForm ────────────────────────────────────────────────────────

function AddIngredientForm({
  token,
  onAdded,
  onCancel,
}: {
  token: string
  onAdded: (i: Ingredient) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({ name: "", unit: "unidades", quantity: "0", minQuantity: "0" })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/backend/admin/inventory/ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: form.name.trim(),
          unit: form.unit.trim() || "unidades",
          quantity: parseFloat(form.quantity) || 0,
          minQuantity: parseFloat(form.minQuantity) || 0,
        }),
      })
      if (!res.ok) throw new Error()
      const { data } = await res.json()
      onAdded(data)
    } catch {
      setError("Erro ao criar ingrediente.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl p-5" style={cardStyle}>
      <p className="mb-4 text-sm font-semibold text-white">Novo ingrediente</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <label className="mb-1 block text-[11px] text-white/40">Nome *</label>
          <input
            className={inputCls}
            style={inputStyle}
            placeholder="Ex: Carne bovina"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            autoFocus
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-white/40">Unidade</label>
          <input
            className={inputCls}
            style={inputStyle}
            placeholder="unidades"
            value={form.unit}
            onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-white/40">Qtd. atual</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className={inputCls}
            style={inputStyle}
            value={form.quantity}
            onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-white/40">Qtd. mínima</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className={inputCls}
            style={inputStyle}
            value={form.minQuantity}
            onChange={(e) => setForm((f) => ({ ...f, minQuantity: e.target.value }))}
          />
        </div>
      </div>
      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle className="h-3.5 w-3.5" /> {error}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={saving || !form.name.trim()}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Salvar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-4 py-2 text-sm text-white/40 transition hover:bg-white/5 hover:text-white"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}

// ─── FichaTecnica ─────────────────────────────────────────────────────────────

function FichaTecnica({
  products,
  ingredients,
  token,
}: {
  products: Product[]
  ingredients: Ingredient[]
  token: string
}) {
  const [selectedProduct, setSelectedProduct] = useState("")
  const [_productIngredients, setProductIngredients] = useState<ProductIngredient[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState("")
  const [draft, setDraft] = useState<{ ingredientId: string; quantity: string }[]>([])

  const loadProductIngredients = useCallback(
    async (productId: string) => {
      setLoading(true)
      try {
        const res = await fetch(`/api/backend/admin/inventory/products/${productId}/ingredients`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error()
        const { data } = await res.json()
        setProductIngredients(data)
        setDraft(
          data.map((pi: ProductIngredient) => ({
            ingredientId: pi.ingredientId,
            quantity: String(pi.quantity),
          })),
        )
      } finally {
        setLoading(false)
      }
    },
    [token],
  )

  useEffect(() => {
    if (selectedProduct) {
      loadProductIngredients(selectedProduct) // eslint-disable-line react-hooks/set-state-in-effect
    } else {
      setProductIngredients([])  
      setDraft([])  
    }
  }, [selectedProduct, loadProductIngredients])

  function addLine() {
    const unused = ingredients.find((i) => !draft.some((d) => d.ingredientId === i.id))
    if (!unused) return
    setDraft((d) => [...d, { ingredientId: unused.id, quantity: "1" }])
  }

  function removeLine(idx: number) {
    setDraft((d) => d.filter((_, i) => i !== idx))
  }

  function updateLine(idx: number, field: "ingredientId" | "quantity", value: string) {
    setDraft((d) => d.map((item, i) => (i === idx ? { ...item, [field]: value } : item)))
  }

  async function handleSave() {
    if (!selectedProduct) return
    setSaving(true)
    setSuccess("")
    try {
      const res = await fetch(
        `/api/backend/admin/inventory/products/${selectedProduct}/ingredients`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            ingredients: draft
              .filter((d) => d.ingredientId && parseFloat(d.quantity) > 0)
              .map((d) => ({ ingredientId: d.ingredientId, quantity: parseFloat(d.quantity) })),
          }),
        },
      )
      if (!res.ok) throw new Error()
      setSuccess("Ficha salva!")
      await loadProductIngredients(selectedProduct)
      setTimeout(() => setSuccess(""), 3000)
    } finally {
      setSaving(false)
    }
  }

  const unusedIngredients = (idx: number) =>
    ingredients.filter((i) => !draft.some((d, di) => d.ingredientId === i.id && di !== idx))

  return (
    <div className="space-y-4">
      {/* Product selector */}
      <div className="rounded-2xl p-5" style={cardStyle}>
        <label className="mb-2 block text-sm font-semibold text-white">Selecionar produto</label>
        <div className="relative">
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full appearance-none rounded-xl px-3 py-2.5 pr-9 text-sm ring-1 transition outline-none focus:ring-orange-500/50"
            style={{ ...inputStyle, background: "rgba(0,0,0,0.25)" }}
          >
            <option value="">— escolha um produto —</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-white/30" />
        </div>
      </div>

      {/* Ficha editor */}
      {selectedProduct && (
        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-white">
              Ingredientes — {products.find((p) => p.id === selectedProduct)?.name}
            </p>
            {loading && <Loader2 className="h-4 w-4 animate-spin text-white/30" />}
          </div>

          {draft.length === 0 && !loading && (
            <p className="mb-4 text-xs text-white/30">
              Nenhum ingrediente vinculado. Produtos sem ficha técnica são sempre considerados em
              estoque.
            </p>
          )}

          <div className="space-y-2">
            {draft.map((line, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <select
                    value={line.ingredientId}
                    onChange={(e) => updateLine(idx, "ingredientId", e.target.value)}
                    className="w-full appearance-none rounded-xl px-3 py-2 pr-8 text-sm ring-1 transition outline-none focus:ring-orange-500/50"
                    style={{ ...inputStyle, background: "rgba(0,0,0,0.25)" }}
                  >
                    {unusedIngredients(idx).map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name} ({i.unit})
                      </option>
                    ))}
                    {/* keep current if not in unused list */}
                    {!unusedIngredients(idx).find((i) => i.id === line.ingredientId) && (
                      <option value={line.ingredientId}>
                        {ingredients.find((i) => i.id === line.ingredientId)?.name ??
                          line.ingredientId}
                      </option>
                    )}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
                </div>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={line.quantity}
                  onChange={(e) => updateLine(idx, "quantity", e.target.value)}
                  className="w-24 rounded-xl px-3 py-2 text-sm ring-1 transition outline-none focus:ring-orange-500/50"
                  style={inputStyle}
                  placeholder="Qtd."
                />
                <button
                  onClick={() => removeLine(idx)}
                  className="flex h-8 w-8 flex-none items-center justify-center rounded-lg text-white/30 transition hover:bg-red-500/10 hover:text-red-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={addLine}
              disabled={ingredients.length === 0 || draft.length >= ingredients.length}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white/50 transition hover:bg-white/5 hover:text-white disabled:opacity-30"
            >
              <Plus className="h-3.5 w-3.5" /> Adicionar ingrediente
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="ml-auto flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Salvar ficha
            </button>
          </div>

          {success && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-green-400">
              <Check className="h-3.5 w-3.5" /> {success}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EstoquePage() {
  const { token } = useStaff()
  const [tab, setTab] = useState<"ingredientes" | "fichas">("ingredientes")
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError("")
    try {
      const [ingRes, menuRes] = await Promise.all([
        fetch("/api/backend/admin/inventory/ingredients", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/backend/menu"),
      ])
      if (!ingRes.ok) throw new Error()
      const { data: ingData } = await ingRes.json()
      setIngredients(ingData)

      if (menuRes.ok) {
        const { data: cats } = await menuRes.json()
        const prods: Product[] = (cats ?? []).flatMap((c: { products: Product[] }) => c.products)
        setProducts(prods)
      }
    } catch {
      setError("Erro ao carregar dados.")
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    load() // eslint-disable-line react-hooks/set-state-in-effect
  }, [load])

  const lowStock = ingredients.filter((i) => i.minQuantity > 0 && i.quantity <= i.minQuantity)
  const outOfStock = ingredients.filter((i) => i.quantity === 0)

  const tabs = [
    { id: "ingredientes" as const, label: "Ingredientes", icon: PackageSearch },
    { id: "fichas" as const, label: "Fichas Técnicas", icon: FlaskConical },
  ]

  return (
    <div className="mob-on-dark mx-auto max-w-5xl space-y-6 p-6 pt-6 lg:pt-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1
          className="leading-none text-white"
          style={{ fontFamily: "var(--font-bebas)", fontSize: "2.2rem", letterSpacing: "0.05em" }}
        >
          Controle de Estoque
        </h1>
        <p className="text-sm text-white/40">
          Gerencie ingredientes e fichas técnicas dos produtos
        </p>
      </div>

      {/* Alert badges */}
      {(outOfStock.length > 0 || lowStock.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {outOfStock.length > 0 && (
            <span
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-red-400"
              style={{
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              <AlertCircle className="h-3.5 w-3.5" /> {outOfStock.length} sem estoque
            </span>
          )}
          {lowStock.length > 0 && (
            <span
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-amber-400"
              style={{
                background: "rgba(245,158,11,0.12)",
                border: "1px solid rgba(245,158,11,0.2)",
              }}
            >
              <AlertTriangle className="h-3.5 w-3.5" /> {lowStock.length} abaixo do mínimo
            </span>
          )}
        </div>
      )}

      {/* Tabs */}
      <div
        className="flex gap-1 rounded-xl p-1"
        style={{ background: "rgba(0,0,0,0.3)", border: "1px solid var(--mob-b1)" }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition"
            style={
              tab === t.id
                ? { background: "rgba(249,115,22,0.15)", color: "#f97316" }
                : { color: "var(--mob-sidebar-inactive)" }
            }
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-sm text-red-400">
          <AlertCircle className="h-4 w-4" /> {error}
        </p>
      )}

      {/* Tab: Ingredientes */}
      {tab === "ingredientes" && (
        <div className="space-y-4">
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition"
              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
            >
              <Plus className="h-4 w-4" /> Novo ingrediente
            </button>
          )}

          {showAddForm && (
            <AddIngredientForm
              token={token!}
              onAdded={(i) => {
                setIngredients((prev) => [...prev, i].sort((a, b) => a.name.localeCompare(b.name)))
                setShowAddForm(false)
              }}
              onCancel={() => setShowAddForm(false)}
            />
          )}

          <div className="overflow-hidden rounded-2xl" style={cardStyle}>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-white/30" />
              </div>
            ) : ingredients.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-16 text-center">
                <PackageSearch className="h-10 w-10 text-white/10" />
                <p className="text-sm text-white/30">Nenhum ingrediente cadastrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid var(--mob-b1)",
                        background: "rgba(0,0,0,0.2)",
                      }}
                    >
                      <th className="px-4 py-3 text-left text-[11px] font-semibold tracking-wider text-white/40 uppercase">
                        Nome
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold tracking-wider text-white/40 uppercase">
                        Unidade
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold tracking-wider text-white/40 uppercase">
                        Qtd. atual
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold tracking-wider text-white/40 uppercase">
                        Qtd. mínima
                      </th>
                      <th className="w-20 px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {ingredients.map((ingredient) => (
                      <IngredientRow
                        key={ingredient.id}
                        ingredient={ingredient}
                        token={token!}
                        onUpdated={(updated) =>
                          setIngredients((prev) =>
                            prev.map((i) => (i.id === updated.id ? updated : i)),
                          )
                        }
                        onDeleted={(id) =>
                          setIngredients((prev) => prev.filter((i) => i.id !== id))
                        }
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Fichas Técnicas */}
      {tab === "fichas" && (
        <FichaTecnica products={products} ingredients={ingredients} token={token!} />
      )}
    </div>
  )
}
