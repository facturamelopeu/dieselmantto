// ============================================================
//  equipmentService — gestión de maquinaria y volquetes
//  Reemplazar `mockRequest(...)` por `httpRequest('/equipment')`
//  cuando el backend esté disponible.
// ============================================================

import { EQUIPMENT } from '@/data/mockData';
import { mockRequest, nextId } from './api';
import type { Equipment } from '@/types';

// Estado en memoria (simula persistencia de sesión).
let store: Equipment[] = structuredClone(EQUIPMENT);

export const equipmentService = {
  /** GET /equipment */
  async list(): Promise<Equipment[]> {
    return mockRequest(store);
  },

  /** GET /equipment/:id */
  async getById(id: string): Promise<Equipment | undefined> {
    return mockRequest(store.find((e) => e.id === id));
  },

  /** POST /equipment */
  async create(data: Omit<Equipment, 'id'>): Promise<Equipment> {
    const created: Equipment = { ...data, id: nextId('E', store) };
    store = [created, ...store];
    return mockRequest(created);
  },

  /** PUT /equipment/:id */
  async update(id: string, patch: Partial<Equipment>): Promise<Equipment | undefined> {
    store = store.map((e) => (e.id === id ? { ...e, ...patch } : e));
    return mockRequest(store.find((e) => e.id === id));
  },

  /** DELETE /equipment/:id */
  async remove(id: string): Promise<{ id: string }> {
    store = store.filter((e) => e.id !== id);
    return mockRequest({ id });
  },
};
