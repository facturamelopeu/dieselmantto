import { Router, Response } from 'express';
import { superAdminMiddleware, SuperAdminRequest } from '../middleware/superAdminMiddleware';
import * as tenantService from '../services/tenantService';
import * as waManager from '../services/waClientManager';
import { hashPassword } from '../services/authService';
import { TenantSubscription, TenantPayment } from '../types';

const router = Router();
router.use(superAdminMiddleware);

// GET /superadmin/tenants
router.get('/tenants', (_req: SuperAdminRequest, res: Response) => {
  const tenants = tenantService.getAll().map((t) => ({
    id: t.id,
    username: t.username,
    storeName: t.storeName,
    websiteUrl: t.websiteUrl,
    logoUrl: t.logoUrl ?? '',
    phoneNumberId: t.phoneNumberId,
    verifyToken: t.verifyToken,
    productCount: t.catalog.length,
    faqCount: t.faqs.length,
    ai: t.ai ?? { enabled: true, model: 'llama3.2:3b' },
    stats: t.stats ?? { messages: 0, conversations: 0, leads: 0 },
    waStatus: waManager.getStatus(t.id),
    subscription: t.subscription ?? null,
    createdAt: t.createdAt,
  }));
  res.json(tenants);
});

// POST /superadmin/tenants  — create new business
router.post('/tenants', async (req: SuperAdminRequest, res: Response) => {
  const { username, password, storeName, whatsappToken, phoneNumberId, verifyToken, websiteUrl } =
    req.body as Record<string, string>;

  if (!username || !password || !storeName || !whatsappToken || !phoneNumberId || !verifyToken) {
    res.status(400).json({
      error: 'Faltan campos: username, password, storeName, whatsappToken, phoneNumberId, verifyToken',
    });
    return;
  }
  if (tenantService.findByUsername(username)) {
    res.status(409).json({ error: 'El usuario ya existe' });
    return;
  }

  const passwordHash = await hashPassword(password);
  const tenant = tenantService.create({
    username, passwordHash, storeName,
    websiteUrl: websiteUrl || '',
    whatsappToken, phoneNumberId, verifyToken,
    catalog: [], faqs: [],
  });

  res.status(201).json({
    id: tenant.id,
    username: tenant.username,
    storeName: tenant.storeName,
    createdAt: tenant.createdAt,
  });
});

// PUT /superadmin/tenants/:id  — update any field
router.put('/tenants/:id', async (req: SuperAdminRequest, res: Response) => {
  const { username, storeName, websiteUrl, logoUrl, password, whatsappToken, phoneNumberId, verifyToken } =
    req.body as Record<string, string>;

  const updates: Parameters<typeof tenantService.update>[1] = {};
  if (username) updates.username = username;
  if (storeName) updates.storeName = storeName;
  if (websiteUrl !== undefined) updates.websiteUrl = websiteUrl;
  if (logoUrl !== undefined) updates.logoUrl = logoUrl;
  if (whatsappToken) updates.whatsappToken = whatsappToken;
  if (phoneNumberId) updates.phoneNumberId = phoneNumberId;
  if (verifyToken) updates.verifyToken = verifyToken;
  if (password) updates.passwordHash = await hashPassword(password);

  const updated = tenantService.update(req.params.id, updates);
  if (!updated) { res.status(404).json({ error: 'Negocio no encontrado' }); return; }

  res.json({ ok: true, storeName: updated.storeName });
});

// DELETE /superadmin/tenants/:id
router.delete('/tenants/:id', (req: SuperAdminRequest, res: Response) => {
  const deleted = tenantService.remove(req.params.id);
  if (!deleted) { res.status(404).json({ error: 'Negocio no encontrado' }); return; }
  res.json({ ok: true });
});

// ── Suscripción ───────────────────────────────────────────────────────────────

router.put('/tenants/:id/subscription', (req: SuperAdminRequest, res: Response) => {
  const tenant = tenantService.findById(req.params.id);
  if (!tenant) { res.status(404).json({ error: 'Negocio no encontrado' }); return; }

  const { status, plan, amount, currency, startDate, expiresAt } =
    req.body as Partial<TenantSubscription>;

  const current = tenant.subscription ?? {
    status: 'trial',
    plan: 'Básico',
    amount: 0,
    currency: 'MXN',
    startDate: new Date().toISOString().slice(0, 10),
    expiresAt: new Date().toISOString().slice(0, 10),
    payments: [],
  };

  const updated: TenantSubscription = {
    ...current,
    ...(status !== undefined && { status }),
    ...(plan && { plan }),
    ...(amount !== undefined && { amount }),
    ...(currency && { currency }),
    ...(startDate && { startDate }),
    ...(expiresAt && { expiresAt }),
  };

  tenantService.update(req.params.id, { subscription: updated });
  res.json({ ok: true, subscription: updated });
});

// POST /superadmin/tenants/:id/payments — register a payment, auto-extend expiresAt
router.post('/tenants/:id/payments', (req: SuperAdminRequest, res: Response) => {
  const tenant = tenantService.findById(req.params.id);
  if (!tenant) { res.status(404).json({ error: 'Negocio no encontrado' }); return; }

  const { amount, currency, method, note, period, extensionDays } =
    req.body as { amount?: number; currency?: string; method?: string; note?: string; period?: string; extensionDays?: number };

  if (!amount || !method || !period) {
    res.status(400).json({ error: 'amount, method y period son requeridos' }); return;
  }

  const payment: TenantPayment = {
    id: `pay-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    amount,
    currency: currency || 'MXN',
    method,
    note,
    period,
  };

  const current = tenant.subscription ?? {
    status: 'trial' as const,
    plan: 'Básico',
    amount: 0,
    currency: 'MXN',
    startDate: new Date().toISOString().slice(0, 10),
    expiresAt: new Date().toISOString().slice(0, 10),
    payments: [],
  };

  const days = extensionDays ?? 30;
  const base = new Date(current.expiresAt) < new Date()
    ? new Date()
    : new Date(current.expiresAt);
  base.setDate(base.getDate() + days);
  const newExpiry = base.toISOString().slice(0, 10);

  const updatedSub: TenantSubscription = {
    ...current,
    status: 'active',
    expiresAt: newExpiry,
    payments: [...current.payments, payment],
  };

  tenantService.update(req.params.id, { subscription: updatedSub });
  res.status(201).json({ ok: true, payment, expiresAt: newExpiry });
});

// DELETE /superadmin/tenants/:id/payments/:paymentId
router.delete('/tenants/:id/payments/:paymentId', (req: SuperAdminRequest, res: Response) => {
  const tenant = tenantService.findById(req.params.id);
  if (!tenant || !tenant.subscription) {
    res.status(404).json({ error: 'No encontrado' }); return;
  }
  const filtered = tenant.subscription.payments.filter((p) => p.id !== req.params.paymentId);
  tenantService.update(req.params.id, {
    subscription: { ...tenant.subscription, payments: filtered },
  });
  res.json({ ok: true });
});

export default router;
