import { Tenant } from '../types';
import { sendTextMessage, sendInteractiveList } from '../services/whatsappClient';
import { sendMainMenu } from './menuHandler';

export async function sendFaqList(tenant: Tenant, to: string): Promise<void> {
  if (tenant.faqs.length === 0) {
    await sendTextMessage(tenant, to, 'Aún no hay preguntas frecuentes configuradas. Escribe tu consulta y te respondo.');
    return;
  }

  const rows = tenant.faqs.map((f) => ({
    id: `faq_${f.id}`,
    title: `${f.id}. ${f.question.length > 60 ? f.question.slice(0, 57) + '...' : f.question}`,
    description: '',
  }));

  await sendInteractiveList(
    tenant,
    to,
    'Preguntas Frecuentes',
    'Selecciona la pregunta que deseas consultar:',
    'Ver preguntas',
    [{ title: 'FAQ', rows }]
  );
}

export async function handleFaqSelection(tenant: Tenant, to: string, selectionId: string): Promise<void> {
  const id = parseInt(selectionId.replace('faq_', ''), 10);
  const faq = tenant.faqs.find((f) => f.id === id);

  if (faq) {
    await sendTextMessage(tenant, to, `*${faq.question}*\n\n${faq.answer}`);
  } else {
    await sendTextMessage(tenant, to, 'No encontré esa pregunta. Intenta de nuevo.');
  }

  await sendMainMenu(tenant, to);
}
