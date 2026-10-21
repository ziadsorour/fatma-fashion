/**
 * FATMA Fashion E-Commerce Platform — Database Seed
 *
 * Seeds demo data for development / preview.
 * Run with: npx tsx src/lib/db/seed.ts
 *
 * ⚠ Does NOT seed admin users — use the secure setup flow instead.
 */

import { randomUUID } from 'crypto';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { sql } from 'drizzle-orm';
import path from 'path';
import fs from 'fs';
import * as schema from './schema';

// ─── database path ──────────────────────────────────────────────────────────
const DB_PATH =
  process.env.DATABASE_URL || path.join(process.cwd(), 'data', 'fatma.db');
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sqlite = new Database(DB_PATH);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');
sqlite.pragma('busy_timeout = 5000');

const db = drizzle(sqlite, { schema });

// ─── helpers ────────────────────────────────────────────────────────────────
const uuid = () => randomUUID();
const now = () => Math.floor(Date.now() / 1000);
/** Convert EGP to piasters */
const egp = (pounds: number) => Math.round(pounds * 100);

// ─── create tables via raw SQL (drizzle push equivalent) ────────────────────
function createTables() {
  console.log('📦  Creating tables …');

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'customer',
      email_verified INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users(email);
    CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);
    CREATE INDEX IF NOT EXISTS users_phone_idx ON users(phone);

    CREATE TABLE IF NOT EXISTS customer_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      phone TEXT,
      default_address_id TEXT,
      lifetime_spent INTEGER NOT NULL DEFAULT 0,
      order_count INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS cp_user_id_idx ON customer_profiles(user_id);

    CREATE TABLE IF NOT EXISTS addresses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      label TEXT,
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      governorate TEXT NOT NULL,
      city TEXT NOT NULL,
      address_line1 TEXT NOT NULL,
      address_line2 TEXT,
      building_info TEXT,
      delivery_instructions TEXT,
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS addr_user_id_idx ON addresses(user_id);

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name_ar TEXT NOT NULL,
      name_en TEXT NOT NULL,
      slug TEXT NOT NULL,
      description_ar TEXT,
      description_en TEXT,
      image_url TEXT,
      parent_id TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      is_visible INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS cat_slug_idx ON categories(slug);
    CREATE INDEX IF NOT EXISTS cat_parent_idx ON categories(parent_id);
    CREATE INDEX IF NOT EXISTS cat_order_idx ON categories(display_order);

    CREATE TABLE IF NOT EXISTS collections (
      id TEXT PRIMARY KEY,
      name_ar TEXT NOT NULL,
      name_en TEXT NOT NULL,
      slug TEXT NOT NULL,
      description_ar TEXT,
      description_en TEXT,
      image_url TEXT,
      banner_url TEXT,
      type TEXT NOT NULL DEFAULT 'manual',
      is_visible INTEGER NOT NULL DEFAULT 1,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS coll_slug_idx ON collections(slug);
    CREATE INDEX IF NOT EXISTS coll_order_idx ON collections(display_order);

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name_ar TEXT NOT NULL,
      name_en TEXT NOT NULL,
      slug TEXT NOT NULL,
      description_ar TEXT,
      description_en TEXT,
      sku TEXT NOT NULL,
      category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
      price INTEGER NOT NULL,
      sale_price INTEGER,
      cost_price INTEGER,
      status TEXT NOT NULL DEFAULT 'draft',
      is_featured INTEGER NOT NULL DEFAULT 0,
      is_bestseller INTEGER NOT NULL DEFAULT 0,
      tags TEXT,
      seo_title_ar TEXT,
      seo_title_en TEXT,
      seo_description_ar TEXT,
      seo_description_en TEXT,
      published_at INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS prod_slug_idx ON products(slug);
    CREATE UNIQUE INDEX IF NOT EXISTS prod_sku_idx ON products(sku);
    CREATE INDEX IF NOT EXISTS prod_category_idx ON products(category_id);
    CREATE INDEX IF NOT EXISTS prod_status_idx ON products(status);
    CREATE INDEX IF NOT EXISTS prod_featured_idx ON products(is_featured);
    CREATE INDEX IF NOT EXISTS prod_bestseller_idx ON products(is_bestseller);
    CREATE INDEX IF NOT EXISTS prod_created_idx ON products(created_at);

    CREATE TABLE IF NOT EXISTS collection_products (
      collection_id TEXT NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      display_order INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (collection_id, product_id)
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      alt_text_ar TEXT,
      alt_text_en TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      is_primary INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS pi_product_idx ON product_images(product_id);
    CREATE INDEX IF NOT EXISTS pi_order_idx ON product_images(display_order);

    CREATE TABLE IF NOT EXISTS product_variants (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      sku TEXT NOT NULL,
      size TEXT,
      color_name_ar TEXT,
      color_name_en TEXT,
      color_hex TEXT,
      price_override INTEGER,
      quantity_on_hand INTEGER NOT NULL DEFAULT 0,
      quantity_reserved INTEGER NOT NULL DEFAULT 0,
      low_stock_threshold INTEGER NOT NULL DEFAULT 5,
      barcode TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS pv_sku_idx ON product_variants(sku);
    CREATE INDEX IF NOT EXISTS pv_product_idx ON product_variants(product_id);
    CREATE INDEX IF NOT EXISTS pv_barcode_idx ON product_variants(barcode);

    CREATE TABLE IF NOT EXISTS inventory_movements (
      id TEXT PRIMARY KEY,
      variant_id TEXT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      reference_type TEXT,
      reference_id TEXT,
      notes TEXT,
      created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS im_variant_idx ON inventory_movements(variant_id);
    CREATE INDEX IF NOT EXISTS im_type_idx ON inventory_movements(type);
    CREATE INDEX IF NOT EXISTS im_ref_idx ON inventory_movements(reference_type, reference_id);
    CREATE INDEX IF NOT EXISTS im_created_idx ON inventory_movements(created_at);

    CREATE TABLE IF NOT EXISTS carts (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      session_id TEXT,
      coupon_code TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS cart_user_idx ON carts(user_id);
    CREATE INDEX IF NOT EXISTS cart_session_idx ON carts(session_id);

    CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY,
      cart_id TEXT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
      variant_id TEXT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS ci_cart_idx ON cart_items(cart_id);
    CREATE INDEX IF NOT EXISTS ci_variant_idx ON cart_items(variant_id);

    CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      type TEXT NOT NULL,
      value INTEGER NOT NULL,
      min_order_value INTEGER,
      max_discount INTEGER,
      start_date INTEGER,
      end_date INTEGER,
      total_limit INTEGER,
      per_customer_limit INTEGER NOT NULL DEFAULT 1,
      usage_count INTEGER NOT NULL DEFAULT 0,
      applies_to_products TEXT,
      applies_to_categories TEXT,
      new_customers_only INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS coup_code_idx ON coupons(code);
    CREATE INDEX IF NOT EXISTS coup_active_idx ON coupons(is_active);

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT NOT NULL,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      guest_email TEXT,
      guest_phone TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      payment_status TEXT NOT NULL DEFAULT 'pending',
      payment_method TEXT,
      subtotal INTEGER NOT NULL DEFAULT 0,
      discount_amount INTEGER NOT NULL DEFAULT 0,
      shipping_fee INTEGER NOT NULL DEFAULT 0,
      tax_amount INTEGER NOT NULL DEFAULT 0,
      total INTEGER NOT NULL DEFAULT 0,
      coupon_id TEXT REFERENCES coupons(id) ON DELETE SET NULL,
      customer_name TEXT,
      customer_phone TEXT,
      customer_email TEXT,
      shipping_governorate TEXT,
      shipping_city TEXT,
      shipping_address TEXT,
      shipping_building TEXT,
      shipping_instructions TEXT,
      shipping_method TEXT,
      tracking_number TEXT,
      estimated_delivery TEXT,
      internal_notes TEXT,
      customer_notes TEXT,
      cancellation_reason TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS ord_number_idx ON orders(order_number);
    CREATE INDEX IF NOT EXISTS ord_user_idx ON orders(user_id);
    CREATE INDEX IF NOT EXISTS ord_status_idx ON orders(status);
    CREATE INDEX IF NOT EXISTS ord_pay_status_idx ON orders(payment_status);
    CREATE INDEX IF NOT EXISTS ord_created_idx ON orders(created_at);
    CREATE INDEX IF NOT EXISTS ord_guest_email_idx ON orders(guest_email);
    CREATE INDEX IF NOT EXISTS ord_guest_phone_idx ON orders(guest_phone);

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id),
      variant_id TEXT NOT NULL REFERENCES product_variants(id),
      product_name_snapshot TEXT,
      sku_snapshot TEXT,
      variant_info_snapshot TEXT,
      unit_price INTEGER NOT NULL,
      discount INTEGER NOT NULL DEFAULT 0,
      quantity INTEGER NOT NULL,
      total INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS oi_order_idx ON order_items(order_id);
    CREATE INDEX IF NOT EXISTS oi_product_idx ON order_items(product_id);
    CREATE INDEX IF NOT EXISTS oi_variant_idx ON order_items(variant_id);

    CREATE TABLE IF NOT EXISTS order_status_history (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      old_status TEXT,
      new_status TEXT NOT NULL,
      changed_by TEXT REFERENCES users(id) ON DELETE SET NULL,
      reason TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS osh_order_idx ON order_status_history(order_id);
    CREATE INDEX IF NOT EXISTS osh_created_idx ON order_status_history(created_at);

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      method TEXT,
      provider TEXT,
      provider_transaction_id TEXT,
      amount INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      provider_response TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS pay_order_idx ON payments(order_id);
    CREATE INDEX IF NOT EXISTS pay_status_idx ON payments(status);

    CREATE TABLE IF NOT EXISTS coupon_redemptions (
      id TEXT PRIMARY KEY,
      coupon_id TEXT NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
      order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      discount_amount INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS cr_coupon_idx ON coupon_redemptions(coupon_id);
    CREATE INDEX IF NOT EXISTS cr_order_idx ON coupon_redemptions(order_id);
    CREATE INDEX IF NOT EXISTS cr_user_idx ON coupon_redemptions(user_id);

    CREATE TABLE IF NOT EXISTS shipping_zones (
      id TEXT PRIMARY KEY,
      name_ar TEXT NOT NULL,
      name_en TEXT NOT NULL,
      governorates TEXT NOT NULL,
      shipping_fee INTEGER NOT NULL,
      free_shipping_threshold INTEGER,
      estimated_days_min INTEGER NOT NULL,
      estimated_days_max INTEGER NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS sz_active_idx ON shipping_zones(is_active);

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL,
      title TEXT,
      comment TEXT,
      is_approved INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS rev_product_idx ON reviews(product_id);
    CREATE INDEX IF NOT EXISTS rev_user_idx ON reviews(user_id);
    CREATE INDEX IF NOT EXISTS rev_approved_idx ON reviews(is_approved);

    CREATE TABLE IF NOT EXISTS wishlists (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      created_at INTEGER NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS wl_user_product_idx ON wishlists(user_id, product_id);

    CREATE TABLE IF NOT EXISTS cms_sections (
      id TEXT PRIMARY KEY,
      page TEXT NOT NULL,
      section_type TEXT NOT NULL,
      title_ar TEXT,
      title_en TEXT,
      subtitle_ar TEXT,
      subtitle_en TEXT,
      content TEXT,
      image_url TEXT,
      link_url TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      is_visible INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS cms_page_idx ON cms_sections(page);
    CREATE INDEX IF NOT EXISTS cms_order_idx ON cms_sections(page, display_order);

    CREATE TABLE IF NOT EXISTS cms_pages (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL,
      title_ar TEXT NOT NULL,
      title_en TEXT NOT NULL,
      content_ar TEXT,
      content_en TEXT,
      seo_title_ar TEXT,
      seo_title_en TEXT,
      seo_description_ar TEXT,
      seo_description_en TEXT,
      is_published INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS cmsp_slug_idx ON cms_pages(slug);

    CREATE TABLE IF NOT EXISTS notification_templates (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      subject_ar TEXT,
      subject_en TEXT,
      body_ar TEXT,
      body_en TEXT,
      channels TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS nt_event_idx ON notification_templates(event_type);

    CREATE TABLE IF NOT EXISTS notification_logs (
      id TEXT PRIMARY KEY,
      template_id TEXT REFERENCES notification_templates(id) ON DELETE SET NULL,
      recipient TEXT NOT NULL,
      channel TEXT NOT NULL,
      subject TEXT,
      body TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      error TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS nl_template_idx ON notification_logs(template_id);
    CREATE INDEX IF NOT EXISTS nl_status_idx ON notification_logs(status);
    CREATE INDEX IF NOT EXISTS nl_created_idx ON notification_logs(created_at);

    CREATE TABLE IF NOT EXISTS audit_log (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      old_values TEXT,
      new_values TEXT,
      ip_address TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS al_user_idx ON audit_log(user_id);
    CREATE INDEX IF NOT EXISTS al_entity_idx ON audit_log(entity_type, entity_id);
    CREATE INDEX IF NOT EXISTS al_created_idx ON audit_log(created_at);

    CREATE TABLE IF NOT EXISTS store_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS recently_viewed (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      session_id TEXT,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      viewed_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS rv_user_idx ON recently_viewed(user_id);
    CREATE INDEX IF NOT EXISTS rv_session_idx ON recently_viewed(session_id);
    CREATE INDEX IF NOT EXISTS rv_product_idx ON recently_viewed(product_id);
    CREATE INDEX IF NOT EXISTS rv_viewed_idx ON recently_viewed(viewed_at);
  `);

  console.log('✅  All tables created.');
}

// ═══════════════════════════════════════════════════════════════════════════
// SEED DATA
// ═══════════════════════════════════════════════════════════════════════════

function seedCategories() {
  console.log('🏷️   Seeding categories …');

  const cats = [
    { nameAr: 'توبات', nameEn: 'Tops', slug: 'tops', order: 1, descAr: 'تشكيلة واسعة من التوبات العصرية', descEn: 'Wide selection of trendy tops' },
    { nameAr: 'سويت شيرت', nameEn: 'Sweaters', slug: 'sweaters', order: 2, descAr: 'سويت شيرت دافئة وأنيقة', descEn: 'Warm and stylish sweaters' },
    { nameAr: 'بناطيل', nameEn: 'Pants', slug: 'pants', order: 3, descAr: 'بناطيل مريحة وعصرية', descEn: 'Comfortable and fashionable pants' },
    { nameAr: 'فساتين', nameEn: 'Dresses', slug: 'dresses', order: 4, descAr: 'فساتين لكل المناسبات', descEn: 'Dresses for every occasion' },
    { nameAr: 'أطقم', nameEn: 'Sets', slug: 'sets', order: 5, descAr: 'أطقم متكاملة وأنيقة', descEn: 'Complete and elegant sets' },
    { nameAr: 'جواكت', nameEn: 'Outerwear', slug: 'outerwear', order: 6, descAr: 'جواكت وملابس خارجية', descEn: 'Jackets and outerwear' },
    { nameAr: 'إكسسوارات', nameEn: 'Accessories', slug: 'accessories', order: 7, descAr: 'إكسسوارات مميزة', descEn: 'Distinctive accessories' },
  ];

  const ids: Record<string, string> = {};

  for (const cat of cats) {
    const id = uuid();
    ids[cat.slug] = id;
    db.insert(schema.categories).values({
      id,
      nameAr: cat.nameAr,
      nameEn: cat.nameEn,
      slug: cat.slug,
      descriptionAr: cat.descAr,
      descriptionEn: cat.descEn,
      displayOrder: cat.order,
      isVisible: 1,
      createdAt: now(),
      updatedAt: now(),
    }).run();
  }

  console.log(`   → ${cats.length} categories created.`);
  return ids;
}

function seedProducts(catIds: Record<string, string>) {
  console.log('👗  Seeding products …');

  const ts = now();

  interface DemoProduct {
    nameAr: string;
    nameEn: string;
    slug: string;
    sku: string;
    cat: string;
    price: number;
    salePrice?: number;
    costPrice: number;
    featured?: boolean;
    bestseller?: boolean;
    descAr: string;
    descEn: string;
    tags: string;
    colors: { ar: string; en: string; hex: string }[];
  }

  const demoProducts: DemoProduct[] = [
    // ── Tops (3) ──
    {
      nameAr: 'بلوزة قطنية كلاسيكية', nameEn: 'Classic Cotton Blouse', slug: 'classic-cotton-blouse',
      sku: 'FTM-TOP-001', cat: 'tops', price: 349, costPrice: 150, featured: true,
      descAr: 'بلوزة قطنية بتصميم كلاسيكي أنيق، مناسبة للخروج والعمل', descEn: 'Classic cotton blouse with elegant design, suitable for outings and work',
      tags: 'cotton,classic,blouse', colors: [{ ar: 'أبيض', en: 'White', hex: '#FFFFFF' }, { ar: 'بيج', en: 'Beige', hex: '#E8D7C9' }, { ar: 'وردي', en: 'Rose', hex: '#B8787D' }],
    },
    {
      nameAr: 'تي شيرت مطبوع', nameEn: 'Printed T-Shirt', slug: 'printed-tshirt',
      sku: 'FTM-TOP-002', cat: 'tops', price: 249, salePrice: 199, costPrice: 100,
      descAr: 'تي شيرت بتصميم مطبوع عصري ومريح للارتداء اليومي', descEn: 'Trendy printed t-shirt comfortable for daily wear',
      tags: 'tshirt,printed,casual', colors: [{ ar: 'أسود', en: 'Black', hex: '#292522' }, { ar: 'أبيض', en: 'White', hex: '#FFFFFF' }],
    },
    {
      nameAr: 'توب كروب ستان', nameEn: 'Satin Crop Top', slug: 'satin-crop-top',
      sku: 'FTM-TOP-003', cat: 'tops', price: 299, costPrice: 130, bestseller: true,
      descAr: 'توب كروب من قماش الستان الفاخر', descEn: 'Crop top made from luxurious satin fabric',
      tags: 'satin,crop,elegant', colors: [{ ar: 'ذهبي وردي', en: 'Rose Gold', hex: '#B58A68' }, { ar: 'أسود', en: 'Black', hex: '#292522' }],
    },
    // ── Sweaters (2) ──
    {
      nameAr: 'سويت شيرت أوفر سايز', nameEn: 'Oversized Sweater', slug: 'oversized-sweater',
      sku: 'FTM-SWT-001', cat: 'sweaters', price: 499, costPrice: 220, featured: true, bestseller: true,
      descAr: 'سويت شيرت أوفر سايز مريح ودافئ لأيام الشتاء', descEn: 'Comfortable and warm oversized sweater for winter days',
      tags: 'oversized,warm,winter', colors: [{ ar: 'رمادي', en: 'Gray', hex: '#9E9E9E' }, { ar: 'بيج', en: 'Beige', hex: '#E8D7C9' }, { ar: 'زيتي', en: 'Olive', hex: '#556B2F' }],
    },
    {
      nameAr: 'كارديجان صوف', nameEn: 'Wool Cardigan', slug: 'wool-cardigan',
      sku: 'FTM-SWT-002', cat: 'sweaters', price: 599, costPrice: 280,
      descAr: 'كارديجان من الصوف الطبيعي بتصميم دافئ', descEn: 'Natural wool cardigan with a warm design',
      tags: 'wool,cardigan,cozy', colors: [{ ar: 'كريمي', en: 'Cream', hex: '#F8F1EB' }, { ar: 'بني', en: 'Brown', hex: '#8B4513' }],
    },
    // ── Pants (2) ──
    {
      nameAr: 'بنطلون واسع كتان', nameEn: 'Wide Leg Linen Pants', slug: 'wide-leg-linen-pants',
      sku: 'FTM-PNT-001', cat: 'pants', price: 449, costPrice: 200, bestseller: true,
      descAr: 'بنطلون واسع من قماش الكتان المريح والخفيف', descEn: 'Wide leg pants made from comfortable lightweight linen',
      tags: 'linen,wide-leg,summer', colors: [{ ar: 'أبيض', en: 'White', hex: '#FFFFFF' }, { ar: 'بيج', en: 'Beige', hex: '#E8D7C9' }, { ar: 'أسود', en: 'Black', hex: '#292522' }],
    },
    {
      nameAr: 'بنطلون جينز مام فيت', nameEn: 'Mom Fit Jeans', slug: 'mom-fit-jeans',
      sku: 'FTM-PNT-002', cat: 'pants', price: 549, salePrice: 449, costPrice: 250,
      descAr: 'بنطلون جينز مام فيت بقصة مريحة وعصرية', descEn: 'Mom fit jeans with a comfortable and trendy cut',
      tags: 'jeans,mom-fit,denim', colors: [{ ar: 'أزرق فاتح', en: 'Light Blue', hex: '#87CEEB' }, { ar: 'أزرق غامق', en: 'Dark Blue', hex: '#00008B' }],
    },
    // ── Dresses (3) ──
    {
      nameAr: 'فستان ميدي فلورال', nameEn: 'Floral Midi Dress', slug: 'floral-midi-dress',
      sku: 'FTM-DRS-001', cat: 'dresses', price: 649, costPrice: 300, featured: true,
      descAr: 'فستان ميدي بنقشة فلورال ناعمة ومناسب لكل المناسبات', descEn: 'Floral midi dress with soft pattern, suitable for all occasions',
      tags: 'floral,midi,elegant', colors: [{ ar: 'وردي', en: 'Pink', hex: '#FFB6C1' }, { ar: 'أزرق', en: 'Blue', hex: '#6495ED' }],
    },
    {
      nameAr: 'فستان سهرة لامع', nameEn: 'Glitter Evening Dress', slug: 'glitter-evening-dress',
      sku: 'FTM-DRS-002', cat: 'dresses', price: 1299, costPrice: 600, featured: true,
      descAr: 'فستان سهرة لامع بتصميم فاخر للمناسبات الخاصة', descEn: 'Glitter evening dress with luxurious design for special occasions',
      tags: 'evening,glitter,luxury', colors: [{ ar: 'ذهبي', en: 'Gold', hex: '#FFD700' }, { ar: 'أسود', en: 'Black', hex: '#292522' }],
    },
    {
      nameAr: 'فستان كاجوال قطني', nameEn: 'Casual Cotton Dress', slug: 'casual-cotton-dress',
      sku: 'FTM-DRS-003', cat: 'dresses', price: 399, salePrice: 329, costPrice: 170, bestseller: true,
      descAr: 'فستان كاجوال من القطن المريح للارتداء اليومي', descEn: 'Casual cotton dress comfortable for everyday wear',
      tags: 'casual,cotton,daily', colors: [{ ar: 'أخضر نعناعي', en: 'Mint', hex: '#98FB98' }, { ar: 'خوخي', en: 'Peach', hex: '#FFDAB9' }, { ar: 'أبيض', en: 'White', hex: '#FFFFFF' }],
    },
    // ── Sets (2) ──
    {
      nameAr: 'طقم رياضي قطني', nameEn: 'Cotton Athleisure Set', slug: 'cotton-athleisure-set',
      sku: 'FTM-SET-001', cat: 'sets', price: 699, costPrice: 320, bestseller: true,
      descAr: 'طقم رياضي من القطن يتكون من هودي وبنطلون', descEn: 'Cotton athleisure set consisting of hoodie and pants',
      tags: 'athleisure,cotton,set', colors: [{ ar: 'رمادي', en: 'Gray', hex: '#9E9E9E' }, { ar: 'وردي فاتح', en: 'Light Pink', hex: '#FFB6C1' }],
    },
    {
      nameAr: 'طقم بليزر رسمي', nameEn: 'Formal Blazer Set', slug: 'formal-blazer-set',
      sku: 'FTM-SET-002', cat: 'sets', price: 999, costPrice: 450, featured: true,
      descAr: 'طقم رسمي بليزر مع بنطلون بقصة كلاسيكية أنيقة', descEn: 'Formal blazer set with pants in a classic elegant cut',
      tags: 'blazer,formal,classic', colors: [{ ar: 'أسود', en: 'Black', hex: '#292522' }, { ar: 'كحلي', en: 'Navy', hex: '#000080' }],
    },
    // ── Outerwear (1) ──
    {
      nameAr: 'جاكيت جلد صناعي', nameEn: 'Faux Leather Jacket', slug: 'faux-leather-jacket',
      sku: 'FTM-OUT-001', cat: 'outerwear', price: 899, salePrice: 749, costPrice: 400,
      descAr: 'جاكيت من الجلد الصناعي بتصميم عصري وأنيق', descEn: 'Faux leather jacket with a modern and stylish design',
      tags: 'leather,jacket,trendy', colors: [{ ar: 'أسود', en: 'Black', hex: '#292522' }, { ar: 'بني', en: 'Brown', hex: '#8B4513' }, { ar: 'بورجندي', en: 'Burgundy', hex: '#800020' }],
    },
    // ── Accessories (1) ──
    {
      nameAr: 'حقيبة يد جلد', nameEn: 'Leather Handbag', slug: 'leather-handbag',
      sku: 'FTM-ACC-001', cat: 'accessories', price: 599, costPrice: 250, featured: true,
      descAr: 'حقيبة يد أنيقة من الجلد الطبيعي بتصميم كلاسيكي', descEn: 'Elegant natural leather handbag with classic design',
      tags: 'handbag,leather,classic', colors: [{ ar: 'أسود', en: 'Black', hex: '#292522' }, { ar: 'بني', en: 'Tan', hex: '#D2B48C' }],
    },
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
  const productIds: string[] = [];

  for (const p of demoProducts) {
    const productId = uuid();
    productIds.push(productId);

    db.insert(schema.products).values({
      id: productId,
      nameAr: p.nameAr,
      nameEn: p.nameEn,
      slug: p.slug,
      descriptionAr: p.descAr,
      descriptionEn: p.descEn,
      sku: p.sku,
      categoryId: catIds[p.cat],
      price: egp(p.price),
      salePrice: p.salePrice ? egp(p.salePrice) : null,
      costPrice: egp(p.costPrice),
      status: 'published',
      isFeatured: p.featured ? 1 : 0,
      isBestseller: p.bestseller ? 1 : 0,
      tags: p.tags,
      seoTitleAr: p.nameAr,
      seoTitleEn: p.nameEn,
      seoDescriptionAr: p.descAr,
      seoDescriptionEn: p.descEn,
      publishedAt: ts,
      createdAt: ts,
      updatedAt: ts,
    }).run();

    // Placeholder primary image
    db.insert(schema.productImages).values({
      id: uuid(),
      productId,
      url: `/images/products/${p.slug}.jpg`,
      altTextAr: p.nameAr,
      altTextEn: p.nameEn,
      displayOrder: 0,
      isPrimary: 1,
      createdAt: ts,
    }).run();

    // Variants: every size × every color
    let variantIdx = 0;
    for (const color of p.colors) {
      // Accessories don't need sizes (single "OS" variant per color)
      const sizesForProduct = p.cat === 'accessories' ? ['OS'] : sizes;

      for (const size of sizesForProduct) {
        variantIdx++;
        const variantId = uuid();
        const variantSku = `${p.sku}-${color.en.toUpperCase().replace(/\s+/g, '')}-${size}`;
        const stock = 10 + Math.floor(Math.random() * 40); // 10–49

        db.insert(schema.productVariants).values({
          id: variantId,
          productId,
          sku: variantSku,
          size,
          colorNameAr: color.ar,
          colorNameEn: color.en,
          colorHex: color.hex,
          priceOverride: null,
          quantityOnHand: stock,
          quantityReserved: 0,
          lowStockThreshold: 5,
          barcode: null,
          isActive: 1,
          createdAt: ts,
          updatedAt: ts,
        }).run();

        // Initial receipt inventory movement
        db.insert(schema.inventoryMovements).values({
          id: uuid(),
          variantId,
          type: 'receipt',
          quantity: stock,
          referenceType: 'manual',
          referenceId: null,
          notes: '[DEMO] Initial stock receipt',
          createdBy: null,
          createdAt: ts,
        }).run();
      }
    }
  }

  console.log(`   → ${demoProducts.length} products with variants seeded.`);
  return productIds;
}

function seedShippingZones() {
  console.log('🚚  Seeding shipping zones …');

  const ts = now();

  const zones = [
    {
      nameAr: 'القاهرة', nameEn: 'Cairo',
      governorates: JSON.stringify(['القاهرة', 'Cairo']),
      fee: egp(40), threshold: egp(500), minDays: 1, maxDays: 3,
    },
    {
      nameAr: 'الجيزة', nameEn: 'Giza',
      governorates: JSON.stringify(['الجيزة', 'Giza']),
      fee: egp(40), threshold: egp(500), minDays: 1, maxDays: 3,
    },
    {
      nameAr: 'الإسكندرية', nameEn: 'Alexandria',
      governorates: JSON.stringify(['الإسكندرية', 'Alexandria']),
      fee: egp(50), threshold: egp(600), minDays: 2, maxDays: 4,
    },
    {
      nameAr: 'الدلتا', nameEn: 'Delta',
      governorates: JSON.stringify([
        'الدقهلية', 'الشرقية', 'الغربية', 'المنوفية', 'كفر الشيخ', 'البحيرة', 'الدقهلية', 'القليوبية',
        'Dakahlia', 'Sharqia', 'Gharbia', 'Monufia', 'Kafr El Sheikh', 'Beheira', 'Qalyubia',
      ]),
      fee: egp(55), threshold: egp(700), minDays: 2, maxDays: 5,
    },
    {
      nameAr: 'صعيد مصر', nameEn: 'Upper Egypt',
      governorates: JSON.stringify([
        'الفيوم', 'بني سويف', 'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان',
        'Fayoum', 'Beni Suef', 'Minya', 'Assiut', 'Sohag', 'Qena', 'Luxor', 'Aswan',
      ]),
      fee: egp(65), threshold: egp(800), minDays: 3, maxDays: 7,
    },
    {
      nameAr: 'القناة والبحر الأحمر', nameEn: 'Canal & Red Sea',
      governorates: JSON.stringify([
        'بورسعيد', 'الإسماعيلية', 'السويس', 'البحر الأحمر', 'شمال سيناء', 'جنوب سيناء', 'مرسى مطروح', 'الوادي الجديد',
        'Port Said', 'Ismailia', 'Suez', 'Red Sea', 'North Sinai', 'South Sinai', 'Matruh', 'New Valley',
      ]),
      fee: egp(70), threshold: egp(900), minDays: 3, maxDays: 7,
    },
  ];

  for (const z of zones) {
    db.insert(schema.shippingZones).values({
      id: uuid(),
      nameAr: z.nameAr,
      nameEn: z.nameEn,
      governorates: z.governorates,
      shippingFee: z.fee,
      freeShippingThreshold: z.threshold,
      estimatedDaysMin: z.minDays,
      estimatedDaysMax: z.maxDays,
      isActive: 1,
      createdAt: ts,
    }).run();
  }

  console.log(`   → ${zones.length} shipping zones created.`);
}

function seedCmsSections() {
  console.log('📄  Seeding CMS sections …');

  const ts = now();

  const sections = [
    {
      type: 'announcement' as const, order: 0,
      titleAr: 'شحن مجاني للطلبات فوق ٥٠٠ جنيه للقاهرة والجيزة', titleEn: 'Free shipping on orders over 500 EGP for Cairo & Giza',
      content: JSON.stringify({ backgroundColor: '#B8787D', textColor: '#FFFFFF' }),
    },
    {
      type: 'hero' as const, order: 1,
      titleAr: 'مجموعة شتاء ٢٠٢٥', titleEn: 'Winter Collection 2025',
      subtitleAr: 'اكتشفي أحدث صيحات الموضة لهذا الموسم', subtitleEn: 'Discover the latest fashion trends this season',
      content: JSON.stringify({ buttonTextAr: 'تسوقي الآن', buttonTextEn: 'Shop Now', buttonLink: '/collections/winter-2025' }),
      imageUrl: '/images/cms/hero-winter.jpg', linkUrl: '/collections/winter-2025',
    },
    {
      type: 'categories' as const, order: 2,
      titleAr: 'تسوقي حسب الفئة', titleEn: 'Shop by Category',
    },
    {
      type: 'new_arrivals' as const, order: 3,
      titleAr: 'وصل حديثاً', titleEn: 'New Arrivals',
      subtitleAr: 'أحدث المنتجات المضافة لمجموعتنا', subtitleEn: 'Latest additions to our collection',
    },
    {
      type: 'bestsellers' as const, order: 4,
      titleAr: 'الأكثر مبيعاً', titleEn: 'Best Sellers',
      subtitleAr: 'المنتجات الأكثر طلباً من عملائنا', subtitleEn: 'Most popular products among our customers',
    },
    {
      type: 'campaign' as const, order: 5,
      titleAr: 'خصم ٢٠٪ على الفساتين', titleEn: '20% Off Dresses',
      subtitleAr: 'لفترة محدودة', subtitleEn: 'Limited time offer',
      imageUrl: '/images/cms/campaign-dresses.jpg', linkUrl: '/categories/dresses',
      content: JSON.stringify({ discountCode: 'DRESS20', expiresAt: '2025-03-31' }),
    },
    {
      type: 'featured_collection' as const, order: 6,
      titleAr: 'المفضلة لدينا', titleEn: 'Our Favourites',
      subtitleAr: 'اختيارات فريق فاطمة المميزة', subtitleEn: 'FATMA team\'s curated picks',
    },
    {
      type: 'trust_badges' as const, order: 7,
      titleAr: 'لماذا فاطمة؟', titleEn: 'Why FATMA?',
      content: JSON.stringify({
        badges: [
          { iconAr: '🚚', titleAr: 'شحن سريع', descAr: 'توصيل سريع لجميع المحافظات', titleEn: 'Fast Shipping', descEn: 'Quick delivery to all governorates' },
          { iconAr: '🔄', titleAr: 'إرجاع سهل', descAr: 'سياسة إرجاع ١٤ يوم', titleEn: 'Easy Returns', descEn: '14-day return policy' },
          { iconAr: '💎', titleAr: 'جودة عالية', descAr: 'أقمشة وخامات ممتازة', titleEn: 'Premium Quality', descEn: 'Excellent fabrics and materials' },
          { iconAr: '💬', titleAr: 'دعم متواصل', descAr: 'خدمة عملاء عبر واتساب', titleEn: 'Continuous Support', descEn: 'Customer service via WhatsApp' },
        ],
      }),
    },
    {
      type: 'newsletter' as const, order: 8,
      titleAr: 'اشتركي في نشرتنا البريدية', titleEn: 'Subscribe to Our Newsletter',
      subtitleAr: 'احصلي على خصم ١٠٪ على أول طلب', subtitleEn: 'Get 10% off your first order',
    },
    {
      type: 'instagram' as const, order: 9,
      titleAr: 'تابعينا على انستجرام', titleEn: 'Follow Us on Instagram',
      subtitleAr: '@fatma.fashion', subtitleEn: '@fatma.fashion',
      content: JSON.stringify({ handle: '@fatma.fashion', posts: [] }),
    },
  ];

  for (const s of sections) {
    db.insert(schema.cmsSections).values({
      id: uuid(),
      page: 'homepage',
      sectionType: s.type,
      titleAr: s.titleAr || null,
      titleEn: s.titleEn || null,
      subtitleAr: (s as any).subtitleAr || null,
      subtitleEn: (s as any).subtitleEn || null,
      content: s.content || null,
      imageUrl: (s as any).imageUrl || null,
      linkUrl: (s as any).linkUrl || null,
      displayOrder: s.order,
      isVisible: 1,
      createdAt: ts,
      updatedAt: ts,
    }).run();
  }

  console.log(`   → ${sections.length} CMS sections created.`);
}

function seedCmsPages() {
  console.log('📝  Seeding CMS pages …');

  const ts = now();

  const pages = [
    {
      slug: 'privacy-policy',
      titleAr: 'سياسة الخصوصية', titleEn: 'Privacy Policy',
      contentAr: `# سياسة الخصوصية

## مقدمة
نحن في فاطمة نلتزم بحماية خصوصيتك وبياناتك الشخصية.

## البيانات التي نجمعها
- الاسم ومعلومات الاتصال
- عنوان الشحن
- سجل الطلبات
- معلومات الدفع (مشفرة)

## كيف نستخدم بياناتك
- معالجة وتوصيل طلباتك
- إرسال تحديثات حول طلباتك
- تحسين تجربة التسوق
- إرسال عروض ترويجية (بموافقتك)

## حقوقك
يحق لك طلب الوصول إلى بياناتك أو تعديلها أو حذفها في أي وقت.

## تواصلي معنا
للاستفسار عن خصوصيتك، تواصلي معنا عبر: privacy@fatma.fashion`,
      contentEn: `# Privacy Policy

## Introduction
At FATMA, we are committed to protecting your privacy and personal data.

## Data We Collect
- Name and contact information
- Shipping address
- Order history
- Payment information (encrypted)

## How We Use Your Data
- Processing and delivering your orders
- Sending order updates
- Improving your shopping experience
- Sending promotional offers (with your consent)

## Your Rights
You have the right to access, modify, or delete your data at any time.

## Contact Us
For privacy inquiries, contact us at: privacy@fatma.fashion`,
    },
    {
      slug: 'terms-and-conditions',
      titleAr: 'الشروط والأحكام', titleEn: 'Terms & Conditions',
      contentAr: `# الشروط والأحكام

## القبول
باستخدامك لموقع فاطمة، فإنك توافق على هذه الشروط والأحكام.

## الأسعار والدفع
- جميع الأسعار بالجنيه المصري وتشمل ضريبة القيمة المضافة
- نقبل الدفع عند الاستلام والدفع الإلكتروني

## الشحن
- أوقات التوصيل المذكورة تقديرية وقد تختلف
- رسوم الشحن تحسب حسب المنطقة

## الإلغاء
يمكنك إلغاء طلبك قبل شحنه دون أي رسوم.

## حقوق الملكية الفكرية
جميع المحتويات والتصاميم محمية بحقوق الملكية الفكرية.`,
      contentEn: `# Terms & Conditions

## Acceptance
By using the FATMA website, you agree to these terms and conditions.

## Pricing & Payment
- All prices are in Egyptian Pounds (EGP) and include VAT
- We accept Cash on Delivery and online payment

## Shipping
- Delivery times mentioned are estimates and may vary
- Shipping fees are calculated based on your region

## Cancellation
You can cancel your order before it ships at no charge.

## Intellectual Property
All content and designs are protected by intellectual property rights.`,
    },
    {
      slug: 'shipping-policy',
      titleAr: 'سياسة الشحن', titleEn: 'Shipping Policy',
      contentAr: `# سياسة الشحن

## مناطق التوصيل
نوصل لجميع محافظات مصر.

## أوقات التوصيل
- القاهرة والجيزة: ١-٣ أيام عمل
- الإسكندرية: ٢-٤ أيام عمل
- الدلتا: ٢-٥ أيام عمل
- صعيد مصر: ٣-٧ أيام عمل
- القناة والبحر الأحمر: ٣-٧ أيام عمل

## رسوم الشحن
- القاهرة والجيزة: ٤٠ جنيه (مجاني للطلبات فوق ٥٠٠ جنيه)
- الإسكندرية: ٥٠ جنيه (مجاني للطلبات فوق ٦٠٠ جنيه)
- الدلتا: ٥٥ جنيه (مجاني للطلبات فوق ٧٠٠ جنيه)
- صعيد مصر: ٦٥ جنيه (مجاني للطلبات فوق ٨٠٠ جنيه)
- القناة والبحر الأحمر: ٧٠ جنيه (مجاني للطلبات فوق ٩٠٠ جنيه)

## تتبع الطلب
ستتلقين رسالة برقم التتبع فور شحن طلبك.`,
      contentEn: `# Shipping Policy

## Delivery Areas
We deliver to all Egyptian governorates.

## Delivery Times
- Cairo & Giza: 1-3 business days
- Alexandria: 2-4 business days
- Delta: 2-5 business days
- Upper Egypt: 3-7 business days
- Canal & Red Sea: 3-7 business days

## Shipping Fees
- Cairo & Giza: 40 EGP (free on orders over 500 EGP)
- Alexandria: 50 EGP (free on orders over 600 EGP)
- Delta: 55 EGP (free on orders over 700 EGP)
- Upper Egypt: 65 EGP (free on orders over 800 EGP)
- Canal & Red Sea: 70 EGP (free on orders over 900 EGP)

## Order Tracking
You will receive a tracking number via SMS once your order ships.`,
    },
    {
      slug: 'returns-policy',
      titleAr: 'سياسة الإرجاع والاستبدال', titleEn: 'Returns & Exchange Policy',
      contentAr: `# سياسة الإرجاع والاستبدال

## مدة الإرجاع
يمكنك إرجاع أو استبدال المنتج خلال ١٤ يوم من تاريخ الاستلام.

## شروط الإرجاع
- المنتج في حالته الأصلية مع جميع التاجز
- لم يتم ارتداؤه أو غسله
- التغليف الأصلي سليم

## المنتجات غير القابلة للإرجاع
- الملابس الداخلية
- الإكسسوارات المخصصة
- المنتجات المخفضة بأكثر من ٥٠٪

## خطوات الإرجاع
1. تواصلي معنا عبر واتساب
2. سنرسل لك رقم إرجاع
3. أرسلي المنتج عبر شركة الشحن
4. سيتم رد المبلغ خلال ٧ أيام عمل

## رسوم الإرجاع
رسوم شحن الإرجاع على العميل ما لم يكن المنتج به عيب.`,
      contentEn: `# Returns & Exchange Policy

## Return Period
You can return or exchange products within 14 days of receipt.

## Return Conditions
- Product in original condition with all tags
- Not worn or washed
- Original packaging intact

## Non-Returnable Items
- Underwear
- Customized accessories
- Products discounted by more than 50%

## Return Steps
1. Contact us via WhatsApp
2. We will send you a return number
3. Ship the product via courier
4. Refund will be processed within 7 business days

## Return Shipping
Return shipping costs are borne by the customer unless the product is defective.`,
    },
    {
      slug: 'faq',
      titleAr: 'الأسئلة الشائعة', titleEn: 'Frequently Asked Questions',
      contentAr: `# الأسئلة الشائعة

## كيف يمكنني تتبع طلبي؟
بعد شحن طلبك، ستتلقين رسالة نصية برقم التتبع. يمكنك أيضاً تتبع طلبك من حسابك على الموقع.

## ما هي طرق الدفع المتاحة؟
نقبل الدفع عند الاستلام، الدفع الإلكتروني، التحويل البنكي، وإنستاباي.

## هل يمكنني تغيير عنواني بعد الطلب؟
نعم، تواصلي معنا فوراً عبر واتساب قبل شحن الطلب.

## كم يستغرق التوصيل؟
يعتمد على منطقتك. القاهرة والجيزة ١-٣ أيام، والمحافظات الأخرى حتى ٧ أيام.

## كيف أختار المقاس المناسب؟
يمكنك الاطلاع على دليل المقاسات الخاص بنا لمساعدتك في اختيار المقاس المناسب.

## هل يمكنني إلغاء طلبي؟
نعم، يمكنك إلغاء الطلب قبل شحنه دون أي رسوم.`,
      contentEn: `# Frequently Asked Questions

## How can I track my order?
After your order ships, you will receive an SMS with a tracking number. You can also track your order from your account on the website.

## What payment methods are available?
We accept Cash on Delivery, online payment, bank transfer, and InstaPay.

## Can I change my address after ordering?
Yes, contact us immediately via WhatsApp before the order ships.

## How long does delivery take?
It depends on your region. Cairo and Giza 1-3 days, other governorates up to 7 days.

## How do I choose the right size?
You can check our size guide to help you choose the right size.

## Can I cancel my order?
Yes, you can cancel your order before it ships at no charge.`,
    },
    {
      slug: 'size-guide',
      titleAr: 'دليل المقاسات', titleEn: 'Size Guide',
      contentAr: `# دليل المقاسات

## جدول المقاسات

| المقاس | XS | S | M | L | XL |
|--------|-----|-----|-----|-----|------|
| الصدر (سم) | ٨٠ | ٨٤ | ٨٨ | ٩٢ | ٩٦ |
| الخصر (سم) | ٦٠ | ٦٤ | ٦٨ | ٧٢ | ٧٦ |
| الأرداف (سم) | ٨٦ | ٩٠ | ٩٤ | ٩٨ | ١٠٢ |

## كيف تأخذين قياساتك

### الصدر
قيسي حول أعرض جزء من الصدر مع الحفاظ على الشريط مستوي.

### الخصر
قيسي حول أضيق جزء من الخصر الطبيعي.

### الأرداف
قيسي حول أعرض جزء من الأرداف.

## نصائح عامة
- إذا كنتِ بين مقاسين، اختاري المقاس الأكبر
- المقاسات تقريبية وقد تختلف حسب التصميم
- لا تترددي في التواصل معنا للمساعدة`,
      contentEn: `# Size Guide

## Size Chart

| Size | XS | S | M | L | XL |
|------|-----|-----|-----|-----|------|
| Bust (cm) | 80 | 84 | 88 | 92 | 96 |
| Waist (cm) | 60 | 64 | 68 | 72 | 76 |
| Hips (cm) | 86 | 90 | 94 | 98 | 102 |

## How to Measure

### Bust
Measure around the fullest part of your bust, keeping the tape level.

### Waist
Measure around the narrowest part of your natural waist.

### Hips
Measure around the widest part of your hips.

## General Tips
- If you're between sizes, choose the larger size
- Sizes are approximate and may vary by design
- Don't hesitate to contact us for help`,
    },
  ];

  for (const p of pages) {
    db.insert(schema.cmsPages).values({
      id: uuid(),
      slug: p.slug,
      titleAr: p.titleAr,
      titleEn: p.titleEn,
      contentAr: p.contentAr,
      contentEn: p.contentEn,
      seoTitleAr: p.titleAr,
      seoTitleEn: p.titleEn,
      seoDescriptionAr: p.titleAr + ' - فاطمة فاشون',
      seoDescriptionEn: p.titleEn + ' - FATMA Fashion',
      isPublished: 1,
      createdAt: ts,
      updatedAt: ts,
    }).run();
  }

  console.log(`   → ${pages.length} CMS pages created.`);
}

function seedStoreSettings() {
  console.log('⚙️   Seeding store settings …');

  const ts = now();

  const settings: Record<string, string> = {
    'store.name_ar': 'فاطمة',
    'store.name_en': 'FATMA',
    'store.tagline_ar': 'أزياء للبنات',
    'store.tagline_en': 'Fashion For Girls',
    'store.email': 'hello@fatma.fashion',
    'store.phone': '+201000000000',
    'store.whatsapp': '+201000000000',
    'store.currency': 'EGP',
    'store.currency_symbol': 'ج.م',
    'store.locale_default': 'ar',
    'store.timezone': 'Africa/Cairo',
    'store.logo_url': '/images/logo.svg',
    'store.favicon_url': '/images/favicon.ico',
    'store.social.instagram': 'https://instagram.com/fatma.fashion',
    'store.social.facebook': 'https://facebook.com/fatma.fashion',
    'store.social.tiktok': 'https://tiktok.com/@fatma.fashion',
    'theme.color.cream': '#F8F1EB',
    'theme.color.warm_beige': '#E8D7C9',
    'theme.color.rose_blush': '#B8787D',
    'theme.color.rose_gold': '#B58A68',
    'theme.color.charcoal': '#292522',
    'theme.color.white': '#FFFFFF',
    'checkout.guest_enabled': 'true',
    'checkout.cod_enabled': 'true',
    'checkout.online_payment_enabled': 'false',
    'checkout.instapay_enabled': 'true',
    'checkout.bank_transfer_enabled': 'true',
    'order.prefix': 'FTM',
    'order.next_number': '1001',
    'inventory.track_enabled': 'true',
    'inventory.allow_oversell': 'false',
    'notifications.order_confirmed.email': 'true',
    'notifications.order_confirmed.sms': 'true',
    'notifications.order_shipped.email': 'true',
    'notifications.order_shipped.sms': 'true',
    'notifications.order_shipped.whatsapp': 'true',
    'seo.default_title_ar': 'فاطمة - أزياء للبنات | تسوقي أونلاين في مصر',
    'seo.default_title_en': 'FATMA - Fashion For Girls | Shop Online in Egypt',
    'seo.default_description_ar': 'تسوقي أحدث صيحات الموضة النسائية من فاطمة. فساتين، توبات، بناطيل وإكسسوارات بأسعار مناسبة مع شحن لجميع محافظات مصر.',
    'seo.default_description_en': 'Shop the latest women\'s fashion trends at FATMA. Dresses, tops, pants and accessories at great prices with shipping to all Egyptian governorates.',
  };

  for (const [key, value] of Object.entries(settings)) {
    db.insert(schema.storeSettings).values({
      key,
      value,
      updatedAt: ts,
    }).run();
  }

  console.log(`   → ${Object.keys(settings).length} store settings created.`);
}

function seedNotificationTemplates() {
  console.log('📧  Seeding notification templates …');

  const ts = now();

  const templates = [
    {
      eventType: 'order_confirmed',
      subjectAr: 'تأكيد الطلب رقم {{order_number}}', subjectEn: 'Order Confirmed #{{order_number}}',
      bodyAr: 'مرحباً {{customer_name}}، تم تأكيد طلبك رقم {{order_number}} بنجاح. سنبدأ في تجهيزه قريباً.',
      bodyEn: 'Hello {{customer_name}}, your order #{{order_number}} has been confirmed. We will start preparing it soon.',
      channels: 'email,sms',
    },
    {
      eventType: 'order_shipped',
      subjectAr: 'تم شحن طلبك رقم {{order_number}}', subjectEn: 'Order Shipped #{{order_number}}',
      bodyAr: 'مرحباً {{customer_name}}، تم شحن طلبك رقم {{order_number}}. رقم التتبع: {{tracking_number}}',
      bodyEn: 'Hello {{customer_name}}, your order #{{order_number}} has been shipped. Tracking number: {{tracking_number}}',
      channels: 'email,sms,whatsapp',
    },
    {
      eventType: 'order_delivered',
      subjectAr: 'تم توصيل طلبك رقم {{order_number}}', subjectEn: 'Order Delivered #{{order_number}}',
      bodyAr: 'مرحباً {{customer_name}}، تم توصيل طلبك رقم {{order_number}} بنجاح. نتمنى أن تنال إعجابك!',
      bodyEn: 'Hello {{customer_name}}, your order #{{order_number}} has been delivered. We hope you love it!',
      channels: 'email',
    },
    {
      eventType: 'order_cancelled',
      subjectAr: 'تم إلغاء طلبك رقم {{order_number}}', subjectEn: 'Order Cancelled #{{order_number}}',
      bodyAr: 'مرحباً {{customer_name}}، تم إلغاء طلبك رقم {{order_number}}. السبب: {{cancellation_reason}}',
      bodyEn: 'Hello {{customer_name}}, your order #{{order_number}} has been cancelled. Reason: {{cancellation_reason}}',
      channels: 'email,sms',
    },
    {
      eventType: 'password_reset',
      subjectAr: 'إعادة تعيين كلمة المرور', subjectEn: 'Password Reset',
      bodyAr: 'استخدمي هذا الرابط لإعادة تعيين كلمة المرور: {{reset_link}}. الرابط صالح لمدة ساعة واحدة.',
      bodyEn: 'Use this link to reset your password: {{reset_link}}. The link is valid for one hour.',
      channels: 'email',
    },
    {
      eventType: 'welcome',
      subjectAr: 'مرحباً بك في فاطمة! 🎉', subjectEn: 'Welcome to FATMA! 🎉',
      bodyAr: 'مرحباً {{customer_name}}، أهلاً بك في عائلة فاطمة! استمتعي بالتسوق واكتشفي أحدث صيحات الموضة.',
      bodyEn: 'Hello {{customer_name}}, welcome to the FATMA family! Enjoy shopping and discover the latest fashion trends.',
      channels: 'email',
    },
  ];

  for (const t of templates) {
    db.insert(schema.notificationTemplates).values({
      id: uuid(),
      eventType: t.eventType,
      subjectAr: t.subjectAr,
      subjectEn: t.subjectEn,
      bodyAr: t.bodyAr,
      bodyEn: t.bodyEn,
      channels: t.channels,
      isActive: 1,
      createdAt: ts,
    }).run();
  }

  console.log(`   → ${templates.length} notification templates created.`);
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║   FATMA Fashion — Database Seed                  ║');
  console.log('║   All prices are DEMO data in EGP piasters       ║');
  console.log('╚═══════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Database: ${DB_PATH}`);
  console.log('');

  createTables();

  // Check if already seeded
  const existing = sqlite
    .prepare('SELECT COUNT(*) as count FROM categories')
    .get() as { count: number };

  if (existing.count > 0) {
    console.log('');
    console.log('⚠️   Database already contains data. Skipping seed.');
    console.log('    To re-seed, delete the database file and re-run.');
    process.exit(0);
  }

  const catIds = seedCategories();
  seedProducts(catIds);
  seedShippingZones();
  seedCmsSections();
  seedCmsPages();
  seedStoreSettings();
  seedNotificationTemplates();

  console.log('');
  console.log('══════════════════════════════════════════════════════');
  console.log('✅  Seed complete!');
  console.log('   ⚠ Admin users NOT seeded — use secure setup flow.');
  console.log('══════════════════════════════════════════════════════');
  console.log('');
}

main().catch((err) => {
  console.error('❌  Seed failed:', err);
  process.exit(1);
});
