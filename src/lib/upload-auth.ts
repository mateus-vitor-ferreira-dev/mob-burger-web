import type { NextRequest } from "next/server"
import * as jose from "jose"

/** Claims do access token emitido pelo mob-burger-api (mesmo JWT_SECRET). */
interface TokenPayload {
  sub?: string
  type?: "staff" | "customer"
  role?: string
}

/**
 * Confere o `Authorization: Bearer <token>` contra o JWT_SECRET da API. Devolve o
 * payload, ou null se faltar, vencer ou não bater a assinatura.
 */
export async function verifyBearer(req: NextRequest): Promise<TokenPayload | null> {
  try {
    const auth = req.headers.get("authorization") ?? ""
    const token = auth.replace(/^Bearer\s+/i, "")
    if (!token) return null
    const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "")
    const { payload } = await jose.jwtVerify<TokenPayload>(token, secret)
    return payload
  } catch {
    return null
  }
}

/**
 * Upload de imagem do cardápio (produto, categoria, adicional): só ADMIN, a mesma regra
 * que a API aplica em /api/admin. Sem isso, qualquer um sobrescreveria as fotos.
 */
export async function isAdmin(req: NextRequest): Promise<boolean> {
  const payload = await verifyBearer(req)
  return payload?.type === "staff" && payload.role === "ADMIN"
}
