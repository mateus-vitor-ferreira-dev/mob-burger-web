# M.O.B Burger — Web App

Sistema de pedidos online da hamburgueria M.O.B (Lavras/MG), desenvolvido pela **Codexa**.

**Produção:** `https://mob-burger-web.vercel.app`

## Sobre

- **Loja:** cliente monta o pedido, escolhe o pagamento (na entrega) e acompanha em tempo real
- **Painel admin:** operador da cozinha visualiza pedidos recebidos via SSE e atualiza status

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Estilo | Tailwind CSS v4 + shadcn/ui |
| Estado | Zustand + TanStack Query |
| Formulários | React Hook Form + Zod |
| Real-time | Server-Sent Events (SSE) |
| Push | Web Push API + VAPID |
| Animações | GSAP 3 + Embla Carousel |
| Hosting | Vercel (auto-deploy) |

## Rodar localmente

```bash
npm install
cp .env.example .env.local   # preencha NEXT_PUBLIC_API_URL
npm run dev                   # http://localhost:3000
```

## Deploy

Push para `main` → deploy automático na Vercel.
