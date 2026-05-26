// SparePartsPage — inventario de repuestos con control de stock y salidas.
import { useEffect, useMemo, useState } from 'react';
import { Plus, Package, AlertTriangle, PackageMinus, DollarSign } from 'lucide-react';
import { PageHeader, SectionCard } from '@/components/common/Feedback';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DataTable, type Column } from '@/components/common/DataTable';
import { Modal, FormGrid, Field } from '@/components/common/Modal';
import { Toolbar, SearchInput, Loader } from '@/components/common/Ui';
import { Toast } from '@/components/common/Feedback';
import { sparePartsService } from '@/services/sparePartsService';
import { formatCurrency, formatNumber } from '@/lib/format';
import type { SparePart } from '@/types';

const CATS = ['Filtros', 'Motor', 'Hidráulico', 'Frenos', 'Lubricantes', 'Neumáticos', 'Transmisión', 'Eléctrico', 'Otros'];

export function SparePartsPage() {
  const [data, setData] = useState<SparePart[] | null>(null);
  const [search, setSearch] = useState('');
  const [fCat, setFCat] = useState('');
  const [modal, setModal] = useState(false);
  const [dispatchFor, setDispatchFor] = useState<SparePart | null>(null);
  const [toast, setToast] = useState('');

  const load = () => sparePartsService.list().then(setData);
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase();
    return data.filter((p) => (!q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)) && (!fCat || p.cat === fCat));
  }, [data, search, fCat]);

  const lowStock = data?.filter((p) => p.status !== 'Disponible') ?? [];
  const totalValue = data?.reduce((a, p) => a + p.stock * p.cost, 0) ?? 0;

  const columns: Column<SparePart>[] = [
    { key: 'id', header: 'Código', render: (p) => <span className="font-mono font-semibold text-ink">{p.id}</span> },
    { key: 'name', header: 'Repuesto', render: (p) => <span className="text-ink">{p.name}</span> },
    { key: 'cat', header: 'Categoría', accessor: (p) => p.cat },
    { key: 'brand', header: 'Marca', accessor: (p) => p.brand },
    { key: 'stock', header: 'Stock', render: (p) => <span className={cx_stock(p)}>{formatNumber(p.stock)} {p.unit}</span> },
    { key: 'min', header: 'Mínimo', render: (p) => <span className="font-mono text-ink-faint">{p.min}</span> },
    { key: 'cost', header: 'Costo unit.', render: (p) => formatCurrency(p.cost) },
    { key: 'status', header: 'Estado', render: (p) => <StatusBadge status={p.status} /> },
    {
      key: 'act', header: '', className: 'text-right',
      render: (p) => (
        <div onClick={(e) => e.stopPropagation()}>
          <button className="btn btn-ghost btn-sm" onClick={() => setDispatchFor(p)} disabled={p.stock <= 0}><PackageMinus size={14} /> Salida</button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        crumb="Almacén"
        title="Repuestos"
        subtitle="Control de inventario y consumo de repuestos"
        actions={<button className="btn btn-brand" onClick={() => setModal(true)}><Plus size={16} /> Nuevo repuesto</button>}
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Mini icon={Package} c="#2f6bff" v={String(data?.length ?? 0)} l="Ítems en almacén" />
        <Mini icon={AlertTriangle} c="#f5b53d" v={String(lowStock.length)} l="Con alerta de stock" />
        <Mini icon={DollarSign} c="#22c98a" v={formatCurrency(totalValue)} l="Valor del inventario" />
      </div>

      {lowStock.length > 0 && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-warn/30 bg-warn/5 p-4">
          <AlertTriangle size={20} className="mt-0.5 shrink-0 text-warn" />
          <div className="text-[13px]">
            <span className="font-semibold text-warn">Atención: </span>
            <span className="text-ink-dim">{lowStock.length} repuesto(s) requieren reposición: </span>
            <span className="text-ink">{lowStock.map((p) => p.name).join(', ')}.</span>
          </div>
        </div>
      )}

      <Toolbar>
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por código, nombre o marca…" />
        <select className="input max-w-[180px]" value={fCat} onChange={(e) => setFCat(e.target.value)}>
          <option value="">Todas las categorías</option>
          {CATS.map((c) => <option key={c}>{c}</option>)}
        </select>
      </Toolbar>

      <div className="card overflow-hidden">
        {!data ? <Loader /> : (
          <DataTable columns={columns} rows={filtered} rowKey={(p) => p.id} emptyTitle="Sin repuestos" emptyMessage="No hay repuestos con esos filtros." emptyIcon={Package} />
        )}
      </div>

      <SparePartForm open={modal} onClose={() => setModal(false)} onSaved={() => { setModal(false); load(); setToast('Repuesto registrado.'); }} />
      <DispatchForm part={dispatchFor} onClose={() => setDispatchFor(null)} onSaved={() => { setDispatchFor(null); load(); setToast('Salida de repuesto registrada.'); }} />
      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}

function cx_stock(p: SparePart) {
  return p.status === 'Sin stock' ? 'font-mono font-semibold text-danger' : p.status === 'Bajo stock' ? 'font-mono font-semibold text-warn' : 'font-mono text-ink';
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

function SparePartForm({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: '', cat: CATS[0], brand: '', unit: 'Und', stock: 0, min: 0, cost: 0 });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const save = async () => { await sparePartsService.create(form); onSaved(); };

  return (
    <Modal open={open} title="Registrar nuevo repuesto" onClose={onClose} wide
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancelar</button><button className="btn btn-brand" onClick={save}>Guardar repuesto</button></>}>
      <FormGrid>
        <Field label="Nombre del repuesto" full><input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Filtro de aceite motor" /></Field>
        <Field label="Categoría"><select className="input" value={form.cat} onChange={(e) => set('cat', e.target.value)}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Marca"><input className="input" value={form.brand} onChange={(e) => set('brand', e.target.value)} placeholder="CAT" /></Field>
        <Field label="Unidad de medida"><select className="input" value={form.unit} onChange={(e) => set('unit', e.target.value)}><option>Und</option><option>Jgo</option><option>Bal</option><option>Lt</option><option>Kg</option></select></Field>
        <Field label="Stock inicial"><input type="number" className="input" value={form.stock} onChange={(e) => set('stock', +e.target.value)} /></Field>
        <Field label="Stock mínimo"><input type="number" className="input" value={form.min} onChange={(e) => set('min', +e.target.value)} /></Field>
        <Field label="Costo unitario (USD)"><input type="number" className="input" value={form.cost} onChange={(e) => set('cost', +e.target.value)} /></Field>
      </FormGrid>
    </Modal>
  );
}

function DispatchForm({ part, onClose, onSaved }: { part: SparePart | null; onClose: () => void; onSaved: () => void }) {
  const [qty, setQty] = useState(1);
  if (!part) return null;
  const save = async () => { await sparePartsService.dispatch(part.id, qty); onSaved(); setQty(1); };

  return (
    <Modal open={!!part} title="Registrar salida de repuesto" onClose={onClose}
      footer={<><button className="btn btn-ghost" onClick={onClose}>Cancelar</button><button className="btn btn-brand" onClick={save}>Confirmar salida</button></>}>
      <div className="mb-4 rounded-[10px] bg-surface-2 p-3.5">
        <div className="text-[13px] font-semibold text-ink">{part.name}</div>
        <div className="mt-1 text-[12px] text-ink-faint">Stock actual: <span className="font-mono text-ink">{part.stock} {part.unit}</span> · Mínimo: {part.min}</div>
      </div>
      <FormGrid>
        <Field label="Cantidad a despachar"><input type="number" min={1} max={part.stock} className="input" value={qty} onChange={(e) => setQty(+e.target.value)} /></Field>
        <Field label="Orden de trabajo asociada"><input className="input" placeholder="OT-3301 (opcional)" /></Field>
      </FormGrid>
    </Modal>
  );
}
