import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { login, hashPassword } from '../services/authService';
import * as tenantService from '../services/tenantService';
import config from '../config';

const router = Router();

// POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) {
    res.status(400).json({ error: 'usuario y contraseña requeridos' });
    return;
  }

  const token = await login(username, password);
  if (!token) {
    res.status(401).json({ error: 'Credenciales incorrectas' });
    return;
  }

  const tenant = tenantService.findByUsername(username)!;
  res.json({ token, storeName: tenant.storeName, id: tenant.id });
});

// POST /auth/register  (protegido por SUPER_ADMIN_TOKEN)
router.post('/register', async (req: Request, res: Response) => {
  const adminToken = req.headers['x-admin-token'];
  if (adminToken !== config.superAdminToken) {
    res.status(403).json({ error: 'No autorizado' });
    return;
  }

  const { username, password, storeName, whatsappToken, phoneNumberId, verifyToken, websiteUrl } =
    req.body as Record<string, string>;

  if (!username || !password || !storeName || !whatsappToken || !phoneNumberId || !verifyToken) {
    res.status(400).json({ error: 'Faltan campos requeridos: username, password, storeName, whatsappToken, phoneNumberId, verifyToken' });
    return;
  }

  if (tenantService.findByUsername(username)) {
    res.status(409).json({ error: 'El usuario ya existe' });
    return;
  }

  const passwordHash = await hashPassword(password);
  const tenant = tenantService.create({
    username,
    passwordHash,
    storeName,
    websiteUrl: websiteUrl || '',
    whatsappToken,
    phoneNumberId,
    verifyToken,
    catalog: [],
    faqs: [],
  });

  res.status(201).json({ id: tenant.id, username: tenant.username, storeName: tenant.storeName });
});

// POST /auth/superadmin/login
router.post('/superadmin/login', (req: Request, res: Response) => {
  const { token: adminToken } = req.body as { token?: string };
  if (!adminToken || adminToken !== config.superAdminToken) {
    res.status(401).json({ error: 'Token incorrecto' });
    return;
  }
  const token = jwt.sign({ role: 'superadmin' }, config.jwtSecret, { expiresIn: '12h' });
  res.json({ token });
});

export default router;
