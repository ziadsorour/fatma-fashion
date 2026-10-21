const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');

const db = new Database(path.join(__dirname, '..', 'data', 'fatma.db'));

// 1. Update categories with exact mockup images
const catMap = {
  tops: '/images/mockup-assets/category-tops.jpg',
  sweaters: '/images/mockup-assets/category-sweaters.jpg',
  pants: '/images/mockup-assets/category-pants.jpg',
  dresses: '/images/mockup-assets/category-dresses.jpg',
  sets: '/images/mockup-assets/category-sets.jpg',
  outerwear: '/images/mockup-assets/category-outerwear.jpg',
  accessories: '/images/mockup-assets/category-accessories.jpg',
};

for (const [slug, img] of Object.entries(catMap)) {
  db.prepare('UPDATE categories SET image_url = ? WHERE slug = ?').run(img, slug);
}
console.log('Categories updated with exact mockup images.');

// 2. Add or update the 3 featured products from the mockup
const featuredProducts = [
  {
    slug: 'striped-knit-sweater',
    name_en: 'Striped Knit Sweater',
    name_ar: 'سويتر تريكو مخطط',
    price: 65000, // 650 EGP
    catSlug: 'sweaters',
    sku: 'FM-SWEATER-STRIPED',
    image: '/images/mockup-assets/product-striped-sweater.jpg',
  },
  {
    slug: 'cozy-set',
    name_en: 'Cozy Set',
    name_ar: 'طقم كوزي وردي',
    price: 85000, // 850 EGP
    catSlug: 'sets',
    sku: 'FM-SET-COZY-PINK',
    image: '/images/mockup-assets/product-cozy-set.jpg',
  },
  {
    slug: 'little-black-dress',
    name_en: 'Little Black Dress',
    name_ar: 'فستان أسود قصير',
    price: 75000, // 750 EGP
    catSlug: 'dresses',
    sku: 'FM-DRESS-LBD',
    image: '/images/mockup-assets/product-black-dress.jpg',
  },
];

const now = Math.floor(Date.now() / 1000);

for (const p of featuredProducts) {
  const cat = db.prepare('SELECT id FROM categories WHERE slug = ?').get(p.catSlug);
  const existing = db.prepare('SELECT id FROM products WHERE slug = ?').get(p.slug);

  let prodId = existing?.id;
  if (!existing) {
    prodId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO products (id, name_ar, name_en, slug, description_ar, description_en, sku, category_id, price, status, is_featured, is_bestseller, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', 1, 1, ?, ?)
    `).run(
      prodId, p.name_ar, p.name_en, p.slug,
      'قطعة أنيقة وعصرية تناسب مختلف الإطلالات اليومية.',
      'Chic and trendy piece suitable for everyday comfortable style.',
      p.sku, cat ? cat.id : null, p.price, now, now
    );

    // Add variant
    const variantId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO product_variants (id, product_id, sku, size, color_name_ar, color_name_en, color_hex, quantity_on_hand, quantity_reserved, low_stock_threshold, is_active, created_at, updated_at)
      VALUES (?, ?, ?, 'M', 'أصلي', 'Original', '#C5A880', 25, 0, 5, 1, ?, ?)
    `).run(variantId, prodId, `${p.sku}-M`, now, now);
  } else {
    db.prepare(`
      UPDATE products SET name_en = ?, name_ar = ?, price = ?, is_featured = 1, is_bestseller = 1, status = 'published' WHERE id = ?
    `).run(p.name_en, p.name_ar, p.price, prodId);
  }

  // Update primary image
  db.prepare('DELETE FROM product_images WHERE product_id = ?').run(prodId);
  db.prepare(`
    INSERT INTO product_images (id, product_id, url, alt_text_ar, alt_text_en, display_order, is_primary, created_at)
    VALUES (?, ?, ?, ?, ?, 0, 1, ?)
  `).run(crypto.randomUUID(), prodId, p.image, p.name_ar, p.name_en, now);
}

console.log('Synchronized 3 featured products with exact mockup data.');
