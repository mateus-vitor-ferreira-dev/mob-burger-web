'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isStaff } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated() || !isStaff()) {
      router.replace('/login');
    }
  }, [isAuthenticated, isStaff, router]);

  if (!isAuthenticated() || !isStaff()) return null;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar virá aqui */}
      <aside className="w-64 border-r bg-sidebar" />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
