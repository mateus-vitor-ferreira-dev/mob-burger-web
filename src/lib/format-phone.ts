/**
 * Formata número de telefone brasileiro enquanto o usuário digita.
 * Celular (11 dígitos): (XX) XXXXX-XXXX
 * Fixo   (10 dígitos): (XX) XXXX-XXXX
 */
export function formatPhone(value: string): string {
  const digits = String(value ?? '').replace(/\D/g, '').slice(0, 11);
  const len = digits.length;

  if (len === 0) return '';
  if (len <= 2) return `(${digits}`;
  if (len <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (len <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/** Remove toda formatação, retorna apenas dígitos */
export function unformatPhone(value: string): string {
  return value.replace(/\D/g, '');
}
