// ShiftsPage — registro de guardias de trabajo (8h / 12h) por supervisor.
import { useEffect, useMemo, useState } from 'react';
import { Plus, ClipboardList, ClipboardCheck } from 'lucide-react';
import { PageHeader } from '@/components/common/Feedback';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DataTable, type Column } from '@/components/common/DataTable';
import { Modal, FormGrid, Field } from '@/components/common/Modal';
import { Toolbar, SearchInput, Loader } from '@/components/common/Ui';
import { Toast } from '@/components/common/Feedback';
import { shiftService } from '@/services/shiftService';
import { PROJECTS, OPERATORS, EQUIPMENT } from '@/data/mockData';
import { formatDate, todayISO } from '@/lib/format';
import type { WorkShift, ShiftDuration, ShiftTurn } from '@/types';

export function ShiftsPage() {
  const [data, setData] = useState<WorkShift[] | null>(null);
  const [search, setSearch] = useState('');
  const [fTurn, setFTurn] = useState('');
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState('');

  const load = () => shiftService.list().then(setData);
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase();
    return data.filter(
      (s) => (!q || s.supervisor.toLowerCase().includes(q) || s.equipment.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)) && (!fTurn || s.turn === fTurn),
    );
  }, [data, search, fTurn]);

  const columns: Column<WorkShift>[] = [
    { key: 'id', header: 'Guardia', render: (s) => <span className="font-mono font-semibold text-brand">{s.id}</span> },
    { key: 'date', header: 'Fecha', render: (s) => formatDate(s.date) },
    { key: 'turn', header: 'Turno', render: (s) => <span>{s.turn} · <span className="text-ink-faint">{s.duration}</span></span> },
    { key: 'sup', header: 'Supervisor', render: (s) => <span className="text-ink">{s.supervisor}</span> },
    { key: 'eq', header: 'Equipo', render: (s) => <span className="font-mono">{s.equipment}</span> },
    { key: 'hours', header: 'Horas', render: (s) => `${s.hours} h` },
    { key: 'inc', header: 'Incidencias', render: (s) => s.incidents > 0 ? <span className="font-semibold text-warn">{s.incidents}</span> : <span className="text-ink-faint">0</span> },
    { key: 'status', header: 'Estado', render: (s) => <StatusBadge status={s.status} /> },
  ];

  const completed = data?.filter((s) => s.status === 'Completada').length ?? 0;
  const pending = data?.filter((s) => s.status === 'Pendiente').length ?? 0;

  return (
    <div>
      <PageHeader
        crumb="Operación diaria"
        title="Guardias de Trabajo"
        subtitle="Registro de operación por turno de 8 o 12 horas"
        actions={<button className="btn btn-brand" onClick={() => setModal(true)}><Plus size={16} /> Registrar guardia</button>}
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Mini icon={ClipboardList} c="#2f6bff" v={String(data?.length ?? 0)} l="Guardias registradas" />
        <Mini icon={ClipboardCheck} c="#22c98a" v={String(completed)} l="Completadas" />
        <Mini icon={ClipboardList} c="#f5b53d" v={String(pending)} l="Pendientes / en curso" />
      </div>

      <Toolbar>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por supervisor, equipo o guardia…" />
        <select className="input max-w-[160px]" value={fTurn} onChange={(e) => setFTurn(e.target.value)}>
          <option value="">Todos los turnos</option>
          <option value="Día">Día</option>
          <option value="Noche">Noche</option>
        </select>
      </Toolbar>

      <div className="card overflow-hidden">
        {!data ? <Loader /> : (
          <DataTable columns={columns} rows={filtered} rowKey={(s) => s.id} emptyTitle="Sin guardias" emptyMessage="No hay guardias registradas con esos filtros." emptyIcon={ClipboardList} />
        )}
      </div>

      <ShiftForm open={modal} onClose={() => setModal(false)} onSaved={() => { setModal(false); load(); setToast('Guardia registrada correctamente.'); }} />
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

function ShiftForm({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    supervisor: OPERATORS[0], date: todayISO(), turn: 'Día' as ShiftTurn, duration: '12h' as ShiftDuration,
    project: PROJECTS[0], equipment: EQUIPMENT[0].code, operator: OPERATORS[0],
    hmStart: 0, hmEnd: 0, kmStart: 0, kmEnd: 0, incidents: 0, failures: 0, notes: '',
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const hours = form.duration === '12h' ? 12 : 8;

  const save = async () => {
    await shiftService.create({ ...form, hours, status: 'Completada' });
    onSaved();
  };

  return (
    <Modal open={open} title="Registrar guardia de trabajo" onClose={onClose} wide
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancelar</button><button className="btn btn-brand" onClick={save}>Confirmar guardia</button></>}>
      <FormGrid>
        <Field label="Supervisor"><select className="input" value={form.supervisor} onChange={(e) => set('supervisor', e.target.value)}>{OPERATORS.map((o) => <option key={o}>{o}</option>)}</select></Field>
        <Field label="Fecha"><input type="date" className="input" value={form.date} onChange={(e) => set('date', e.target.value)} /></Field>
        <Field label="Turno / Guardia"><select className="input" value={form.turn} onChange={(e) => set('turn', e.target.value)}><option>Día</option><option>Noche</option></select></Field>
        <Field label="Duración">
          <div className="flex gap-2">
            {(['8h', '12h'] as ShiftDuration[]).map((d) => (
              <button key={d} type="button" onClick={() => set('duration', d)}
                className={`flex-1 rounded-[10px] border py-2.5 text-sm font-semibold transition-colors ${form.duration === d ? 'border-brand bg-brand/10 text-brand' : 'border-border text-ink-dim'}`}>
                {d === '8h' ? '8 horas' : '12 horas'}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Proyecto / frente"><select className="input" value={form.project} onChange={(e) => set('project', e.target.value)}>{PROJECTS.map((p) => <option key={p}>{p}</option>)}</select></Field>
        <Field label="Equipo"><select className="input" value={form.equipment} onChange={(e) => set('equipment', e.target.value)}>{EQUIPMENT.map((eq) => <option key={eq.id}>{eq.code}</option>)}</select></Field>
        <Field label="Operador"><select className="input" value={form.operator} onChange={(e) => set('operator', e.target.value)}>{OPERATORS.map((o) => <option key={o}>{o}</option>)}</select></Field>
        <Field label="Horas trabajadas"><input className="input bg-surface-2" value={`${hours} h`} disabled /></Field>
        <Field label="Horómetro inicial"><input type="number" className="input" value={form.hmStart} onChange={(e) => set('hmStart', +e.target.value)} /></Field>
        <Field label="Horómetro final"><input type="number" className="input" value={form.hmEnd} onChange={(e) => set('hmEnd', +e.target.value)} /></Field>
        <Field label="Kilometraje inicial"><input type="number" className="input" value={form.kmStart} onChange={(e) => set('kmStart', +e.target.value)} /></Field>
        <Field label="Kilometraje final"><input type="number" className="input" value={form.kmEnd} onChange={(e) => set('kmEnd', +e.target.value)} /></Field>
        <Field label="Incidencias"><input type="number" className="input" value={form.incidents} onChange={(e) => set('incidents', +e.target.value)} /></Field>
        <Field label="Fallas reportadas"><input type="number" className="input" value={form.failures} onChange={(e) => set('failures', +e.target.value)} /></Field>
        <Field label="Observaciones" full><textarea className="input min-h-[70px]" value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Estado del equipo durante la guardia, incidencias, fallas…" /></Field>
        <Field label="Confirmación digital" full>
          <label className="flex items-center gap-2.5 rounded-[10px] border border-border bg-surface-2 p-3 text-[13px] text-ink-dim">
            <input type="checkbox" className="h-4 w-4 accent-brand" defaultChecked /> Confirmo que los datos registrados son correctos (firma digital simulada)
          </label>
        </Field>
      </FormGrid>
    </Modal>
  );
}
