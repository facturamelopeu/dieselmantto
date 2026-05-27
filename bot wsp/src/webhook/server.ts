import express, { Request, Response } from 'express';
import path from 'path';
import { MetaWebhookBody, WhatsAppMessage } from '../types';
import { handleMessage } from '../handlers/messageHandler';
import * as tenantService from '../services/tenantService';
import * as waManager from '../services/waClientManager';
import authRoutes from '../routes/authRoutes';
import adminRoutes from '../routes/adminRoutes';
import superAdminRoutes from '../routes/superAdminRoutes';
import chatRoutes from '../routes/chatRoutes';

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../public')));

// Auth & admin API
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/admin/chat', chatRoutes);
app.use('/superadmin', superAdminRoutes);

// Meta webhook kept for backward compat (tenants still using Meta API)
app.get('/webhook', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'] as string;
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && tenantService.findByVerifyToken(token)) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', (req: Request, res: Response) => {
  res.sendStatus(200);
  const body = req.body as MetaWebhookBody;
  if (body.object !== 'whatsapp_business_account') return;
  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const phoneNumberId = change.value?.metadata?.phone_number_id;
      const tenant = tenantService.findByPhoneNumberId(phoneNumberId);
      if (!tenant) continue;
      for (const raw of change.value?.messages ?? []) {
        let text = '';
        if (raw.type === 'text' && raw.text?.body) text = raw.text.body;
        else if (raw.type === 'interactive') {
          text = raw.interactive?.button_reply?.id || raw.interactive?.list_reply?.id || '';
        }
        if (!text) continue;
        const msg: WhatsAppMessage = { from: raw.from, text, messageId: raw.id };
        handleMessage(tenant, msg).catch((err) => {
          console.error(`[meta][${tenant.storeName}]`, JSON.stringify(err?.response?.data ?? err?.message ?? err));
        });
      }
    }
  }
});

app.get('/health', (_req, res) =>
  res.json({ status: 'ok', tenants: tenantService.getAll().length })
);

// Initialize WhatsApp Web clients for all tenants on startup
waManager.initAll();

export default app;
