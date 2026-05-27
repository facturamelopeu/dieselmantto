import { Tenant, WhatsAppMessage } from '../types';
import { sendTextMessage, resolveNumber } from '../services/whatsappClient';
import { sendMainMenu } from './menuHandler';
import { sendFaqList, handleFaqSelection } from './faqHandler';
import { sendCategoryList, handleCategorySelection, handleProductSelection } from './catalogHandler';
import { askOllama } from '../services/ollamaService';

const GREETINGS = ['hola', 'hi', 'hello', 'buenos', 'buenas', 'inicio', 'start', 'menu', 'ayuda', 'help'];

async function route(tenant: Tenant, from: string, id: string): Promise<boolean> {
  if (id === 'menu_catalogo' || id === 'catalogo') { await sendCategoryList(tenant, from); return true; }
  if (id === 'menu_recomendar' || id === 'recomendar') {
    await sendTextMessage(tenant, from, 'Cuéntame: ¿qué tipo de equipo tienes y qué necesitas?');
    return true;
  }
  if (id === 'menu_faq' || id === 'faq' || id === 'preguntas') { await sendFaqList(tenant, from); return true; }
  if (id === 'asesor' || id === 'menu_asesor') {
    await sendTextMessage(tenant, from, `Para hablar con un asesor de *${tenant.storeName}*, continúa escribiendo y un representante te atenderá.`);
    return true;
  }
  if (id.startsWith('cat_')) { await handleCategorySelection(tenant, from, id); return true; }
  if (id.startsWith('prod_')) { await handleProductSelection(tenant, from, id); return true; }
  if (id.startsWith('faq_')) { await handleFaqSelection(tenant, from, id); return true; }
  return false;
}

export async function handleMessage(tenant: Tenant, msg: WhatsAppMessage): Promise<void> {
  const { from, text } = msg;
  const normalized = text.toLowerCase().trim();

  // Resolve numeric shortcut from last shown list
  if (/^\d+$/.test(normalized)) {
    const n = parseInt(normalized, 10);
    const resolved = resolveNumber(tenant.id, from, n);
    if (resolved && await route(tenant, from, resolved)) return;
  }

  if (await route(tenant, from, normalized)) return;

  if (GREETINGS.some((g) => normalized.includes(g))) {
    await sendMainMenu(tenant, from);
    return;
  }

  // Free text → Ollama with fallback to keyword search
  if (normalized.length >= 3) {
    try {
      await sendTextMessage(tenant, from, 'Consultando...');
      const reply = await askOllama(tenant, text);
      await sendTextMessage(tenant, from, reply);
    } catch {
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
