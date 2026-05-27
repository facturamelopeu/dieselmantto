import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import * as tenantService from '../services/tenantService';
import * as waManager from '../services/waClientManager';
import { hashPassword } from '../services/authService';
import { Product, FAQ } from '../types';

const router = Router();
router.use(authMiddleware);

// GET /admin/settings
router.get('/settings', (req: AuthRequest, res: Response) => {
  const t = req.tenant!;
  res.json({
    id: t.id,
    username: t.username,
    storeName: t.storeName,
    websiteUrl: t.websiteUrl,
    phoneNumberId: t.phoneNumberId,
    createdAt: t.createdAt,
  });
});

// PUT /admin/settings
router.put('/settings', async (req: AuthRequest, res: Response) => {
  const { username, storeName, websiteUrl, password, whatsappToken, phoneNumberId, verifyToken } =
    req.body as Record<string, string>;

  const updates: Partial<typeof req.tenant> = {};
  if (username) updates.username = username;
  if (storeName) updates.storeName = storeName;
  if (websiteUrl !== undefined) updates.websiteUrl = websiteUrl;
  if (whatsappToken) updates.whatsappToken = whatsappToken;
  if (phoneNumberId) updates.phoneNumberId = phoneNumberId;
  if (verifyToken) updates.verifyToken = verifyToken;
  if (password) updates.passwordHash = await hashPassword(password);

  const updated = tenantService.update(req.tenant!.id, updates);
  res.json({ ok: true, storeName: updated?.storeName });
});

// ── Catálogo ─────────────────────────────────────────────────────────────────

// GET /admin/catalog
router.get('/catalog', (req: AuthRequest, res: Response) => {
  res.json(req.tenant!.catalog);
});

// POST /admin/catalog
router.post('/catalog', (req: AuthRequest, res: Response) => {
  const p = req.body as Partial<Product>;
  if (!p.name || !p.category || !p.description) {
    res.status(400).json({ error: 'name, category y description son requeridos' });
    return;
  }
  const product: Product = {
    id: p.id || `prod-${Date.now()}`,
    name: p.name,
    category: p.category,
    description: p.description,
    price: p.price,
    keywords: p.keywords ?? p.name.toLowerCase().split(' '),
    source: 'manual',
  };
  tenantService.addProduct(req.tenant!.id, product);
  res.status(201).json(product);
});

// PUT /admin/catalog/:id
router.put('/catalog/:id', (req: AuthRequest, res: Response) => {
  const tenant = req.tenant!;
  const existing = tenant.catalog.find((p) => p.id === req.params.id);
  if (!existing) { res.status(404).json({ error: 'Producto no encontrado' }); return; }
  const updated: Product = { ...existing, ...(req.body as Partial<Product>), id: existing.id };
  tenantService.addProduct(tenant.id, updated);
  res.json(updated);
});

// DELETE /admin/catalog/:id
router.delete('/catalog/:id', (req: AuthRequest, res: Response) => {
  tenantService.removeProduct(req.tenant!.id, req.params.id);
  res.json({ ok: true });
});

// ── FAQs ─────────────────────────────────────────────────────────────────────

// GET /admin/faqs
router.get('/faqs', (req: AuthRequest, res: Response) => {
  res.json(req.tenant!.faqs);
});

// POST /admin/faqs
router.post('/faqs', (req: AuthRequest, res: Response) => {
  const { question, answer } = req.body as Partial<FAQ>;
  if (!question || !answer) {
    res.status(400).json({ error: 'question y answer son requeridos' });
    return;
  }
  const updated = tenantService.addFaq(req.tenant!.id, { question, answer });
  res.status(201).json(updated?.faqs.at(-1));
});

// DELETE /admin/faqs/:id
router.delete('/faqs/:id', (req: AuthRequest, res: Response) => {
  tenantService.removeFaq(req.tenant!.id, parseInt(req.params.id, 10));
  res.json({ ok: true });
});

// ── WhatsApp QR ───────────────────────────────────────────────────────────────

// GET /admin/whatsapp/status
router.get('/whatsapp/status', (req: AuthRequest, res: Response) => {
  const status = waManager.getStatus(req.tenant!.id);
  res.json({ status });
});

// GET /admin/whatsapp/qr
router.get('/whatsapp/qr', (req: AuthRequest, res: Response) => {
  const qr = waManager.getQR(req.tenant!.id);
  if (!qr) { res.status(404).json({ error: 'QR no disponible' }); return; }
  res.json({ qr });
});

// POST /admin/whatsapp/connect
router.post('/whatsapp/connect', (req: AuthRequest, res: Response) => {
  waManager.initClient(req.tenant!);
  res.json({ ok: true, message: 'Iniciando conexión. Espera el QR.' });
});

// POST /admin/whatsapp/logout
router.post('/whatsapp/logout', async (req: AuthRequest, res: Response) => {
  await waManager.logoutClient(req.tenant!.id);
  res.json({ ok: true });
});

export default router;
