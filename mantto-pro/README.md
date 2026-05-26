# MANTTO PRO — Sistema de Gestión de Mantenimiento

Frontend profesional (SaaS corporativo) para la gestión de mantenimiento de
**maquinaria pesada y volquetes**: equipos, guardias de trabajo, mantenimiento
preventivo y correctivo, órdenes de trabajo, repuestos, KPIs y reportes.

> ⚠️ **Solo frontend.** No incluye backend ni base de datos reales. Todos los
> datos son *mock* y los servicios simulan llamadas asíncronas a una API, listos
> para conectarse a un backend real más adelante.

---

## 🚀 Puesta en marcha

Requisitos: **Node.js 18+** y npm.

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar el entorno de desarrollo
npm run dev      # abre http://localhost:5173

# 3. Build de producción
npm run build
npm run preview  # previsualiza el build
```

### Credenciales demo

El login es **simulado**: selecciona un rol y entra (cualquier email/contraseña sirve).
La sesión se guarda en `localStorage`.

| Rol | Email sugerido | Acceso |
|-----|----------------|--------|
| **Administrador** | `admin@manttopro.com` | Todos los módulos |
| **Supervisor** | `supervisor@manttopro.com` | Equipos, guardias, preventivo, correctivo, OT, repuestos |
| **Técnico / Mecánico** | `tecnico@manttopro.com` | Equipos, correctivo, OT, repuestos |

---

## 🧱 Stack

- **React 18** + **TypeScript**
- **Vite** (bundler / dev server)
- **Tailwind CSS** (tema corporativo oscuro personalizado)
- **React Router** (ruteo con `HashRouter`)
- **Recharts** (gráficos)
- **lucide-react** (iconos)

---

## 📂 Estructura

```
mantto-pro/
├─ index.html
├─ package.json
├─ vite.config.ts          # alias @ -> ./src
├─ tailwind.config.js      # tema (colores, fuentes, sombras)
├─ tsconfig.json
└─ src/
   ├─ main.tsx             # entrada: Router + AuthProvider
   ├─ App.tsx              # definición de rutas (públicas/privadas por rol)
   ├─ index.css            # estilos base + clases utilitarias (.btn, .card, .input, .tbl…)
   │
   ├─ types/               # tipos del dominio (contrato de datos)
   │  └─ index.ts
   │
   ├─ data/                # datos mock centralizados
   │  └─ mockData.ts
   │
   ├─ services/            # capa de "API" (async, simulada)
   │  ├─ api.ts            # mockRequest() — punto único de migración a fetch real
   │  ├─ authService.ts
   │  ├─ equipmentService.ts
   │  ├─ maintenanceService.ts
   │  ├─ workOrderService.ts
   │  ├─ sparePartsService.ts
   │  ├─ shiftService.ts
   │  └─ kpiService.ts
   │
   ├─ context/
   │  └─ AuthContext.tsx   # sesión global + useAuth()
   │
   ├─ lib/
   │  ├─ ui.ts             # estados→colores, navegación por rol
   │  └─ format.ts         # formato de fechas, números, moneda
   │
   ├─ components/
   │  ├─ common/           # KpiCard, DataTable, StatusBadge, Modal, PageHeader…
   │  ├─ charts/           # wrappers de Recharts con el tema
   │  └─ layout/           # Sidebar, Header, AppLayout, ProtectedRoute
   │
   └─ pages/               # las 12 pantallas
      ├─ LoginPage.tsx
      ├─ DashboardPage.tsx
      ├─ EquipmentPage.tsx        (+ detalle por pestañas)
      ├─ ShiftsPage.tsx
      ├─ PreventivePage.tsx
      ├─ CorrectivePage.tsx
      ├─ WorkOrdersPage.tsx       (Kanban + tabla)
      ├─ SparePartsPage.tsx
      ├─ KpiPage.tsx
      ├─ ReportsPage.tsx
      └─ ConfigPage.tsx
```

---

## 🔌 Conectar un backend real

Toda la "capa de transporte" está aislada en **`src/services/api.ts`**.
Hoy usa `mockRequest()` que devuelve datos mock con latencia simulada.

Para conectar tu API real solo necesitas reemplazar esa función por una basada
en `fetch` (o axios) y actualizar cada servicio para que llame a tus endpoints:

```ts
// src/services/api.ts
const BASE = import.meta.env.VITE_API_URL;

export async function httpRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    ...init,
  });
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return (await res.json()) as T;
}
```

```ts
// Ejemplo: src/services/equipmentService.ts
async list(): Promise<Equipment[]> {
  // return mockRequest(store);          // ← antes
  return httpRequest<Equipment[]>('/equipment');  // ← después
}
```

Los **tipos** en `src/types/index.ts` definen el contrato que el backend debe
respetar. Si los respetas, **los componentes no necesitan cambios**.

Sugerencia: define `VITE_API_URL` en un archivo `.env`:

```
VITE_API_URL=https://api.tu-dominio.com
```

---

## 🎨 Personalización del tema

Los colores, fuentes y sombras del sistema están en **`tailwind.config.js`**.
Las clases utilitarias reutilizables (`.btn`, `.card`, `.input`, `.badge`,
`.tbl`, etc.) están en **`src/index.css`**.

---

## 📋 Módulos incluidos

1. **Login** — selector de rol, sesión simulada.
2. **Dashboard ejecutivo** — KPIs, gráficos, equipos críticos, alertas, últimas OT.
3. **Equipos** — listado con filtros + ficha detalle con 5 pestañas.
4. **Guardias de Trabajo** — registro por turno de 8h / 12h.
5. **Mantenimiento Preventivo** — semáforo de estados + checklist.
6. **Mantenimiento Correctivo** — registro de fallas + seguimiento.
7. **Órdenes de Trabajo** — tablero **Kanban** + vista tabla + cambio de estado.
8. **Repuestos** — inventario, alertas de stock, salidas.
9. **KPI de Mantenimiento** — panel analítico (disponibilidad, MTBF, MTTR, costos…).
10. **Reportes** — tarjetas exportables (PDF/Excel simulados).
11. **Configuración** — usuarios, catálogos, proyectos, parámetros.

El menú lateral se adapta automáticamente según el **rol** del usuario.

---

© 2026 MANTTO PRO · Demo de frontend para gestión de mantenimiento.
