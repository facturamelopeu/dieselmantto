// ============================================================
//  kpiService — cálculo y agregación de indicadores
//  Calcula KPIs de gestión a partir de los datos mock. Cuando
//  exista backend, estos cálculos pueden venir ya resueltos
//  desde la API o mantenerse en el cliente según convenga.
// ============================================================

import {
  EQUIPMENT,
  PREVENTIVE,
  CORRECTIVE,
  WORKORDERS,
  AVAILABILITY_SERIES,
  PM_VS_CM_SERIES,
  FAIL_BY_TYPE,
  COST_BY_EQUIP,
  MTBF_SERIES,
} from '@/data/mockData';
import { mockRequest } from './api';
import type { DashboardKpis } from '@/types';

export const kpiService = {
  async dashboard(): Promise<DashboardKpis> {
    const totalEquipment = EQUIPMENT.length;
    const operational = EQUIPMENT.filter((e) => e.status === 'Operativo').length;
    const inMaintenance = EQUIPMENT.filter((e) => e.status === 'En mantenimiento').length;
    const stopped = EQUIPMENT.filter((e) => e.status === 'Parado').length;
    const preventivePending = PREVENTIVE.filter(
      (p) => p.status === 'Próximo' || p.status === 'Vencido' || p.status === 'Programado',
    ).length;
    const correctiveOpen = CORRECTIVE.filter((c) => c.status !== 'Finalizado').length;
    const activeWorkOrders = WORKORDERS.filter(
      (o) => o.status !== 'Cerrada' && o.status !== 'Finalizada',
    ).length;
    const executed = PREVENTIVE.filter((p) => p.status === 'Ejecutado').length;
    const preventiveCompliance = Math.round((executed / PREVENTIVE.length) * 100);
    const availability =
      Math.round((EQUIPMENT.reduce((a, e) => a + e.availability, 0) / totalEquipment) * 10) / 10;

    return mockRequest({
      totalEquipment,
      operational,
      inMaintenance,
      stopped,
      preventivePending,
      correctiveOpen,
      activeWorkOrders,
      preventiveCompliance,
      availability,
      mttr: 8.6,
      estimatedCost: 60400,
    });
  },

  async availabilitySeries() {
    return mockRequest(AVAILABILITY_SERIES);
  },
  async pmVsCmSeries() {
    return mockRequest(PM_VS_CM_SERIES);
  },
  async failByType() {
    return mockRequest(FAIL_BY_TYPE);
  },
  async costByEquipment() {
    return mockRequest(COST_BY_EQUIP);
  },
  async mtbfSeries() {
    return mockRequest(MTBF_SERIES);
  },

  /** Ranking de equipos críticos por nº de fallas / disponibilidad. */
  async criticalEquipment() {
    const ranked = [...EQUIPMENT]
      .sort((a, b) => b.failures - a.failures || a.availability - b.availability)
      .slice(0, 6);
    return mockRequest(ranked);
  },
};
