// ============================================================
//  Datos mock centralizados — MANTTO PRO
//  Toda la data demo del frontend vive aquí. Cuando el backend
//  esté listo, los servicios (src/services) reemplazarán estas
//  estructuras por llamadas reales a la API. La UI no cambia.
// ============================================================

import type {
  Equipment,
  WorkShift,
  PreventiveMaintenance,
  CorrectiveMaintenance,
  WorkOrder,
  SparePart,
  User,
} from '@/types';

export const PROJECTS = [
  'Mina Norte',
  'Proyecto Vial Sur',
  'Cantera Este',
  'Frente Tajo Abierto',
  'Planta Concentradora',
];

export const OPERATORS = [
  'J. Quispe',
  'M. Huamán',
  'C. Rojas',
  'L. Mamani',
  'P. Torres',
  'R. Flores',
  'A. Vargas',
];

export const USERS: User[] = [
  { id: 'U-01', name: 'Carlos Mendoza', email: 'admin@manttopro.com', role: 'admin', initials: 'CM' },
  { id: 'U-02', name: 'Pedro Torres', email: 'supervisor@manttopro.com', role: 'supervisor', initials: 'PT' },
  { id: 'U-03', name: 'Roberto Flores', email: 'tecnico@manttopro.com', role: 'tech', initials: 'RF' },
];

export const EQUIPMENT: Equipment[] = [
  { id: 'E-001', code: 'EXC-001', type: 'Excavadora', brand: 'Caterpillar', model: '336 GC', plate: '—', year: 2021, serial: 'CAT336GC0091', horometer: 8420, km: 0, status: 'Operativo', project: 'Mina Norte', owner: 'C. Rojas', entryDate: '2021-03-12', failures: 2, availability: 94.2, notes: 'Equipo principal de excavación frente norte.' },
  { id: 'E-002', code: 'VOL-014', type: 'Volquete', brand: 'Volvo', model: 'FMX 440', plate: 'V2J-841', year: 2020, serial: 'VOLFMX44012', horometer: 0, km: 182400, status: 'Operativo', project: 'Proyecto Vial Sur', owner: 'J. Quispe', entryDate: '2020-08-01', failures: 5, availability: 88.6 },
  { id: 'E-003', code: 'CAR-007', type: 'Cargador frontal', brand: 'Komatsu', model: 'WA470-8', plate: '—', year: 2019, serial: 'KOMWA47008', horometer: 11250, km: 0, status: 'En mantenimiento', project: 'Cantera Este', owner: 'L. Mamani', entryDate: '2019-05-20', failures: 8, availability: 79.4 },
  { id: 'E-004', code: 'VOL-021', type: 'Volquete', brand: 'Scania', model: 'P460', plate: 'W7K-302', year: 2022, serial: 'SCAP46021', horometer: 0, km: 96300, status: 'Operativo', project: 'Frente Tajo Abierto', owner: 'M. Huamán', entryDate: '2022-01-15', failures: 1, availability: 96.8 },
  { id: 'E-005', code: 'MOT-003', type: 'Motoniveladora', brand: 'Caterpillar', model: '140 GC', plate: '—', year: 2018, serial: 'CAT140GC03', horometer: 14800, km: 0, status: 'Parado', project: 'Proyecto Vial Sur', owner: 'P. Torres', entryDate: '2018-11-03', failures: 12, availability: 62.1 },
  { id: 'E-006', code: 'TRA-002', type: 'Tractor', brand: 'Komatsu', model: 'D65PX-18', plate: '—', year: 2020, serial: 'KOMD65PX18', horometer: 9600, km: 0, status: 'Operativo', project: 'Mina Norte', owner: 'R. Flores', entryDate: '2020-06-22', failures: 3, availability: 91.0 },
  { id: 'E-007', code: 'ROD-005', type: 'Rodillo', brand: 'Hamm', model: '3411', plate: '—', year: 2021, serial: 'HAM341105', horometer: 5300, km: 0, status: 'En mantenimiento', project: 'Proyecto Vial Sur', owner: 'A. Vargas', entryDate: '2021-09-10', failures: 2, availability: 90.3 },
  { id: 'E-008', code: 'VOL-033', type: 'Volquete', brand: 'Volvo', model: 'FMX 500', plate: 'X3M-118', year: 2023, serial: 'VOLFMX50033', horometer: 0, km: 41200, status: 'Operativo', project: 'Frente Tajo Abierto', owner: 'J. Quispe', entryDate: '2023-02-28', failures: 0, availability: 98.1 },
  { id: 'E-009', code: 'CIS-001', type: 'Camión cisterna', brand: 'Mercedes-Benz', model: 'Actros 4144', plate: 'Y9P-455', year: 2019, serial: 'MBACT414401', horometer: 0, km: 158700, status: 'Operativo', project: 'Cantera Este', owner: 'L. Mamani', entryDate: '2019-07-14', failures: 4, availability: 85.5 },
  { id: 'E-010', code: 'EXC-002', type: 'Excavadora', brand: 'Hitachi', model: 'ZX350', plate: '—', year: 2022, serial: 'HITZX35002', horometer: 6100, km: 0, status: 'Operativo', project: 'Mina Norte', owner: 'C. Rojas', entryDate: '2022-04-18', failures: 1, availability: 95.4 },
  { id: 'E-011', code: 'VOL-040', type: 'Volquete', brand: 'Scania', model: 'G410', plate: 'Z1Q-720', year: 2021, serial: 'SCAG41040', horometer: 0, km: 112000, status: 'Parado', project: 'Proyecto Vial Sur', owner: 'M. Huamán', entryDate: '2021-11-30', failures: 7, availability: 71.2 },
  { id: 'E-012', code: 'CAR-009', type: 'Cargador frontal', brand: 'Caterpillar', model: '950 GC', plate: '—', year: 2020, serial: 'CAT950GC09', horometer: 8900, km: 0, status: 'Operativo', project: 'Planta Concentradora', owner: 'P. Torres', entryDate: '2020-03-05', failures: 2, availability: 93.7 },
];

export const SHIFTS: WorkShift[] = [
  { id: 'G-1042', supervisor: 'M. Huamán', date: '2026-05-25', turn: 'Día', duration: '12h', project: 'Mina Norte', equipment: 'EXC-001', operator: 'C. Rojas', hmStart: 8408, hmEnd: 8420, kmStart: 0, kmEnd: 0, hours: 12, status: 'Completada', incidents: 0, failures: 0, notes: 'Operación normal sin novedades.' },
  { id: 'G-1041', supervisor: 'P. Torres', date: '2026-05-25', turn: 'Noche', duration: '12h', project: 'Proyecto Vial Sur', equipment: 'VOL-014', operator: 'J. Quispe', hmStart: 0, hmEnd: 0, kmStart: 182160, kmEnd: 182400, hours: 12, status: 'Completada', incidents: 1, failures: 1, notes: 'Falla intermitente en sistema hidráulico de tolva.' },
  { id: 'G-1040', supervisor: 'L. Mamani', date: '2026-05-24', turn: 'Día', duration: '8h', project: 'Cantera Este', equipment: 'CIS-001', operator: 'L. Mamani', hmStart: 0, hmEnd: 0, kmStart: 158540, kmEnd: 158700, hours: 8, status: 'Completada', incidents: 0, failures: 0, notes: '' },
  { id: 'G-1039', supervisor: 'M. Huamán', date: '2026-05-24', turn: 'Noche', duration: '12h', project: 'Frente Tajo Abierto', equipment: 'VOL-021', operator: 'M. Huamán', hmStart: 0, hmEnd: 0, kmStart: 96140, kmEnd: 96300, hours: 12, status: 'Completada', incidents: 0, failures: 0, notes: '' },
  { id: 'G-1038', supervisor: 'P. Torres', date: '2026-05-26', turn: 'Día', duration: '8h', project: 'Proyecto Vial Sur', equipment: 'ROD-005', operator: 'A. Vargas', hmStart: 5295, hmEnd: 0, kmStart: 0, kmEnd: 0, hours: 0, status: 'Pendiente', incidents: 0, failures: 0, notes: 'Guardia en curso.' },
];

export const PREVENTIVE: PreventiveMaintenance[] = [
  { id: 'PM-2201', equipment: 'EXC-001', type: 'PM500', hmProg: 8500, kmProg: 0, dateProg: '2026-06-02', owner: 'C. Rojas', status: 'Próximo', progress: 0 },
  { id: 'PM-2202', equipment: 'VOL-014', type: 'PM1000', hmProg: 0, kmProg: 185000, dateProg: '2026-06-10', owner: 'J. Quispe', status: 'Programado', progress: 0 },
  { id: 'PM-2203', equipment: 'CAR-007', type: 'PM2000', hmProg: 11000, kmProg: 0, dateProg: '2026-05-20', owner: 'L. Mamani', status: 'Vencido', progress: 0 },
  { id: 'PM-2204', equipment: 'MOT-003', type: 'PM250', hmProg: 14750, kmProg: 0, dateProg: '2026-05-18', owner: 'P. Torres', status: 'Vencido', progress: 0 },
  { id: 'PM-2205', equipment: 'VOL-021', type: 'PM500', hmProg: 0, kmProg: 98000, dateProg: '2026-06-15', owner: 'M. Huamán', status: 'Programado', progress: 0 },
  { id: 'PM-2206', equipment: 'TRA-002', type: 'PM1000', hmProg: 9700, kmProg: 0, dateProg: '2026-05-28', owner: 'R. Flores', status: 'Próximo', progress: 0 },
  { id: 'PM-2207', equipment: 'EXC-002', type: 'PM250', hmProg: 6250, kmProg: 0, dateProg: '2026-05-15', owner: 'C. Rojas', status: 'Ejecutado', progress: 100 },
  { id: 'PM-2208', equipment: 'VOL-033', type: 'PM500', hmProg: 0, kmProg: 42000, dateProg: '2026-06-20', owner: 'J. Quispe', status: 'Programado', progress: 0 },
];

export const CORRECTIVE: CorrectiveMaintenance[] = [
  { id: 'CO-0512', equipment: 'CAR-007', date: '2026-05-22', reportedBy: 'L. Mamani', failType: 'Hidráulico', criticality: 'Alta', description: 'Pérdida de presión en cilindro de levante del cucharón.', diagnosis: 'Sello de pistón dañado, requiere reemplazo.', downtime: '18h', status: 'En reparación' },
  { id: 'CO-0511', equipment: 'MOT-003', date: '2026-05-18', reportedBy: 'P. Torres', failType: 'Motor', criticality: 'Crítica', description: 'Sobrecalentamiento y pérdida de potencia del motor.', diagnosis: 'Falla en bomba de agua y termostato.', downtime: '72h', status: 'En diagnóstico' },
  { id: 'CO-0510', equipment: 'VOL-040', date: '2026-05-15', reportedBy: 'M. Huamán', failType: 'Frenos', criticality: 'Alta', description: 'Vibración y bajo rendimiento de frenado.', diagnosis: 'Pastillas de freno desgastadas.', downtime: '6h', status: 'Finalizado' },
  { id: 'CO-0509', equipment: 'VOL-014', date: '2026-05-25', reportedBy: 'J. Quispe', failType: 'Hidráulico', criticality: 'Media', description: 'Falla intermitente en sistema de tolva.', diagnosis: 'En evaluación.', downtime: '—', status: 'Reportado' },
  { id: 'CO-0508', equipment: 'CIS-001', date: '2026-05-12', reportedBy: 'L. Mamani', failType: 'Eléctrico', criticality: 'Baja', description: 'Tablero de instrumentos con fallas intermitentes.', diagnosis: 'Fusible y conexiones revisadas.', downtime: '3h', status: 'Finalizado' },
  { id: 'CO-0507', equipment: 'ROD-005', date: '2026-05-20', reportedBy: 'A. Vargas', failType: 'Neumáticos', criticality: 'Media', description: 'Desgaste irregular de banda vibratoria.', diagnosis: 'Ajuste de excéntrica requerido.', downtime: '8h', status: 'En reparación' },
];

export const WORKORDERS: WorkOrder[] = [
  { id: 'OT-3301', type: 'Correctiva', equipment: 'CAR-007', created: '2026-05-22', priority: 'Alta', tech: 'R. Flores', supervisor: 'L. Mamani', status: 'En proceso', desc: 'Reemplazo de sello de cilindro hidráulico.', hours: 6, start: '2026-05-22', end: '—' },
  { id: 'OT-3300', type: 'Correctiva', equipment: 'MOT-003', created: '2026-05-18', priority: 'Crítica', tech: 'A. Vargas', supervisor: 'P. Torres', status: 'En espera de repuestos', desc: 'Cambio de bomba de agua y termostato.', hours: 4, start: '2026-05-19', end: '—' },
  { id: 'OT-3299', type: 'Preventiva', equipment: 'EXC-002', created: '2026-05-14', priority: 'Media', tech: 'C. Rojas', supervisor: 'M. Huamán', status: 'Cerrada', desc: 'Mantenimiento PM250 programado.', hours: 5, start: '2026-05-15', end: '2026-05-15' },
  { id: 'OT-3298', type: 'Correctiva', equipment: 'VOL-040', created: '2026-05-15', priority: 'Alta', tech: 'R. Flores', supervisor: 'M. Huamán', status: 'Finalizada', desc: 'Reemplazo de pastillas de freno.', hours: 3, start: '2026-05-15', end: '2026-05-15' },
  { id: 'OT-3297', type: 'Preventiva', equipment: 'EXC-001', created: '2026-05-26', priority: 'Media', tech: 'C. Rojas', supervisor: 'M. Huamán', status: 'Abierta', desc: 'Mantenimiento PM500 próximo a ejecutar.', hours: 0, start: '—', end: '—' },
  { id: 'OT-3296', type: 'Correctiva', equipment: 'ROD-005', created: '2026-05-20', priority: 'Media', tech: 'A. Vargas', supervisor: 'P. Torres', status: 'En proceso', desc: 'Ajuste de excéntrica de banda vibratoria.', hours: 2, start: '2026-05-21', end: '—' },
  { id: 'OT-3295', type: 'Preventiva', equipment: 'TRA-002', created: '2026-05-23', priority: 'Baja', tech: 'R. Flores', supervisor: 'R. Flores', status: 'Abierta', desc: 'PM1000 programado para fin de mes.', hours: 0, start: '—', end: '—' },
  { id: 'OT-3294', type: 'Correctiva', equipment: 'CIS-001', created: '2026-05-12', priority: 'Baja', tech: 'C. Rojas', supervisor: 'L. Mamani', status: 'Cerrada', desc: 'Revisión de tablero eléctrico.', hours: 3, start: '2026-05-12', end: '2026-05-12' },
];

export const SPAREPARTS: SparePart[] = [
  { id: 'RP-0001', name: 'Filtro de aceite motor', cat: 'Filtros', brand: 'CAT', unit: 'Und', stock: 48, min: 20, cost: 42.5, status: 'Disponible' },
  { id: 'RP-0002', name: 'Sello de pistón hidráulico', cat: 'Hidráulico', brand: 'Komatsu', unit: 'Und', stock: 6, min: 10, cost: 128.0, status: 'Bajo stock' },
  { id: 'RP-0003', name: 'Pastillas de freno', cat: 'Frenos', brand: 'Volvo', unit: 'Jgo', stock: 14, min: 8, cost: 95.3, status: 'Disponible' },
  { id: 'RP-0004', name: 'Bomba de agua', cat: 'Motor', brand: 'CAT', unit: 'Und', stock: 0, min: 3, cost: 340.0, status: 'Sin stock' },
  { id: 'RP-0005', name: 'Termostato', cat: 'Motor', brand: 'CAT', unit: 'Und', stock: 2, min: 5, cost: 58.0, status: 'Bajo stock' },
  { id: 'RP-0006', name: 'Filtro de combustible', cat: 'Filtros', brand: 'Scania', unit: 'Und', stock: 62, min: 25, cost: 31.8, status: 'Disponible' },
  { id: 'RP-0007', name: 'Aceite hidráulico 20L', cat: 'Lubricantes', brand: 'Mobil', unit: 'Bal', stock: 30, min: 15, cost: 210.0, status: 'Disponible' },
  { id: 'RP-0008', name: 'Neumático 20.5R25', cat: 'Neumáticos', brand: 'Michelin', unit: 'Und', stock: 4, min: 6, cost: 1850.0, status: 'Bajo stock' },
  { id: 'RP-0009', name: 'Correa de transmisión', cat: 'Transmisión', brand: 'Komatsu', unit: 'Und', stock: 11, min: 6, cost: 74.2, status: 'Disponible' },
  { id: 'RP-0010', name: 'Batería 12V 180Ah', cat: 'Eléctrico', brand: 'Bosch', unit: 'Und', stock: 8, min: 4, cost: 420.0, status: 'Disponible' },
];

export const PREVENTIVE_CHECKLIST = [
  { t: 'Revisión de niveles de aceite y refrigerante', done: true },
  { t: 'Cambio de filtros (aceite, aire, combustible)', done: true },
  { t: 'Inspección de sistema hidráulico', done: true },
  { t: 'Engrase de puntos de articulación', done: false },
  { t: 'Revisión de sistema de frenos', done: false },
  { t: 'Inspección de neumáticos / orugas', done: false },
  { t: 'Prueba de funcionamiento general', done: false },
];

// ---- Series para gráficos del dashboard / KPI ----
export const AVAILABILITY_SERIES = [
  { mes: 'Dic', disp: 89.2, meta: 90 },
  { mes: 'Ene', disp: 91.5, meta: 90 },
  { mes: 'Feb', disp: 88.7, meta: 90 },
  { mes: 'Mar', disp: 92.1, meta: 90 },
  { mes: 'Abr', disp: 90.8, meta: 90 },
  { mes: 'May', disp: 87.4, meta: 90 },
];

export const PM_VS_CM_SERIES = [
  { mes: 'Dic', preventivo: 18, correctivo: 7 },
  { mes: 'Ene', preventivo: 22, correctivo: 9 },
  { mes: 'Feb', preventivo: 20, correctivo: 12 },
  { mes: 'Mar', preventivo: 25, correctivo: 8 },
  { mes: 'Abr', preventivo: 24, correctivo: 11 },
  { mes: 'May', preventivo: 19, correctivo: 14 },
];

export const FAIL_BY_TYPE = [
  { tipo: 'Motor', value: 14 },
  { tipo: 'Hidráulico', value: 11 },
  { tipo: 'Eléctrico', value: 7 },
  { tipo: 'Frenos', value: 6 },
  { tipo: 'Neumáticos', value: 9 },
  { tipo: 'Transmisión', value: 4 },
];

export const COST_BY_EQUIP = [
  { equipo: 'MOT-003', costo: 18400 },
  { equipo: 'CAR-007', costo: 14200 },
  { equipo: 'VOL-040', costo: 9800 },
  { equipo: 'CIS-001', costo: 7600 },
  { equipo: 'VOL-014', costo: 6300 },
  { equipo: 'ROD-005', costo: 4100 },
];

export const MTBF_SERIES = [
  { mes: 'Dic', mtbf: 210, mttr: 9.2 },
  { mes: 'Ene', mtbf: 235, mttr: 8.4 },
  { mes: 'Feb', mtbf: 198, mttr: 10.1 },
  { mes: 'Mar', mtbf: 252, mttr: 7.8 },
  { mes: 'Abr', mtbf: 241, mttr: 8.0 },
  { mes: 'May', mtbf: 224, mttr: 8.6 },
];
