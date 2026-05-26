// KpiPage — panel ejecutivo de indicadores de mantenimiento (solo admin).
import { useEffect, useState } from 'react';
import {
  Gauge, CheckCircle2, Activity, Timer, AlertOctagon, DollarSign, Download, TrendingUp, PieChart, BarChart3,
} from 'lucide-react';
import { PageHeader, SectionCard } from '@/components/common/Feedback';
import { KpiCard } from '@/components/common/KpiCard';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Loader } from '@/components/common/Ui';
import { Toast } from '@/components/common/Feedback';
import { AreaTrend, GroupedBars, Donut, HorizontalBars, DualLine } from '@/components/charts/Charts';
import { kpiService } from '@/services/kpiService';
import { formatCurrency } from '@/lib/format';
import type { DashboardKpis, Equipment } from '@/types';

export function KpiPage() {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [avail, setAvail] = useState<any[]>([]);
  const [pmcm, setPmcm] = useState<any[]>([]);
  const [fail, setFail] = useState<any[]>([]);
  const [cost, setCost] = useState<any[]>([]);
  const [mtbf, setMtbf] = useState<any[]>([]);
  const [critical, setCritical] = useState<Equipment[]>([]);
  const [toast, setToast] = useState('');

  useEffect(() => {
    Promise.all([
      kpiService.dashboard(), kpiService.availabilitySeries(), kpiService.pmVsCmSeries(),
      kpiService.failByType(), kpiService.costByEquipment(), kpiService.mtbfSeries(), kpiService.criticalEquipment(),
    ]).then(([k, a, p, f, c, m, cr]) => {
      setKpis(k); setAvail(a); setPmcm(p); setFail(f); setCost(c); setMtbf(m); setCritical(cr);
    });
  }, []);

  if (!kpis) return <Loader label="Calculando indicadores…" />;

  return (
    <div>
      <PageHeader
        crumb="Indicadores de gestión"
        title="KPI de Mantenimiento"
        subtitle="Análisis ejecutivo del desempeño de mantenimiento de la flota"
        actions={<button className="btn btn-ghost" onClick={() => setToast('Exportación simulada (PDF/Excel).')}><Download size={16} /> Exportar</button>}
      />

      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard icon={Gauge} label="Disponibilidad mecánica" value={kpis.availability} unit="%" tone="green" delta={{ value: '+1.2%', dir: 'up' }} />
        <KpiCard icon={CheckCircle2} label="Cumplimiento de preventivos" value={kpis.preventiveCompliance} unit="%" tone="brand" delta={{ value: '+4%', dir: 'up' }} />
        <KpiCard icon={Activity} label="MTBF (tiempo entre fallas)" value={224} unit="h" tone="info" delta={{ value: '-17h', dir: 'down' }} />
        <KpiCard icon={Timer} label="MTTR (tiempo de reparación)" value={kpis.mttr} unit="h" tone="yellow" delta={{ value: '-0.4h', dir: 'up' }} />
        <KpiCard icon={AlertOctagon} label="% correctivos vs preventivos" value={42} unit="%" tone="red" delta={{ value: '+6%', dir: 'down' }} />
        <KpiCard icon={DollarSign} label="Costo total de mantenimiento" value={formatCurrency(kpis.estimatedCost)} tone="violet" delta={{ value: '+8%', dir: 'down' }} />
      </div>

      <div className="mb-4 grid gap-4 xl:grid-cols-2">
        <SectionCard title="Disponibilidad mecánica vs meta" icon={TrendingUp} pad>
          <AreaTrend data={avail} xKey="mes" series={[{ key: 'disp', color: '#2f6bff', label: 'Disponibilidad %' }, { key: 'meta', color: '#22c98a', label: 'Meta %' }]} />
        </SectionCard>
        <SectionCard title="MTBF vs MTTR" icon={Activity} pad>
          <DualLine data={mtbf} xKey="mes" series={[{ key: 'mtbf', color: '#3b9dff', label: 'MTBF (h)' }, { key: 'mttr', color: '#ff7a18', label: 'MTTR (h)' }]} />
        </SectionCard>
      </div>

      <div className="mb-4 grid gap-4 xl:grid-cols-2">
        <SectionCard title="Distribución de fallas por tipo" icon={PieChart} pad>
          <Donut data={fail} dataKey="value" nameKey="tipo" />
        </SectionCard>
        <SectionCard title="Preventivos vs correctivos por mes" icon={BarChart3} pad>
          <GroupedBars data={pmcm} xKey="mes" series={[{ key: 'preventivo', color: '#2f6bff', label: 'Preventivo' }, { key: 'correctivo', color: '#ff7a18', label: 'Correctivo' }]} />
        </SectionCard>
      </div>

      <div className="mb-4 grid gap-4 xl:grid-cols-2">
        <SectionCard title="Costo de mantenimiento por equipo" icon={DollarSign} pad>
          <HorizontalBars data={cost} xKey="equipo" barKey="costo" color="#9d7bff" />
        </SectionCard>
        <SectionCard title="Ranking de equipos con más fallas" icon={AlertOctagon}>
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>#</th><th>Equipo</th><th>Fallas</th><th>Disponib.</th><th>Estado</th></tr></thead>
              <tbody>
                {critical.map((e, i) => (
                  <tr key={e.id}>
                    <td className="font-mono font-bold text-ink-faint">{i + 1}</td>
                    <td className="font-mono font-semibold text-ink">{e.code}</td>
                    <td><span className={e.failures >= 7 ? 'font-semibold text-danger' : 'text-ink-dim'}>{e.failures}</span></td>
                    <td>{e.availability}%</td>
                    <td><StatusBadge status={e.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  );
}
