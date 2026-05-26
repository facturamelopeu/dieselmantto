import { sendInteractiveButtons } from '../services/whatsappClient';
import { Tenant } from '../types';

export async function sendMainMenu(tenant: Tenant, to: string): Promise<void> {
  const body =
    `Hola, soy el asistente virtual de *${tenant.storeName}* 🚛\n\n` +
    '¿En qué te puedo ayudar hoy?';

  await sendInteractiveButtons(tenant, to, body, [
    { id: 'menu_catalogo', title: 'Ver catalogo' },
    { id: 'menu_recomendar', title: 'Recomendar' },
    { id: 'menu_faq', title: 'Preguntas FAQ' },
  ]);
}
