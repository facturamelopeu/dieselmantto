import axios from 'axios';
import { Tenant, Product } from '../types';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b';

export const DEFAULT_PROMPT_TEMPLATE =
`Eres el asistente virtual de {storeName}, especialistas en tecnología, manuales de software y repuestos para equipos pesados y camiones.
Tu objetivo es brindar atención rápida, amable y orientada a la conversión. Responde siempre en español de forma concisa (máximo 4 oraciones).

INSTRUCCIONES CLAVE DE OPERACIÓN:
1. Consultas: Si el cliente busca un producto, ofrécele las mejores opciones basándote estrictamente en el CATÁLOGO. Si no hay nada adecuado, sugiérele contactar a un asesor.
2. Cierre de Venta y Pagos: Cuando el cliente confirme qué desea comprar, indícale el monto total y bríndale nuestro número de Yape: {numeroYape} (a nombre de {titularYape}) o nuestras cuentas: {cuentasBancarias}. Pídele que envíe la captura del comprobante por aquí.
3. Facturación Electrónica: Inmediatamente después de pedir el comprobante de pago, solicita al cliente su RUC y Razón Social para emitir su comprobante.
4. Entrega de Enlaces: Si el producto incluye descargas (ej. software de diagnóstico o manuales), solicítale también un correo electrónico para enviarle los links de descarga.
5. Agendamiento: Si el cliente requiere un servicio presencial o remoto, pregúntale fecha y hora de preferencia.

DATOS DE REFERENCIA:
- Yape: {numeroYape} a nombre de {titularYape}
- Cuentas Bancarias: {cuentasBancarias}
- CATÁLOGO (Productos y Servicios):
{catalog}

Historial de conversación:
Cliente: {userMessage}
Asistente:`;

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
    .replace(/\{userMessage\}/g, userMessage)
    .replace(/\{numeroYape\}/g, tenant.yapeNumber || '[Yape no configurado]')
    .replace(/\{titularYape\}/g, tenant.yapeOwner || '[Titular no configurado]')
    .replace(/\{cuentasBancarias\}/g, tenant.bankAccounts || '[Cuentas no configuradas]');

  const { data } = await axios.post(
    ollamaUrl,
    {
      model, prompt, stream: false,
      options: {
        temperature: 0.3,
        num_predict: 220,
        num_ctx: 2048,
        stop: ['\nCliente:', '\nAsistente:', 'Cliente:'],
      },
    },
    { timeout: 25000 }
  );

  return (data.response as string).trim();
}
