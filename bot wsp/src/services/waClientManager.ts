import { Client, LocalAuth } from 'whatsapp-web.js';
import path from 'path';
import QRCode from 'qrcode';
import { Tenant, WhatsAppMessage } from '../types';
import * as tenantService from './tenantService';

type Status = 'initializing' | 'qr' | 'connected' | 'disconnected';

interface ClientEntry {
  client: Client;
  status: Status;
  qrDataUrl: string | null;
}

const entries = new Map<string, ClientEntry>();

export async function sendText(tenantId: string, to: string, text: string): Promise<void> {
  const entry = entries.get(tenantId);
  if (!entry || entry.status !== 'connected') throw new Error('WhatsApp no conectado');
  const chatId = to.includes('@') ? to : `${to}@c.us`;
  await entry.client.sendMessage(chatId, text);
}

export function getStatus(tenantId: string): Status {
  return entries.get(tenantId)?.status ?? 'disconnected';
}

export function getQR(tenantId: string): string | null {
  return entries.get(tenantId)?.qrDataUrl ?? null;
}

export async function logoutClient(tenantId: string): Promise<void> {
  const entry = entries.get(tenantId);
  if (!entry) return;
  try { await entry.client.logout(); } catch { /* ignore */ }
  try { await entry.client.destroy(); } catch { /* ignore */ }
  entries.delete(tenantId);
}

export function initClient(tenant: Tenant): void {
  if (entries.has(tenant.id)) return;

  // Use system Chromium if available (lighter on VPS), else fall back to bundled
  const executablePath = (() => {
    const candidates = ['/usr/bin/chromium-browser', '/usr/bin/chromium', '/usr/bin/google-chrome'];
    for (const p of candidates) {
      try { require('fs').accessSync(p); return p; } catch { /* not found */ }
    }
    return undefined;
  })();

  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: tenant.id,
      dataPath: path.join(__dirname, '../../data/sessions'),
    }),
    puppeteer: {
      headless: true,
      ...(executablePath ? { executablePath } : {}),
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
      ],
    },
  });

  const entry: ClientEntry = { client, status: 'initializing', qrDataUrl: null };
  entries.set(tenant.id, entry);

  client.on('qr', async (qr) => {
    entry.status = 'qr';
    entry.qrDataUrl = await QRCode.toDataURL(qr);
    console.log(`[wa][${tenant.storeName}] QR listo para escanear`);
  });

  client.on('ready', () => {
    entry.status = 'connected';
    entry.qrDataUrl = null;
    console.log(`[wa][${tenant.storeName}] Conectado correctamente`);
  });

  client.on('auth_failure', () => {
    entry.status = 'disconnected';
    console.error(`[wa][${tenant.storeName}] Fallo de autenticación`);
  });

  client.on('disconnected', (reason) => {
    entry.status = 'disconnected';
    console.log(`[wa][${tenant.storeName}] Desconectado:`, reason);
    entries.delete(tenant.id);
  });

  client.on('message', async (msg) => {
    if (msg.isStatus || msg.from === 'status@broadcast') return;
    if (msg.from.endsWith('@g.us')) return;

    const currentTenant = tenantService.findById(tenant.id);
    if (!currentTenant) return;

    const waMsg: WhatsAppMessage = {
      from: msg.from,
      text: msg.body,
      messageId: msg.id._serialized,
    };

    // Lazy import to avoid circular dependency
    import('../handlers/messageHandler').then(({ handleMessage }) => {
      handleMessage(currentTenant, waMsg).catch((err) => {
        console.error(`[wa][${tenant.storeName}] Error:`, err.message);
      });
    });
  });

  client.initialize().catch((err) => {
    console.error(`[wa][${tenant.storeName}] Error al inicializar:`, err.message);
    entry.status = 'disconnected';
    entries.delete(tenant.id);
  });
}

export function initAll(): void {
  for (const tenant of tenantService.getAll()) {
    initClient(tenant);
  }
}
