import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.API_URL ?? "http://localhost:3002"

/**
 * Respostas públicas que mudam pouco e podem sair do cache da Cloudflare mais
 * perto do cliente, em segundos. Só GET sem login; pedidos, login e painel nunca.
 * O status da loja tem cache curto para "fechar a loja" valer quase na hora.
 */
const CACHE_PUBLICO_SEGUNDOS: Record<string, number> = {
  menu: 60,
  extras: 60,
  "menu/status": 10,
  "menu/delivery-zones": 300,
}

/** Cache da Cloudflare (Workers); fora dela (dev local), não existe. */
function cacheDaBorda(): Cache | null {
  const storage = (globalThis as { caches?: CacheStorage & { default?: Cache } }).caches
  return storage?.default ?? null
}

export async function proxyToBackend(request: NextRequest, segments: string[]) {
  const path = segments.join("/")
  // Os parâmetros da URL (?from=...&month=...) também vão para a API
  const endpoint = `${API_URL}/api/${path}${request.nextUrl.search}`

  const isRaw = request.headers.get("content-type")?.includes("application/json")
  const body = request.method !== "GET" ? await request.text() : undefined

  const headers: Record<string, string> = {}
  if (isRaw || body) headers["content-type"] = "application/json"

  const auth = request.headers.get("authorization")
  if (auth) headers["authorization"] = auth

  const ttl = request.method === "GET" && !auth ? CACHE_PUBLICO_SEGUNDOS[path] : undefined
  const cache = ttl ? cacheDaBorda() : null
  const chave = new Request(endpoint)

  if (cache) {
    const guardada = await cache.match(chave).catch(() => undefined)
    if (guardada) return guardada
  }

  const res = await fetch(endpoint, {
    method: request.method,
    headers,
    body,
  }).catch(() => null)

  if (!res)
    return NextResponse.json({ error: { message: "Serviço indisponível" } }, { status: 503 })

  const data = await res.json().catch(() => ({}))
  const resposta = NextResponse.json(data, { status: res.status })

  if (cache && ttl && res.ok) {
    resposta.headers.set("Cache-Control", `public, max-age=${ttl}`)
    await cache.put(chave, resposta.clone()).catch(() => undefined)
  }
  return resposta
}
