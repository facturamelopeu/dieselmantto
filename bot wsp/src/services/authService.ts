import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as tenantService from './tenantService';
import config from '../config';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function login(username: string, password: string): Promise<string | null> {
  const tenant = tenantService.findByUsername(username);
  if (!tenant) return null;

  const valid = await bcrypt.compare(password, tenant.passwordHash);
  if (!valid) return null;

  return jwt.sign({ tenantId: tenant.id }, config.jwtSecret, { expiresIn: '7d' });
}

export function verifyToken(token: string): { tenantId: string } | null {
  try {
    return jwt.verify(token, config.jwtSecret) as { tenantId: string };
  } catch {
    return null;
  }
}
