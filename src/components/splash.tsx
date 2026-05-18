'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';

export function Splash({ onComplete }: { onComplete: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const tl = gsap.timeline({
      onComplete() {
        document.body.style.overflow = '';
        onComplete();
      },
    });

    tl.set(wrapRef.current, { visibility: 'visible' })

      // Logo aparece rápido
      .from(logoRef.current, {
        opacity: 0,
        scale: 0.82,
        duration: 0.35,
        ease: 'power2.out',
      })

      // Pausa
      .to({}, { duration: 0.45 })

      // Whole screen fades out
      .to(wrapRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
      });

    return () => {
      tl.kill();
      document.body.style.overflow = '';
    };
  }, [onComplete]);

  return (
    <div
      ref={wrapRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ visibility: 'hidden', background: '#08070B' }}
    >
      {/* Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(255,100,0,0.18) 0%, transparent 70%)',
        }}
      />

      <div
        ref={logoRef}
        style={{ filter: 'drop-shadow(0 0 36px rgba(255,80,0,0.5))' }}
        className="relative z-10"
      >
        <Image
          src="/mob-logo.png"
          alt="Mob Burger"
          width={200}
          height={200}
          style={{ width: 'clamp(120px, 16vw, 200px)', height: 'auto' }}
          priority
        />
      </div>
    </div>
  );
}
