import axios from 'axios';
import { Tenant, Product } from '../types';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b';

export const DEFAULT_PROMPT_TEMPLATE =
  `Eres el asistente virtual de {storeName}, tienda de tecnología para equipos pesados y camiones.\n` +
  `Responde en español, de forma breve y amigable (máximo 3 oraciones).\n` +
  `Si el cliente pregunta por un producto, recomiéndale opciones del catálogo.\n` +
  `Si no hay producto adecuado en el catálogo, sugiere que contacte a un asesor.\n\n` +
  `CATÁLOGO:\n{catalog}\n\n` +
  `Cliente: {userMessage}\nAsistente:`;

function buildContext(catalog: Product[], query: string): string {
  const words = query.toLowerCase().split(/\s+/);
  const relevant = catalog.filter((p) => {
    const searchable = [p.name, p.description, p.category, ...p.keywords].join(' ').toLowerCase();
    return words.some((w) => searchable.includes(w));
  });
  const pool = relevant.length > 0 ? relevant.slice(0, 6) : catalog.slice(0, 6);
  return pool
    .map((p) => `- ${p.name} [${p.category}]: ${p.description}${p.price ? ` | Precio: ${p.price}` : ''}`)
    .join('\n') || 'Sin productos en catálogo aún.';
}

export async function askOllama(tenant: Tenant, userMessage: string): Promise<string> {
  const ai = tenant.ai;

  // If AI explicitly disabled, throw so caller uses fallback
  if (ai && ai.enabled === false) throw new Error('IA deshabilitada');

  const model = ai?.model || DEFAULT_MODEL;
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';

  const context = buildContext(tenant.catalog, userMessage);
  const promptTemplate = ai?.prompt || DEFAULT_PROMPT_TEMPLATE;
  const prompt = promptTemplate
    .replace(/\{storeName\}/g, tenant.storeName)
    .replace(/\{catalog\}/g, context)
    .replace(/\{userMessage\}/g, userMessage);

  const { data } = await axios.post(
    ollamaUrl,
    {
      model, prompt, stream: false,
      options: {
        temperature: 0.3,
        num_predict: 120,
        num_ctx: 1024,
        stop: ['\nCliente:', '\nAsistente:', 'Cliente:'],
      },
    },
    { timeout: 25000 }
  );

  return (data.response as string).trim();
}
