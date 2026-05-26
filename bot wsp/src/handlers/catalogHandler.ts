import { Tenant } from '../types';
import { sendTextMessage, sendInteractiveList, sendInteractiveButtons } from '../services/whatsappClient';
import { sendMainMenu } from './menuHandler';

function getCategories(tenant: Tenant): string[] {
  return [...new Set(tenant.catalog.map((p) => p.category))];
}

export async function sendCategoryList(tenant: Tenant, to: string): Promise<void> {
  if (tenant.catalog.length === 0) {
    await sendTextMessage(tenant, to, 'El catálogo está vacío. Escribe tu consulta y te ayudo.');
    return;
  }

  const categories = getCategories(tenant);
  const rows = categories.map((cat, i) => ({
    id: `cat_${i}`,
    title: cat.length > 24 ? cat.slice(0, 21) + '...' : cat,
    description: `${tenant.catalog.filter((p) => p.category === cat).length} producto(s)`,
  }));

  await sendInteractiveList(tenant, to, 'Catálogo de Productos', 'Selecciona una categoría:', 'Ver categorías', [
    { title: 'Categorías', rows },
  ]);
}

export async function handleCategorySelection(tenant: Tenant, to: string, selectionId: string): Promise<void> {
  const index = parseInt(selectionId.replace('cat_', ''), 10);
  const category = getCategories(tenant)[index];
  if (!category) { await sendTextMessage(tenant, to, 'Categoría no encontrada.'); return; }

  const products = tenant.catalog.filter((p) => p.category === category);
  const rows = products.map((p) => ({
    id: `prod_${p.id}`,
    title: p.name.length > 24 ? p.name.slice(0, 21) + '...' : p.name,
    description: p.price ? `Precio: ${p.price}` : '',
  }));

  await sendInteractiveList(tenant, to, category, `Productos en *${category}*:`, 'Ver productos', [
    { title: category, rows },
  ]);
}

export async function handleProductSelection(tenant: Tenant, to: string, selectionId: string): Promise<void> {
  const productId = selectionId.replace('prod_', '');
  const product = tenant.catalog.find((p) => p.id === productId);

  if (!product) { await sendTextMessage(tenant, to, 'Producto no encontrado.'); return; }

  const detail =
    `*${product.name}*\n\n` +
    `📂 Categoría: ${product.category}\n\n` +
    `📋 ${product.description}\n\n` +
    (product.price ? `💰 Precio: ${product.price}\n\n` : '') +
    '¿Te interesa? Escríbenos y un asesor te contacta.';

  await sendTextMessage(tenant, to, detail);
  await sendInteractiveButtons(tenant, to, '¿Qué deseas hacer?', [
    { id: 'menu_catalogo', title: 'Ver mas productos' },
    { id: 'menu_recomendar', title: 'Otra consulta' },
    { id: 'asesor', title: 'Hablar con asesor' },
  ]);
}
