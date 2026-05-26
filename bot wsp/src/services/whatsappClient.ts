import axios from 'axios';
import { Tenant, InteractiveButton, InteractiveListSection } from '../types';

function headers(token: string) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

function url(phoneNumberId: string) {
  return `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
}

export async function sendTextMessage(tenant: Tenant, to: string, text: string): Promise<void> {
  await axios.post(
    url(tenant.phoneNumberId),
    { messaging_product: 'whatsapp', to, type: 'text', text: { body: text } },
    { headers: headers(tenant.whatsappToken) }
  );
}

export async function sendInteractiveButtons(
  tenant: Tenant,
  to: string,
  body: string,
  buttons: InteractiveButton[]
): Promise<void> {
  await axios.post(
    url(tenant.phoneNumberId),
    {
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: body },
        action: {
          buttons: buttons.map((b) => ({ type: 'reply', reply: { id: b.id, title: b.title } })),
        },
      },
    },
    { headers: headers(tenant.whatsappToken) }
  );
}

export async function sendInteractiveList(
  tenant: Tenant,
  to: string,
  header: string,
  body: string,
  buttonLabel: string,
  sections: InteractiveListSection[]
): Promise<void> {
  await axios.post(
    url(tenant.phoneNumberId),
    {
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'list',
        header: { type: 'text', text: header },
        body: { text: body },
        action: { button: buttonLabel, sections },
      },
    },
    { headers: headers(tenant.whatsappToken) }
  );
}
