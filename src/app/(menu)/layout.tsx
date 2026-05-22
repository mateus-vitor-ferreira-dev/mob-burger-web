import Link from "next/link"
import Image from "next/image"
import { CartButton } from "@/components/cart-button"
import { UserMenu } from "@/components/user-menu"

const MOB_PATTERN = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="110" fill="white">` +
    `<text x="8" y="54" font-family="Arial Black,Impact,Arial,sans-serif" font-weight="900" font-size="42" letter-spacing="8">MOB</text>` +
    `<g transform="translate(158,14)">` +
    `<path d="M5 32 Q5 4 38 4 Q70 4 70 32Z"/>` +
    `<rect x="2" y="32" width="70" height="7" rx="3"/>` +
    `<rect x="2" y="40" width="70" height="12" rx="3"/>` +
    `<rect x="4" y="53" width="66" height="13" rx="6"/>` +
    `</g>` +
    `</svg>`,
)}`

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen" style={{ background: "#0c0b09" }}>
      {/* ── Background fixo — dá profundidade ao glassmorphism ── */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <Image
          src="/images/mob-banner.png"
          alt=""
          fill
          priority
          className="object-cover"
          style={{ opacity: 0.18, filter: "blur(48px) saturate(1.8)" }}
        />
        {/* Vignette para escurecer as bordas */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 80% at 50% 40%, transparent 0%, rgba(12,11,9,0.7) 100%)",
          }}
        />
        {/* Padrão diagonal MOB + burger */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            style={{
              position: "absolute",
              inset: "-100%",
              transform: "rotate(-25deg)",
              backgroundImage: `url("${MOB_PATTERN}")`,
              backgroundRepeat: "repeat",
              backgroundSize: "240px 110px",
              opacity: 0.045,
            }}
          />
        </div>
      </div>

      {/* ── Header sticky ─────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b border-white/[0.07]"
        style={{
          background: "rgba(12,11,9,0.75)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
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

          <UserMenu />
          <CartButton />
        </div>
      </header>

      {/* ── Conteúdo sobre o background ───────────────────────── */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
