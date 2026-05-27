import axios from 'axios';
import * as cheerio from 'cheerio';
import { Product } from '../types';

const PRODUCT_SELECTORS = [
  { name: '.product-title, .product-name, h2.woocommerce-loop-product__title, .product_title', desc: '.product-description, .woocommerce-product-details__short-description, .product-short-description', price: '.price, .woocommerce-Price-amount' },
  { name: 'h2, h3', desc: 'p', price: '.price, [class*="price"]' },
];

function clean(str: string): string {
  return str.replace(/\s+/g, ' ').trim().slice(0, 200);
}

function extractKeywords(name: string, category: string): string[] {
  return [...new Set([...name.toLowerCase().split(/\s+/), category.toLowerCase()])]
    .filter((w) => w.length > 2);
}

function guessCategory(name: string, desc: string): string {
  const text = (name + ' ' + desc).toLowerCase();
  if (/gps|rastr|tracker|flota/.test(text)) return 'GPS y Rastreo';
  if (/c[aá]m[ae]ra|video|dashcam|cctv/.test(text)) return 'Cámaras y Video';
  if (/diagnos|scanner|ecu|obd|j1939|nexiq|vocom/.test(text)) return 'Software ECU Diesel';
  if (/llanta|neum[aá]tico|tpms|presi[oó]n/.test(text)) return 'Monitoreo de Llantas';
  if (/combustible|diesel|sensor|telemetr/.test(text)) return 'Control de Combustible';
  if (/laptop|computadora|pc|notebook/.test(text)) return 'Laptop';
  if (/seguridad|minera|acceso|biom/.test(text)) return 'Seguridad Minera';
  return 'General';
}

export async function scrapeUrl(url: string): Promise<Product[]> {
  const { data: html } = await axios.get(url, {
    timeout: 20000,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WhatsAppBot/1.0)' },
  });

  const $ = cheerio.load(html);
  const products: Product[] = [];
  const seen = new Set<string>();

  // Try WooCommerce / common e-commerce patterns
  const productEls = $('[class*="product"], [class*="item"], article').slice(0, 40);

  productEls.each((_, el) => {
    const nameEl = $(el).find('h2, h3, [class*="title"], [class*="name"]').first();
    const name = clean(nameEl.text());
    if (!name || name.length < 3 || seen.has(name)) return;

    const desc = clean($(el).find('p, [class*="desc"], [class*="short"]').first().text()) || name;
    const price = clean($(el).find('[class*="price"], .amount').first().text());
    const category = guessCategory(name, desc);

    seen.add(name);
    products.push({
      id: `scraped-${Date.now()}-${products.length}`,
      name,
      category,
      description: desc,
      price: price || undefined,
      keywords: extractKeywords(name, category),
      source: 'scraped',
    });
  });

  // Fallback: grab all headings as product names if no products found
  if (products.length === 0) {
    $('h2, h3').slice(0, 20).each((_, el) => {
      const name = clean($(el).text());
      if (!name || name.length < 3 || seen.has(name)) return;
      const desc = clean($(el).next('p').text()) || name;
      const category = guessCategory(name, desc);
      seen.add(name);
      products.push({
        id: `scraped-${Date.now()}-${products.length}`,
        name,
        category,
        description: desc,
        keywords: extractKeywords(name, category),
        source: 'scraped',
      });
    });
  }

  return products.slice(0, 30);
}
