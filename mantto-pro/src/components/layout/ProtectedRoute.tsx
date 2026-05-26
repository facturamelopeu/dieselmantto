// ProtectedRoute — protege rutas privadas y valida rol (simulado).
import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { RoleKey } from '@/types';

export function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: RoleKey[];
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
