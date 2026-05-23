import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import * as jose from "jose"
import { uploadBuffer } from "@/lib/cloudinary"

const MAX_SIZE = 2 * 1024 * 1024
const ALLOWED = ["image/jpeg", "image/png", "image/webp"]
const JWT_SECRET = process.env.JWT_SECRET ?? ""

async function verifyToken(req: NextRequest): Promise<boolean> {
  try {
    const auth = req.headers.get("authorization") ?? ""
    const token = auth.replace(/^Bearer\s+/i, "")
    if (!token) return false
    const secret = new TextEncoder().encode(JWT_SECRET)
    await jose.jwtVerify(token, secret)
    return true
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  if (!(await verifyToken(req))) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 })
  }

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

    const buffer = Buffer.from(await file.arrayBuffer())
    const url = await uploadBuffer(buffer, {
      folder: "mob-burger/avatars",
      public_id: randomUUID(),
      overwrite: false,
    })

    return NextResponse.json({ url })
  } catch {
    return NextResponse.json({ error: "Erro ao fazer upload" }, { status: 500 })
  }
}
