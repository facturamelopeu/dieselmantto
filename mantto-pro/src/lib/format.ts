// ============================================================
//  Utilidades de formato — MANTTO PRO
// ============================================================

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('es-PE').format(n);
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatDate(iso: string): string {
  if (!iso || iso === '—') return '—';
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}

/** Une clases condicionalmente (mini-clsx). */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

export const todayISO = (): string => new Date().toISOString().slice(0, 10);
