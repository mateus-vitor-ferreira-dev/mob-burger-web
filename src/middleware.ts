import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Fica como `middleware` (e não `proxy`, o nome novo do Next 16) porque o `proxy` só roda
// em Node, e o OpenNext no Cloudflare Workers só aceita middleware no runtime Edge.

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/admin/login") return NextResponse.next()

  const hasSession = request.cookies.has("mob-admin")
  if (!hasSession) {
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
