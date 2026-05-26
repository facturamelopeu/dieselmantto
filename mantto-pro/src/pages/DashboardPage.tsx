// DashboardPage — panel ejecutivo con KPIs, gráficos y alertas.
import { useEffect, useState } from 'react';
import {
  Truck, CheckCircle2, Wrench, OctagonX, CalendarClock, AlertOctagon,
  ListChecks, Gauge, Timer, DollarSign, TrendingUp, Bell, ChevronRight,
} from 'lucide-react';
import { KpiCard } from '@/components/common/KpiCard';
import { SectionCard } from '@/components/common/Feedback';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Loader } from '@/components/common/Ui';
import { AreaTrend, GroupedBars } from '@/components/charts/Charts';
import { kpiService } from '@/services/kpiService';
import { workOrderService } from '@/services/workOrderService';
import { formatCurrency } from '@/lib/format';
import type { DashboardKpis, Equipment, WorkOrder } from '@/types';

export function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [avail, setAvail] = useState<any[]>([]);
  const [pmcm, setPmcm] = useState<any[]>([]);
  const [critical, setCritical] = useState<Equipment[]>([]);
  const [orders, setOrders] = useState<WorkOrder[]>([]);

  useEffect(() => {
    Promise.all([
      kpiService.dashboard(),
      kpiService.availabilitySeries(),
      kpiService.pmVsCmSeries(),
      kpiService.criticalEquipment(),
      workOrderService.list(),
    ]).then(([k, a, p, c, o]) => {
      setKpis(k);
      setAvail(a);
      setPmcm(p);
      setCritical(c);
      setOrders(o.slice(0, 5));
    });
  }, []);

  if (!kpis) return <Loader label="Cargando panel ejecutivo…" />;

  const alerts = [
    { tone: 'red', icon: AlertOctagon, t: 'PM-2203 · CAR-007 vencido', d: 'Mantenimiento PM2000 con 6 días de retraso' },
    { tone: 'red', icon: AlertOctagon, t: 'PM-2204 · MOT-003 vencido', d: 'Mantenimiento PM250 requiere atención inmediata' },
    { tone: 'yellow', icon: CalendarClock, t: 'PM-2201 · EXC-001 próximo', d: 'Programado para el 02 jun · faltan 80 h' },
    { tone: 'yellow', icon: Gauge, t: 'VOL-014 · horómetro alto', d: '182,400 km — revisar plan de servicio' },
  ] as const;

  return (
    <div>
      <div className="mb-6">
        <div className="mb-2 text-[11px] uppercase tracking-[1.5px] text-ink-faint">Resumen general</div>
        <h1 className="font-display text-[26px] font-extrabold tracking-tight">Dashboard ejecutivo</h1>
        <p className="mt-1.5 text-[13.5px] text-ink-dim">
          Estado en tiempo real de la flota y la gestión de mantenimiento.
        </p>
      </div>

      {/* KPIs principales */}
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={Truck} label="Total de equipos" value={kpis.totalEquipment} tone="brand" delta={{ value: '+2', dir: 'up' }} />
        <KpiCard icon={CheckCircle2} label="Equipos operativos" value={kpis.operational} tone="green" delta={{ value: '75%', dir: 'up' }} />
        <KpiCard icon={Wrench} label="En mantenimiento" value={kpis.inMaintenance} tone="yellow" delta={{ value: 'estable', dir: 'flat' }} />
        <KpiCard icon={OctagonX} label="Equipos parados" value={kpis.stopped} tone="red" delta={{ value: '+1', dir: 'down' }} />
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={CalendarClock} label="Preventivos pendientes" value={kpis.preventivePending} tone="info" />
        <KpiCard icon={AlertOctagon} label="Correctivos abiertos" value={kpis.correctiveOpen} tone="red" />
        <KpiCard icon={ListChecks} label="Órdenes activas" value={kpis.activeWorkOrders} tone="violet" />
        <KpiCard icon={Gauge} label="Disponibilidad mecánica" value={kpis.availability} unit="%" tone="green" delta={{ value: '+1.2%', dir: 'up' }} />
      </div>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard icon={CheckCircle2} label="Cumplimiento preventivo" value={kpis.preventiveCompliance} unit="%" tone="brand" delta={{ value: '+4%', dir: 'up' }} />
        <KpiCard icon={Timer} label="Tiempo prom. reparación (MTTR)" value={kpis.mttr} unit="h" tone="yellow" delta={{ value: '-0.4h', dir: 'up' }} />
        <KpiCard icon={DollarSign} label="Costo estimado mantenimiento" value={formatCurrency(kpis.estimatedCost)} tone="info" delta={{ value: '+8%', dir: 'down' }} />
      </div>

      {/* Gráficos */}
      <div className="mb-6 grid gap-4 xl:grid-cols-2">
        <SectionCard title="Disponibilidad mecánica por mes" icon={TrendingUp} pad>
          <AreaTrend
            data={avail}
            xKey="mes"
            series={[
              { key: 'disp', color: '#2f6bff', label: 'Disponibilidad %' },
              { key: 'meta', color: '#22c98a', label: 'Meta %' },
            ]}
          />
        </SectionCard>
        <SectionCard title="Preventivos vs Correctivos" icon={Wrench} pad>
          <GroupedBars
            data={pmcm}
            xKey="mes"
            series={[
              { key: 'preventivo', color: '#2f6bff', label: 'Preventivo' },
              { key: 'correctivo', color: '#ff7a18', label: 'Correctivo' },
            ]}
          />
        </SectionCard>
      </div>

      {/* Equipos críticos + alertas */}
      <div className="mb-6 grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard title="Equipos críticos" icon={AlertOctagon}>
            <div className="overflow-x-auto">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Equipo</th>
                    <th>Tipo</th>
                    <th>Proyecto</th>
                    <th>Fallas</th>
                    <th>Disponib.</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {critical.map((e) => (
                    <tr key={e.id}>
                      <td><span className="font-mono font-semibold text-ink">{e.code}</span></td>
                      <td>{e.type}</td>
                      <td>{e.project}</td>
                      <td>
                        <span className={e.failures >= 7 ? 'font-semibold text-danger' : 'text-ink-dim'}>
                          {e.failures}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-surface-2">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${e.availability}%`,
                                background: e.availability >= 90 ? '#22c98a' : e.availability >= 80 ? '#f5b53d' : '#ff5169',
                              }}
                            />
                          </div>
                          <span className="text-xs">{e.availability}%</span>
                        </div>
                      </td>
                      <td><StatusBadge status={e.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Alertas de mantenimiento" icon={Bell}>
          <div className="p-3">
            {alerts.map((a, i) => {
              const Icon = a.icon;
              const color = a.tone === 'red' ? '#ff5169' : '#f5b53d';
              return (
                <div key={i} className="mb-2.5 flex items-center gap-3 rounded-[11px] border border-border-soft bg-surface-2 p-3 last:mb-0">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg" style={{ background: `${color}1f`, color }}>
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold">{a.t}</div>
                    <div className="truncate text-[11.5px] text-ink-faint">{a.d}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>

      {/* Últimas OT */}
      <SectionCard
        title="Últimas órdenes de trabajo"
        icon={ListChecks}
        action={
          <a href="#/ordenes" className="flex items-center gap-1 text-[12.5px] font-semibold text-brand">
            Ver todas <ChevronRight size={14} />
          </a>
        }
      >
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>OT</th>
                <th>Tipo</th>
                <th>Equipo</th>
                <th>Técnico</th>
                <th>Creada</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td><span className="font-mono font-semibold text-brand">{o.id}</span></td>
                  <td>
                    <StatusBadge status={o.type} tone={o.type === 'Preventiva' ? 'blue' : 'yellow'} />
                  </td>
                  <td><span className="font-mono text-ink">{o.equipment}</span></td>
                  <td>{o.tech}</td>
                  <td>{o.created}</td>
                  <td><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
