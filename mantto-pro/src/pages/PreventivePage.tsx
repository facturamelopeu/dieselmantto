// PreventivePage — control de mantenimientos preventivos programados.
import { useEffect, useMemo, useState } from 'react';
import { Plus, CalendarCheck, FileCheck2, CheckSquare, Square, ArrowRight } from 'lucide-react';
import { PageHeader, SectionCard } from '@/components/common/Feedback';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DataTable, type Column } from '@/components/common/DataTable';
import { Modal, FormGrid, Field } from '@/components/common/Modal';
import { Toolbar, SearchInput, Loader } from '@/components/common/Ui';
import { Toast } from '@/components/common/Feedback';
import { maintenanceService } from '@/services/maintenanceService';
import { workOrderService } from '@/services/workOrderService';
import { EQUIPMENT, OPERATORS, PREVENTIVE_CHECKLIST } from '@/data/mockData';
import { formatDate, formatNumber, todayISO, cx } from '@/lib/format';
import type { PreventiveMaintenance, PreventiveType } from '@/types';

const PM_TYPES: PreventiveType[] = ['PM250', 'PM500', 'PM1000', 'PM2000', 'Otros'];

export function PreventivePage() {
  const [data, setData] = useState<PreventiveMaintenance[] | null>(null);
  const [search, setSearch] = useState('');
  const [fStatus, setFStatus] = useState('');
  const [modal, setModal] = useState(false);
  const [checklistFor, setChecklistFor] = useState<PreventiveMaintenance | null>(null);
  const [toast, setToast] = useState('');

  const load = () => maintenanceService.listPreventive().then(setData);
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase();
    return data.filter((p) => (!q || p.equipment.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)) && (!fStatus || p.status === fStatus));
  }, [data, search, fStatus]);

  const counts = useMemo(() => {
    const c = { Programado: 0, Próximo: 0, Vencido: 0, Ejecutado: 0 } as Record<string, number>;
    data?.forEach((p) => { c[p.status]++; });
    return c;
  }, [data]);

  const genOT = async (p: PreventiveMaintenance) => {
    await workOrderService.create({
      type: 'Preventiva', equipment: p.equipment, created: todayISO(), priority: 'Media',
      tech: OPERATORS[5], supervisor: p.owner, status: 'Abierta',
      desc: `Mantenimiento ${p.type} programado.`, hours: 0, start: '—', end: '—',
    });
    setToast(`Orden de trabajo generada desde ${p.id}.`);
  };

  const columns: Column<PreventiveMaintenance>[] = [
    { key: 'id', header: 'Código', render: (p) => <span className="font-mono font-semibold text-brand">{p.id}</span> },
    { key: 'eq', header: 'Equipo', render: (p) => <span className="font-mono text-ink">{p.equipment}</span> },
    { key: 'type', header: 'Tipo', render: (p) => <span className="font-semibold">{p.type}</span> },
    { key: 'prog', header: 'Programado a', render: (p) => <span className="font-mono">{p.hmProg ? `${formatNumber(p.hmProg)} h` : `${formatNumber(p.kmProg)} km`}</span> },
    { key: 'date', header: 'Fecha', render: (p) => formatDate(p.dateProg) },
    { key: 'owner', header: 'Responsable', accessor: (p) => p.owner },
    { key: 'status', header: 'Estado', render: (p) => <StatusBadge status={p.status} /> },
    {
      key: 'act', header: '', className: 'text-right',
      render: (p) => (
        <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button className="btn btn-ghost btn-sm" onClick={() => setChecklistFor(p)}>Checklist</button>
          {p.status !== 'Ejecutado' && <button className="btn btn-brand btn-sm" onClick={() => genOT(p)}>Generar OT <ArrowRight size={13} /></button>}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        crumb="Plan de mantenimiento"
        title="Mantenimiento Preventivo"
        subtitle="Control de mantenimientos programados por horómetro y kilometraje"
        actions={<button className="btn btn-brand" onClick={() => setModal(true)}><Plus size={16} /> Programar PM</button>}
      />

      {/* Semáforo de estados */}
      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Light c="#22c98a" v={counts.Ejecutado} l="Al día / ejecutados" />
        <Light c="#3b9dff" v={counts.Programado} l="Programados" />
        <Light c="#f5b53d" v={counts.Próximo} l="Próximos a vencer" />
        <Light c="#ff5169" v={counts.Vencido} l="Vencidos" pulse />
      </div>

      <Toolbar>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por equipo o código…" />
        <select className="input max-w-[180px]" value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
          <option value="">Todos los estados</option>
          {['Programado', 'Próximo', 'Vencido', 'Ejecutado'].map((s) => <option key={s}>{s}</option>)}
        </select>
      </Toolbar>

      <div className="card overflow-hidden">
        {!data ? <Loader /> : (
          <DataTable columns={columns} rows={filtered} rowKey={(p) => p.id} emptyTitle="Sin mantenimientos" emptyMessage="No hay mantenimientos preventivos con esos filtros." emptyIcon={CalendarCheck} />
        )}
      </div>

      {/* Modal nuevo PM */}
      <PreventiveForm open={modal} onClose={() => setModal(false)} onSaved={() => { setModal(false); load(); setToast('Mantenimiento preventivo programado.'); }} />

      {/* Modal checklist */}
      <Modal open={!!checklistFor} title={`Checklist preventivo · ${checklistFor?.type ?? ''}`} onClose={() => setChecklistFor(null)}
        footer={<button className="btn btn-brand" onClick={() => setChecklistFor(null)}>Cerrar</button>}>
        <div className="mb-4 flex items-center gap-2 rounded-[10px] bg-surface-2 p-3 text-[13px] text-ink-dim">
          <FileCheck2 size={16} className="text-brand" /> Equipo <span className="font-mono text-ink">{checklistFor?.equipment}</span> · Responsable {checklistFor?.owner}
        </div>
        {PREVENTIVE_CHECKLIST.map((it, i) => (
          <div key={i} className="flex items-center gap-3 border-b border-border-soft py-2.5 text-[13px] last:border-0">
            {it.done ? <CheckSquare size={20} className="text-ok" /> : <Square size={20} className="text-ink-faint" />}
            <span className={it.done ? 'text-ink' : 'text-ink-dim'}>{it.t}</span>
          </div>
        ))}
      </Modal>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}

function Light({ c, v, l, pulse }: { c: string; v: number; l: string; pulse?: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
      <span className={cx('h-3 w-3 rounded-full', pulse && v > 0 && 'animate-pulse')} style={{ background: c, boxShadow: `0 0 12px ${c}` }} />
      <div>
        <div className="font-display text-2xl font-extrabold">{v}</div>
        <div className="text-[11px] uppercase tracking-wider text-ink-faint">{l}</div>
      </div>
    </div>
  );
}

function PreventiveForm({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    equipment: EQUIPMENT[0].code, type: 'PM250' as PreventiveType, hmProg: 0, kmProg: 0,
    dateProg: todayISO(), owner: OPERATORS[0], status: 'Programado' as const,
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const save = async () => { await maintenanceService.createPreventive({ ...form, progress: 0 }); onSaved(); };

  return (
    <Modal open={open} title="Programar mantenimiento preventivo" onClose={onClose}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancelar</button><button className="btn btn-brand" onClick={save}>Programar</button></>}>
      <FormGrid>
        <Field label="Equipo"><select className="input" value={form.equipment} onChange={(e) => set('equipment', e.target.value)}>{EQUIPMENT.map((eq) => <option key={eq.id}>{eq.code}</option>)}</select></Field>
        <Field label="Tipo de mantenimiento"><select className="input" value={form.type} onChange={(e) => set('type', e.target.value)}>{PM_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
        <Field label="Horómetro programado"><input type="number" className="input" value={form.hmProg} onChange={(e) => set('hmProg', +e.target.value)} /></Field>
        <Field label="Kilometraje programado"><input type="number" className="input" value={form.kmProg} onChange={(e) => set('kmProg', +e.target.value)} /></Field>
        <Field label="Fecha programada"><input type="date" className="input" value={form.dateProg} onChange={(e) => set('dateProg', e.target.value)} /></Field>
        <Field label="Responsable"><select className="input" value={form.owner} onChange={(e) => set('owner', e.target.value)}>{OPERATORS.map((o) => <option key={o}>{o}</option>)}</select></Field>
      </FormGrid>
    </Modal>
  );
}
