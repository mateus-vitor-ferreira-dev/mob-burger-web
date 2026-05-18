import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Entrar' };

const DISPLAY = 'var(--font-bebas), sans-serif';

const G_MURILO   = 'linear-gradient(to bottom, #FFFDE7 0%, #FFE082 25%, #FFCA28 55%, #FFB300 100%)';
const G_ORIGINAL = 'linear-gradient(to bottom, #FFB300 0%, #FF8F00 30%, #FF6D00 65%, #F4511E 100%)';
const G_BURGER   = 'linear-gradient(to bottom, #E64A19 0%, #C62828 45%, #B71C1C 75%, #7B1414 100%)';

const clip = {
  WebkitBackgroundClip: 'text' as const,
  WebkitTextFillColor: 'transparent' as const,
  backgroundClip: 'text' as const,
};

const TEXTURE = `url("data:image/svg+xml,%3Csvg width='52' height='52' viewBox='0 0 52 52' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z' fill='%23ffffff' fill-opacity='0.025' fill-rule='evenodd'/%3E%3C/svg%3E")`;

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">

      {/* ── Painel esquerdo — hero igual à landing ── */}
      <div
        className="relative hidden w-1/2 overflow-hidden lg:flex lg:flex-col lg:justify-center"
        style={{ background: '#08070B' }}
      >
        {/* Glow fogo radial */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(circle, rgba(255,110,0,0.13) 0%, rgba(255,69,0,0.05) 45%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        <div
          className="relative z-10 flex flex-col justify-center px-10"
          style={{ minHeight: '100%', paddingTop: '4rem', paddingBottom: '4rem' }}
        >
          {/* Eyebrow */}
          <p style={{
            fontFamily: 'var(--font-geist-sans)',
            fontSize: '0.65rem',
            letterSpacing: '0.28em',
            color: '#FF4500',
            textTransform: 'uppercase',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            marginBottom: '1.5rem',
          }}>
            <span style={{ width: '28px', height: '1px', background: '#FF4500', display: 'inline-block' }} />
            Artesanal · Lavras/MG
          </p>

          {/* Grid: texto chama | M·O·B fantasma */}
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', alignItems: 'center', gap: 'clamp(0.5rem, 2vw, 2rem)' }}>
            <h1 style={{ fontFamily: DISPLAY, lineHeight: 0.87, letterSpacing: '-0.01em' }}>
              <div style={{ overflow: 'clip' }}>
                <div style={{ fontSize: 'clamp(4rem, 9vw, 9rem)', background: G_MURILO, ...clip }}>MURILO</div>
              </div>
              <div style={{ overflow: 'clip' }}>
                <div style={{ fontSize: 'clamp(2.8rem, 7vw, 7rem)', background: G_ORIGINAL, ...clip }}>ORIGINAL</div>
              </div>
              <div style={{ overflow: 'clip' }}>
                <div style={{ fontSize: 'clamp(4rem, 9vw, 9rem)', background: G_BURGER, ...clip }}>BURGER</div>
              </div>
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 0.85 }}>
              {[
                { letter: 'M', stroke: 'rgba(255,225,80,0.28)' },
                { letter: 'O', stroke: 'rgba(255,140,0,0.24)' },
                { letter: 'B', stroke: 'rgba(200,40,20,0.22)' },
              ].map(({ letter, stroke }) => (
                <span key={letter} style={{
                  fontFamily: DISPLAY,
                  fontSize: 'clamp(3rem, 6vw, 6rem)',
                  color: 'transparent',
                  WebkitTextStroke: `2px ${stroke}`,
                  display: 'block',
                  textAlign: 'center',
                  userSelect: 'none',
                }}>
                  {letter}
                </span>
              ))}
              <p style={{
                fontFamily: 'var(--font-geist-sans)',
                fontSize: '0.52rem',
                letterSpacing: '0.18em',
                color: 'rgba(255,150,0,0.3)',
                textTransform: 'uppercase',
                marginTop: '0.5rem',
                textAlign: 'center',
              }}>
                Murilo Original Burger
              </p>
            </div>
          </div>

          {/* Tagline */}
          <p style={{
            fontFamily: 'var(--font-geist-sans)',
            fontSize: 'clamp(0.75rem, 1.1vw, 0.9rem)',
            color: 'rgba(240,234,224,0.45)',
            lineHeight: 1.65,
            marginTop: '2rem',
            maxWidth: '340px',
          }}>
            Ingredientes premium, pão brioche fresquinho e aquele blend que você não encontra em
            nenhuma rede. Peça agora direto, sem comissão.
          </p>
        </div>
      </div>

      {/* ── Painel direito — formulário (sempre escuro) ── */}
      <div
        className="dark relative flex w-full flex-col items-center justify-center bg-[#100E17] lg:w-1/2"
        style={{
          backgroundImage: TEXTURE,
          borderLeft: '1px solid rgba(255, 100, 0, 0.12)',
          minHeight: '100vh',
        }}
      >
        {/* Glow sutil espelhando o painel esquerdo */}
        <div
          className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2"
          style={{ width: '180px', height: '320px', background: 'rgba(255,100,0,0.05)', filter: 'blur(48px)', borderRadius: '50%' }}
        />

        <div className="relative z-10 w-full max-w-sm px-2">
          {children}
        </div>
      </div>

    </div>
  );
}
