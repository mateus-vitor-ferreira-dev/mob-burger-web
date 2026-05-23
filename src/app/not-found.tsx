import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Página não encontrada" }

export default function NotFound() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center"
      style={{ background: "#0c0b09" }}
    >
      <p
        className="leading-none text-orange-500/20"
        style={{
          fontFamily: "var(--font-bebas)",
          fontSize: "clamp(6rem, 20vw, 12rem)",
          letterSpacing: "0.05em",
        }}
      >
        404
      </p>
      <div style={{ marginTop: "-2rem" }}>
        <h1
          className="mb-2 text-white"
          style={{
            fontFamily: "var(--font-bebas)",
            fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
            letterSpacing: "0.05em",
          }}
        >
          Página não encontrada
        </h1>
        <p className="text-sm text-white/40">
          A página que você procura não existe ou foi removida.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-xl px-6 py-3 text-sm font-semibold text-white transition active:scale-95"
        style={{
          background: "linear-gradient(135deg, #f97316, #ea580c)",
          boxShadow: "0 6px 20px rgba(249,115,22,0.3)",
        }}
      >
        Voltar para o início
      </Link>
    </div>
  )
}
