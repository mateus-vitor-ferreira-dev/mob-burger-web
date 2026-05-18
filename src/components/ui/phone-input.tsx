'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { COUNTRIES, DEFAULT_COUNTRY, type Country } from '@/lib/countries';
import { formatPhone } from '@/lib/format-phone';

export interface PhoneInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onDialCodeChange?: (dialCode: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export function PhoneInput({
  value = '',
  onChange,
  onDialCodeChange,
  placeholder,
  disabled,
  error,
  className,
}: PhoneInputProps) {
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onDialCodeChange?.(DEFAULT_COUNTRY.dialCode);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    searchRef.current?.focus();

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  function handleSelectCountry(selected: Country) {
    setCountry(selected);
    setIsOpen(false);
    setSearch('');
    onDialCodeChange?.(selected.dialCode);
    onChange?.(''); // limpa o número ao trocar de país
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted =
      country.code === 'BR'
        ? formatPhone(e.target.value)
        : e.target.value.replace(/[^\d\s\-().+]/g, '').slice(0, 20);
    onChange?.(formatted);
  }

  const filtered = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search),
  );

  const inputPlaceholder = placeholder ?? (country.code === 'BR' ? '(11) 99999-9999' : 'Número de telefone');

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div
        className={cn(
          'flex h-12 w-full items-center rounded-md border text-sm transition-colors',
          'bg-white dark:bg-zinc-900',
          'border-zinc-300 dark:border-zinc-600',
          'focus-within:outline-none focus-within:border-primary/60 dark:focus-within:border-orange-600/60',
          error && 'border-destructive',
          disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
      >
        {/* Botão seletor de país */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((o) => !o)}
          aria-label="Selecionar país"
          aria-expanded={isOpen}
          className={cn(
            'flex h-full shrink-0 items-center gap-1.5 rounded-l-md px-3',
            'text-sm transition-colors',
            'hover:bg-zinc-100 dark:hover:bg-zinc-800',
            'focus:outline-none',
            disabled && 'pointer-events-none',
          )}
        >
          <span className="text-base leading-none">{country.flag}</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{country.dialCode}</span>
          <ChevronDown
            className={cn('h-3 w-3 text-zinc-400 dark:text-zinc-500 transition-transform', isOpen && 'rotate-180')}
          />
        </button>

        {/* Divisor */}
        <div className="h-5 w-px shrink-0 bg-zinc-200 dark:bg-zinc-700" />

        {/* Input do número */}
        <input
          type="tel"
          inputMode="tel"
          value={value}
          onChange={handlePhoneChange}
          placeholder={inputPlaceholder}
          disabled={disabled}
          className={cn(
            'flex-1 rounded-r-md bg-transparent px-3 py-2 text-sm',
            'text-zinc-900 dark:text-white',
            'placeholder:text-zinc-400 dark:placeholder:text-zinc-600',
            'focus:outline-none',
            'disabled:cursor-not-allowed',
          )}
        />
      </div>

      {/* Dropdown de países */}
      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-50 w-72 rounded-md border bg-popover text-popover-foreground shadow-md">
          {/* Campo de busca */}
          <div className="flex items-center gap-2 border-b px-3 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar país..."
              className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          {/* Lista de países */}
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">Nenhum país encontrado</li>
            ) : (
              filtered.map((c) => (
                <li key={c.code}>
                  <button
                    type="button"
                    onClick={() => handleSelectCountry(c)}
                    className={cn(
                      'flex w-full items-center gap-2.5 px-3 py-2 text-sm transition-colors',
                      'hover:bg-accent hover:text-accent-foreground',
                      c.code === country.code && 'bg-accent text-accent-foreground font-medium',
                    )}
                  >
                    <span className="text-base leading-none">{c.flag}</span>
                    <span className="flex-1 truncate text-left">{c.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{c.dialCode}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
