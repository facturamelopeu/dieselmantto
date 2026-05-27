import fs from 'fs';
import path from 'path';
import { Tenant, Product, FAQ } from '../types';

const DB_PATH = path.join(__dirname, '../../data/tenants.json');

function load(): Tenant[] {
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw) as Tenant[];
}

function save(tenants: Tenant[]): void {
  fs.writeFileSync(DB_PATH, JSON.stringify(tenants, null, 2), 'utf-8');
}

export function getAll(): Tenant[] {
  return load();
}

export function findById(id: string): Tenant | undefined {
  return load().find((t) => t.id === id);
}

export function findByPhoneNumberId(phoneNumberId: string): Tenant | undefined {
  return load().find((t) => t.phoneNumberId === phoneNumberId);
}

export function findByUsername(username: string): Tenant | undefined {
  return load().find((t) => t.username.toLowerCase() === username.toLowerCase());
}

export function findByVerifyToken(token: string): Tenant | undefined {
  return load().find((t) => t.verifyToken === token);
}

export function create(data: Omit<Tenant, 'id' | 'createdAt'>): Tenant {
  const tenants = load();
  const tenant: Tenant = {
    ...data,
    id: `tenant-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  tenants.push(tenant);
  save(tenants);
  return tenant;
}

export function update(id: string, updates: Partial<Omit<Tenant, 'id' | 'createdAt'>>): Tenant | null {
  const tenants = load();
  const idx = tenants.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  tenants[idx] = { ...tenants[idx], ...updates };
  save(tenants);
  return tenants[idx];
}

export function remove(id: string): boolean {
  const tenants = load();
  const filtered = tenants.filter((t) => t.id !== id);
  if (filtered.length === tenants.length) return false;
  save(filtered);
  return true;
}

// Catalog helpers
export function addProduct(tenantId: string, product: Product): Tenant | null {
  const tenant = findById(tenantId);
  if (!tenant) return null;
  const catalog = [...tenant.catalog.filter((p) => p.id !== product.id), product];
  return update(tenantId, { catalog });
}

export function removeProduct(tenantId: string, productId: string): Tenant | null {
  const tenant = findById(tenantId);
  if (!tenant) return null;
  return update(tenantId, { catalog: tenant.catalog.filter((p) => p.id !== productId) });
}

// FAQ helpers
export function addFaq(tenantId: string, faq: Omit<FAQ, 'id'>): Tenant | null {
  const tenant = findById(tenantId);
  if (!tenant) return null;
  const nextId = tenant.faqs.length > 0 ? Math.max(...tenant.faqs.map((f) => f.id)) + 1 : 1;
  const faqs = [...tenant.faqs, { ...faq, id: nextId }];
  return update(tenantId, { faqs });
}

export function removeFaq(tenantId: string, faqId: number): Tenant | null {
  const tenant = findById(tenantId);
  if (!tenant) return null;
  return update(tenantId, { faqs: tenant.faqs.filter((f) => f.id !== faqId) });
}
