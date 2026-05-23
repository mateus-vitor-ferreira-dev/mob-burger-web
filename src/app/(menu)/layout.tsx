import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { CartButton } from "@/components/cart-button"
import { UserMenu } from "@/components/user-menu"
import { ThemeToggle } from "@/components/theme-toggle"

export const metadata: Metadata = {
  title: { default: "M.O.B Burger", template: "%s | M.O.B Burger" },
}

const SVG_SHAPE =
  `<text x="8" y="54" font-family="Arial Black,Impact,Arial,sans-serif" font-weight="900" font-size="42" letter-spacing="8">MOB</text>` +
  `<g transform="translate(158,14)"><path d="M5 32 Q5 4 38 4 Q70 4 70 32Z"/><rect x="2" y="32" width="70" height="7" rx="3"/><rect x="2" y="40" width="70" height="12" rx="3"/><rect x="4" y="53" width="66" height="13" rx="6"/></g>`

const MOB_PATTERN_DARK = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="240" height="110" fill="white">${SVG_SHAPE}</svg>`)}`
const MOB_PATTERN_LIGHT = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="240" height="110" fill="rgba(60,35,10,0.85)">${SVG_SHAPE}</svg>`)}`

const patternBase: React.CSSProperties = {
  position: "absolute",
  inset: "-100%",
  transform: "rotate(-25deg)",
  backgroundRepeat: "repeat",
  backgroundSize: "240px 110px",
}

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen" style={{ background: "var(--mob-bg)" }}>
      {/* ── Background fixo — dá profundidade ao glassmorphism ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <Image
          src="/images/mob-banner.png"
          alt=""
          fill
          priority
          className="object-cover opacity-[0.22] dark:opacity-[0.28]"
          style={{ filter: "var(--mob-banner-filter)" }}
        />
        {/* Vignette */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 80% 80% at 50% 40%, transparent 0%, var(--mob-vignette) 100%)`,
          }}
        />
        {/* Padrão diagonal — dark: branco / light: marrom */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="mob-pattern-dark"
            style={{ ...patternBase, backgroundImage: `url("${MOB_PATTERN_DARK}")`, opacity: 0.07 }}
          />
          <div
            className="mob-pattern-light"
            style={{
              ...patternBase,
              backgroundImage: `url("${MOB_PATTERN_LIGHT}")`,
              opacity: 0.14,
            }}
          />
        </div>
      </div>

      {/* ── Header sticky ─────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b border-white/[0.07]"
        style={{
          background: "var(--mob-header-bg)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-6">
          {/* Brand */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <Image
              src="/mob-logo.png"
              alt="M.O.B"
              width={36}
              height={36}
              className="rounded-lg object-cover"
            />
            <div className="hidden sm:block">
              <p
                className="text-sm leading-none font-semibold tracking-[0.18em]"
                style={{ color: "var(--mob-text-primary)" }}
              >
                M.O.B
              </p>
              <p className="text-[10px]" style={{ color: "var(--mob-text-tertiary)" }}>
                Burgers Pack Co.
              </p>
            </div>
          </Link>

          {/* Nav — centro */}
          <nav className="flex flex-1 items-center justify-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium transition-colors hover:text-orange-500"
              style={{ color: "var(--mob-text-secondary)" }}
            >
              Início
            </Link>
            <Link
              href="/cardapio"
              className="text-sm font-medium transition-colors hover:text-orange-500"
              style={{ color: "var(--mob-text-secondary)" }}
            >
              Cardápio
            </Link>
          </nav>

          {/* Ações — direita */}
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <UserMenu />
            <CartButton />
          </div>
        </div>
      </header>

      {/* ── Conteúdo sobre o background ───────────────────────── */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
