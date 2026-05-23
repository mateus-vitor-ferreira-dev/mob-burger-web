import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Acompanhar pedido",
  description: "Acompanhe o status do seu pedido em tempo real.",
}

export default function AcompanharLayout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}
