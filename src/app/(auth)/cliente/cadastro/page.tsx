'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { ThemeToggle } from '@/components/theme-toggle';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { unformatPhone } from '@/lib/format-phone';

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

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const digits = unformatPhone(data.phone ?? '');
      const phone = digits ? `${dialCode}${digits}` : undefined;

      const res = await api.post<{
        accessToken: string;
        refreshToken: string;
        customer: { id: string; name: string; email: string };
      }>('/api/auth/register', {
        name: data.name,
        email: data.email,
        phone,
        password: data.password,
      });

      setAuth(
        { id: res.customer.id, email: res.customer.email, name: res.customer.name, type: 'customer' },
        res.accessToken,
        res.refreshToken,
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
    <div className="w-full max-w-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Criar conta</h1>
          <p className="text-sm text-muted-foreground">Preencha seus dados para continuar</p>
        </div>
        <ThemeToggle />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" placeholder="Seu nome" autoComplete="name" {...register('name')} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="seu@email.com" autoComplete="email" {...register('email')} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>
            Telefone <span className="text-muted-foreground">(opcional)</span>
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
              />
            )}
          />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Senha</Label>
          <Input id="password" type="password" placeholder="••••••••" autoComplete="new-password" {...register('password')} />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirmar senha</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Criar conta
        </Button>
      </form>

      <Button variant="ghost" className="w-full" onClick={() => router.push('/login')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Já tenho conta
      </Button>
    </div>
  );
}
