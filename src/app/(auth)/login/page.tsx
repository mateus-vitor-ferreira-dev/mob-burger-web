'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useGoogleLogin } from '@react-oauth/google';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import type { StaffRole } from '@/store/auth';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

type FormData = z.infer<typeof schema>;

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  customer?: { id: string; name: string; email: string; role?: StaffRole };
  user?: { id: string; email: string; role: StaffRole };
};

function redirectByRole(role?: StaffRole) {
  return role === 'ADMIN' || role === 'ATTENDANT' ? '/admin' : '/menu';
}

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await api.post<LoginResponse>('/api/auth/customer/login', data);
      const u = res.customer ?? res.user;
      if (!u) throw new Error('Resposta inválida do servidor.');

      setAuth(
        {
          id: u.id,
          email: u.email,
          name: 'name' in u ? u.name : undefined,
          type: u.role === 'ADMIN' || u.role === 'ATTENDANT' ? 'staff' : 'customer',
          role: u.role,
        },
        res.accessToken,
        res.refreshToken,
      );

      toast.success('Bem-vindo de volta!');
      router.push(redirectByRole(u.role));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Email ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async ({ access_token }) => {
      setGoogleLoading(true);
      try {
        const info = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${access_token}` },
        }).then((r) => r.json());

        const res = await api.post<LoginResponse>('/api/auth/google', {
          idToken: access_token,
          googleId: info.sub,
          email: info.email,
          name: info.name,
        });

        const u = res.customer ?? res.user;
        if (!u) throw new Error('Resposta inválida do servidor.');

        setAuth(
          {
            id: u.id,
            email: u.email,
            name: 'name' in u ? u.name : undefined,
            type: u.role === 'ADMIN' || u.role === 'ATTENDANT' ? 'staff' : 'customer',
            role: u.role,
          },
          res.accessToken,
          res.refreshToken,
        );

        toast.success('Bem-vindo!');
        router.push(redirectByRole(u.role));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao autenticar com Google.');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => toast.error('Erro ao autenticar com Google.'),
  });

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bem-vindo</h1>
          <p className="text-sm text-muted-foreground">Acesse sua conta para continuar</p>
        </div>
        <ThemeToggle />
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => googleLogin()}
        disabled={googleLoading}
      >
        {googleLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        )}
        Entrar com Google
      </Button>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">ou</span>
        <Separator className="flex-1" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            {...register('email')}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            {...register('password')}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Entrar
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Não tem conta?{' '}
        <a href="/cliente/cadastro" className="font-medium text-primary hover:underline">
          Cadastre-se
        </a>
      </p>
    </div>
  );
}
