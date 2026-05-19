import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Permite que o popup do Google OAuth se comunique com a janela pai.
          // O padrão "same-origin" do Next.js bloqueia window.closed no popup OAuth.
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
        ],
      },
    ]
  },
}

export default nextConfig
