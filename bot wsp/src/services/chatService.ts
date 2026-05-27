import { Response } from 'express';

export interface ChatMessage {
  id: string;
  text: string;
  direction: 'in' | 'out';
  ts: number;
}

export interface Conversation {
  phone: string;
  name?: string;
  messages: ChatMessage[];
  botEnabled: boolean;
  unread: number;
  lastTs: number;
}

// tenantId → phone → Conversation
const store = new Map<string, Map<string, Conversation>>();

// SSE clients: tenantId → Set of Response objects
const sseClients = new Map<string, Set<Response>>();

function getConvMap(tenantId: string): Map<string, Conversation> {
  if (!store.has(tenantId)) store.set(tenantId, new Map());
  return store.get(tenantId)!;
}

export function addMessage(tenantId: string, phone: string, msg: Omit<ChatMessage, 'id'>, name?: string): void {
  const convs = getConvMap(tenantId);
  if (!convs.has(phone)) {
    convs.set(phone, { phone, name, messages: [], botEnabled: true, unread: 0, lastTs: Date.now() });
  }
  const conv = convs.get(phone)!;
  if (name) conv.name = name;
  const full: ChatMessage = { ...msg, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` };
  conv.messages.push(full);
  if (msg.direction === 'in') conv.unread += 1;
  conv.lastTs = msg.ts;

  // Keep last 100 messages per conversation
  if (conv.messages.length > 100) conv.messages = conv.messages.slice(-100);

  broadcast(tenantId, { type: 'message', phone, message: full, botEnabled: conv.botEnabled, unread: conv.unread });
}

export function getConversations(tenantId: string): Conversation[] {
  return [...getConvMap(tenantId).values()].sort((a, b) => b.lastTs - a.lastTs);
}

export function getMessages(tenantId: string, phone: string): ChatMessage[] {
  return getConvMap(tenantId).get(phone)?.messages ?? [];
}

export function markRead(tenantId: string, phone: string): void {
  const conv = getConvMap(tenantId).get(phone);
  if (conv) conv.unread = 0;
}

export function isBotEnabled(tenantId: string, phone: string): boolean {
  return getConvMap(tenantId).get(phone)?.botEnabled ?? true;
}

export function setBotEnabled(tenantId: string, phone: string, enabled: boolean): void {
  const convs = getConvMap(tenantId);
  if (!convs.has(phone)) {
    convs.set(phone, { phone, messages: [], botEnabled: enabled, unread: 0, lastTs: Date.now() });
  }
  convs.get(phone)!.botEnabled = enabled;
  broadcast(tenantId, { type: 'bot_toggle', phone, botEnabled: enabled });
}

// SSE management
export function addSseClient(tenantId: string, res: Response): void {
  if (!sseClients.has(tenantId)) sseClients.set(tenantId, new Set());
  sseClients.get(tenantId)!.add(res);
}

export function removeSseClient(tenantId: string, res: Response): void {
  sseClients.get(tenantId)?.delete(res);
}

function broadcast(tenantId: string, data: object): void {
  const clients = sseClients.get(tenantId);
  if (!clients?.size) return;
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) {
    try { res.write(payload); } catch { clients.delete(res); }
  }
}
