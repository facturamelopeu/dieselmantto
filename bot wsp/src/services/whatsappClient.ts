import { Tenant, InteractiveButton, InteractiveListSection } from '../types';
import { sendText } from './waClientManager';
import * as chatService from './chatService';

// Per-user session: tracks the IDs of the last numbered list shown
// so user can reply with "1", "2", etc.
const sessionIds = new Map<string, string[]>();

function sessionKey(tenantId: string, to: string): string {
  return `${tenantId}:${to}`;
}

export function resolveNumber(tenantId: string, to: string, n: number): string | null {
  const ids = sessionIds.get(sessionKey(tenantId, to));
  return ids?.[n - 1] ?? null;
}

export async function sendTextMessage(tenant: Tenant, to: string, text: string): Promise<void> {
  await sendText(tenant.id, to, text);
  chatService.addMessage(tenant.id, to, { text, direction: 'out', ts: Date.now() });
}

export async function sendInteractiveButtons(
  tenant: Tenant,
  to: string,
  body: string,
  buttons: InteractiveButton[]
): Promise<void> {
  const lines = [body, ''];
  const ids: string[] = [];
  buttons.forEach((b, i) => {
    lines.push(`${i + 1}. ${b.title}`);
    ids.push(b.id);
  });
  lines.push('\n_Responde con el número de tu opción._');
  await sendText(tenant.id, to, lines.join('\n'));
  sessionIds.set(sessionKey(tenant.id, to), ids);
}

export async function sendInteractiveList(
  tenant: Tenant,
  to: string,
  header: string,
  body: string,
  _buttonLabel: string,
  sections: InteractiveListSection[]
): Promise<void> {
  const lines: string[] = [];
  if (header) lines.push(`*${header}*`);
  if (body) lines.push(body);
  lines.push('');

  const ids: string[] = [];
  let n = 1;
  for (const section of sections) {
    if (section.title && sections.length > 1) lines.push(`*${section.title}*`);
    for (const row of section.rows) {
      const desc = (row as { description?: string }).description;
      lines.push(`${n}. ${row.title}${desc ? ` _(${desc})_` : ''}`);
      ids.push(row.id);
      n++;
    }
  }
  lines.push('\n_Responde con el número de tu opción._');
  await sendText(tenant.id, to, lines.join('\n').trim());
  sessionIds.set(sessionKey(tenant.id, to), ids);
}
