import { menuDoServidor } from "@/lib/backend-proxy"
import type { MenuCategory } from "@/lib/use-menu"
import CardapioCliente from "./cardapio-cliente"

// O cardápio muda pelo painel: a página é montada a cada visita (com cache curto na borda)
export const dynamic = "force-dynamic"

export default async function CardapioPage() {
  const menuInicial = await menuDoServidor<MenuCategory>()
  return <CardapioCliente menuInicial={menuInicial} />
}
