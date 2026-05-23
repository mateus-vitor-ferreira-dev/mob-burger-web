import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cardápio",
  description: "Smash burgers, chicken, combos, bebidas e sobremesas. Faça seu pedido online.",
}

export default function CardapioLayout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}
