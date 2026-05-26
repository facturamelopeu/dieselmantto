// Header — barra superior con buscador, notificaciones y cierre de sesión.
import { useState } from 'react';
import { Menu, Search, Bell, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ROLE_META } from '@/lib/ui';

export function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const { user, logout } = useAuth();
  const [q, setQ] = useState('');
  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-bg-soft/80 px-4 backdrop-blur-md sm:px-6">
      <button
        className="grid h-[38px] w-[38px] place-items-center rounded-[9px] border border-border bg-surface text-ink-dim lg:hidden"
        onClick={onToggleSidebar}
        aria-label="Menú"
      >
        <Menu size={18} />
      </button>

      <div className="relative hidden max-w-[440px] flex-1 sm:block">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input
          className="w-full rounded-[10px] border border-border bg-surface py-2.5 pl-10 pr-3.5 text-[13.5px] transition-colors focus:border-brand focus:outline-none"
          placeholder="Buscar equipos, órdenes, repuestos…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button className="relative grid h-10 w-10 place-items-center rounded-[10px] border border-border bg-surface text-ink-dim transition-colors hover:border-brand hover:text-ink">
          <Bell size={18} />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border-2 border-surface bg-accent" />
        </button>

        <div className="hidden items-center gap-2.5 rounded-[10px] border border-border bg-surface px-2.5 py-1.5 md:flex">
          <div
            className="grid h-8 w-8 place-items-center rounded-lg text-xs font-bold text-white"
            style={{ background: ROLE_META[user.role].color }}
          >
            {user.initials}
          </div>
          <div className="pr-1">
            <div className="text-[13px] font-semibold leading-tight">{user.name}</div>
            <div className="text-[10.5px] text-ink-faint">{ROLE_META[user.role].label}</div>
          </div>
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-[10px] border border-border bg-surface text-ink-dim transition-colors hover:border-danger hover:text-danger"
          onClick={logout}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
