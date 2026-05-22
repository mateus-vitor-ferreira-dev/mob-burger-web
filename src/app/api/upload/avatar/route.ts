import { NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"

const MAX_SIZE = 2 * 1024 * 1024 // 2 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"]

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get("avatar") as File | null

    if (!file) return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    if (!ALLOWED.includes(file.type))
      return NextResponse.json(
        { error: "Formato inválido. Use JPG, PNG ou WebP." },
        { status: 400 },
      )
    if (file.size > MAX_SIZE)
      return NextResponse.json({ error: "Arquivo muito grande. Máximo 2 MB." }, { status: 400 })

    const ext = file.type.split("/")[1].replace("jpeg", "jpg")
    const filename = `${randomUUID()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars")
    await writeFile(path.join(uploadDir, filename), buffer)

    return NextResponse.json({ url: `/uploads/avatars/${filename}` })
  } catch {
    return NextResponse.json({ error: "Erro ao fazer upload" }, { status: 500 })
  }
}
