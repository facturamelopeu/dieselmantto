// ============================================================
//  Cliente de API simulado — MANTTO PRO
//  ------------------------------------------------------------
//  Este módulo centraliza la "capa de transporte". Hoy resuelve
//  promesas con datos mock + latencia simulada. Para conectar el
//  backend real, basta reemplazar `mockRequest` por `httpRequest`
//  (fetch/axios) sin tocar los servicios ni los componentes.
//
//  Ejemplo de migración futura:
//
//    const BASE = import.meta.env.VITE_API_URL;
//    export async function httpRequest<T>(path: string, init?: RequestInit) {
//      const res = await fetch(`${BASE}${path}`, {
//        headers: { 'Content-Type': 'application/json', ...authHeader() },
//        ...init,
//      });
//      if (!res.ok) throw new ApiError(res.status, await res.text());
//      return (await res.json()) as T;
//    }
// ============================================================

const DEFAULT_DELAY = 350;

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

/**
 * Simula una petición asíncrona devolviendo una copia profunda
 * de los datos mock tras una latencia configurable.
 */
export function mockRequest<T>(data: T, delay = DEFAULT_DELAY): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Copia profunda para que los servicios no muten la fuente mock.
      resolve(structuredClone(data));
    }, delay);
  });
}

/** Genera un identificador correlativo simple para entidades nuevas. */
export function nextId(prefix: string, existing: { id: string }[]): string {
  const nums = existing
    .map((e) => parseInt(e.id.replace(/\D/g, ''), 10))
    .filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return `${prefix}-${String(max + 1).padStart(4, '0')}`;
}
