// WorkOrdersPage — gestión de OT con tablero Kanban y vista tabla.
import { useEffect, useMemo, useState } from 'react';
import {
  Plus, ListChecks, LayoutGrid, Table2, ArrowLeft, Play, Pause, CheckCircle2, Lock, Clock,
} from 'lucide-react';
import { PageHeader, SectionCard } from '@/components/common/Feedback';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DataTable, type Column } from '@/components/common/DataTable';
import { Modal, FormGrid, Field } from '@/components/common/Modal';
import { Toolbar, SearchInput, Loader } from '@/components/common/Ui';
import { Toast } from '@/components/common/Feedback';
import { workOrderService } from '@/services/workOrderService';
import { EQUIPMENT, OPERATORS } from '@/data/mockData';
import { formatDate, todayISO, cx } from '@/lib/format';
import type { WorkOrder, WorkOrderStatus, WorkOrderType, Criticality } from '@/types';

const OT_STATES: WorkOrderStatus[] = ['Abierta', 'En proceso', 'En espera de repuestos', 'Finalizada', 'Cerrada'];
const STATE_COLOR: Record<WorkOrderStatus, string> = {
  'Abierta': '#3b9dff', 'En proceso': '#f5b53d', 'En espera de repuestos': '#9d7bff', 'Finalizada': '#22c98a', 'Cerrada': '#62718f',
};

export function WorkOrdersPage() {
  const [data, setData] = useState<WorkOrder[] | null>(null);
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [detail, setDetail] = useState<WorkOrder | null>(null);
  const [toast, setToast] = useState('');

  const load = () => workOrderService.list().then(setData);
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase();
    return data.filter((o) => !q || o.id.toLowerCase().includes(q) || o.equipment.toLowerCase().includes(q) || o.tech.toLowerCase().includes(q));
  }, [data, search]);

  const change = async (o: WorkOrder, status: WorkOrderStatus) => {
    await workOrderService.changeStatus(o.id, status);
    await load();
    setToast(`${o.id} → ${status}`);
    setDetail((d) => (d && d.id === o.id ? { ...d, status } : d));
  };

  const columns: Column<WorkOrder>[] = [
    { key: 'id', header: 'OT', render: (o) => <span className="font-mono font-semibold text-brand">{o.id}</span> },
    { key: 'type', header: 'Tipo', render: (o) => <StatusBadge status={o.type} tone={o.type === 'Preventiva' ? 'blue' : 'yellow'} /> },
    { key: 'eq', header: 'Equipo', render: (o) => <span className="font-mono text-ink">{o.equipment}</span> },
    { key: 'prio', header: 'Prioridad', render: (o) => <StatusBadge status={o.priority} /> },
    { key: 'tech', header: 'Técnico', accessor: (o) => o.tech },
    { key: 'created', header: 'Creada', render: (o) => formatDate(o.created) },
    { key: 'status', header: 'Estado', render: (o) => <StatusBadge status={o.status} /> },
  ];

  if (detail) return <WorkOrderDetail o={detail} onBack={() => setDetail(null)} onChange={change} />;

  return (
    <div>
      <PageHeader
        crumb="Ejecución de trabajos"
        title="Órdenes de Trabajo"
        subtitle="Gestión y seguimiento de todas las órdenes de mantenimiento"
        actions={
          <>
            <div className="flex overflow-hidden rounded-[10px] border border-border">
              <button className={cx('flex items-center gap-1.5 px-3 py-2.5 text-[12.5px] font-semibold transition-colors', view === 'kanban' ? 'bg-brand text-white' : 'bg-surface text-ink-dim')} onClick={() => setView('kanban')}><LayoutGrid size={15} /> Kanban</button>
              <button className={cx('flex items-center gap-1.5 px-3 py-2.5 text-[12.5px] font-semibold transition-colors', view === 'table' ? 'bg-brand text-white' : 'bg-surface text-ink-dim')} onClick={() => setView('table')}><Table2 size={15} /> Tabla</button>
            </div>
            <button className="btn btn-brand" onClick={() => setModal(true)}><Plus size={16} /> Nueva OT</button>
          </>
        }
      />

      {!data ? <Loader /> : view === 'table' ? (
        <>
          <Toolbar><SearchInput value={search} onChange={setSearch} placeholder="Buscar por OT, equipo o técnico…" /></Toolbar>
          <div className="card overflow-hidden">
            <DataTable columns={columns} rows={filtered} rowKey={(o) => o.id} onRowClick={(o) => setDetail(o)} emptyTitle="Sin órdenes" emptyMessage="No hay órdenes con ese filtro." emptyIcon={ListChecks} />
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {OT_STATES.map((state) => {
            const items = filtered.filter((o) => o.status === state);
            return (
              <div key={state} className="flex flex-col rounded-xl2 border border-border bg-bg-soft/60">
                <div className="flex items-center justify-between border-b border-border-soft px-3.5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATE_COLOR[state] }} />
                    <span className="text-[12.5px] font-semibold">{state}</span>
                  </div>
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-bold text-ink-dim">{items.length}</span>
                </div>
                <div className="flex-1 space-y-2.5 p-2.5">
                  {items.map((o) => (
                    <button key={o.id} onClick={() => setDetail(o)} className="w-full rounded-[11px] border border-border bg-surface p-3 text-left transition-all hover:border-brand hover:shadow-card">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[12.5px] font-bold text-brand">{o.id}</span>
                        <StatusBadge status={o.priority} />
                      </div>
                      <div className="mt-2 font-mono text-[12px] text-ink">{o.equipment}</div>
                      <p className="mt-1 line-clamp-2 text-[11.5px] text-ink-faint">{o.desc}</p>
                      <div className="mt-2.5 flex items-center justify-between border-t border-border-soft pt-2 text-[11px] text-ink-faint">
                        <span>{o.tech}</span>
                        <StatusBadge status={o.type} tone={o.type === 'Preventiva' ? 'blue' : 'yellow'} />
                      </div>
                    </button>
                  ))}
                  {items.length === 0 && <div className="py-6 text-center text-[11.5px] text-ink-faint">Sin OT</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <WorkOrderForm open={modal} onClose={() => setModal(false)} onSaved={() => { setModal(false); load(); setToast('Orden de trabajo creada.'); }} />
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}

function WorkOrderDetail({ o, onBack, onChange }: { o: WorkOrder; onBack: () => void; onChange: (o: WorkOrder, s: WorkOrderStatus) => void }) {
  const actions: { label: string; icon: any; to: WorkOrderStatus; show: boolean; cls: string }[] = [
    { label: 'Iniciar', icon: Play, to: 'En proceso', show: o.status === 'Abierta', cls: 'btn-brand' },
    { label: 'Esperar repuestos', icon: Pause, to: 'En espera de repuestos', show: o.status === 'En proceso', cls: 'btn-ghost' },
    { label: 'Reanudar', icon: Play, to: 'En proceso', show: o.status === 'En espera de repuestos', cls: 'btn-brand' },
    { label: 'Finalizar', icon: CheckCircle2, to: 'Finalizada', show: o.status === 'En proceso', cls: 'btn-brand' },
    { label: 'Cerrar OT', icon: Lock, to: 'Cerrada', show: o.status === 'Finalizada', cls: 'btn-ghost' },
  ];

  return (
    <div>
      <button className="mb-4 flex items-center gap-2 text-[13px] font-semibold text-ink-dim transition-colors hover:text-ink" onClick={onBack}>
        <ArrowLeft size={16} /> Volver a órdenes
      </button>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-extrabold text-brand">{o.id}</h1>
          <StatusBadge status={o.type} tone={o.type === 'Preventiva' ? 'blue' : 'yellow'} />
          <StatusBadge status={o.status} />
        </div>
        <div className="flex flex-wrap gap-2">
          {actions.filter((a) => a.show).map((a) => {
            const Icon = a.icon;
            return <button key={a.label} className={`btn ${a.cls}`} onClick={() => onChange(o, a.to)}><Icon size={15} /> {a.label}</button>;
          })}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard title="Detalle de la orden" icon={ListChecks} pad>
            <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {[
                ['Equipo', o.equipment], ['Tipo', o.type], ['Prioridad', o.priority], ['Técnico asignado', o.tech],
                ['Supervisor', o.supervisor], ['Fecha de creación', formatDate(o.created)],
                ['Inicio', formatDate(o.start)], ['Fin', formatDate(o.end)], ['Horas trabajadas', `${o.hours} h`],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="text-[11px] uppercase tracking-wider text-ink-faint">{k}</div>
                  <div className="mt-1 text-[14px] font-medium text-ink">{v}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-border-soft pt-5">
              <div className="text-[11px] uppercase tracking-wider text-ink-faint">Descripción del trabajo</div>
              <p className="mt-1.5 text-[14px] text-ink-dim">{o.desc}</p>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Línea de tiempo" icon={Clock} pad>
          <div className="relative pl-7">
            <div className="absolute bottom-1.5 left-[9px] top-1.5 w-0.5 bg-border" />
            {OT_STATES.map((s, i) => {
              const reached = OT_STATES.indexOf(o.status) >= i;
              return (
                <div key={s} className="relative pb-5 last:pb-0">
                  <span className={cx('absolute -left-[24px] top-0.5 h-3.5 w-3.5 rounded-full border-[3px] border-bg', reached ? 'bg-brand' : 'bg-surface-3')} />
                  <div className={cx('text-[13px] font-semibold', !reached && 'text-ink-faint')}>{s}</div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function WorkOrderForm({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    type: 'Correctiva' as WorkOrderType, equipment: EQUIPMENT[0].code, created: todayISO(),
    priority: 'Media' as Criticality, tech: OPERATORS[5], supervisor: OPERATORS[0],
    status: 'Abierta' as WorkOrderStatus, desc: '', hours: 0, start: '—', end: '—',
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const save = async () => { await workOrderService.create(form); onSaved(); };

  return (
    <Modal open={open} title="Nueva orden de trabajo" onClose={onClose} wide
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancelar</button><button className="btn btn-brand" onClick={save}>Crear OT</button></>}>
      <FormGrid>
        <Field label="Tipo de orden"><select className="input" value={form.type} onChange={(e) => set('type', e.target.value)}><option>Correctiva</option><option>Preventiva</option></select></Field>
        <Field label="Equipo"><select className="input" value={form.equipment} onChange={(e) => set('equipment', e.target.value)}>{EQUIPMENT.map((eq) => <option key={eq.id}>{eq.code}</option>)}</select></Field>
        <Field label="Prioridad"><select className="input" value={form.priority} onChange={(e) => set('priority', e.target.value)}>{(['Baja', 'Media', 'Alta', 'Crítica'] as Criticality[]).map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Fecha de creación"><input type="date" className="input" value={form.created} onChange={(e) => set('created', e.target.value)} /></Field>
        <Field label="Técnico asignado"><select className="input" value={form.tech} onChange={(e) => set('tech', e.target.value)}>{OPERATORS.map((o) => <option key={o}>{o}</option>)}</select></Field>
        <Field label="Supervisor"><select className="input" value={form.supervisor} onChange={(e) => set('supervisor', e.target.value)}>{OPERATORS.map((o) => <option key={o}>{o}</option>)}</select></Field>
        <Field label="Descripción del trabajo" full><textarea className="input min-h-[80px]" value={form.desc} onChange={(e) => set('desc', e.target.value)} placeholder="Detalle del trabajo a realizar…" /></Field>
      </FormGrid>
    </Modal>
  );
}
