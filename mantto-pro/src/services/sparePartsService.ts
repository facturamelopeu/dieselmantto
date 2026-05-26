// ============================================================
//  sparePartsService — inventario de repuestos
// ============================================================

import { SPAREPARTS } from '@/data/mockData';
import { mockRequest, nextId } from './api';
import type { SparePart, StockStatus } from '@/types';

let store: SparePart[] = structuredClone(SPAREPARTS);

function deriveStatus(stock: number, min: number): StockStatus {
  if (stock <= 0) return 'Sin stock';
  if (stock < min) return 'Bajo stock';
  return 'Disponible';
}

export const sparePartsService = {
  async list(): Promise<SparePart[]> {
    return mockRequest(store);
  },
  async create(data: Omit<SparePart, 'id' | 'status'>): Promise<SparePart> {
    const created: SparePart = {
      ...data,
      id: nextId('RP', store),
      status: deriveStatus(data.stock, data.min),
    };
    store = [created, ...store];
    return mockRequest(created);
  },
  /** Registra salida de repuestos descontando del stock. */
  async dispatch(id: string, qty: number) {
    store = store.map((p) => {
      if (p.id !== id) return p;
      const stock = Math.max(0, p.stock - qty);
      return { ...p, stock, status: deriveStatus(stock, p.min) };
    });
    return mockRequest(store.find((p) => p.id === id));
  },
  async lowStock(): Promise<SparePart[]> {
    return mockRequest(store.filter((p) => p.status !== 'Disponible'));
  },
};
