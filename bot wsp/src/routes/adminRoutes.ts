import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import * as tenantService from '../services/tenantService';
import * as waManager from '../services/waClientManager';
import * as scraperService from '../services/scraperService';
import { hashPassword } from '../services/authService';
import { DEFAULT_PROMPT_TEMPLATE } from '../services/ollamaService';
import { Product, FAQ, TenantAI } from '../types';

const router = Router();
router.use(authMiddleware);

// ── Settings ─────────────────────────────────────────────────────────────────

router.get('/settings', (req: AuthRequest, res: Response) => {
  const t = req.tenant!;
  res.json({
    id: t.id,
    username: t.username,
    storeName: t.storeName,
    websiteUrl: t.websiteUrl,
    logoUrl: t.logoUrl ?? '',
    phoneNumberId: t.phoneNumberId,
    createdAt: t.createdAt,
  });
});

router.put('/settings', async (req: AuthRequest, res: Response) => {
  const { username, storeName, websiteUrl, password, whatsappToken, phoneNumberId, verifyToken, logoUrl } =
    req.body as Record<string, string>;

  const updates: Partial<typeof req.tenant> = {};
  if (username) updates.username = username;
  if (storeName) updates.storeName = storeName;
  if (websiteUrl !== undefined) updates.websiteUrl = websiteUrl;
  if (logoUrl !== undefined) updates.logoUrl = logoUrl;
  if (whatsappToken) updates.whatsappToken = whatsappToken;
  if (phoneNumberId) updates.phoneNumberId = phoneNumberId;
  if (verifyToken) updates.verifyToken = verifyToken;
  if (password) updates.passwordHash = await hashPassword(password);

  const updated = tenantService.update(req.tenant!.id, updates);
  res.json({ ok: true, storeName: updated?.storeName });
});

// ── Catálogo ─────────────────────────────────────────────────────────────────

router.get('/catalog', (req: AuthRequest, res: Response) => {
  res.json(req.tenant!.catalog);
});

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

router.put('/catalog/:id', (req: AuthRequest, res: Response) => {
  const tenant = req.tenant!;
  const existing = tenant.catalog.find((p) => p.id === req.params.id);
  if (!existing) { res.status(404).json({ error: 'Producto no encontrado' }); return; }
  const updated: Product = { ...existing, ...(req.body as Partial<Product>), id: existing.id };
  tenantService.addProduct(tenant.id, updated);
  res.json(updated);
});

router.delete('/catalog/:id', (req: AuthRequest, res: Response) => {
  tenantService.removeProduct(req.tenant!.id, req.params.id);
  res.json({ ok: true });
});

// ── FAQs ─────────────────────────────────────────────────────────────────────

router.get('/faqs', (req: AuthRequest, res: Response) => {
  res.json(req.tenant!.faqs);
});

router.post('/faqs', (req: AuthRequest, res: Response) => {
  const { question, answer } = req.body as Partial<FAQ>;
  if (!question || !answer) {
    res.status(400).json({ error: 'question y answer son requeridos' });
    return;
  }
  const updated = tenantService.addFaq(req.tenant!.id, { question, answer });
  res.status(201).json(updated?.faqs.at(-1));
});

router.delete('/faqs/:id', (req: AuthRequest, res: Response) => {
  tenantService.removeFaq(req.tenant!.id, parseInt(req.params.id, 10));
  res.json({ ok: true });
});

// ── IA / Agente ──────────────────────────────────────────────────────────────

router.get('/ai', (req: AuthRequest, res: Response) => {
  const ai = req.tenant!.ai ?? { enabled: true, model: 'llama3.2:3b', prompt: DEFAULT_PROMPT_TEMPLATE };
  res.json(ai);
});

router.put('/ai', (req: AuthRequest, res: Response) => {
  const { enabled, model, prompt } = req.body as Partial<TenantAI>;
  const current = req.tenant!.ai ?? { enabled: true, model: 'llama3.2:3b', prompt: DEFAULT_PROMPT_TEMPLATE };
  const updated: TenantAI = {
    enabled: enabled ?? current.enabled,
    model: model || current.model,
    prompt: prompt || current.prompt,
  };
  tenantService.update(req.tenant!.id, { ai: updated });
  res.json({ ok: true });
});

// ── Estadísticas ─────────────────────────────────────────────────────────────

router.get('/stats', (req: AuthRequest, res: Response) => {
  res.json(req.tenant!.stats ?? { messages: 0, conversations: 0, leads: 0 });
});

router.post('/stats/reset', (req: AuthRequest, res: Response) => {
  tenantService.update(req.tenant!.id, { stats: { messages: 0, conversations: 0, leads: 0 } });
  res.json({ ok: true });
});

// ── Scraper ───────────────────────────────────────────────────────────────────

router.post('/scrape', async (req: AuthRequest, res: Response) => {
  const url = (req.body as { url?: string }).url || req.tenant!.websiteUrl;
  if (!url) { res.status(400).json({ error: 'URL requerida' }); return; }

  try {
    const products = await scraperService.scrapeUrl(url);
    if (products.length === 0) {
      res.status(422).json({ error: 'No se encontraron productos en la URL indicada' });
      return;
    }
    for (const p of products) {
      tenantService.addProduct(req.tenant!.id, p);
    }
    res.json({ ok: true, added: products.length, products });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: `Error al scrapear: ${msg}` });
  }
});

// ── WhatsApp QR ───────────────────────────────────────────────────────────────

router.get('/whatsapp/status', (req: AuthRequest, res: Response) => {
  res.json({ status: waManager.getStatus(req.tenant!.id) });
});

router.get('/whatsapp/qr', (req: AuthRequest, res: Response) => {
  const qr = waManager.getQR(req.tenant!.id);
  if (!qr) { res.status(404).json({ error: 'QR no disponible' }); return; }
  res.json({ qr });
});

router.post('/whatsapp/connect', (req: AuthRequest, res: Response) => {
  waManager.initClient(req.tenant!);
  res.json({ ok: true, message: 'Iniciando conexión. Espera el QR.' });
});

router.post('/whatsapp/logout', async (req: AuthRequest, res: Response) => {
  await waManager.logoutClient(req.tenant!.id);
  res.json({ ok: true });
});

export default router;
