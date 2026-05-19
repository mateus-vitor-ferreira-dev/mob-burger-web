import Link from "next/link"
import Image from "next/image"
import { ShoppingBag } from "lucide-react"

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "#0c0b09" }}>
      {/* ── Header sticky ──────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b border-white/[0.07]"
        style={{ background: "rgba(12,11,9,0.92)", backdropFilter: "blur(16px)" }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/mob-logo.png"
              alt="M.O.B"
              width={36}
              height={36}
              className="rounded-lg object-cover"
            />
            <div>
              <p className="text-sm leading-none font-semibold tracking-[0.18em] text-white">
                M.O.B
              </p>
              <p className="text-[10px] text-white/40">Burgers Pack Co.</p>
            </div>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-white/60 transition-colors hover:text-white"
            >
              Início
            </Link>
            <Link
              href="/cardapio"
              className="text-sm font-medium text-white/60 transition-colors hover:text-white"
            >
              Cardápio
            </Link>
          </nav>

          {/* Cart — conectar ao store depois */}
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all active:scale-95"
            style={{
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              boxShadow: "0 4px 12px rgba(249,115,22,0.25)",
            }}
          >
            <ShoppingBag className="h-4 w-4" />
            Carrinho
          </button>
        </div>
      </header>

      {children}
    </div>
  )
}
