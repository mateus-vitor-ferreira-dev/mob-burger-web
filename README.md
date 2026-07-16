<div align="center">

<h1>🍔 M.O.B Burger — Web App</h1>

<p><strong>Plataforma de pedidos online e operação de cozinha para uma hamburgueria artesanal</strong></p>

<p>
  <a href="https://mob-burger-web.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/Ver_ao_vivo-mob--burger--web.vercel.app-FF4500?style=for-the-badge&logo=vercel&logoColor=white" alt="Demo ao vivo"/>
  </a>
</p>

<p>
  <img src="https://img.shields.io/badge/status-em_produção-16A34A?style=flat-square" alt="Em produção"/>
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind"/>
  <img src="https://img.shields.io/badge/deploy-Vercel-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel"/>
</p>

<img src="docs/preview.webp" alt="Navegação pela home e pelo cardápio do M.O.B Burger" width="100%"/>

</div>

---

## O problema

Hamburguerias que vendem por iFood e Aiqfome entregam **até 30% do ticket em comissão** e não ficam com o que mais importa: o cadastro do cliente, o histórico de pedidos e o canal de contato. Quem constrói a audiência é o marketplace, não a marca.

## A solução

Um canal de vendas próprio, ponta a ponta — o cliente monta o pedido, paga na entrega e acompanha em tempo real; a cozinha recebe no painel no mesmo instante, sem intermediário e sem comissão. O produto está **em produção**, atendendo uma hamburgueria real em Lavras/MG.

São dois produtos no mesmo app:

| | Para quem | O que faz |
|---|---|---|
| **Loja** | Cliente final | Cardápio com busca e filtros, carrinho, cupons, checkout e rastreamento do pedido ao vivo |
| **Painel** | Operação da cozinha | Pedidos em tempo real, estoque, cardápio, entregadores, cupons e financeiro |

---

## ✨ Destaques de engenharia

**Tempo real sem WebSocket.** O acompanhamento do pedido e a fila da cozinha usam **Server-Sent Events**, com reconexão automática a cada 5s. SSE é unidirecional — exatamente a forma do problema (servidor → cliente) — e atravessa proxy HTTP sem handshake especial, enquanto um WebSocket aqui só adicionaria infra para manter.

**Um BFF que esconde a API.** Rotas de proxy (`/api/backend/[...path]`, `/api/auth/[...path]`) repassam `Authorization` e `Content-Type` para o backend, com rotas dedicadas para os streams SSE. O browser nunca fala direto com a API: a URL do backend não vai para o bundle e o CORS deixa de existir como problema.

**Estoque que fecha o cardápio sozinho.** Cada produto tem ficha técnica de ingredientes; confirmar um pedido desconta o estoque e recalcula a disponibilidade, tirando o item do ar antes que alguém peça o que a cozinha não tem.

**Push notifications nativas.** Web Push API + VAPID com service worker próprio (`public/sw.js`): a cozinha é avisada de pedido novo mesmo com o painel fechado, e o cliente sabe quando o pedido saiu para entrega.

**SEO para quem precisa ser achado.** `sitemap.ts` gerado dinamicamente e JSON-LD `Restaurant` no layout raiz — o negócio existe para o Google, não só para quem já tem o link.

**Estado onde ele pertence.** Zustand persistido em `localStorage` para carrinho, sessão e entrega (sobrevive ao refresh); TanStack Query para o que é do servidor. Cache de servidor e estado de UI não se misturam.

---

## 🛠️ Stack

<table>
  <tbody>
    <tr>
      <td><strong>Framework</strong></td>
      <td><img src="https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=next.js&logoColor=white"/> (App Router) <img src="https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black"/> <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white"/></td>
    </tr>
    <tr>
      <td><strong>UI</strong></td>
      <td><img src="https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white"/> <img src="https://img.shields.io/badge/shadcn/ui-000000?style=flat-square"/> <img src="https://img.shields.io/badge/Lucide-222222?style=flat-square"/> <img src="https://img.shields.io/badge/Sonner-000000?style=flat-square"/></td>
    </tr>
    <tr>
      <td><strong>Estado</strong></td>
      <td><img src="https://img.shields.io/badge/Zustand-443E38?style=flat-square"/> (persist) <img src="https://img.shields.io/badge/TanStack_Query-FF4154?style=flat-square&logo=reactquery&logoColor=white"/></td>
    </tr>
    <tr>
      <td><strong>Formulários</strong></td>
      <td><img src="https://img.shields.io/badge/React_Hook_Form-EC5990?style=flat-square&logo=reacthookform&logoColor=white"/> <img src="https://img.shields.io/badge/Zod-3E67B1?style=flat-square&logo=zod&logoColor=white"/></td>
    </tr>
    <tr>
      <td><strong>Tempo real</strong></td>
      <td><img src="https://img.shields.io/badge/SSE-Server--Sent_Events-FF6B35?style=flat-square"/> <img src="https://img.shields.io/badge/Web_Push_+_VAPID-4285F4?style=flat-square"/></td>
    </tr>
    <tr>
      <td><strong>Mídia</strong></td>
      <td><img src="https://img.shields.io/badge/Cloudinary-3448C5?style=flat-square&logo=cloudinary&logoColor=white"/> — upload de produtos, categorias e avatar</td>
    </tr>
    <tr>
      <td><strong>Interação</strong></td>
      <td><img src="https://img.shields.io/badge/GSAP_3-88CE02?style=flat-square&logo=greensock&logoColor=black"/> <img src="https://img.shields.io/badge/Embla_Carousel-222222?style=flat-square"/> <img src="https://img.shields.io/badge/dnd--kit-000000?style=flat-square"/> <img src="https://img.shields.io/badge/Recharts-22B5BF?style=flat-square"/></td>
    </tr>
    <tr>
      <td><strong>Auth</strong></td>
      <td><img src="https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white"/> <img src="https://img.shields.io/badge/Google_OAuth-4285F4?style=flat-square&logo=google&logoColor=white"/></td>
    </tr>
    <tr>
      <td><strong>Deploy</strong></td>
      <td><img src="https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white"/> — auto-deploy a cada push em <code>main</code></td>
    </tr>
  </tbody>
</table>

---

## 🧭 O que dá para fazer

**Cliente**

- Cardápio com busca por nome ou ingrediente, filtro por categoria, faixa de preço e favoritos
- Produto com opções personalizáveis (rádio/checkbox) e observação por item
- Carrinho com cupom validado em tempo real, taxa por zona de entrega e endereço auto-preenchido por CEP (ViaCEP)
- Entrega ou retirada, com pagamento na entrega (dinheiro, cartão na maquininha ou PIX)
- Acompanhamento ao vivo com timeline de status, ETA, cancelamento e opt-in de push
- Perfil com avatar, endereço padrão, histórico e **refazer pedido** em um clique

**Operação**

- Fila de pedidos que se atualiza sozinha (SSE), troca de status, designação de entregador e impressão de comanda térmica
- Cardápio: CRUD de produtos e categorias, reordenação por drag-and-drop, toggle de disponibilidade
- Estoque: ingredientes, fichas técnicas, alerta de estoque baixo e histórico de movimentações
- Financeiro: receita diária, despesas por tipo, lucro bruto e exportação CSV
- Cupons (percentual, valor fixo, frete grátis), zonas de entrega, entregadores e equipe
- Configuração da loja: abrir/fechar, horários, WhatsApp e ocultar itens sem estoque

---

## 🚀 Rodando localmente

```bash
git clone https://github.com/mateus-vitor-ferreira-dev/mob-burger-web.git
cd mob-burger-web
npm install

cp .env.example .env.local   # veja as variáveis abaixo
npm run dev                  # http://localhost:3000
```

```ini
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3002
```

> Requer a **API do M.O.B Burger** rodando em `http://localhost:3002` — repositório privado por ser código de cliente.

---

<div align="center">
  <sub>Desenvolvido pela <strong>Codexa</strong> · <a href="https://github.com/mateus-vitor-ferreira-dev/mob-burger-landing">Landing page do projeto</a></sub>
</div>
