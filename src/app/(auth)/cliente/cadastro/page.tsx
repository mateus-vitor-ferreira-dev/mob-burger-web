'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { ThemeToggle } from '@/components/theme-toggle';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { unformatPhone } from '@/lib/format-phone';

const FLAME_H = 'linear-gradient(to right, #FFB300, #FF6D00, #E64A19)';
const BTN_GRADIENT = 'linear-gradient(to right, #FF8F00, #FF6D00, #E64A19)';

const inputCls =
  'h-12 border-zinc-600 bg-zinc-900/80 text-white placeholder:text-zinc-600 focus-visible:border-orange-600/60 focus-visible:ring-0 focus-visible:ring-offset-0';
const labelCls = 'text-[0.65rem] tracking-[0.15em] uppercase text-zinc-500 font-medium';

const schema = z
  .object({
    name: z.string().min(2, 'Nome obrigatório'),
    email: z.string().email('Email inválido'),
    phone: z.string().optional(),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [dialCode, setDialCode] = useState('+55');

  const { register, control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const digits = unformatPhone(data.phone ?? '');
      const phone = digits ? `${dialCode}${digits}` : undefined;

      const res = await api.post<{
        accessToken: string;
        refreshToken: string;
        customer: { id: string; name: string; email: string };
      }>('/api/auth/register', { name: data.name, email: data.email, phone, password: data.password });

      setAuth(
        { id: res.customer.id, email: res.customer.email, name: res.customer.name, type: 'customer' },
        res.accessToken, res.refreshToken,
      );

      toast.success('Conta criada com sucesso!');
      router.push('/menu');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-5">

      {/* Título */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[0.65rem] tracking-[0.2em] uppercase text-zinc-600">Crie sua conta no</p>
          <h1
            className="text-5xl leading-none tracking-tight"
            style={{ fontFamily: 'var(--font-bebas)', background: FLAME_H, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            MOB BURGER
          </h1>
          <p className="text-sm text-zinc-500">Preencha seus dados para continuar</p>
        </div>
        <ThemeToggle />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name" className={labelCls}>Nome</Label>
          <Input id="name" placeholder="Seu nome completo" autoComplete="name" className={inputCls} {...register('name')} />
          {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className={labelCls}>Email</Label>
          <Input id="email" type="email" placeholder="seu@email.com" autoComplete="email" className={inputCls} {...register('email')} />
          {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className={labelCls}>
            Telefone <span className="normal-case tracking-normal text-zinc-700">(opcional)</span>
          </Label>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <PhoneInput
                value={field.value ?? ''}
                onChange={field.onChange}
                onDialCodeChange={setDialCode}
                error={!!errors.phone}
                wrapperClassName="h-12 border-zinc-600 bg-zinc-900/80 focus-within:border-orange-600/60 focus-within:ring-0 focus-within:ring-offset-0"
              />
            )}
          />
          {errors.phone && <p className="text-xs text-red-400">{errors.phone.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="password" className={labelCls}>Senha</Label>
            <Input id="password" type="password" placeholder="••••••••" autoComplete="new-password" className={inputCls} {...register('password')} />
            {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className={labelCls}>Confirmar</Label>
            <Input id="confirmPassword" type="password" placeholder="••••••••" autoComplete="new-password" className={inputCls} {...register('confirmPassword')} />
            {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>}
          </div>
        </div>

        <Button
          type="submit"
          className="h-12 w-full font-bold tracking-wide text-white transition-all hover:opacity-90"
          style={{ background: BTN_GRADIENT, boxShadow: '0 0 24px rgba(255, 100, 0, 0.35)' }}
          disabled={loading}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Criar conta
        </Button>
      </form>

      <p className="text-center text-[0.75rem] tracking-wide text-zinc-600">
        Já possui conta?{' '}
        <a href="/login" className="font-semibold text-orange-400 hover:text-orange-300 transition-colors">
          Clique aqui!
        </a>
      </p>
    </div>
  );
}
