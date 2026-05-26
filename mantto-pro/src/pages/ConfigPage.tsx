// ConfigPage — configuración del sistema con secciones por pestañas (solo admin).
import { useState } from 'react';
import {
  Users, Tag, Layers, SlidersHorizontal, Plus, ShieldCheck, HardHat, Wrench, Trash2,
} from 'lucide-react';
import { PageHeader, SectionCard } from '@/components/common/Feedback';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Toast } from '@/components/common/Feedback';
import { USERS, PROJECTS } from '@/data/mockData';
import { ROLE_META } from '@/lib/ui';
import { cx } from '@/lib/format';

const TABS = [
  { key: 'users', label: 'Usuarios y roles', icon: Users },
  { key: 'catalogs', label: 'Catálogos', icon: Tag },
  { key: 'projects', label: 'Proyectos / frentes', icon: Layers },
  { key: 'params', label: 'Parámetros', icon: SlidersHorizontal },
] as const;

const EQUIP_TYPES = ['Excavadora', 'Cargador frontal', 'Tractor', 'Motoniveladora', 'Rodillo', 'Volquete', 'Camión cisterna'];
const MAINT_TYPES = ['PM250', 'PM500', 'PM1000', 'PM2000', 'Correctivo'];
const ROLE_ICON = { admin: ShieldCheck, supervisor: HardHat, tech: Wrench };

export function ConfigPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('users');
  const [toast, setToast] = useState('');

  return (
    <div>
      <PageHeader crumb="Administración" title="Configuración" subtitle="Gestión de usuarios, catálogos y parámetros del sistema" />

      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cx('flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-[13px] font-semibold transition-colors',
                tab === t.key ? 'border-brand text-brand' : 'border-transparent text-ink-dim hover:text-ink')}>
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'users' && (
        <SectionCard title="Usuarios del sistema" icon={Users}
          action={<button className="btn btn-brand btn-sm" onClick={() => setToast('Alta de usuario (simulada).')}><Plus size={14} /> Nuevo usuario</button>}>
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>Usuario</th><th>Correo</th><th>Rol</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                {USERS.map((u) => {
                  const Icon = ROLE_ICON[u.role];
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <span className="grid h-8 w-8 place-items-center rounded-lg text-[12px] font-bold text-white" style={{ background: ROLE_META[u.role].color }}>{u.initials}</span>
                          <span className="font-medium text-ink">{u.name}</span>
                        </div>
                      </td>
                      <td className="font-mono text-[12px]">{u.email}</td>
                      <td><span className="inline-flex items-center gap-1.5"><Icon size={14} style={{ color: ROLE_META[u.role].color }} /> {ROLE_META[u.role].label}</span></td>
                      <td><StatusBadge status="Operativo" tone="green" /></td>
                      <td className="text-right"><button className="grid h-8 w-8 place-items-center rounded-lg border border-border text-ink-faint hover:border-danger hover:text-danger"><Trash2 size={14} /></button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {tab === 'catalogs' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <CatalogCard title="Tipos de equipo" icon={Tag} items={EQUIP_TYPES} onAdd={() => setToast('Tipo de equipo agregado (simulado).')} />
          <CatalogCard title="Tipos de mantenimiento" icon={Wrench} items={MAINT_TYPES} onAdd={() => setToast('Tipo de mantenimiento agregado (simulado).')} />
        </div>
      )}

      {tab === 'projects' && (
        <CatalogCard title="Proyectos / frentes de trabajo" icon={Layers} items={PROJECTS} onAdd={() => setToast('Proyecto agregado (simulado).')} wide />
      )}

      {tab === 'params' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard title="Parámetros de guardia" icon={SlidersHorizontal} pad>
            <div className="space-y-4">
              <Param label="Duración de guardia corta" value="8 horas" />
              <Param label="Duración de guardia larga" value="12 horas" />
              <Param label="Turnos disponibles" value="Día / Noche" />
              <Param label="Confirmación digital obligatoria" value="Activada" tone="green" />
            </div>
          </SectionCard>
          <SectionCard title="Estados del sistema" icon={Layers} pad>
            <div className="space-y-3">
              {[
                ['Equipos', 'Operativo · En mantenimiento · Parado · Baja'],
                ['Preventivo', 'Programado · Próximo · Vencido · Ejecutado'],
                ['Correctivo', 'Reportado · En diagnóstico · En reparación · Finalizado'],
                ['Órdenes de trabajo', 'Abierta · En proceso · En espera · Finalizada · Cerrada'],
              ].map(([k, v]) => (
                <div key={k} className="rounded-[10px] border border-border-soft bg-surface-2 p-3">
                  <div className="text-[12px] font-semibold text-ink">{k}</div>
                  <div className="mt-1 text-[11.5px] text-ink-faint">{v}</div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}

function CatalogCard({ title, icon: Icon, items, onAdd, wide }: { title: string; icon: any; items: string[]; onAdd: () => void; wide?: boolean }) {
  return (
    <SectionCard title={title} icon={Icon} action={<button className="btn btn-brand btn-sm" onClick={onAdd}><Plus size={14} /> Agregar</button>}>
      <div className={cx('flex flex-wrap gap-2 p-5', wide && 'gap-2.5')}>
        {items.map((it) => (
          <span key={it} className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-2 px-3.5 py-1.5 text-[12.5px] text-ink">
            {it}
            <button className="text-ink-faint hover:text-danger">×</button>
          </span>
        ))}
      </div>
    </SectionCard>
  );
}

function Param({ label, value, tone }: { label: string; value: string; tone?: 'green' }) {
  return (
    <div className="flex items-center justify-between rounded-[10px] border border-border-soft bg-surface-2 p-3.5">
      <span className="text-[13px] text-ink-dim">{label}</span>
      <span className={cx('text-[13px] font-semibold', tone === 'green' ? 'text-ok' : 'text-ink')}>{value}</span>
    </div>
  );
}
