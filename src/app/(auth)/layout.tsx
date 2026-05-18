import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Entrar' };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Painel esquerdo — brand */}
      <div className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden bg-zinc-950 lg:flex">
        {/* Glow de fundo */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.705_0.213_47.604/0.25)_0%,transparent_65%)]" />

        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <span className="text-8xl font-black tracking-tighter text-white">
              MOB
            </span>
            <div className="h-1 w-24 rounded-full bg-primary" />
            <span className="text-2xl font-semibold tracking-widest text-zinc-400 uppercase">
              Burger
            </span>
          </div>

          <p className="max-w-xs text-sm leading-relaxed text-zinc-500">
            Ingredientes premium, pão brioche fresquinho e muito sabor em cada mordida.
          </p>
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        {children}
      </div>
    </div>
  );
}
