import config from './config';
import app from './webhook/server';
import * as tenantService from './services/tenantService';

app.listen(config.port, () => {
  const count = tenantService.getAll().length;
  console.log(`[server] WhatsApp Multi-Bot corriendo en puerto ${config.port}`);
  console.log(`[server] Tenants registrados: ${count}`);
  console.log(`[server] POST /auth/register  → crear nueva empresa (requiere X-Admin-Token)`);
  console.log(`[server] POST /auth/login      → obtener token JWT`);
  console.log(`[server] GET  /admin/*         → gestionar catálogo, FAQs, ajustes`);
  console.log(`[server] POST /webhook         → recibe mensajes de WhatsApp`);
});
