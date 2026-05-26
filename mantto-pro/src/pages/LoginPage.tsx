// LoginPage — inicio de sesión con selector visual de rol (simulado).
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, ShieldCheck, HardHat, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { RoleKey } from '@/types';
import { cx } from '@/lib/format';

const ROLE_OPTIONS: { key: RoleKey; label: string; desc: string; icon: typeof Wrench; color: string }[] = [
  { key: 'admin', label: 'Administrador', desc: 'Control total del sistema', icon: ShieldCheck, color: '#2f6bff' },
  { key: 'supervisor', label: 'Supervisor', desc: 'Registro por guardia de trabajo', icon: HardHat, color: '#ff7a18' },
  { key: 'tech', label: 'Técnico / Mecánico', desc: 'Órdenes de trabajo asignadas', icon: Wrench, color: '#22c98a' },
];

const DEMO_EMAIL: Record<RoleKey, string> = {
  admin: 'admin@manttopro.com',
  supervisor: 'supervisor@manttopro.com',
  tech: 'tecnico@manttopro.com',
};

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<RoleKey>('admin');
  const [email, setEmail] = useState(DEMO_EMAIL.admin);
  const [password, setPassword] = useState('demo1234');
  const [busy, setBusy] = useState(false);

  const handleRole = (r: RoleKey) => {
    setRole(r);
    setEmail(DEMO_EMAIL[r]);
  };

  const submit = async () => {
    setBusy(true);
    await login(role, email);
    setBusy(false);
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
      {/* Panel ilustrativo */}
      <aside
        className="relative hidden flex-col justify-between overflow-hidden border-r border-border p-14 lg:flex"
        style={{
          background:
            'radial-gradient(1200px 600px at -10% -10%, rgba(47,107,255,.22), transparent 55%), radial-gradient(900px 500px at 110% 110%, rgba(255,122,24,.14), transparent 50%), linear-gradient(160deg,#0b1322,#0a0f1c 60%)',
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              'linear-gradient(#1a2540 1px,transparent 1px),linear-gradient(90deg,#1a2540 1px,transparent 1px)',
            backgroundSize: '42px 42px',
            maskImage: 'radial-gradient(circle at 30% 40%,#000 0%,transparent 70%)',
          }}
        />
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="grid h-[54px] w-[54px] place-items-center rounded-[14px] bg-gradient-to-br from-brand to-brand-2 shadow-glow">
            <Wrench size={28} className="text-white" />
          </div>
          <div>
            <div className="font-display text-2xl font-extrabold tracking-wide">
              MANTTO<span className="text-brand"> PRO</span>
            </div>
            <div className="text-[11px] uppercase tracking-[2px] text-ink-faint">
              Gestión de Mantenimiento
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="font-display text-[46px] font-black leading-[1.04] tracking-tight">
            Control total de tu<br />
            <span className="bg-gradient-to-r from-white to-[#9bbcff] bg-clip-text text-transparent">
              maquinaria pesada
            </span>
          </h1>
          <p className="mt-4 max-w-[440px] text-[15px] leading-relaxed text-ink-dim">
            Gestiona mantenimientos preventivos y correctivos, órdenes de trabajo, repuestos y
            KPIs de disponibilidad mecánica desde una sola plataforma corporativa.
          </p>
          <div className="mt-8 flex gap-9">
            {[
              { n: '+250', l: 'Equipos' },
              { n: '98.1%', l: 'Disponibilidad' },
              { n: '24/7', l: 'Operación' },
            ].map((s) => (
              <div key={s.l}>
                <div className="bg-gradient-to-r from-white to-[#9bbcff] bg-clip-text font-display text-[30px] font-extrabold text-transparent">
                  {s.n}
                </div>
                <div className="mt-1 text-[12px] uppercase tracking-[1.5px] text-ink-faint">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-[12px] text-ink-faint">
          © 2026 MANTTO PRO · Construcción · Minería · Transporte pesado
        </div>
      </aside>

      {/* Formulario */}
      <div className="flex items-center justify-center bg-bg-soft p-6 sm:p-10">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 lg:hidden">
            <div className="mb-2 inline-grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-2 shadow-glow">
              <Wrench size={24} className="text-white" />
            </div>
          </div>
          <h2 className="font-display text-[26px] font-extrabold tracking-tight">Iniciar sesión</h2>
          <p className="mb-7 mt-2 text-sm text-ink-dim">Selecciona tu rol para continuar</p>

          <div className="mb-6 grid gap-3">
            {ROLE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = role === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => handleRole(opt.key)}
                  className={cx(
                    'flex w-full items-center gap-3.5 rounded-[10px] border-[1.5px] p-3.5 text-left transition-all',
                    active
                      ? 'border-brand bg-gradient-to-r from-brand/[0.14] to-transparent shadow-[0_0_0_3px_rgba(47,107,255,.25)]'
                      : 'border-border bg-surface hover:border-brand hover:bg-surface-2',
                  )}
                >
                  <span
                    className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-[10px]"
                    style={{ background: `${opt.color}1f`, color: opt.color }}
                  >
                    <Icon size={20} />
                  </span>
                  <span>
                    <span className="block text-[14.5px] font-semibold">{opt.label}</span>
                    <span className="mt-0.5 block text-xs text-ink-faint">{opt.desc}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mb-4">
            <label className="label">Correo electrónico</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="mb-5">
            <label className="label">Contraseña</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            className="btn btn-brand w-full justify-center py-3.5 text-[14.5px]"
            onClick={submit}
            disabled={busy}
          >
            {busy ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Ingresando…
              </>
            ) : (
              'Ingresar al sistema'
            )}
          </button>

          <p className="mt-[18px] text-center text-xs leading-relaxed text-ink-faint">
            Demo · login simulado. La sesión se guarda en <span className="font-mono">localStorage</span>.
            <br />
            Cualquier credencial es válida en este entorno.
          </p>
        </div>
      </div>
    </div>
  );
}
