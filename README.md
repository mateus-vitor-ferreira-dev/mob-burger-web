# Mob Burger — Web

Frontend do sistema de pedidos online **Mob Burger**, desenvolvido pela **Codexa**.

## Sobre

Aplicação Next.js que cobre dois fluxos principais:

- **Loja:** cliente monta o pedido, escolhe o pagamento (Pix ou cartão via Stripe) e acompanha o status em tempo real
- **Painel:** operador da cozinha visualiza os pedidos recebidos e atualiza o status de cada um

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Zustand (estado global) + TanStack Query (cache de dados)
- React Hook Form + Zod (formulários e validação)
- Stripe (Pix + Cartão)
- Server-Sent Events (SSE) para atualizações em tempo real

## Rodando localmente

```bash
npm install
cp .env.example .env.local  # preencha as variáveis
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_API_URL` | URL da mob-burger-api |
| `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` | Chave pública do Stripe |

## Deploy

O frontend é implantado na **Vercel**. A API roda no Railway.

Repositório da API: [mob-burger-api](https://github.com/mateus-vitor-ferreira-dev/mob-burger-api)

---

Desenvolvido por **Codexa** — [github.com/mateus-vitor-ferreira-dev](https://github.com/mateus-vitor-ferreira-dev)
