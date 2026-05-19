// ─── Burgers & Chicken ───────────────────────────────────────────────────────
// Adicione novos itens aqui — TOTAL_ITEMS se atualiza automaticamente.
//
// Campo `img`:
//   - null → usa o gradiente placeholder (cor de fundo automática)
//   - "/images/b01.jpg" → aparece como background com cover no painel esquerdo
//
// Para adicionar uma foto, coloque o arquivo em public/images/ e preencha o campo:
//   img: "/images/b01.jpg"

export const MENU_ITEMS = [
  // Burgers
  {
    id: "B-01",
    name: "MOB CLASSIC",
    price: "R$ 28",
    emoji: "🍔",
    badge: "MAIS PEDIDO",
    cat: "burger" as const,
    img: null,
  },
  {
    id: "B-02",
    name: "MOB BACON",
    price: "R$ 32",
    emoji: "🥓",
    badge: null,
    cat: "burger" as const,
    img: null,
  },
  {
    id: "B-03",
    name: "MOB GODFATHER",
    price: "R$ 42",
    emoji: "🍔",
    badge: "SIGNATURE",
    cat: "burger" as const,
    img: null,
  },
  {
    id: "B-04",
    name: "MOB SUNRISE",
    price: "R$ 33",
    emoji: "🍳",
    badge: "NOVO",
    cat: "burger" as const,
    img: null,
  },
  {
    id: "B-05",
    name: "MOB CHAOS",
    price: "R$ 37",
    emoji: "🔥",
    badge: null,
    cat: "burger" as const,
    img: null,
  },
  {
    id: "B-06",
    name: "MOB DELI",
    price: "R$ 31",
    emoji: "🍔",
    badge: "NOVO",
    cat: "burger" as const,
    img: null,
  },
  {
    id: "B-07",
    name: "MOB ITALIAN",
    price: "R$ 36",
    emoji: "🍝",
    badge: null,
    cat: "burger" as const,
    img: null,
  },
  {
    id: "B-08",
    name: "MOB BRUNCH",
    price: "R$ 34",
    emoji: "🍳",
    badge: "NOVO",
    cat: "burger" as const,
    img: null,
  },
  {
    id: "B-09",
    name: "MOB KING",
    price: "R$ 48",
    emoji: "👑",
    badge: "PREMIUM",
    cat: "burger" as const,
    img: null,
  },
  {
    id: "B-10",
    name: "MOB STREET",
    price: "R$ 30",
    emoji: "🍔",
    badge: "ESPECIAL",
    cat: "burger" as const,
    img: null,
  },
  {
    id: "B-11",
    name: "MOB BEAST",
    price: "R$ 44",
    emoji: "💥",
    badge: "TENDÊNCIA",
    cat: "burger" as const,
    img: null,
  },
  {
    id: "B-12",
    name: "MOB JOKER",
    price: "R$ 46",
    emoji: "🃏",
    badge: null,
    cat: "burger" as const,
    img: null,
  },
  {
    id: "B-13",
    name: "MOB ORIGINAL",
    price: "R$ 34",
    emoji: "🍔",
    badge: "TOP VENDA",
    cat: "burger" as const,
    img: null,
  },
  {
    id: "B-14",
    name: "MOB FULL",
    price: "R$ 52",
    emoji: "🏆",
    badge: "DEFINITIVO",
    cat: "burger" as const,
    img: null,
  },
  // Chicken
  {
    id: "C-01",
    name: "MOB CHICKEN",
    price: "R$ 30",
    emoji: "🍗",
    badge: "TENDÊNCIA",
    cat: "chicken" as const,
    img: null,
  },
  {
    id: "C-02",
    name: "MOB CHICKEN BACON",
    price: "R$ 35",
    emoji: "🍗",
    badge: null,
    cat: "chicken" as const,
    img: null,
  },
  {
    id: "C-03",
    name: "MOB CHICKEN SUNRISE",
    price: "R$ 34",
    emoji: "🍗",
    badge: "NOVO",
    cat: "chicken" as const,
    img: null,
  },
  {
    id: "C-04",
    name: "MOB CHICKEN FULL",
    price: "R$ 44",
    emoji: "🍗",
    badge: "ESPECIAL",
    cat: "chicken" as const,
    img: null,
  },
]

export type MenuItem = (typeof MENU_ITEMS)[number]

// ─── Sobremesas ───────────────────────────────────────────────────────────────

export const DESSERTS = [
  {
    id: "D-01",
    name: "MOB BOMBOM DE MORANGO",
    price: "R$ 12",
    emoji: "🍓",
    badge: "ARTESANAL",
    desc: "Casca de chocolate com recheio cremoso de morango. Artesanal, feito na hora.",
  },
  {
    id: "D-02",
    name: "MOB BROWNIE",
    price: "R$ 18",
    emoji: "🍫",
    badge: "ARTESANAL",
    desc: "Brownie de leite ninho e Nutella com pedaços de Bis, KitKat e confete colorido.",
  },
  {
    id: "D-03",
    name: "MOB COOKIE",
    price: "R$ 10",
    emoji: "🍪",
    badge: "ARTESANAL",
    desc: "Cookie artesanal com gotas de chocolate. Crocante por fora, macio por dentro.",
  },
  {
    id: "D-04",
    name: "MOB COOKIE NUTELLA",
    price: "R$ 13",
    emoji: "🍬",
    badge: "ARTESANAL",
    desc: "Cookie artesanal recheado com Nutella. Parte de fora crocante, recheio cremoso por dentro.",
  },
]

export type DessertItem = (typeof DESSERTS)[number]

// ─── Bebidas ──────────────────────────────────────────────────────────────────

export const DRINKS = [
  { id: "DK-01", name: "COCA-COLA", detail: "Original · Lata 350ml", price: "R$ 7", emoji: "🥤" },
  {
    id: "DK-02",
    name: "COCA-COLA ZERO",
    detail: "Zero Açúcar · Lata 350ml",
    price: "R$ 7",
    emoji: "🥤",
  },
  { id: "DK-03", name: "GUARANÁ", detail: "Original · Lata 350ml", price: "R$ 6", emoji: "🥤" },
  {
    id: "DK-04",
    name: "GUARANÁ ZERO",
    detail: "Zero Açúcar · Lata 350ml",
    price: "R$ 6",
    emoji: "🥤",
  },
]

// ─── Combos ───────────────────────────────────────────────────────────────────

export const COMBOS = [
  { id: "CM-01", name: "MOB COMBO CLÁSSICO", price: "R$ 38", save: "até R$ 6 de desconto" },
  { id: "CM-02", name: "MOB COMBO PREMIUM", price: "R$ 50", save: "até R$ 8 de desconto" },
  { id: "CM-03", name: "MOB COMBO SWEET", price: "R$ 52", save: "até R$ 10 de desconto" },
  { id: "CM-04", name: "MOB PARA 2", price: "R$ 68", save: "até R$ 12 de desconto" },
  { id: "CM-05", name: "MOB FAMÍLIA", price: "R$ 109", save: "até R$ 20 de desconto" },
]

// ─── Total ────────────────────────────────────────────────────────────────────
// Atualiza sozinho quando novos itens são adicionados em qualquer array acima.

export const TOTAL_ITEMS = MENU_ITEMS.length + DESSERTS.length + DRINKS.length + COMBOS.length
