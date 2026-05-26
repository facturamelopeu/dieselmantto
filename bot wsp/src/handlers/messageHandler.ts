import { Tenant, WhatsAppMessage } from '../types';
import { sendTextMessage } from '../services/whatsappClient';
import { sendMainMenu } from './menuHandler';
import { sendFaqList, handleFaqSelection } from './faqHandler';
import { sendCategoryList, handleCategorySelection, handleProductSelection } from './catalogHandler';
import { askOllama } from '../services/ollamaService';

const GREETINGS = ['hola', 'hi', 'hello', 'buenos', 'buenas', 'inicio', 'start', 'menu', 'ayuda', 'help'];

export async function handleMessage(tenant: Tenant, msg: WhatsAppMessage): Promise<void> {
  const { from, text } = msg;
  const normalized = text.toLowerCase().trim();

  if (normalized === 'menu_catalogo' || normalized === 'catalogo') {
    await sendCategoryList(tenant, from);
    return;
  }

  if (normalized === 'menu_recomendar' || normalized === 'recomendar') {
    await sendTextMessage(tenant, from, 'Cuéntame: ¿qué tipo de equipo tienes y qué necesitas?');
    return;
  }

  if (normalized === 'menu_faq' || normalized === 'faq' || normalized === 'preguntas') {
    await sendFaqList(tenant, from);
    return;
  }

  if (normalized === 'asesor' || normalized === 'menu_asesor') {
    await sendTextMessage(
      tenant,
      from,
      `Para hablar con un asesor de *${tenant.storeName}*, continúa escribiendo aquí y un representante te atenderá.`
    );
    return;
  }

  if (normalized.startsWith('cat_')) {
    await handleCategorySelection(tenant, from, normalized);
    return;
  }

  if (normalized.startsWith('prod_')) {
    await handleProductSelection(tenant, from, normalized);
    return;
  }

  if (normalized.startsWith('faq_')) {
    await handleFaqSelection(tenant, from, normalized);
    return;
  }

  if (GREETINGS.some((g) => normalized.includes(g))) {
    await sendMainMenu(tenant, from);
    return;
  }

  // Texto libre → Ollama con catálogo del tenant (fallback a búsqueda simple si Ollama no disponible)
  if (normalized.length >= 3) {
    try {
      await sendTextMessage(tenant, from, 'Consultando...');
      const reply = await askOllama(tenant, text);
      await sendTextMessage(tenant, from, reply);
    } catch {
      // Ollama no disponible — búsqueda por palabras clave
      const words = normalized.split(/\s+/);
      const results = tenant.catalog.filter((p) => {
        const searchable = [p.name, p.description, p.category, ...p.keywords].join(' ').toLowerCase();
        return words.some((w) => searchable.includes(w));
      });
      if (results.length > 0) {
        const lista = results.slice(0, 3).map((p) => `• *${p.name}* — ${p.description}`).join('\n\n');
        await sendTextMessage(tenant, from, `Encontré estos productos:\n\n${lista}`);
      } else {
        await sendTextMessage(tenant, from, 'No encontré productos para tu búsqueda. Escribe *menu* para ver el catálogo completo.');
      }
    }
    await sendMainMenu(tenant, from);
    return;
  }

  await sendTextMessage(tenant, from, 'Escribe *hola* o *menu* para ver las opciones disponibles.');
}
