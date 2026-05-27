"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Upload,
  ImageOff,
} from "lucide-react"
import { useStaff } from "@/lib/staff-store"
import { fmtPrice } from "@/lib/utils"

interface Extra {
  id: string
  name: string
  price: number
  imageUrl: string | null
  active: boolean
}

const inputCls =
  "rounded-xl bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 ring-1 ring-white/10 outline-none transition focus:ring-orange-500/50 w-full"

function ExtraCard({
  extra,
  token,
  onUpdated,
  onDelete,
}: {
  extra: Extra
  token: string
  onUpdated: () => void
  onDelete: (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(extra.name)
  const [price, setPrice] = useState(extra.price.toFixed(2))
  const [imageUrl, setImageUrl] = useState(extra.imageUrl ?? "")
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [toggling, setToggling] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function cancelEdit() {
    setEditing(false)
    setName(extra.name)
    setPrice(extra.price.toFixed(2))
    setImageUrl(extra.imageUrl ?? "")
  }

  async function uploadImage(file: File) {
    setUploading(true)
    const form = new FormData()
    form.append("image", file)
    form.append("name", name || extra.name)
    const res = await fetch("/api/upload/extra", { method: "POST", body: form })
    const json = await res.json()
    if (json.url) setImageUrl(json.url)
    setUploading(false)
  }

  async function save() {
    if (!name.trim()) return
    setSaving(true)
    await fetch(`/api/backend/admin/extras/${extra.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: name.trim(),
        price: parseFloat(price) || 0,
        imageUrl: imageUrl.trim() || null,
        active: extra.active,
      }),
    })
    setSaving(false)
    setEditing(false)
    onUpdated()
  }

  async function toggle() {
    setToggling(true)
    await fetch(`/api/backend/admin/extras/${extra.id}/toggle`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    })
    setToggling(false)
    onUpdated()
  }

  if (editing) {
    return (
      <div
        className="flex flex-col gap-3 rounded-2xl p-4"
        style={{ background: "var(--mob-s3)", border: "1px solid rgba(249,115,22,0.3)" }}
      >
        {/* Image area */}
        <div className="relative mx-auto flex h-28 w-28 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/5">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={name}
              fill
              className="object-cover"
              unoptimized={imageUrl.startsWith("http")}
            />
          ) : (
            <ImageOff className="h-8 w-8 text-white/20" />
          )}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-xl bg-black/60 text-xs font-semibold text-white opacity-0 transition hover:opacity-100 disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Upload className="h-5 w-5" />
            )}
            Trocar
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-white/50">Nome</label>
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Bacon"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-white/50">Preço (R$)</label>
          <input
            className={inputCls}
            type="number"
            min="0"
            step="0.50"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={save}
            disabled={saving || !name.trim()}
            className="flex flex-1 items-center justify-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-white transition disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Salvar
          </button>
          <button
            onClick={cancelEdit}
            className="flex items-center justify-center rounded-xl px-3 py-2 text-sm text-white/40 transition hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="group flex flex-col overflow-hidden rounded-2xl transition"
      style={{
        background: "var(--mob-s3)",
        border: "1px solid var(--mob-s4)",
        opacity: extra.active ? 1 : 0.5,
      }}
    >
      {/* Image */}
      <div className="relative h-36 w-full bg-white/5">
        {extra.imageUrl ? (
          <Image
            src={extra.imageUrl}
            alt={extra.name}
            fill
            className="object-cover"
            unoptimized={extra.imageUrl.startsWith("http")}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageOff className="h-10 w-10 text-white/15" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-sm leading-tight font-bold text-white">{extra.name}</p>
        <p className="text-base font-bold text-orange-400">{fmtPrice(extra.price)}</p>
      </div>

      {/* Actions */}
      <div
        className="flex items-center justify-between border-t px-3 py-2"
        style={{ borderColor: "var(--mob-s4)" }}
      >
        <button
          onClick={toggle}
          disabled={toggling}
          title={extra.active ? "Desativar" : "Ativar"}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-white/5 disabled:opacity-50"
        >
          {toggling ? (
            <Loader2 className="h-4 w-4 animate-spin text-white/40" />
          ) : extra.active ? (
            <ToggleRight className="h-4 w-4 text-green-400" />
          ) : (
            <ToggleLeft className="h-4 w-4 text-white/30" />
          )}
        </button>
        <div className="flex gap-1">
          <button
            onClick={() => setEditing(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/5 hover:text-white"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(extra.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdicionaisPage() {
  const { token } = useStaff()
  const [extras, setExtras] = useState<Extra[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const [newName, setNewName] = useState("")
  const [newPrice, setNewPrice] = useState("")
  const [newImageUrl, setNewImageUrl] = useState("")
  const [adding, setAdding] = useState(false)
  const [uploadingNew, setUploadingNew] = useState(false)
  const newFileRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    const res = await fetch("/api/backend/admin/extras", {
      headers: { Authorization: `Bearer ${token}` },
    })
    const json = await res.json()
    setExtras(json.data ?? [])
    setLoading(false)
  }, [token])

  useEffect(() => {
    load() // eslint-disable-line react-hooks/set-state-in-effect
  }, [load])

  async function uploadNewImage(file: File) {
    setUploadingNew(true)
    const form = new FormData()
    form.append("image", file)
    form.append("name", newName || "extra")
    const res = await fetch("/api/upload/extra", { method: "POST", body: form })
    const json = await res.json()
    if (json.url) setNewImageUrl(json.url)
    setUploadingNew(false)
  }

  async function handleAdd() {
    if (!newName.trim()) return
    setAdding(true)
    await fetch("/api/backend/admin/extras", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: newName.trim(),
        price: parseFloat(newPrice) || 0,
        imageUrl: newImageUrl.trim() || null,
        active: true,
      }),
    })
    setNewName("")
    setNewPrice("")
    setNewImageUrl("")
    setShowForm(false)
    setAdding(false)
    load()
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover este adicional? Pedidos já feitos não serão afetados.")) return
    await fetch(`/api/backend/admin/extras/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    load()
  }

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
            Adicionais
          </h1>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition active:scale-95"
          style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
        >
          <Plus className="h-4 w-4" /> Novo adicional
        </button>
      </div>

      {/* Formulário novo adicional */}
      {showForm && (
        <div
          className="mb-6 rounded-2xl p-4"
          style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.2)" }}
        >
          <p className="mb-3 text-sm font-semibold text-white/70">Novo adicional</p>
          <div className="flex flex-wrap items-end gap-3">
            {/* Image picker */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-white/5"
                onClick={() => newFileRef.current?.click()}
              >
                {newImageUrl ? (
                  <Image
                    src={newImageUrl}
                    alt="preview"
                    fill
                    className="object-cover"
                    unoptimized={newImageUrl.startsWith("http")}
                  />
                ) : (
                  <ImageOff className="h-7 w-7 text-white/20" />
                )}
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 opacity-0 transition hover:opacity-100">
                  {uploadingNew ? (
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  ) : (
                    <Upload className="h-5 w-5 text-white" />
                  )}
                </div>
                <input
                  ref={newFileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && uploadNewImage(e.target.files[0])}
                />
              </div>
              <span className="text-[10px] text-white/30">Imagem</span>
            </div>

            <div className="min-w-36 flex-1">
              <label className="mb-1 block text-xs text-white/50">Nome do adicional</label>
              <input
                className={inputCls}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Bacon, Ovo frito..."
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
            <div className="w-28">
              <label className="mb-1 block text-xs text-white/50">Preço (R$)</label>
              <input
                className={inputCls}
                type="number"
                min="0"
                step="0.50"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="3,00"
              />
            </div>
            <button
              onClick={handleAdd}
              disabled={adding || !newName.trim()}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
            >
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Adicionar
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-52 animate-pulse rounded-2xl"
              style={{ background: "var(--mob-s1)" }}
            />
          ))}
        </div>
      ) : extras.length === 0 ? (
        <div className="py-20 text-center text-sm text-white/25">
          Nenhum adicional cadastrado. Clique em &quot;Novo adicional&quot; para começar.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {extras.map((e) => (
            <ExtraCard
              key={e.id}
              extra={e}
              token={token!}
              onUpdated={load}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <p className="mt-6 text-xs text-white/20">
        Adicionais inativos não aparecem como opção para o cliente no cardápio.
      </p>
    </div>
  )
}
