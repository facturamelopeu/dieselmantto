// Modal — contenedor modal reutilizable con header, body y footer.
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { cx } from '@/lib/format';

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  wide = false,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[200] flex animate-fade items-start justify-center overflow-y-auto bg-[#05080f]/70 p-5 backdrop-blur-sm sm:py-10"
      onClick={onClose}
    >
      <div
        className={cx(
          'w-full animate-pop rounded-2xl border border-border bg-surface shadow-pop',
          wide ? 'max-w-[860px]' : 'max-w-[620px]',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border-soft px-[22px] py-[18px]">
          <h3 className="font-display text-lg font-bold">{title}</h3>
          <button
            className="grid h-9 w-9 place-items-center rounded-lg text-ink-faint transition-colors hover:bg-surface-2 hover:text-ink"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[64vh] overflow-y-auto p-[22px]">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2.5 border-t border-border-soft px-[22px] py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Helpers de formulario dentro del modal
export function Field({
  label,
  children,
  full = false,
}: {
  label: string;
  children: ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

export function FormGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">{children}</div>;
}
