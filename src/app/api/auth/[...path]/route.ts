import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.API_URL ?? "http://localhost:3333"

// Proxy genérico: /api/auth/* → mob-burger-api/api/auth/*
async function proxy(request: NextRequest, path: string[]) {
  const endpoint = `${API_URL}/api/auth/${path.join("/")}`

  const body = request.method !== "GET" ? await request.text() : undefined

  const res = await fetch(endpoint, {
    method: request.method,
    headers: { "Content-Type": "application/json" },
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
