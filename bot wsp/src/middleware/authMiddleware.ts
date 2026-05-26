import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/authService';
import * as tenantService from '../services/tenantService';
import { Tenant } from '../types';

export interface AuthRequest extends Request {
  tenant?: Tenant;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token requerido' });
    return;
  }

  const payload = verifyToken(header.slice(7));
  if (!payload) {
    res.status(401).json({ error: 'Token inválido o expirado' });
    return;
  }

  const tenant = tenantService.findById(payload.tenantId);
  if (!tenant) {
    res.status(401).json({ error: 'Cuenta no encontrada' });
    return;
  }

  req.tenant = tenant;
  next();
}
