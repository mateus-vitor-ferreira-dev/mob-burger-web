import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.API_URL ?? "http://localhost:3002"

export async function proxyToBackend(request: NextRequest, segments: string[]) {
  const endpoint = `${API_URL}/api/${segments.join("/")}`

  const isRaw = request.headers.get("content-type")?.includes("application/json")
  const body = request.method !== "GET" ? await request.text() : undefined

  const headers: Record<string, string> = {}
  if (isRaw || body) headers["content-type"] = "application/json"

  const auth = request.headers.get("authorization")
  if (auth) headers["authorization"] = auth

  const res = await fetch(endpoint, {
    method: request.method,
    headers,
    body,
  }).catch(() => null)

  if (!res)
    return NextResponse.json({ error: { message: "Serviço indisponível" } }, { status: 503 })

  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}
