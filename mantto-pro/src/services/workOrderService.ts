// ============================================================
//  workOrderService — órdenes de trabajo (OT)
// ============================================================

import { WORKORDERS } from '@/data/mockData';
import { mockRequest, nextId } from './api';
import type { WorkOrder, WorkOrderStatus } from '@/types';

let store: WorkOrder[] = structuredClone(WORKORDERS);

export const workOrderService = {
  async list(): Promise<WorkOrder[]> {
    return mockRequest(store);
  },
  async getById(id: string): Promise<WorkOrder | undefined> {
    return mockRequest(store.find((o) => o.id === id));
  },
  async create(data: Omit<WorkOrder, 'id'>): Promise<WorkOrder> {
    const created: WorkOrder = { ...data, id: nextId('OT', store) };
    store = [created, ...store];
    return mockRequest(created);
  },
  async update(id: string, patch: Partial<WorkOrder>) {
    store = store.map((o) => (o.id === id ? { ...o, ...patch } : o));
    return mockRequest(store.find((o) => o.id === id));
  },
  /** Cambia el estado de una OT (usado por botones iniciar/pausar/finalizar/cerrar). */
  async changeStatus(id: string, status: WorkOrderStatus) {
    return this.update(id, { status });
  },
};
