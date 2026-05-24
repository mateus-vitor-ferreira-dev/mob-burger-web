"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Check,
  X,
  AlertCircle,
  Package,
  ImageIcon,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { categoryImageUrl } from "@/lib/cloudinary-utils"
import { useStaff } from "@/lib/staff-store"

interface Category {
  id: string
  name: string
  slug: string
  position: number
  active: boolean
  _count?: { products: number }
}

const inputCls =
  "w-full rounded-xl px-3 py-2.5 text-sm outline-none ring-1 transition focus:ring-orange-500/50"
const inputStyle = {
  background: "rgba(0,0,0,0.25)",
  border: "none",
  color: "white",
  "--tw-ring-color": "rgba(255,255,255,0.12)",
} as React.CSSProperties

function slugify(v: string) {
  return v
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export default function CategoriasPage() {
  const { token } = useStaff()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: "", slug: "", position: 0, active: true })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const imageRef = useRef<HTMLInputElement>(null)

  function notify(msg: string, isError = false) {
    if (isError) {
      setError(msg)
      setTimeout(() => setError(""), 4000)
    } else {
      setSuccess(msg)
      setTimeout(() => setSuccess(""), 3000)
    }
  }

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    const r = await fetch("/api/backend/admin/categories", {
      headers: { Authorization: `Bearer ${token}` },
    })
    const json = await r.json()
    setCategories(json.data ?? [])
    setLoading(false)
  }, [token])

  useEffect(() => {
    load() // eslint-disable-line react-hooks/set-state-in-effect
  }, [load])

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id)
    setForm({ name: cat.name, slug: cat.slug, position: cat.position, active: cat.active })
    setImageFile(null)
    setImagePreview(null)
    setShowForm(false)
  }

  function startCreate() {
    setEditingId(null)
    setForm({ name: "", slug: "", position: categories.length + 1, active: true })
    setImageFile(null)
    setImagePreview(null)
    setShowForm(true)
  }

  function cancelEdit() {
    setEditingId(null)
    setShowForm(false)
    setForm({ name: "", slug: "", position: 0, active: true })
    setImageFile(null)
    setImagePreview(null)
  }

  async function handleSave() {
    if (!form.name.trim()) {
      notify("Nome é obrigatório.", true)
      return
    }
    if (!editingId && !imageFile) {
      notify("Imagem é obrigatória para nova categoria.", true)
      return
    }
    setSaving(true)
    try {
      const slug = form.slug || slugify(form.name)

      // Upload imagem se houver
      if (imageFile) {
        const fd = new FormData()
        fd.append("image", imageFile)
        fd.append("slug", slug)
        const up = await fetch("/api/upload/category", { method: "POST", body: fd })
        const upJson = await up.json()
        if (!up.ok) throw new Error(upJson.error ?? "Erro ao fazer upload da imagem")
      }

      // Criar/atualizar categoria
      const body = { ...form, slug }
      const url = editingId
        ? `/api/backend/admin/categories/${editingId}`
        : "/api/backend/admin/categories"
      const r = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const json = await r.json()
      if (!r.ok) throw new Error(json.error?.message ?? "Erro ao salvar")
      notify(
        editingId
          ? "Categoria atualizada!"
          : "Categoria criada! Ela já aparece no carrossel da home.",
      )
      cancelEdit()
      load()
    } catch (e) {
      notify(e instanceof Error ? e.message : "Erro", true)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(cat: Category) {
    if ((cat._count?.products ?? 0) > 0) {
      notify(`Não é possível excluir — tem ${cat._count?.products} produto(s).`, true)
      return
    }
    if (!confirm(`Excluir a categoria "${cat.name}"?`)) return
    setDeleting(cat.id)
    try {
      const r = await fetch(`/api/backend/admin/categories/${cat.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!r.ok) {
        const j = await r.json()
        throw new Error(j.error?.message)
      }
      notify("Categoria excluída!")
      load()
    } catch (e) {
      notify(e instanceof Error ? e.message : "Erro ao excluir", true)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.3em] text-orange-400 uppercase">
            Cardápio
          </p>
          <h1
            className="leading-none text-white"
            style={{ fontFamily: "var(--font-bebas)", fontSize: "2.5rem", letterSpacing: "0.05em" }}
          >
            Categorias
          </h1>
        </div>
        {!showForm && !editingId && (
          <button
            onClick={startCreate}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition active:scale-95"
            style={{
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              boxShadow: "0 4px 12px rgba(249,115,22,0.3)",
            }}
          >
            <Plus className="h-4 w-4" /> Nova categoria
          </button>
        )}
      </div>

      {/* Feedback */}
      {error && (
        <div
          className="mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-red-400"
          style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)" }}
        >
          <AlertCircle className="h-4 w-4 flex-none" />
          {error}
        </div>
      )}
      {success && (
        <div
          className="mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-green-400"
          style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)" }}
        >
          <Check className="h-4 w-4 flex-none" />
          {success}
        </div>
      )}

      {/* Formulário criar/editar */}
      {(showForm || editingId) && (
        <div
          className="mb-5 rounded-2xl p-5"
          style={{
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <p
            className="mb-4 font-semibold text-orange-400"
            style={{ fontFamily: "var(--font-bebas)", fontSize: "1.2rem", letterSpacing: "0.06em" }}
          >
            {editingId ? "Editar categoria" : "Nova categoria"}
          </p>

          <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
            {/* Upload de imagem */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/50">
                Imagem {!editingId && <span className="text-orange-400">*</span>}
              </label>
              <button
                type="button"
                onClick={() => imageRef.current?.click()}
                className="group relative flex h-40 w-full items-center justify-center overflow-hidden rounded-xl transition"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: `2px dashed ${imagePreview ? "rgba(249,115,22,0.5)" : "rgba(255,255,255,0.2)"}`,
                }}
              >
                {imagePreview ? (
                  <>
                    <Image
                      src={imagePreview}
                      alt="preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition group-hover:opacity-100">
                      <ImageIcon className="h-6 w-6 text-white" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-white/30">
                    <ImageIcon className="h-8 w-8" />
                    <span className="text-xs">Clique para selecionar</span>
                    <span className="text-[10px]">JPG, PNG ou WebP · máx 3MB</span>
                  </div>
                )}
              </button>
              <input
                ref={imageRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {/* Campos */}
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/50">Nome *</label>
                <input
                  className={inputCls}
                  style={inputStyle}
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      name: e.target.value,
                      slug: f.slug || slugify(e.target.value),
                    }))
                  }
                  placeholder="Ex: Smash Burgers"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-white/50">Slug (URL)</label>
                <input
                  className={inputCls}
                  style={inputStyle}
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                  placeholder="ex: smash-burgers"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-white/50">Posição</label>
                  <input
                    type="number"
                    min={0}
                    className={inputCls}
                    style={inputStyle}
                    value={form.position}
                    onChange={(e) => setForm((f) => ({ ...f, position: Number(e.target.value) }))}
                  />
                </div>
                <div className="flex items-end pb-2.5">
                  <label className="flex cursor-pointer items-center gap-2 select-none">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                      className="h-4 w-4 accent-orange-500"
                    />
                    <span className="text-sm text-white/60">Ativa</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition active:scale-95 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {saving ? "Salvando..." : "Salvar"}
            </button>
            <button
              onClick={cancelEdit}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-white/50 transition hover:bg-white/5 hover:text-white"
            >
              <X className="h-4 w-4" /> Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-2xl"
              style={{ background: "var(--mob-s1)" }}
            />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="py-16 text-center text-sm text-white/25">Nenhuma categoria cadastrada.</div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => {
            // Tenta imagem salva para essa categoria
            const imgSrc = categoryImageUrl(cat.slug)
            return (
              <div
                key={cat.id}
                className="flex items-center gap-4 rounded-2xl px-4 py-3.5"
                style={{ background: "var(--mob-s2)", border: "1px solid var(--mob-b1)" }}
              >
                {/* Thumbnail */}
                <div className="relative h-10 w-10 flex-none overflow-hidden rounded-lg bg-white/5">
                  <Image
                    src={imgSrc}
                    alt={cat.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).style.display = "none"
                    }}
                  />
                </div>
                <span className="w-6 text-center text-xs font-bold text-white/30">
                  #{cat.position}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/produtos?cat=${cat.id}`}
                      className="text-sm font-semibold text-white transition hover:text-orange-400"
                    >
                      {cat.name}
                    </Link>
                    {!cat.active && (
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/40">
                        inativa
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/30">/{cat.slug}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-white/30">
                  <Package className="h-3.5 w-3.5" />
                  {cat._count?.products ?? 0}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(cat)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/5 hover:text-white"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    disabled={deleting === cat.id || (cat._count?.products ?? 0) > 0}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                    title={
                      (cat._count?.products ?? 0) > 0 ? "Remova os produtos primeiro" : "Excluir"
                    }
                  >
                    {deleting === cat.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
