// Componentes comunes de layout de página y feedback.
import type { ReactNode } from 'react';
import { Inbox, AlertTriangle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ---- PageHeader ----
export function PageHeader({
  title,
  subtitle,
  crumb,
  actions,
}: {
  title: string;
  subtitle?: string;
  crumb?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {crumb && (
          <div className="mb-2 text-[11px] uppercase tracking-[1.5px] text-ink-faint">{crumb}</div>
        )}
        <h1 className="font-display text-[26px] font-extrabold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1.5 text-[13.5px] text-ink-dim">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ---- SectionCard (card con título e icono) ----
export function SectionCard({
  title,
  icon: Icon,
  action,
  children,
  pad = false,
}: {
  title: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  pad?: boolean;
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between border-b border-border-soft px-5 py-4">
        <h3 className="flex items-center gap-2.5 text-[14.5px] font-semibold">
          {Icon && (
            <span className="grid h-[30px] w-[30px] place-items-center rounded-lg bg-surface-2 text-brand">
              <Icon size={16} />
            </span>
          )}
          {title}
        </h3>
        {action}
      </div>
      <div className={pad ? 'p-5' : ''}>{children}</div>
    </div>
  );
}

// ---- EmptyState ----
export function EmptyState({
  title = 'Sin resultados',
  message = 'No se encontraron registros con los filtros actuales.',
  icon: Icon = Inbox,
}: {
  title?: string;
  message?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="px-5 py-16 text-center text-ink-faint">
      <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-surface-2">
        <Icon size={28} />
      </div>
      <h4 className="mb-1.5 text-base font-semibold text-ink">{title}</h4>
      <p className="text-[13px]">{message}</p>
    </div>
  );
}

// ---- ConfirmDialog ----
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[200] flex animate-fade items-center justify-center bg-black/70 p-5 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-[420px] animate-pop rounded-2xl border border-border bg-surface p-6 shadow-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-danger/10 text-danger">
          <AlertTriangle size={22} />
        </div>
        <h3 className="font-display text-lg font-bold">{title}</h3>
        <p className="mt-2 text-[13.5px] text-ink-dim">{message}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button className="btn btn-ghost" onClick={onCancel}>
            Cancelar
          </button>
          <button
            className="btn"
            style={{ background: 'linear-gradient(135deg,#ff5169,#d93a50)', color: '#fff' }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Toast ----
export function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[300] flex max-w-[340px] animate-slideup items-center gap-3 rounded-xl border border-border border-l-[3px] border-l-ok bg-surface px-4 py-3.5 shadow-pop">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-ok/10 text-ok">✓</span>
      <span className="text-[13px]">{message}</span>
      <button className="ml-2 text-ink-faint hover:text-ink" onClick={onClose}>
        ✕
      </button>
    </div>
  );
}
