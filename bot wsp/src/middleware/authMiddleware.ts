import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/authService';
import * as tenantService from '../services/tenantService';
import { Tenant } from '../types';

export interface AuthRequest extends Request {
  tenant?: Tenant;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const queryToken = req.query.token as string | undefined;
  const rawToken = header?.startsWith('Bearer ') ? header.slice(7) : queryToken;
  if (!rawToken) {
    res.status(401).json({ error: 'Token requerido' });
    return;
  }

  const payload = verifyToken(rawToken);
  if (!payload) {
    res.status(401).json({ error: 'Token inválido o expirado' });
    return;
  }

  const tenant = tenantService.findById(payload.tenantId);
  if (!tenant) {
    res.status(401).json({ error: 'Cuenta no encontrada' });
    return;
  }

  const sub = tenant.subscription;
  if (sub) {
    const expired = new Date(sub.expiresAt) < new Date();
    if (sub.status === 'suspended' || (sub.status !== 'trial' && expired)) {
      res.status(402).json({ error: 'Suscripción inactiva. Contacta al administrador.' });
      return;
    }
  }

  req.tenant = tenant;
  next();
}
