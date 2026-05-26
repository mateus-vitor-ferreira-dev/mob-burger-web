import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Bebas_Neue } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { Providers } from "@/components/providers"
import "./globals.css"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })
const bebasNeue = Bebas_Neue({ variable: "--font-bebas", weight: "400", subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: { default: "M.O.B Burger — Burgers Pack Co.", template: "%s | M.O.B Burger" },
  description:
    "Hambúrgueres artesanais smashados na chapa. Combos exclusivos, ingredientes premium — feito na hora, sem frescura.",
  keywords: ["burger", "hamburguer", "smash burger", "artesanal", "mob burger", "delivery"],
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "MOB Burger" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "M.O.B Burger",
    title: "M.O.B Burger — Burgers Pack Co.",
    description: "Hambúrgueres artesanais smashados na chapa. Feito na hora, sem frescura.",
    images: [{ url: "/images/mob-banner.png", width: 1200, height: 630, alt: "M.O.B Burger" }],
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "M.O.B Burger — Burgers Pack Co.",
    description: "Hambúrgueres artesanais smashados na chapa. Feito na hora, sem frescura.",
    images: ["/images/mob-banner.png"],
  },
}

export const viewport: Viewport = {
  themeColor: "#f97316",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
