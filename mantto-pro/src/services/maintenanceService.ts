// ============================================================
//  maintenanceService — mantenimiento preventivo y correctivo
// ============================================================

import { PREVENTIVE, CORRECTIVE } from '@/data/mockData';
import { mockRequest, nextId } from './api';
import type { PreventiveMaintenance, CorrectiveMaintenance } from '@/types';

let preventiveStore: PreventiveMaintenance[] = structuredClone(PREVENTIVE);
let correctiveStore: CorrectiveMaintenance[] = structuredClone(CORRECTIVE);

export const maintenanceService = {
  // ---- Preventivo ----
  async listPreventive(): Promise<PreventiveMaintenance[]> {
    return mockRequest(preventiveStore);
  },
  async createPreventive(data: Omit<PreventiveMaintenance, 'id'>): Promise<PreventiveMaintenance> {
    const created: PreventiveMaintenance = { ...data, id: nextId('PM', preventiveStore) };
    preventiveStore = [created, ...preventiveStore];
    return mockRequest(created);
  },
  async updatePreventive(id: string, patch: Partial<PreventiveMaintenance>) {
    preventiveStore = preventiveStore.map((p) => (p.id === id ? { ...p, ...patch } : p));
    return mockRequest(preventiveStore.find((p) => p.id === id));
  },

  // ---- Correctivo ----
  async listCorrective(): Promise<CorrectiveMaintenance[]> {
    return mockRequest(correctiveStore);
  },
  async createCorrective(data: Omit<CorrectiveMaintenance, 'id'>): Promise<CorrectiveMaintenance> {
    const created: CorrectiveMaintenance = { ...data, id: nextId('CO', correctiveStore) };
    correctiveStore = [created, ...correctiveStore];
    return mockRequest(created);
  },
  async updateCorrective(id: string, patch: Partial<CorrectiveMaintenance>) {
    correctiveStore = correctiveStore.map((c) => (c.id === id ? { ...c, ...patch } : c));
    return mockRequest(correctiveStore.find((c) => c.id === id));
  },
};
