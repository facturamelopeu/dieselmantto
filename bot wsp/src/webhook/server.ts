import express, { Request, Response } from 'express';
import { MetaWebhookBody, WhatsAppMessage } from '../types';
import { handleMessage } from '../handlers/messageHandler';
import * as tenantService from '../services/tenantService';
import authRoutes from '../routes/authRoutes';
import adminRoutes from '../routes/adminRoutes';

const app = express();
app.use(express.json());

// Auth & admin API
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

// Meta webhook verification — matches verify_token against all registered tenants
app.get('/webhook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'] as string;
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && tenantService.findByVerifyToken(token)) {
    console.log('[webhook] Verification ok for token:', token);
    res.status(200).send(challenge);
  } else {
    console.warn('[webhook] Verification failed — unknown verify_token:', token);
    res.sendStatus(403);
  }
});

// Incoming messages — routed by phone_number_id to the correct tenant
app.post('/webhook', (req: Request, res: Response) => {
  res.sendStatus(200);

  const body = req.body as MetaWebhookBody;
  if (body.object !== 'whatsapp_business_account') return;

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const phoneNumberId = change.value?.metadata?.phone_number_id;
      const tenant = tenantService.findByPhoneNumberId(phoneNumberId);

      if (!tenant) {
        console.warn('[webhook] Unknown phone_number_id:', phoneNumberId);
        continue;
      }

      for (const raw of change.value?.messages ?? []) {
        let text = '';
        if (raw.type === 'text' && raw.text?.body) {
          text = raw.text.body;
        } else if (raw.type === 'interactive') {
          text =
            raw.interactive?.button_reply?.id ||
            raw.interactive?.list_reply?.id ||
            '';
        }

        if (!text) continue;

        const msg: WhatsAppMessage = { from: raw.from, text, messageId: raw.id };
        handleMessage(tenant, msg).catch((err) => {
          const metaError = err?.response?.data ?? err?.message ?? err;
          console.error(`[handler][${tenant.storeName}] Error:`, JSON.stringify(metaError));
        });
      }
    }
  }
});

app.get('/health', (_req, res) => res.json({ status: 'ok', tenants: tenantService.getAll().length }));

export default app;
