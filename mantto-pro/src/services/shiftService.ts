// ============================================================
//  shiftService — guardias de trabajo (8h / 12h)
// ============================================================

import { SHIFTS } from '@/data/mockData';
import { mockRequest, nextId } from './api';
import type { WorkShift } from '@/types';

let store: WorkShift[] = structuredClone(SHIFTS);

export const shiftService = {
  async list(): Promise<WorkShift[]> {
    return mockRequest(store);
  },
  async create(data: Omit<WorkShift, 'id'>): Promise<WorkShift> {
    const created: WorkShift = { ...data, id: nextId('G', store) };
    store = [created, ...store];
    return mockRequest(created);
  },
  async update(id: string, patch: Partial<WorkShift>) {
    store = store.map((s) => (s.id === id ? { ...s, ...patch } : s));
    return mockRequest(store.find((s) => s.id === id));
  },
};
