import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import * as chatService from '../services/chatService';
import * as waManager from '../services/waClientManager';

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

export default router;
