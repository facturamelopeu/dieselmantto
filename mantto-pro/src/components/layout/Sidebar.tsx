// Sidebar — barra lateral con logo, navegación por rol y usuario.
import { NavLink } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { navForRole, ROLE_META } from '@/lib/ui';
import { cx } from '@/lib/format';

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  if (!user) return null;
  const nav = navForRole(user.role);
  const roleColor = ROLE_META[user.role].color;

  return (
    <>
      {/* Backdrop móvil */}
      <div
        className={cx(
          'fixed inset-0 z-[50] bg-black/50 lg:hidden',
          open ? 'block' : 'hidden',
        )}
        onClick={onClose}
      />
      <aside
        className={cx(
          'fixed bottom-0 left-0 top-0 z-[60] flex w-[260px] flex-col border-r border-border bg-bg-soft transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-border-soft px-[18px] py-4">
          <div className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[10px] bg-gradient-to-br from-brand to-brand-2 shadow-glow">
            <Icons.Wrench size={20} className="text-white" />
          </div>
          <div>
            <div className="font-display text-base font-extrabold tracking-wide">
              MANTTO<span className="text-brand"> PRO</span>
            </div>
            <div className="text-[10px] uppercase tracking-[2px] text-ink-faint">Mantenimiento</div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <div className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[2px] text-ink-faint">
            Menú principal
          </div>
          {nav.map((item) => {
            const Icon = (Icons as Record<string, Icons.LucideIcon>)[item.icon] ?? Icons.Circle;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cx(
                    'relative mb-0.5 flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13.5px] font-medium transition-colors',
                    isActive
                      ? 'bg-gradient-to-r from-brand/[0.16] to-transparent text-white before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-full before:bg-brand'
                      : 'text-ink-dim hover:bg-surface hover:text-ink',
                  )
                }
              >
                <Icon size={18} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="rounded-full bg-danger px-[7px] py-0.5 text-[10px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Usuario */}
        <div className="border-t border-border-soft p-3.5">
          <div className="flex items-center gap-2.5 rounded-[10px] border border-border-soft bg-surface p-2.5">
            <div
              className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[9px] text-[13px] font-bold text-white"
              style={{ background: roleColor }}
            >
              {user.initials}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold">{user.name}</div>
              <div className="truncate text-[11px] text-ink-faint">{ROLE_META[user.role].label}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
