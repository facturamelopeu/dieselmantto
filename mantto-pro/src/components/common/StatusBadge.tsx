// StatusBadge — badge de estado/criticidad con punto de color.
import { STATUS_TONE, type BadgeTone } from '@/lib/ui';
import { cx } from '@/lib/format';

const TONE_CLASS: Record<BadgeTone, string> = {
  green: 'text-ok bg-ok/10',
  yellow: 'text-warn bg-warn/10',
  red: 'text-danger bg-danger/10',
  blue: 'text-info bg-info/10',
  gray: 'text-ink-dim bg-surface-2',
  purple: 'text-violet bg-violet/10',
};
const DOT_CLASS: Record<BadgeTone, string> = {
  green: 'bg-ok',
  yellow: 'bg-warn',
  red: 'bg-danger',
  blue: 'bg-info',
  gray: 'bg-ink-faint',
  purple: 'bg-violet',
};

export function StatusBadge({ status, tone }: { status: string; tone?: BadgeTone }) {
  const t = tone ?? STATUS_TONE[status] ?? 'gray';
  return (
    <span className={cx('badge', TONE_CLASS[t])}>
      <span className={cx('bdot', DOT_CLASS[t])} />
      {status}
    </span>
  );
}
