import * as tenantService from './tenantService';

// In-memory set of unique users per tenant (resets on restart, total is persisted)
const seen = new Map<string, Set<string>>();

export function trackMessage(tenantId: string, from: string): void {
  if (!seen.has(tenantId)) seen.set(tenantId, new Set());
  const users = seen.get(tenantId)!;
  const isNew = !users.has(from);
  users.add(from);

  const tenant = tenantService.findById(tenantId);
  if (!tenant) return;

  const stats = tenant.stats ?? { messages: 0, conversations: 0, leads: 0 };
  stats.messages += 1;
  if (isNew) stats.conversations += 1;
  tenantService.update(tenantId, { stats });
}

export function trackLead(tenantId: string): void {
  const tenant = tenantService.findById(tenantId);
  if (!tenant) return;
  const stats = tenant.stats ?? { messages: 0, conversations: 0, leads: 0 };
  stats.leads += 1;
  tenantService.update(tenantId, { stats });
}
