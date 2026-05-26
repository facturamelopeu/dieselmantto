// KpiCard — tarjeta de indicador con icono, valor, unidad y variación.
import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cx } from '@/lib/format';

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  delta?: { value: string; dir: 'up' | 'down' | 'flat' };
  tone?: 'brand' | 'green' | 'yellow' | 'red' | 'info' | 'violet';
}

const TONE: Record<NonNullable<KpiCardProps['tone']>, { ic: string; glow: string }> = {
  brand: { ic: 'text-brand bg-brand/10', glow: 'rgba(47,107,255,.18)' },
  green: { ic: 'text-ok bg-ok/10', glow: 'rgba(34,201,138,.18)' },
  yellow: { ic: 'text-warn bg-warn/10', glow: 'rgba(245,181,61,.18)' },
  red: { ic: 'text-danger bg-danger/10', glow: 'rgba(255,81,105,.18)' },
  info: { ic: 'text-info bg-info/10', glow: 'rgba(59,157,255,.18)' },
  violet: { ic: 'text-violet bg-violet/10', glow: 'rgba(157,123,255,.18)' },
};

export function KpiCard({ icon: Icon, label, value, unit, delta, tone = 'brand' }: KpiCardProps) {
  const t = TONE[tone];
  return (
    <div className="card relative overflow-hidden p-[18px]">
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full"
        style={{ background: `radial-gradient(circle, ${t.glow}, transparent 70%)` }}
      />
      <div className="flex items-start justify-between">
        <div className={cx('grid h-[42px] w-[42px] place-items-center rounded-[11px]', t.ic)}>
          <Icon size={20} />
        </div>
        {delta && (
          <span
            className={cx(
              'inline-flex items-center gap-1 rounded-full px-2 py-[3px] text-[11.5px] font-semibold',
              delta.dir === 'up' && 'text-ok bg-ok/10',
              delta.dir === 'down' && 'text-danger bg-danger/10',
              delta.dir === 'flat' && 'text-ink-dim bg-surface-2',
            )}
          >
            {delta.dir === 'up' && <ArrowUpRight size={13} />}
            {delta.dir === 'down' && <ArrowDownRight size={13} />}
            {delta.dir === 'flat' && <Minus size={13} />}
            {delta.value}
          </span>
        )}
      </div>
      <div className="mt-3.5 text-xs font-medium text-ink-dim">{label}</div>
      <div className="mt-0.5 font-display text-[30px] font-extrabold leading-none tracking-tight">
        {value}
        {unit && <span className="ml-1 text-[15px] font-semibold text-ink-faint">{unit}</span>}
      </div>
    </div>
  );
}
