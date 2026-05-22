import { type NextRequest } from "next/server"
import { proxyToBackend } from "@/lib/backend-proxy"

async function handle(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  return proxyToBackend(request, path)
}

export const GET = handle
export const POST = handle
export const PATCH = handle
export const DELETE = handle
