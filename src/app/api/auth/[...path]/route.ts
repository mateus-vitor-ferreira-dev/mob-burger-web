import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.API_URL ?? "http://localhost:3333"

// Proxy genérico: /api/auth/* → mob-burger-api/api/auth/*
async function proxy(request: NextRequest, path: string[]) {
  const endpoint = `${API_URL}/api/auth/${path.join("/")}`

  const body = request.method !== "GET" ? await request.text() : undefined

  const headers: Record<string, string> = { "Content-Type": "application/json" }
  const auth = request.headers.get("authorization")
  if (auth) headers["authorization"] = auth

  const res = await fetch(endpoint, {
    method: request.method,
    headers,
    body,
  }).catch(() => null)

  if (!res) {
    return NextResponse.json({ message: "Serviço indisponível" }, { status: 503 })
  }

  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params
  return proxy(request, path)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params
  return proxy(request, path)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params
  return proxy(request, path)
}
