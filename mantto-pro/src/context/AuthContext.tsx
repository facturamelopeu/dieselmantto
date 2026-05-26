// ============================================================
//  AuthContext — estado global de sesión
//  Provee el usuario autenticado, login y logout a toda la app.
//  La persistencia real la maneja authService (localStorage).
// ============================================================

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authService } from '@/services/authService';
import type { RoleKey, User } from '@/types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (role: RoleKey, email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaura sesión persistida al montar.
  useEffect(() => {
    setUser(authService.getSession());
    setLoading(false);
  }, []);

  const login = async (role: RoleKey, email: string) => {
    const u = await authService.login(role, email);
    setUser(u);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
