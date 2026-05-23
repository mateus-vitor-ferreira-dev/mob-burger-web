import { type NextRequest } from "next/server"

export const dynamic = "force-dynamic"

const API_URL = process.env.API_URL ?? "http://localhost:3002"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const backendRes = await fetch(`${API_URL}/api/orders/${id}/stream`, {
    headers: { Accept: "text/event-stream" },
  }).catch(() => null)

  if (!backendRes?.body) {
    return new Response("Service Unavailable", { status: 503 })
  }

  return new Response(backendRes.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  })
}
