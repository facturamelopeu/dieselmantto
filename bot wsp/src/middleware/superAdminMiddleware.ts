import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';

export interface SuperAdminRequest extends Request {
  isSuperAdmin?: boolean;
}

export function superAdminMiddleware(req: SuperAdminRequest, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token requerido' });
    return;
  }
  try {
    const payload = jwt.verify(auth.slice(7), config.jwtSecret) as { role?: string };
    if (payload.role !== 'superadmin') {
      res.status(403).json({ error: 'Acceso denegado' });
      return;
    }
    req.isSuperAdmin = true;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}
