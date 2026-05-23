"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  LayoutDashboard,
  ClipboardList,
  Tag,
  Package,
  MapPin,
  Settings,
  Users,
  Bike,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react"
import { useStaff } from "@/lib/staff-store"
import { ThemeToggle } from "@/components/theme-toggle"

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

const NAV = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/pedidos", icon: ClipboardList, label: "Pedidos" },
  { href: "/admin/produtos", icon: Package, label: "Produtos" },
  { href: "/admin/categorias", icon: Tag, label: "Categorias" },
  { href: "/admin/zonas", icon: MapPin, label: "Zonas" },
  { href: "/admin/entregadores", icon: Bike, label: "Entregadores" },
  { href: "/admin/staff", icon: Users, label: "Equipe" },
  { href: "/admin/config", icon: Settings, label: "Config." },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { staff, token, logout } = useStaff()
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setMounted(true) // eslint-disable-line react-hooks/set-state-in-effect
  }, [])
  useEffect(() => {
    if (mounted && !token) router.push("/login")
  }, [mounted, token, router])

  if (!mounted) return null
  if (!token) return null

  function handleLogout() {
    logout()
    router.push("/admin/login")
  }

  return (
    <div className="relative flex min-h-screen" style={{ background: "var(--mob-bg)" }}>
      {/* Background — igual ao menu */}
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
      {/* Sidebar desktop */}
      <aside
        className="mob-on-dark relative z-10 hidden w-56 flex-col border-r lg:flex"
        style={{
          background: "var(--mob-admin-sidebar)",
          borderColor: "var(--mob-b1)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Brand */}
        <div
          className="flex items-center gap-2.5 px-4 py-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Image
            src="/mob-logo.png"
            alt="MOB"
            width={32}
            height={32}
            className="rounded-lg object-cover"
          />
          <div>
            <p className="text-xs font-bold tracking-widest text-white">M.O.B</p>
            <p className="text-[10px] text-white/30">Admin</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 p-3">
          {NAV.map((item) => {
            const active =
              item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
                style={
                  active
                    ? { background: "rgba(249,115,22,0.15)", color: "#f97316" }
                    : { color: "var(--mob-sidebar-inactive)" }
                }
              >
                <item.icon className="h-4 w-4 flex-none" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User + ações */}
        <div className="space-y-1 p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="mb-2 px-3">
            <p className="truncate text-xs font-medium text-white/70">{staff?.email}</p>
            <p className="text-[10px] text-white/30">{staff?.role}</p>
          </div>
          <Link
            href="/"
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/40 transition hover:bg-white/5 hover:text-white"
          >
            <ExternalLink className="h-4 w-4" /> Ver site
          </Link>
          <div className="flex items-center gap-2 px-3 py-1">
            <ThemeToggle />
            <span className="text-xs text-white/30">Tema</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/40 transition hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div
        className="mob-on-dark fixed top-0 right-0 left-0 z-30 flex h-14 items-center justify-between border-b px-4 lg:hidden"
        style={{
          background: "var(--mob-admin-mobile-header)",
          borderColor: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div className="flex items-center gap-2">
          <Image
            src="/mob-logo.png"
            alt="MOB"
            width={28}
            height={28}
            className="rounded-lg object-cover"
          />
          <span className="text-sm font-bold text-white">Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="text-white/60 hover:text-white"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <aside
            className="mob-on-dark absolute top-14 bottom-0 left-0 flex w-56 flex-col border-r"
            style={{
              background: "var(--mob-admin-sidebar-solid)",
              borderColor: "rgba(255,255,255,0.08)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex-1 space-y-0.5 p-3 pt-4">
              {NAV.map((item) => {
                const active =
                  item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
                    style={
                      active
                        ? { background: "rgba(249,115,22,0.15)", color: "#f97316" }
                        : { color: "var(--mob-sidebar-inactive)" }
                    }
                  >
                    <item.icon className="h-4 w-4 flex-none" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/40 transition hover:bg-white/5 hover:text-white"
              >
                <LogOut className="h-4 w-4" /> Sair
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main className="relative z-10 flex-1 overflow-auto pt-14 lg:pt-0">{children}</main>
    </div>
  )
}
