// ============================================================
//  Constantes de presentación — MANTTO PRO
//  Mapea estados de dominio a colores de badge y define el menú
//  de navegación según el rol del usuario.
// ============================================================

import type { RoleKey } from '@/types';

export type BadgeTone = 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'purple';

/** Color de badge por estado/criticidad. */
export const STATUS_TONE: Record<string, BadgeTone> = {
  // Equipos
  Operativo: 'green',
  'En mantenimiento': 'yellow',
  Parado: 'red',
  Baja: 'gray',
  // Preventivo
  Programado: 'blue',
  Próximo: 'yellow',
  Vencido: 'red',
  Ejecutado: 'green',
  // Correctivo
  Reportado: 'blue',
  'En diagnóstico': 'yellow',
  'En reparación': 'yellow',
  Finalizado: 'green',
  // OT
  Abierta: 'blue',
  'En proceso': 'yellow',
  'En espera de repuestos': 'purple',
  Finalizada: 'green',
  Cerrada: 'gray',
  // Stock
  Disponible: 'green',
  'Bajo stock': 'yellow',
  'Sin stock': 'red',
  // Guardias
  Completada: 'green',
  Pendiente: 'yellow',
  // Criticidad
  Baja: 'gray',
  Media: 'blue',
  Alta: 'yellow',
  Crítica: 'red',
};

export const ROLE_META: Record<RoleKey, { label: string; desc: string; color: string }> = {
  admin: { label: 'Administrador', desc: 'Acceso total al sistema', color: '#2f6bff' },
  supervisor: { label: 'Supervisor', desc: 'Registro por guardias de trabajo', color: '#ff7a18' },
  tech: { label: 'Técnico / Mecánico', desc: 'Gestión de órdenes de trabajo', color: '#22c98a' },
};

export interface NavEntry {
  to: string;
  label: string;
  icon: string; // nombre de icono lucide
  badge?: number;
}

/** Items completos del menú. `roles` define quién los ve. */
const ALL_NAV: (NavEntry & { roles: RoleKey[] })[] = [
  { to: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard', roles: ['admin', 'supervisor', 'tech'] },
  { to: '/equipos', label: 'Equipos', icon: 'Truck', roles: ['admin', 'supervisor', 'tech'] },
  { to: '/guardias', label: 'Guardias de Trabajo', icon: 'ClipboardList', roles: ['admin', 'supervisor'] },
  { to: '/preventivo', label: 'Mantenimiento Preventivo', icon: 'CalendarCheck', roles: ['admin', 'supervisor'] },
  { to: '/correctivo', label: 'Mantenimiento Correctivo', icon: 'Wrench', roles: ['admin', 'supervisor', 'tech'] },
  { to: '/ordenes', label: 'Órdenes de Trabajo', icon: 'ListChecks', roles: ['admin', 'supervisor', 'tech'], badge: 5 },
  { to: '/repuestos', label: 'Repuestos', icon: 'Package', roles: ['admin', 'supervisor', 'tech'] },
  { to: '/kpi', label: 'KPI Mantenimiento', icon: 'BarChart3', roles: ['admin'] },
  { to: '/reportes', label: 'Reportes', icon: 'FileText', roles: ['admin'] },
  { to: '/configuracion', label: 'Configuración', icon: 'Settings', roles: ['admin'] },
];

/** Devuelve el menú filtrado por rol. */
export function navForRole(role: RoleKey): NavEntry[] {
  return ALL_NAV.filter((n) => n.roles.includes(role)).map(({ roles, ...rest }) => rest);
}
