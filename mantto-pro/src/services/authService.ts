// ============================================================
//  authService — autenticación simulada
//  Login simulado: valida el rol elegido, genera un "usuario"
//  y persiste la sesión en localStorage. Para backend real,
//  reemplazar `login` por POST /auth/login y guardar el token.
// ============================================================

import { USERS } from '@/data/mockData';
import { mockRequest } from './api';
import type { RoleKey, User } from '@/types';

const STORAGE_KEY = 'mantto_pro_session';

export const authService = {
  /** POST /auth/login (simulado por rol) */
  async login(role: RoleKey, email: string): Promise<User> {
    const base = USERS.find((u) => u.role === role) ?? USERS[0];
    const user: User = { ...base, email: email || base.email };
    await mockRequest(user, 500);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  /** Recupera la sesión persistida (si existe). */
  getSession(): User | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  },

  /** Cierra sesión. */
  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
