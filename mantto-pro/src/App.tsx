// App — define el árbol de rutas de la aplicación.
// Rutas privadas envueltas en ProtectedRoute + AppLayout.
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { EquipmentPage } from '@/pages/EquipmentPage';
import { ShiftsPage } from '@/pages/ShiftsPage';
import { PreventivePage } from '@/pages/PreventivePage';
import { CorrectivePage } from '@/pages/CorrectivePage';
import { WorkOrdersPage } from '@/pages/WorkOrdersPage';
import { SparePartsPage } from '@/pages/SparePartsPage';
import { KpiPage } from '@/pages/KpiPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { ConfigPage } from '@/pages/ConfigPage';

export default function App() {
  return (
    <Routes>
      {/* Pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* Privadas */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/equipos" element={<EquipmentPage />} />
        <Route path="/guardias" element={<ProtectedRoute roles={['admin', 'supervisor']}><ShiftsPage /></ProtectedRoute>} />
        <Route path="/preventivo" element={<ProtectedRoute roles={['admin', 'supervisor']}><PreventivePage /></ProtectedRoute>} />
        <Route path="/correctivo" element={<CorrectivePage />} />
        <Route path="/ordenes" element={<WorkOrdersPage />} />
        <Route path="/repuestos" element={<SparePartsPage />} />
        <Route path="/kpi" element={<ProtectedRoute roles={['admin']}><KpiPage /></ProtectedRoute>} />
        <Route path="/reportes" element={<ProtectedRoute roles={['admin']}><ReportsPage /></ProtectedRoute>} />
        <Route path="/configuracion" element={<ProtectedRoute roles={['admin']}><ConfigPage /></ProtectedRoute>} />
      </Route>

      {/* Redirecciones */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
