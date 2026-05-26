// ============================================================
//  Tipos del dominio — MANTTO PRO
//  Centraliza todas las entidades del sistema. Estos tipos
//  son compartidos por mock data, servicios y componentes,
//  y representan el contrato que el backend deberá respetar.
// ============================================================

export type RoleKey = 'admin' | 'supervisor' | 'tech';

export interface User {
  id: string;
  name: string;
  email: string;
  role: RoleKey;
  initials: string;
}

// ---- Equipos ----
export type EquipmentType =
  | 'Excavadora'
  | 'Cargador frontal'
  | 'Tractor'
  | 'Motoniveladora'
  | 'Rodillo'
  | 'Volquete'
  | 'Camión cisterna'
  | 'Otros';

export type EquipmentStatus = 'Operativo' | 'En mantenimiento' | 'Parado' | 'Baja';

export interface Equipment {
  id: string;
  code: string;
  type: EquipmentType;
  brand: string;
  model: string;
  plate: string;
  year: number;
  serial: string;
  horometer: number;
  km: number;
  status: EquipmentStatus;
  project: string;
  owner: string;
  entryDate: string;
  photo?: string;
  notes?: string;
  failures: number;
  availability: number;
}

// ---- Guardias de trabajo ----
export type ShiftDuration = '8h' | '12h';
export type ShiftTurn = 'Día' | 'Noche';
export type ShiftStatus = 'Completada' | 'Pendiente';

export interface WorkShift {
  id: string;
  supervisor: string;
  date: string;
  turn: ShiftTurn;
  duration: ShiftDuration;
  project: string;
  equipment: string;
  operator: string;
  hmStart: number;
  hmEnd: number;
  kmStart: number;
  kmEnd: number;
  hours: number;
  status: ShiftStatus;
  incidents: number;
  failures: number;
  notes: string;
}

// ---- Mantenimiento preventivo ----
export type PreventiveType = 'PM250' | 'PM500' | 'PM1000' | 'PM2000' | 'Otros';
export type PreventiveStatus = 'Programado' | 'Próximo' | 'Vencido' | 'Ejecutado';

export interface PreventiveMaintenance {
  id: string;
  equipment: string;
  type: PreventiveType;
  hmProg: number;
  kmProg: number;
  dateProg: string;
  owner: string;
  status: PreventiveStatus;
  progress: number;
}

// ---- Mantenimiento correctivo ----
export type FailType =
  | 'Motor'
  | 'Transmisión'
  | 'Hidráulico'
  | 'Eléctrico'
  | 'Neumáticos'
  | 'Frenos'
  | 'Estructura'
  | 'Otros';
export type Criticality = 'Baja' | 'Media' | 'Alta' | 'Crítica';
export type CorrectiveStatus = 'Reportado' | 'En diagnóstico' | 'En reparación' | 'Finalizado';

export interface CorrectiveMaintenance {
  id: string;
  equipment: string;
  date: string;
  reportedBy: string;
  failType: FailType;
  criticality: Criticality;
  description: string;
  diagnosis: string;
  downtime: string;
  status: CorrectiveStatus;
}

// ---- Órdenes de trabajo ----
export type WorkOrderType = 'Preventiva' | 'Correctiva';
export type WorkOrderStatus =
  | 'Abierta'
  | 'En proceso'
  | 'En espera de repuestos'
  | 'Finalizada'
  | 'Cerrada';

export interface WorkOrder {
  id: string;
  type: WorkOrderType;
  equipment: string;
  created: string;
  priority: Criticality;
  tech: string;
  supervisor: string;
  status: WorkOrderStatus;
  desc: string;
  hours: number;
  start: string;
  end: string;
}

// ---- Repuestos ----
export type StockStatus = 'Disponible' | 'Bajo stock' | 'Sin stock';

export interface SparePart {
  id: string;
  name: string;
  cat: string;
  brand: string;
  unit: string;
  stock: number;
  min: number;
  cost: number;
  status: StockStatus;
}

// ---- KPIs / Dashboard ----
export interface KpiPoint {
  label: string;
  value: number;
}

export interface DashboardKpis {
  totalEquipment: number;
  operational: number;
  inMaintenance: number;
  stopped: number;
  preventivePending: number;
  correctiveOpen: number;
  activeWorkOrders: number;
  preventiveCompliance: number;
  availability: number;
  mttr: number;
  estimatedCost: number;
}
