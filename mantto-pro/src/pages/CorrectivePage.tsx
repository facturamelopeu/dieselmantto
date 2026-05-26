// CorrectivePage — registro y seguimiento de fallas / mantenimiento correctivo.
import { useEffect, useMemo, useState } from 'react';
import { Plus, Wrench, AlertOctagon, ArrowLeft, ArrowRight, FileText } from 'lucide-react';
import { PageHeader, SectionCard } from '@/components/common/Feedback';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DataTable, type Column } from '@/components/common/DataTable';
import { Modal, FormGrid, Field } from '@/components/common/Modal';
import { Toolbar, SearchInput, Loader } from '@/components/common/Ui';
import { Toast } from '@/components/common/Feedback';
import { maintenanceService } from '@/services/maintenanceService';
import { workOrderService } from '@/services/workOrderService';
import { EQUIPMENT, OPERATORS } from '@/data/mockData';
import { formatDate, todayISO, cx } from '@/lib/format';
import type { CorrectiveMaintenance, FailType, Criticality, CorrectiveStatus } from '@/types';

const FAIL_TYPES: FailType[] = ['Motor', 'Transmisión', 'Hidráulico', 'Eléctrico', 'Neumáticos', 'Frenos', 'Estructura', 'Otros'];
const CRITICALITIES: Criticality[] = ['Baja', 'Media', 'Alta', 'Crítica'];
const STATUSES: CorrectiveStatus[] = ['Reportado', 'En diagnóstico', 'En reparación', 'Finalizado'];

export function CorrectivePage() {
  const [data, setData] = useState<CorrectiveMaintenance[] | null>(null);
  const [search, setSearch] = useState('');
  const [fCrit, setFCrit] = useState('');
  const [fStatus, setFStatus] = useState('');
  const [modal, setModal] = useState(false);
  const [detail, setDetail] = useState<CorrectiveMaintenance | null>(null);
  const [toast, setToast] = useState('');

  const load = () => maintenanceService.listCorrective().then(setData);
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase();
    return data.filter(
      (c) =>
        (!q || c.equipment.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)) &&
        (!fCrit || c.criticality === fCrit) &&
        (!fStatus || c.status === fStatus),
    );
  }, [data, search, fCrit, fStatus]);

  const genOT = async (c: CorrectiveMaintenance) => {
    await workOrderService.create({
      type: 'Correctiva', equipment: c.equipment, created: todayISO(), priority: c.criticality,
      tech: OPERATORS[5], supervisor: c.reportedBy, status: 'Abierta',
      desc: c.description, hours: 0, start: '—', end: '—',
    });
    setToast(`Orden de trabajo generada desde ${c.id}.`);
  };

  if (detail) return <CorrectiveDetail c={detail} onBack={() => setDetail(null)} onGenOT={genOT} />;

  const open = data?.filter((c) => c.status !== 'Finalizado').length ?? 0;
  const critical = data?.filter((c) => c.criticality === 'Crítica' || c.criticality === 'Alta').length ?? 0;

  const columns: Column<CorrectiveMaintenance>[] = [
    { key: 'id', header: 'Código', render: (c) => <span className="font-mono font-semibold text-brand">{c.id}</span> },
    { key: 'eq', header: 'Equipo', render: (c) => <span className="font-mono text-ink">{c.equipment}</span> },
    { key: 'date', header: 'Fecha falla', render: (c) => formatDate(c.date) },
    { key: 'fail', header: 'Tipo de falla', accessor: (c) => c.failType },
    { key: 'crit', header: 'Criticidad', render: (c) => <StatusBadge status={c.criticality} /> },
    { key: 'down', header: 'Parada', render: (c) => <span className="font-mono">{c.downtime}</span> },
    { key: 'status', header: 'Estado', render: (c) => <StatusBadge status={c.status} /> },
  ];

  return (
    <div>
      <PageHeader
        crumb="Gestión de fallas"
        title="Mantenimiento Correctivo"
        subtitle="Registro y seguimiento de fallas y reparaciones de la flota"
        actions={<button className="btn btn-brand" onClick={() => setModal(true)}><Plus size={16} /> Reportar falla</button>}
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Mini icon={Wrench} c="#ff7a18" v={String(data?.length ?? 0)} l="Fallas registradas" />
        <Mini icon={AlertOctagon} c="#ff5169" v={String(open)} l="Correctivos abiertos" />
        <Mini icon={AlertOctagon} c="#f5b53d" v={String(critical)} l="Criticidad alta / crítica" />
      </div>

      <Toolbar>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por equipo, código o descripción…" />
        <select className="input max-w-[160px]" value={fCrit} onChange={(e) => setFCrit(e.target.value)}>
          <option value="">Toda criticidad</option>
          {CRITICALITIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="input max-w-[170px]" value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
          <option value="">Todos los estados</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </Toolbar>

      <div className="card overflow-hidden">
        {!data ? <Loader /> : (
          <DataTable columns={columns} rows={filtered} rowKey={(c) => c.id} onRowClick={(c) => setDetail(c)} emptyTitle="Sin fallas" emptyMessage="No hay correctivos con esos filtros." emptyIcon={Wrench} />
        )}
      </div>

      <CorrectiveForm open={modal} onClose={() => setModal(false)} onSaved={() => { setModal(false); load(); setToast('Falla reportada correctamente.'); }} />
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}

function Mini({ icon: Icon, c, v, l }: { icon: any; c: string; v: string; l: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border-soft bg-surface-2 p-3.5">
      <span className="grid h-10 w-10 place-items-center rounded-[10px]" style={{ background: `${c}1f`, color: c }}><Icon size={18} /></span>
      <div>
        <div className="font-display text-xl font-extrabold">{v}</div>
        <div className="mt-0.5 text-[11px] uppercase tracking-wider text-ink-faint">{l}</div>
      </div>
    </div>
  );
}

function CorrectiveDetail({ c, onBack, onGenOT }: { c: CorrectiveMaintenance; onBack: () => void; onGenOT: (c: CorrectiveMaintenance) => void }) {
  return (
    <div>
      <button className="mb-4 flex items-center gap-2 text-[13px] font-semibold text-ink-dim transition-colors hover:text-ink" onClick={onBack}>
        <ArrowLeft size={16} /> Volver a correctivos
      </button>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-extrabold text-brand">{c.id}</h1>
          <StatusBadge status={c.criticality} />
          <StatusBadge status={c.status} />
        </div>
        {c.status !== 'Finalizado' && <button className="btn btn-brand" onClick={() => onGenOT(c)}>Generar OT <ArrowRight size={14} /></button>}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard title="Detalle de la falla" icon={FileText} pad>
            <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {[
                ['Equipo', c.equipment], ['Fecha de falla', formatDate(c.date)], ['Reportado por', c.reportedBy],
                ['Tipo de falla', c.failType], ['Criticidad', c.criticality], ['Tiempo de parada', c.downtime],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="text-[11px] uppercase tracking-wider text-ink-faint">{k}</div>
                  <div className="mt-1 text-[14px] font-medium text-ink">{v}</div>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-4 border-t border-border-soft pt-5">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-ink-faint">Descripción de la falla</div>
                <p className="mt-1.5 text-[14px] text-ink-dim">{c.description}</p>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-ink-faint">Diagnóstico técnico</div>
                <p className="mt-1.5 text-[14px] text-ink-dim">{c.diagnosis}</p>
              </div>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Seguimiento" icon={Wrench} pad>
          <div className="relative pl-7">
            <div className="absolute bottom-1.5 left-[9px] top-1.5 w-0.5 bg-border" />
            {[
              { t: 'Falla reportada', m: formatDate(c.date), active: true },
              { t: 'En diagnóstico', m: 'Evaluación técnica', active: c.status !== 'Reportado' },
              { t: 'En reparación', m: 'Intervención del equipo', active: c.status === 'En reparación' || c.status === 'Finalizado' },
              { t: 'Finalizado', m: 'Equipo operativo', active: c.status === 'Finalizado' },
            ].map((s, i) => (
              <div key={i} className="relative pb-5 last:pb-0">
                <span className={cx('absolute -left-[24px] top-0.5 h-3.5 w-3.5 rounded-full border-[3px] border-bg', s.active ? 'bg-brand' : 'bg-surface-3')} />
                <div className={cx('text-[13px] font-semibold', !s.active && 'text-ink-faint')}>{s.t}</div>
                <div className="mt-0.5 text-[11px] text-ink-faint">{s.m}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function CorrectiveForm({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    equipment: EQUIPMENT[0].code, date: todayISO(), reportedBy: OPERATORS[0],
    failType: 'Motor' as FailType, criticality: 'Media' as Criticality,
    description: '', diagnosis: '', downtime: '—', status: 'Reportado' as CorrectiveStatus,
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const save = async () => { await maintenanceService.createCorrective(form); onSaved(); };

  return (
    <Modal open={open} title="Reportar falla / correctivo" onClose={onClose} wide
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancelar</button><button className="btn btn-brand" onClick={save}>Registrar falla</button></>}>
      <FormGrid>
        <Field label="Equipo"><select className="input" value={form.equipment} onChange={(e) => set('equipment', e.target.value)}>{EQUIPMENT.map((eq) => <option key={eq.id}>{eq.code}</option>)}</select></Field>
        <Field label="Fecha de falla"><input type="date" className="input" value={form.date} onChange={(e) => set('date', e.target.value)} /></Field>
        <Field label="Reportado por"><select className="input" value={form.reportedBy} onChange={(e) => set('reportedBy', e.target.value)}>{OPERATORS.map((o) => <option key={o}>{o}</option>)}</select></Field>
        <Field label="Tipo de falla"><select className="input" value={form.failType} onChange={(e) => set('failType', e.target.value)}>{FAIL_TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
        <Field label="Criticidad"><select className="input" value={form.criticality} onChange={(e) => set('criticality', e.target.value)}>{CRITICALITIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Tiempo de parada estimado"><input className="input" value={form.downtime} onChange={(e) => set('downtime', e.target.value)} placeholder="Ej: 18h" /></Field>
        <Field label="Descripción de la falla" full><textarea className="input min-h-[70px]" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Describe el síntoma o falla observada…" /></Field>
        <Field label="Diagnóstico técnico" full><textarea className="input min-h-[70px]" value={form.diagnosis} onChange={(e) => set('diagnosis', e.target.value)} placeholder="Diagnóstico preliminar o confirmado…" /></Field>
        <Field label="Evidencias (fotos)" full><input type="file" multiple className="input file:mr-2 file:rounded file:border-0 file:bg-surface-2 file:px-2 file:py-1 file:text-ink-dim" /></Field>
      </FormGrid>
    </Modal>
  );
}
