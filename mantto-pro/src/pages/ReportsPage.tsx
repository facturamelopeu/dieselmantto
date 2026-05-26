// ReportsPage — reportes visuales y exportación simulada (solo admin).
import { useState } from 'react';
import {
  FileText, FileSpreadsheet, FileDown, Truck, ListChecks, Package, Wrench, Gauge, ClipboardList, Download,
} from 'lucide-react';
import { PageHeader, SectionCard } from '@/components/common/Feedback';
import { Toast } from '@/components/common/Feedback';
import { Donut, HorizontalBars } from '@/components/charts/Charts';
import { FAIL_BY_TYPE, COST_BY_EQUIP } from '@/data/mockData';

const REPORTS = [
  { icon: Truck, color: '#2f6bff', title: 'Reporte por equipo', desc: 'Estado, historial y disponibilidad de cada máquina de la flota.' },
  { icon: ListChecks, color: '#9d7bff', title: 'Órdenes por estado', desc: 'Distribución de OT abiertas, en proceso, finalizadas y cerradas.' },
  { icon: Package, color: '#22c98a', title: 'Repuestos utilizados', desc: 'Consumo de repuestos por periodo, equipo y categoría.' },
  { icon: Wrench, color: '#ff7a18', title: 'Fallas por tipo', desc: 'Análisis de fallas por sistema: motor, hidráulico, eléctrico, etc.' },
  { icon: Gauge, color: '#3b9dff', title: 'Disponibilidad mecánica', desc: 'Evolución de la disponibilidad de la flota por mes y proyecto.' },
  { icon: ClipboardList, color: '#f5b53d', title: 'Guardias de trabajo', desc: 'Resumen de guardias por turno, supervisor e incidencias.' },
];

export function ReportsPage() {
  const [toast, setToast] = useState('');
  const exp = (fmt: string, name: string) => setToast(`Exportando "${name}" a ${fmt} (simulado).`);

  return (
    <div>
      <PageHeader
        crumb="Información gerencial"
        title="Reportes"
        subtitle="Generación y exportación de reportes de mantenimiento"
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {REPORTS.map((r) => {
          const Icon = r.icon;
          return (
            <div key={r.title} className="card flex flex-col p-5">
              <div className="mb-3.5 grid h-12 w-12 place-items-center rounded-xl" style={{ background: `${r.color}1f`, color: r.color }}>
                <Icon size={22} />
              </div>
              <h3 className="text-[15px] font-semibold">{r.title}</h3>
              <p className="mt-1.5 flex-1 text-[12.5px] leading-relaxed text-ink-dim">{r.desc}</p>
              <div className="mt-4 flex gap-2">
                <button className="btn btn-ghost btn-sm flex-1 justify-center" onClick={() => exp('PDF', r.title)}><FileDown size={14} /> PDF</button>
                <button className="btn btn-ghost btn-sm flex-1 justify-center" onClick={() => exp('Excel', r.title)}><FileSpreadsheet size={14} /> Excel</button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          title="Vista previa · Fallas por tipo"
          icon={Wrench}
          pad
          action={<button className="btn btn-ghost btn-sm" onClick={() => exp('PDF', 'Fallas por tipo')}><Download size={13} /> Exportar</button>}
        >
          <Donut data={FAIL_BY_TYPE} dataKey="value" nameKey="tipo" />
        </SectionCard>
        <SectionCard
          title="Vista previa · Costo por equipo"
          icon={FileText}
          pad
          action={<button className="btn btn-ghost btn-sm" onClick={() => exp('Excel', 'Costo por equipo')}><Download size={13} /> Exportar</button>}
        >
          <HorizontalBars data={COST_BY_EQUIP} xKey="equipo" barKey="costo" color="#2f6bff" />
        </SectionCard>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}
