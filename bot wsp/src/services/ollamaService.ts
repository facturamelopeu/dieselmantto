import axios from 'axios';
import { Tenant, Product } from '../types';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b';

function buildContext(catalog: Product[], query: string): string {
  const words = query.toLowerCase().split(/\s+/);
  const relevant = catalog.filter((p) => {
    const searchable = [p.name, p.description, p.category, ...p.keywords].join(' ').toLowerCase();
    return words.some((w) => searchable.includes(w));
  });
  const pool = relevant.length > 0 ? relevant.slice(0, 6) : catalog.slice(0, 6);
  return pool
    .map((p) => `- ${p.name} [${p.category}]: ${p.description}${p.price ? ` | Precio: ${p.price}` : ''}`)
    .join('\n');
}

export async function askOllama(tenant: Tenant, userMessage: string): Promise<string> {
  const context = buildContext(tenant.catalog, userMessage);

  const prompt =
    `Eres el asistente virtual de ${tenant.storeName}, tienda de tecnología para equipos pesados y camiones.\n` +
    `Responde en español, de forma breve y amigable (máximo 3 oraciones).\n` +
    `Si el cliente pregunta por un producto, recomiéndale opciones del catálogo.\n` +
    `Si no hay producto adecuado en el catálogo, sugiere que contacte a un asesor.\n\n` +
    `CATÁLOGO:\n${context || 'Sin productos en catálogo aún.'}\n\n` +
    `Cliente: ${userMessage}\nAsistente:`;

  const { data } = await axios.post(
    OLLAMA_URL,
    { model: MODEL, prompt, stream: false, options: { temperature: 0.4, num_predict: 200 } },
    { timeout: 30000 }
  );

  return (data.response as string).trim();
}
