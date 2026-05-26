import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacidade & Termos",
}

export default function PrivacidadePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10 pb-16">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-white/50 transition hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="text-xs font-semibold tracking-[0.3em] text-orange-400 uppercase">
            M.O.B Burger
          </p>
          <h1
            className="leading-none text-white"
            style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              letterSpacing: "0.05em",
            }}
          >
            Privacidade & Termos
          </h1>
        </div>
      </div>

      <div
        className="space-y-8 text-sm leading-relaxed"
        style={{ color: "var(--mob-text-secondary)" }}
      >
        <p className="text-xs" style={{ color: "var(--mob-text-tertiary)" }}>
          Última atualização: maio de 2026
        </p>

        {/* Política de Privacidade */}
        <section>
          <h2
            className="mb-4 text-white"
            style={{ fontFamily: "var(--font-bebas)", fontSize: "1.6rem", letterSpacing: "0.06em" }}
          >
            Política de Privacidade
          </h2>

          <div className="space-y-4">
            <div
              className="rounded-2xl p-5"
              style={{ background: "var(--mob-s1)", border: "1px solid var(--mob-b1)" }}
            >
              <h3 className="mb-2 font-semibold text-white">Dados que coletamos</h3>
              <ul className="space-y-1.5 text-white/60">
                <li>
                  • <strong className="text-white/80">Nome e e-mail</strong> — para identificação da
                  conta e comunicação sobre pedidos.
                </li>
                <li>
                  • <strong className="text-white/80">Telefone</strong> — para contato sobre o
                  status do seu pedido.
                </li>
                <li>
                  • <strong className="text-white/80">Endereço de entrega</strong> — exclusivamente
                  para processar entregas solicitadas por você.
                </li>
                <li>
                  • <strong className="text-white/80">Histórico de pedidos</strong> — para exibir
                  seus pedidos anteriores e permitir repetição.
                </li>
                <li>
                  • <strong className="text-white/80">Dados de pagamento</strong> — processados
                  inteiramente pelo Stripe; não armazenamos dados de cartão.
                </li>
              </ul>
            </div>

            <div
              className="rounded-2xl p-5"
              style={{ background: "var(--mob-s1)", border: "1px solid var(--mob-b1)" }}
            >
              <h3 className="mb-2 font-semibold text-white">Como usamos seus dados</h3>
              <ul className="space-y-1.5 text-white/60">
                <li>• Processar e entregar seus pedidos.</li>
                <li>• Enviar notificações sobre o status do pedido (push, quando autorizado).</li>
                <li>• Manter histórico para facilitar pedidos futuros.</li>
                <li>• Melhorar a experiência do aplicativo.</li>
              </ul>
              <p className="mt-3 text-white/40">
                Não vendemos, alugamos nem compartilhamos seus dados pessoais com terceiros para
                fins de marketing.
              </p>
            </div>

            <div
              className="rounded-2xl p-5"
              style={{ background: "var(--mob-s1)", border: "1px solid var(--mob-b1)" }}
            >
              <h3 className="mb-2 font-semibold text-white">Terceiros envolvidos</h3>
              <ul className="space-y-1.5 text-white/60">
                <li>
                  • <strong className="text-white/80">Stripe</strong> — processamento de pagamentos.{" "}
                  <a
                    href="https://stripe.com/br/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-400 hover:underline"
                  >
                    Política do Stripe
                  </a>
                  .
                </li>
                <li>
                  • <strong className="text-white/80">Google OAuth</strong> — autenticação opcional
                  via conta Google.{" "}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-400 hover:underline"
                  >
                    Política do Google
                  </a>
                  .
                </li>
                <li>
                  • <strong className="text-white/80">Cloudinary</strong> — armazenamento de imagens
                  de produtos e avatares.
                </li>
              </ul>
            </div>

            <div
              className="rounded-2xl p-5"
              style={{ background: "var(--mob-s1)", border: "1px solid var(--mob-b1)" }}
            >
              <h3 className="mb-2 font-semibold text-white">Seus direitos (LGPD)</h3>
              <p className="mb-3 text-white/60">
                Conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018), você tem direito a:
              </p>
              <ul className="space-y-1.5 text-white/60">
                <li>• Confirmar a existência de tratamento dos seus dados.</li>
                <li>• Acessar, corrigir ou excluir seus dados pessoais.</li>
                <li>• Revogar o consentimento a qualquer momento.</li>
                <li>• Portabilidade dos dados, quando aplicável.</li>
              </ul>
              <p className="mt-3 text-white/40">
                Para exercer seus direitos, entre em contato pelo WhatsApp ou e-mail listados no
                rodapé.
              </p>
            </div>

            <div
              className="rounded-2xl p-5"
              style={{ background: "var(--mob-s1)", border: "1px solid var(--mob-b1)" }}
            >
              <h3 className="mb-2 font-semibold text-white">Retenção e exclusão</h3>
              <p className="text-white/60">
                Seus dados são mantidos enquanto sua conta estiver ativa. Para solicitar a exclusão
                completa da conta e dos dados associados, entre em contato conosco. Dados de
                transações financeiras podem ser mantidos pelo prazo exigido pela legislação fiscal
                brasileira (5 anos).
              </p>
            </div>
          </div>
        </section>

        {/* Termos de Uso */}
        <section>
          <h2
            className="mb-4 text-white"
            style={{ fontFamily: "var(--font-bebas)", fontSize: "1.6rem", letterSpacing: "0.06em" }}
          >
            Termos de Uso
          </h2>

          <div className="space-y-4">
            <div
              className="rounded-2xl p-5"
              style={{ background: "var(--mob-s1)", border: "1px solid var(--mob-b1)" }}
            >
              <h3 className="mb-2 font-semibold text-white">Pedidos e pagamentos</h3>
              <ul className="space-y-1.5 text-white/60">
                <li>
                  • Ao confirmar um pedido, você concorda em pagar o valor total exibido, incluindo
                  taxas de entrega quando aplicável.
                </li>
                <li>
                  • Pedidos podem ser cancelados sem custo até o status <em>Confirmado</em>. Após
                  início do preparo, o cancelamento não é garantido.
                </li>
                <li>• Em caso de falha no pagamento, o pedido não será processado.</li>
              </ul>
            </div>

            <div
              className="rounded-2xl p-5"
              style={{ background: "var(--mob-s1)", border: "1px solid var(--mob-b1)" }}
            >
              <h3 className="mb-2 font-semibold text-white">Uso da plataforma</h3>
              <ul className="space-y-1.5 text-white/60">
                <li>• É proibido criar contas falsas ou usar a plataforma de forma fraudulenta.</li>
                <li>
                  • O conteúdo do cardápio (fotos, descrições, preços) é de propriedade do M.O.B
                  Burger e não pode ser reproduzido sem autorização.
                </li>
                <li>• Reservamo-nos o direito de suspender contas que violem estes termos.</li>
              </ul>
            </div>

            <div
              className="rounded-2xl p-5"
              style={{ background: "var(--mob-s1)", border: "1px solid var(--mob-b1)" }}
            >
              <h3 className="mb-2 font-semibold text-white">Limitação de responsabilidade</h3>
              <p className="text-white/60">
                O M.O.B Burger não se responsabiliza por atrasos causados por condições climáticas
                adversas, congestionamentos ou outras situações fora do nosso controle. Os tempos de
                entrega exibidos são estimativas.
              </p>
            </div>
          </div>
        </section>

        {/* Contato */}
        <section
          className="rounded-2xl p-5"
          style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.2)" }}
        >
          <h3 className="mb-2 font-semibold text-orange-400">Contato</h3>
          <p className="text-white/60">
            Dúvidas sobre privacidade, dados ou estes termos? Fale conosco:
          </p>
          <p className="mt-2 text-white/60">
            E-mail: <span className="text-white/80">contato@mobburguer.com.br</span>
          </p>
        </section>
      </div>
    </main>
  )
}
