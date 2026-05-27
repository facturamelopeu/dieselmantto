import { Router, Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import * as chatService from '../services/chatService';
import type { MediaType } from '../services/chatService';
import * as waManager from '../services/waClientManager';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/', 'audio/', 'video/', 'application/pdf',
      'application/msword', 'application/vnd.openxmlformats'];
    if (allowed.some(t => file.mimetype.startsWith(t))) cb(null, true);
    else cb(new Error('Tipo de archivo no permitido') as unknown as null, false);
  },
});

const router = Router();
router.use(authMiddleware);

// SSE stream — token via query param: GET /admin/chat/stream?token=xxx
router.get('/stream', (req: AuthRequest, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const tenantId = req.tenant!.id;
  chatService.addSseClient(tenantId, res);

  const convs = chatService.getConversations(tenantId);
  res.write(`data: ${JSON.stringify({ type: 'init', conversations: convs })}\n\n`);

  req.on('close', () => {
    chatService.removeSseClient(tenantId, res);
  });
});

router.get('/conversations', (req: AuthRequest, res: Response) => {
  res.json(chatService.getConversations(req.tenant!.id));
});

router.get('/messages/:phone', (req: AuthRequest, res: Response) => {
  res.json(chatService.getMessages(req.tenant!.id, req.params.phone));
});

router.post('/read/:phone', (req: AuthRequest, res: Response) => {
  chatService.markRead(req.tenant!.id, req.params.phone);
  res.json({ ok: true });
});

router.post('/reply', async (req: AuthRequest, res: Response) => {
  const { phone, text } = req.body as { phone?: string; text?: string };
  if (!phone || !text) {
    res.status(400).json({ error: 'phone y text son requeridos' });
    return;
  }
  const tenantId = req.tenant!.id;
  try {
    await waManager.sendText(tenantId, phone, text);
    chatService.addMessage(tenantId, phone, { text, direction: 'out', ts: Date.now() });
    res.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
});

router.post('/bot/:phone', (req: AuthRequest, res: Response) => {
  const { enabled } = req.body as { enabled?: boolean };
  if (enabled === undefined) {
    res.status(400).json({ error: 'enabled es requerido' });
    return;
  }
  chatService.setBotEnabled(req.tenant!.id, req.params.phone, enabled);
  res.json({ ok: true });
});

router.post('/assign/:phone', (req: AuthRequest, res: Response) => {
  const { seller } = req.body as { seller?: string | null };
  chatService.assignConversation(req.tenant!.id, req.params.phone, seller ?? null);
  res.json({ ok: true });
});

// POST /admin/chat/send-media/:phone — send image, document or audio
router.post('/send-media/:phone', upload.single('file'), async (req: AuthRequest, res: Response) => {
  const { phone } = req.params;
  const caption = (req.body as { caption?: string }).caption?.trim() || '';
  if (!req.file) { res.status(400).json({ error: 'No se recibió archivo' }); return; }

  const tenantId = req.tenant!.id;
  const { mimetype, originalname, buffer } = req.file;

  // Persist file so the chat panel can display it
  const uploadsDir = path.join(__dirname, '../../public/uploads/chat', tenantId);
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  const safeFilename = `out-${Date.now()}-${originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  fs.writeFileSync(path.join(uploadsDir, safeFilename), buffer);
  const mediaUrl = `/uploads/chat/${tenantId}/${safeFilename}`;

  let mediaType: MediaType;
  if (mimetype.startsWith('image/')) mediaType = 'image';
  else if (mimetype.startsWith('audio/')) mediaType = 'audio';
  else if (mimetype.startsWith('video/')) mediaType = 'video';
  else mediaType = 'document';

  try {
    await waManager.sendMedia(tenantId, phone, buffer, mimetype, originalname, caption || undefined);
    chatService.addMessage(tenantId, phone, {
      text: caption,
      direction: 'out',
      ts: Date.now(),
      mediaType,
      mediaUrl,
      mediaName: originalname,
    });
    res.json({ ok: true, mediaUrl });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
});

export default router;
