import { type NextRequest } from "next/server"

export const dynamic = "force-dynamic"

const API_URL = process.env.API_URL ?? "http://localhost:3002"

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization") ?? ""

  const backendRes = await fetch(`${API_URL}/api/orders/stream`, {
    headers: { Authorization: auth, Accept: "text/event-stream" },
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
