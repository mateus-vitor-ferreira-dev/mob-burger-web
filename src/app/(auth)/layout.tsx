import Image from "next/image"
import { AuthProviders } from "./providers"

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

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProviders>
      <div className="relative min-h-screen" style={{ background: "var(--mob-bg)" }}>
        {/* Background — mesma identidade da home */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <Image
            src="/images/mob-banner.png"
            alt=""
            fill
            priority
            className="object-cover opacity-[0.22] dark:opacity-[0.28]"
            style={{ filter: "var(--mob-banner-filter)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 80% 80% at 50% 40%, transparent 0%, var(--mob-vignette) 100%)`,
            }}
          />
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="mob-pattern-dark"
              style={{
                ...patternBase,
                backgroundImage: `url("${MOB_PATTERN_DARK}")`,
                opacity: 0.045,
              }}
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
        <div className="relative z-10">{children}</div>
      </div>
    </AuthProviders>
  )
}
