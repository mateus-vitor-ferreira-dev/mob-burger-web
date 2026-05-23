import { NextRequest, NextResponse } from "next/server"
import { uploadBuffer } from "@/lib/cloudinary"

const MAX_SIZE = 3 * 1024 * 1024
const ALLOWED = ["image/jpeg", "image/png", "image/webp"]

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get("image") as File | null
    const slug = form.get("slug") as string | null

    if (!file) return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    if (!slug) return NextResponse.json({ error: "Slug obrigatório" }, { status: 400 })
    if (!ALLOWED.includes(file.type))
      return NextResponse.json(
        { error: "Formato inválido. Use JPG, PNG ou WebP." },
        { status: 400 },
      )
    if (file.size > MAX_SIZE)
      return NextResponse.json({ error: "Arquivo muito grande. Máximo 3 MB." }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const url = await uploadBuffer(buffer, {
      folder: "mob-burger/categories",
      public_id: slug,
      overwrite: true,
    })

    return NextResponse.json({ url })
  } catch {
    return NextResponse.json({ error: "Erro ao fazer upload" }, { status: 500 })
  }
}
