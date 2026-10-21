import test from 'node:test';
import assert from 'node:assert/strict';
import Database from 'better-sqlite3';
import path from 'path';
import { formatPrice, slugify, generateOrderNumber } from '../src/lib/utils';

const dbPath = path.join(process.cwd(), 'data', 'fatma.db');
const sqlite = new Database(dbPath);

test('FATMA E-Commerce Integrity Tests', async (t) => {
  await t.test('1. Database Tables & Seed Data Verification', () => {
    // Verify categories
    const categories = sqlite.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
    assert.ok(categories.count >= 7, 'Expected at least 7 seeded categories');

    // Verify products
    const products = sqlite.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
    assert.ok(products.count >= 14, 'Expected at least 14 seeded products');

    // Verify variants
    const variants = sqlite.prepare('SELECT COUNT(*) as count FROM product_variants').get() as { count: number };
    assert.ok(variants.count > 20, 'Expected products to have multiple variants');

    // Verify shipping zones
    const zones = sqlite.prepare('SELECT COUNT(*) as count FROM shipping_zones WHERE is_active = 1').get() as { count: number };
    assert.ok(zones.count >= 5, 'Expected active shipping zones');

    // Verify CMS pages
    const pages = sqlite.prepare('SELECT COUNT(*) as count FROM cms_pages WHERE is_published = 1').get() as { count: number };
    assert.ok(pages.count >= 4, 'Expected published CMS policy/faq pages');
  });

  await t.test('2. Currency & Pricing Integrity (Piasters)', () => {
    // 150 EGP = 15,000 piasters
    assert.equal(formatPrice(15000, 'en'), 'EGP 150');
    assert.ok(formatPrice(15000, 'ar').includes('150') || formatPrice(15000, 'ar').includes('١٥٠'));

    // Check all products have prices in piasters (e.g., > 1000)
    const cheapProducts = sqlite.prepare('SELECT COUNT(*) as count FROM products WHERE price < 1000').get() as { count: number };
    assert.equal(cheapProducts.count, 0, 'No product should be under 10 EGP (1000 piasters)');
  });

  await t.test('3. Order & Inventory Transactional Integrity', () => {
    // Pick an active variant with stock
    const variant = sqlite.prepare('SELECT id, product_id, quantity_on_hand FROM product_variants WHERE quantity_on_hand > 5 LIMIT 1').get() as { id: string; product_id: string; quantity_on_hand: number };
    assert.ok(variant, 'Active variant found');

    const initialStock = variant.quantity_on_hand;
    const orderQty = 2;

    // Simulate order placement decrementing stock
    sqlite.transaction(() => {
      sqlite.prepare('UPDATE product_variants SET quantity_on_hand = quantity_on_hand - ? WHERE id = ?').run(orderQty, variant.id);
    })();

    const updatedVariant = sqlite.prepare('SELECT quantity_on_hand FROM product_variants WHERE id = ?').get(variant.id) as { quantity_on_hand: number };
    assert.equal(updatedVariant.quantity_on_hand, initialStock - orderQty, 'Stock must decrement correctly by order quantity');

    // Restore stock
    sqlite.prepare('UPDATE product_variants SET quantity_on_hand = ? WHERE id = ?').run(initialStock, variant.id);
  });

  await t.test('4. Order Number Generation', () => {
    const num1 = generateOrderNumber();
    const num2 = generateOrderNumber();
    assert.ok(num1.startsWith('FM-'), 'Order numbers must start with brand prefix FM-');
    assert.notEqual(num1, num2, 'Order numbers must be unique');
  });

  await t.test('5. Slug Generation', () => {
    const slug = slugify('Classic Linen Shirt 2026!');
    assert.equal(slug, 'classic-linen-shirt-2026');
  });
});
