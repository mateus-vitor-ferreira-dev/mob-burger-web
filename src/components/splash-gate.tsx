'use client';

import { useState, useEffect } from 'react';
import { Splash } from './splash';

export function SplashGate({ children }: { children: React.ReactNode }) {
  const [show, setShow]   = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem('mob:splash');
    if (!seen) setShow(true);
    setReady(true);
  }, []);

  function handleComplete() {
    sessionStorage.setItem('mob:splash', '1');
    setShow(false);
  }

  if (!ready) return null;

  return (
    <>
      {show && <Splash onComplete={handleComplete} />}
      {children}
    </>
  );
}
