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

### Pré-requisitos

| | Versão | Por quê |
|---|---|---|
| **Node.js** | `>= 20.9.0` | Piso do Next 16.2.6 (`engines` do próprio Next, no `package-lock.json`). O projeto tipa contra `@types/node@20`. |
| **npm** | o que acompanha o Node 20 | `package-lock.json` v3. |
| **API do M.O.B Burger** | rodando em `:3002` | **Obrigatória.** Sem ela o app sobe, mas o cardápio, o login e a fila da cozinha voltam vazios. |

Este repositório é só o frontend: **não existe cardápio, usuário ou pedido sem a API**. Suba o
**mob-burger-api** primeiro — migrations,
seed e `npm run dev`, que serve em `http://localhost:3002`. É um repositório privado, por ser código de cliente.

### Passo a passo

```bash
# 1. Clone e instale
git clone https://github.com/mateus-vitor-ferreira-dev/mob-burger-web.git
cd mob-burger-web
npm install                  # o "prepare" instala os hooks do husky junto

# 2. Em OUTRO terminal, na pasta do mob-burger-api: migrations + seed + dev.
#    Confirme que respondeu antes de seguir:
curl http://localhost:3002/health

# 3. Crie o .env.local na raiz e cole o bloco da seção abaixo.
#    Não há .env.example neste repo — o bloco abaixo é a referência.

# 4. Suba o app
npm run dev                  # http://localhost:3000
```

### Variáveis de ambiente

Todas ficam em `.env.local` na raiz. As `NEXT_PUBLIC_*` são embutidas no bundle do browser — **nunca coloque
segredo nelas**; as demais só existem no servidor (rotas de proxy e de upload).

```ini
# ─── API ────────────────────────────────────────────────────────────────────
# URL da API do M.O.B Burger. Defina SEMPRE, mesmo em dev: os defaults do código
# são inconsistentes (/api/auth/* assume :3333, o proxy e os streams SSE, :3002).
API_URL=http://localhost:3002

# ─── Auth ───────────────────────────────────────────────────────────────────
# Obrigatória para o upload de avatar. Precisa ser EXATAMENTE o mesmo JWT_SECRET
# da API: /api/upload/avatar valida localmente (jose) o token que a API emitiu.
# Divergiu → todo upload de avatar responde 401.
JWT_SECRET=

# OAuth client (tipo "Web application") do Google Cloud Console — o MESMO valor
# do GOOGLE_CLIENT_ID da API, senão ela rejeita o credential do popup.
# Autorize http://localhost:3000 em "Authorized JavaScript origins".
# Opcional: vazio, só o "entrar com Google" para de funcionar — login por senha segue.
NEXT_PUBLIC_GOOGLE_CLIENT_ID=

# ─── Web Push — opcional em dev ─────────────────────────────────────────────
# Chave PÚBLICA VAPID. Tem que ser o par da VAPID_PRIVATE_KEY da API: gere as duas
# de uma vez (npx web-push generate-vapid-keys), pública aqui, privada lá.
# Vazia → o app não pede permissão e subscribePush() retorna false, em silêncio.
NEXT_PUBLIC_VAPID_PUBLIC_KEY=

# ─── Cloudinary — opcional em dev ───────────────────────────────────────────
# Credenciais do dashboard do Cloudinary. Só as rotas /api/upload/* usam.
# Vazias → o upload de produto/categoria/avatar falha; o resto do app funciona.
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Cloud name exposto ao browser — monta a URL das imagens de categoria.
# Vazio → cai no arquivo local /categories/<slug>.png.
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=

# ─── Opcionais ──────────────────────────────────────────────────────────────
# URL pública do app: base do sitemap.ts e do metadataBase do layout raiz.
# Fora do arquivo, o layout assume http://localhost:3000 e o sitemap, a URL de produção.
NEXT_PUBLIC_APP_URL=http://localhost:3000

# WhatsApp do link flutuante — país + DDD + número (ex.: 5535991234567).
# Vazio → o link simplesmente não aparece.
NEXT_PUBLIC_WHATSAPP=
```

> **Nunca commite `.env*`** — o `.gitignore` já cobre o padrão inteiro. As chaves de produção vivem só no Vercel.

### Endpoints locais

`npm run dev` é `next dev` sem `-p`, então a porta é a default do Next.

| | URL |
|---|---|
| **Loja** — home | `http://localhost:3000` |
| Cardápio | `http://localhost:3000/cardapio` |
| Carrinho → pagamento | `http://localhost:3000/carrinho` |
| Acompanhar pedido (SSE) | `http://localhost:3000/acompanhar/<id>` |
| **Painel** — cozinha | `http://localhost:3000/admin` |
| Login do painel | `http://localhost:3000/admin/login` |
| Fila de pedidos (SSE) | `http://localhost:3000/admin/pedidos` |
| API (repo irmão) | `http://localhost:3002` |

### Como verificar que subiu

1. **Loja** — `http://localhost:3000` mostra a home com as categorias e os produtos do seed. Cardápio vazio ou
   toast de *"Serviço indisponível"* significa API fora do ar (o proxy responde 503 quando não alcança o backend).
2. **Painel** — `http://localhost:3000/admin/login` e entre com um usuário de **staff do seed da API**
   (`npm run prisma:seed`, no repo da API, cria o cardápio e os usuários de exemplo; as credenciais são de lá,
   este repo não define nenhuma).
3. **Tempo real** — deixe `/admin/pedidos` aberto e finalize um pedido na loja em outra aba. O pedido entra na
   fila **sem refresh**: é o SSE de ponta a ponta, que é o caminho mais fácil de provar que app e API estão realmente conversando.

### Problemas comuns

**Login dá 503 e o resto do app funciona.** É a pegadinha da casa: `API_URL` não está definida e
`/api/auth/[...path]` cai no default `http://localhost:3333`, enquanto o proxy geral e os streams caem em `:3002`.
Metade do app acha a API, metade não. Defina `API_URL` explicitamente.

**Mudou `.env.local` e nada mudou.** As `NEXT_PUBLIC_*` são inlined em build time — reinicie o `npm run dev`.

**Push não pede permissão, ou pede e nunca chega.** Vazia, a `NEXT_PUBLIC_VAPID_PUBLIC_KEY` faz
`subscribePush()` retornar `false` sem erro nenhum. Preenchida mas fora do par da `VAPID_PRIVATE_KEY` da API, é
pior: o browser aceita a inscrição e o envio falha lá no backend. Gere o par de uma vez só e distribua as duas metades.

**Porta 3000 ocupada.** O `next dev` sobe em outra porta e não avisa mais que isso — aí `NEXT_PUBLIC_APP_URL` e a
origin autorizada no Google OAuth ficam apontando para a porta errada, e o login com Google para.

**Upload de avatar responde 401 com token válido.** `JWT_SECRET` daqui está diferente do da API.

**Imagens de categoria quebradas sem Cloudinary.** O fallback é `/categories/<slug>.png` e o repo só versiona
`pizza.jpg`. Esperado em dev, não é erro de setup.

> CORS não está nesta lista de propósito — o browser nunca fala com a API, só com o próprio Next, que faz o proxy
> no servidor. A única chamada cross-origin do frontend é o ViaCEP, que é público.

### Scripts

```bash
npm run dev            # next dev — hot reload em http://localhost:3000
npm run build          # build de produção
npm start              # serve o build (next start)
npm run lint           # ESLint
npm run lint:fix       # ESLint com --fix
npm run format         # Prettier --write em tudo
npm run format:check   # Prettier --check (não escreve)
```

O `prepare` roda sozinho no `npm install` e instala o husky. No commit, o lint-staged passa Prettier + ESLint
(`--max-warnings=0`) nos `.ts`/`.tsx` staged — lint quebrado não vira commit.

---

<div align="center">
  <sub>Desenvolvido pela <strong>Codexa</strong> · <a href="https://github.com/mateus-vitor-ferreira-dev/mob-burger-landing">Landing page do projeto</a></sub>
</div>
