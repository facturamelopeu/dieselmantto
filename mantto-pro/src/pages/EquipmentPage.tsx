// EquipmentPage — listado, alta y vista detalle (pestañas) de maquinaria.
import { useEffect, useMemo, useState } from 'react';
import {
  Plus, Truck, Eye, Pencil, ArrowLeft, Gauge, Wrench, ListChecks, Package, BarChart3, Info,
} from 'lucide-react';
import { PageHeader, SectionCard } from '@/components/common/Feedback';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DataTable, type Column } from '@/components/common/DataTable';
import { Modal, FormGrid, Field } from '@/components/common/Modal';
import { Toolbar, SearchInput, Loader } from '@/components/common/Ui';
import { Toast } from '@/components/common/Feedback';
import { AreaTrend } from '@/components/charts/Charts';
import { equipmentService } from '@/services/equipmentService';
import { PROJECTS, OPERATORS, AVAILABILITY_SERIES } from '@/data/mockData';
import { formatNumber, formatDate, cx, todayISO } from '@/lib/format';
import type { Equipment, EquipmentType, EquipmentStatus } from '@/types';

const TYPES: EquipmentType[] = ['Excavadora', 'Cargador frontal', 'Tractor', 'Motoniveladora', 'Rodillo', 'Volquete', 'Camión cisterna', 'Otros'];
const STATUSES: EquipmentStatus[] = ['Operativo', 'En mantenimiento', 'Parado', 'Baja'];

export function EquipmentPage() {
  const [data, setData] = useState<Equipment[] | null>(null);
  const [search, setSearch] = useState('');
  const [fType, setFType] = useState('');
  const [fStatus, setFStatus] = useState('');
  const [modal, setModal] = useState(false);
  const [detail, setDetail] = useState<Equipment | null>(null);
  const [toast, setToast] = useState('');

  const load = () => equipmentService.list().then(setData);
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase();
    return data.filter(
      (e) =>
        (!q || e.code.toLowerCase().includes(q) || e.brand.toLowerCase().includes(q) || e.model.toLowerCase().includes(q) || e.plate.toLowerCase().includes(q)) &&
        (!fType || e.type === fType) &&
        (!fStatus || e.status === fStatus),
    );
  }, [data, search, fType, fStatus]);

  if (detail) return <EquipmentDetail equipment={detail} onBack={() => setDetail(null)} />;

  const columns: Column<Equipment>[] = [
    { key: 'code', header: 'Código', render: (e) => <span className="font-mono font-semibold text-ink">{e.code}</span> },
    { key: 'type', header: 'Tipo', accessor: (e) => e.type },
    { key: 'brand', header: 'Marca / Modelo', render: (e) => <span><span className="text-ink">{e.brand}</span> · {e.model}</span> },
    { key: 'meter', header: 'Horómetro / Km', render: (e) => <span className="font-mono">{e.horometer ? `${formatNumber(e.horometer)} h` : `${formatNumber(e.km)} km`}</span> },
    { key: 'project', header: 'Proyecto', accessor: (e) => e.project },
    { key: 'status', header: 'Estado', render: (e) => <StatusBadge status={e.status} /> },
    {
      key: 'actions', header: '', className: 'text-right',
      render: (e) => (
        <div className="flex justify-end gap-1.5" onClick={(ev) => ev.stopPropagation()}>
          <button className="grid h-8 w-8 place-items-center rounded-lg border border-border text-ink-dim transition-colors hover:border-brand hover:text-brand" onClick={() => setDetail(e)} title="Ver detalle"><Eye size={15} /></button>
          <button className="grid h-8 w-8 place-items-center rounded-lg border border-border text-ink-dim transition-colors hover:border-brand hover:text-brand" title="Editar"><Pencil size={15} /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        crumb="Gestión de flota"
        title="Equipos"
        subtitle={data ? `${data.length} equipos registrados en la flota` : ''}
        actions={<button className="btn btn-brand" onClick={() => setModal(true)}><Plus size={16} /> Nuevo equipo</button>}
      />

      <Toolbar>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por código, placa, marca o modelo…" />
        <select className="input max-w-[180px]" value={fType} onChange={(e) => setFType(e.target.value)}>
          <option value="">Todos los tipos</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="input max-w-[180px]" value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
          <option value="">Todos los estados</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </Toolbar>

      <div className="card overflow-hidden">
        {!data ? <Loader /> : (
          <DataTable
            columns={columns}
            rows={filtered}
            rowKey={(e) => e.id}
            onRowClick={(e) => setDetail(e)}
            emptyTitle="Sin equipos"
            emptyMessage="No se encontraron equipos con los filtros actuales."
            emptyIcon={Truck}
          />
        )}
      </div>

      <EquipmentForm
        open={modal}
        onClose={() => setModal(false)}
        onSaved={() => { setModal(false); load(); setToast('Equipo registrado correctamente.'); }}
      />
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}

// ---- Formulario de alta ----
function EquipmentForm({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    code: '', type: 'Excavadora' as EquipmentType, brand: '', model: '', plate: '—',
    year: 2024, serial: '', horometer: 0, km: 0, status: 'Operativo' as EquipmentStatus,
    project: PROJECTS[0], owner: OPERATORS[0], entryDate: todayISO(), notes: '',
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    await equipmentService.create({ ...form, failures: 0, availability: 100 });
    onSaved();
  };

  return (
    <Modal
      open={open}
      title="Registrar nuevo equipo"
      onClose={onClose}
      wide
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-brand" onClick={save}>Guardar equipo</button>
        </>
      }
    >
      <FormGrid>
        <Field label="Código interno"><input className="input" value={form.code} onChange={(e) => set('code', e.target.value)} placeholder="EXC-013" /></Field>
        <Field label="Tipo de equipo">
          <select className="input" value={form.type} onChange={(e) => set('type', e.target.value)}>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Marca"><input className="input" value={form.brand} onChange={(e) => set('brand', e.target.value)} placeholder="Caterpillar" /></Field>
        <Field label="Modelo"><input className="input" value={form.model} onChange={(e) => set('model', e.target.value)} placeholder="336 GC" /></Field>
        <Field label="Placa"><input className="input" value={form.plate} onChange={(e) => set('plate', e.target.value)} /></Field>
        <Field label="Año"><input type="number" className="input" value={form.year} onChange={(e) => set('year', +e.target.value)} /></Field>
        <Field label="Número de serie"><input className="input" value={form.serial} onChange={(e) => set('serial', e.target.value)} /></Field>
        <Field label="Estado">
          <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Horómetro actual (h)"><input type="number" className="input" value={form.horometer} onChange={(e) => set('horometer', +e.target.value)} /></Field>
        <Field label="Kilometraje actual (km)"><input type="number" className="input" value={form.km} onChange={(e) => set('km', +e.target.value)} /></Field>
        <Field label="Proyecto / frente">
          <select className="input" value={form.project} onChange={(e) => set('project', e.target.value)}>
            {PROJECTS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Responsable asignado">
          <select className="input" value={form.owner} onChange={(e) => set('owner', e.target.value)}>
            {OPERATORS.map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="Fecha de ingreso"><input type="date" className="input" value={form.entryDate} onChange={(e) => set('entryDate', e.target.value)} /></Field>
        <Field label="Foto referencial"><input type="file" className="input file:mr-2 file:rounded file:border-0 file:bg-surface-2 file:px-2 file:py-1 file:text-ink-dim" /></Field>
        <Field label="Observaciones" full><textarea className="input min-h-[74px]" value={form.notes} onChange={(e) => set('notes', e.target.value)} /></Field>
      </FormGrid>
    </Modal>
  );
}

// ---- Vista detalle con pestañas ----
const TABS = [
  { key: 'info', label: 'Información general', icon: Info },
  { key: 'hist', label: 'Historial de mantenimiento', icon: Wrench },
  { key: 'ot', label: 'Órdenes de trabajo', icon: ListChecks },
  { key: 'parts', label: 'Repuestos usados', icon: Package },
  { key: 'kpi', label: 'KPIs del equipo', icon: BarChart3 },
] as const;

function EquipmentDetail({ equipment: e, onBack }: { equipment: Equipment; onBack: () => void }) {
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('info');

  return (
    <div>
      <button className="mb-4 flex items-center gap-2 text-[13px] font-semibold text-ink-dim transition-colors hover:text-ink" onClick={onBack}>
        <ArrowLeft size={16} /> Volver a equipos
      </button>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand/20 to-brand-2/10 text-brand">
            <Truck size={30} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-2xl font-extrabold">{e.code}</h1>
              <StatusBadge status={e.status} />
            </div>
            <p className="mt-1 text-[13.5px] text-ink-dim">{e.type} · {e.brand} {e.model} · {e.project}</p>
          </div>
        </div>
        <button className="btn btn-ghost"><Pencil size={15} /> Editar equipo</button>
      </div>

      {/* Mini stats */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { ic: Gauge, l: e.horometer ? 'Horómetro' : 'Kilometraje', v: e.horometer ? `${formatNumber(e.horometer)} h` : `${formatNumber(e.km)} km`, c: '#2f6bff' },
          { ic: BarChart3, l: 'Disponibilidad', v: `${e.availability}%`, c: '#22c98a' },
          { ic: Wrench, l: 'Fallas totales', v: String(e.failures), c: '#ff7a18' },
          { ic: Info, l: 'Año', v: String(e.year), c: '#9d7bff' },
        ].map((s) => {
          const Icon = s.ic;
          return (
            <div key={s.l} className="flex items-center gap-3 rounded-xl border border-border-soft bg-surface-2 p-3.5">
              <span className="grid h-10 w-10 place-items-center rounded-[10px]" style={{ background: `${s.c}1f`, color: s.c }}><Icon size={18} /></span>
              <div>
                <div className="font-display text-xl font-extrabold">{s.v}</div>
                <div className="mt-0.5 text-[11px] uppercase tracking-wider text-ink-faint">{s.l}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cx(
                'flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-[13px] font-semibold transition-colors',
                tab === t.key ? 'border-brand text-brand' : 'border-transparent text-ink-dim hover:text-ink',
              )}
            >
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'info' && (
        <div className="card p-6">
          <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ['Código interno', e.code], ['Tipo', e.type], ['Marca', e.brand], ['Modelo', e.model],
              ['Placa', e.plate], ['Año', e.year], ['Número de serie', e.serial],
              ['Horómetro', `${formatNumber(e.horometer)} h`], ['Kilometraje', `${formatNumber(e.km)} km`],
              ['Proyecto / frente', e.project], ['Responsable', e.owner], ['Fecha de ingreso', formatDate(e.entryDate)],
            ].map(([k, v]) => (
              <div key={k as string}>
                <div className="text-[11px] uppercase tracking-wider text-ink-faint">{k}</div>
                <div className="mt-1 text-[14px] font-medium text-ink">{v}</div>
              </div>
            ))}
          </div>
          {e.notes && (
            <div className="mt-6 border-t border-border-soft pt-5">
              <div className="text-[11px] uppercase tracking-wider text-ink-faint">Observaciones</div>
              <p className="mt-1.5 text-[14px] text-ink-dim">{e.notes}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'hist' && (
        <SectionCard title="Historial de mantenimiento" icon={Wrench} pad>
          <div className="relative pl-7">
            <div className="absolute bottom-1.5 left-[9px] top-1.5 w-0.5 bg-border" />
            {[
              { t: 'PM250 ejecutado', d: 'Mantenimiento preventivo completado', m: '15 may 2026 · C. Rojas' },
              { t: 'Correctivo finalizado', d: 'Reemplazo de filtros y revisión hidráulica', m: '28 abr 2026 · R. Flores' },
              { t: 'PM500 ejecutado', d: 'Cambio de aceite y engrase general', m: '10 mar 2026 · C. Rojas' },
            ].map((it, i) => (
              <div key={i} className="relative pb-5 last:pb-0">
                <span className="absolute -left-[24px] top-0.5 h-3.5 w-3.5 rounded-full border-[3px] border-bg bg-brand" />
                <div className="text-[13px] font-semibold">{it.t}</div>
                <div className="mt-0.5 text-[12px] text-ink-faint">{it.d}</div>
                <div className="mt-1 text-[11px] text-ink-faint">{it.m}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {tab === 'ot' && (
        <div className="card overflow-hidden">
          <table className="tbl">
            <thead><tr><th>OT</th><th>Tipo</th><th>Descripción</th><th>Estado</th></tr></thead>
            <tbody>
              <tr><td className="font-mono font-semibold text-brand">OT-3299</td><td><StatusBadge status="Preventiva" tone="blue" /></td><td>Mantenimiento PM250 programado</td><td><StatusBadge status="Cerrada" /></td></tr>
              <tr><td className="font-mono font-semibold text-brand">OT-3297</td><td><StatusBadge status="Preventiva" tone="blue" /></td><td>Mantenimiento PM500 próximo a ejecutar</td><td><StatusBadge status="Abierta" /></td></tr>
            </tbody>
          </table>
        </div>
      )}

      {tab === 'parts' && (
        <div className="card overflow-hidden">
          <table className="tbl">
            <thead><tr><th>Repuesto</th><th>Categoría</th><th>Cantidad</th><th>OT</th></tr></thead>
            <tbody>
              <tr><td className="text-ink">Filtro de aceite motor</td><td>Filtros</td><td>2 Und</td><td className="font-mono text-brand">OT-3299</td></tr>
              <tr><td className="text-ink">Aceite hidráulico 20L</td><td>Lubricantes</td><td>1 Bal</td><td className="font-mono text-brand">OT-3299</td></tr>
            </tbody>
          </table>
        </div>
      )}

      {tab === 'kpi' && (
        <SectionCard title="Tendencia de disponibilidad del equipo" icon={BarChart3} pad>
          <AreaTrend data={AVAILABILITY_SERIES} xKey="mes" series={[{ key: 'disp', color: '#22c98a', label: 'Disponibilidad %' }]} />
        </SectionCard>
      )}
    </div>
  );
}
