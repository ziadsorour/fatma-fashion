/**
 * FATMA Fashion E-Commerce Platform — Database Schema
 * Drizzle ORM with better-sqlite3
 *
 * Conventions:
 *  - All IDs are text (UUID v4)
 *  - Monetary values are integer piasters (1 EGP = 100 piasters)
 *  - Timestamps are integer Unix-epoch seconds
 *  - Booleans are integer 0 / 1
 *  - JSON payloads are stored as text
 */

import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
  primaryKey,
} from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// ─── helpers ────────────────────────────────────────────────────────────────
const timestamp = (name: string) => integer(name);
const bool = (name: string) => integer(name, { mode: 'number' });
const money = (name: string) => integer(name);
const id = () => text('id').primaryKey();
const now = () => Math.floor(Date.now() / 1000);

// ═══════════════════════════════════════════════════════════════════════════
// 1. USERS
// ═══════════════════════════════════════════════════════════════════════════
export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    name: text('name').notNull(),
    phone: text('phone'),
    role: text('role', {
      enum: [
        'customer',
        'admin',
        'manager',
        'fulfillment',
        'product_manager',
        'support',
        'analyst',
      ],
    })
      .notNull()
      .default('customer'),
    emailVerified: bool('email_verified').notNull().default(0),
    createdAt: timestamp('created_at')
      .notNull()
      .$defaultFn(now),
    updatedAt: timestamp('updated_at')
      .notNull()
      .$defaultFn(now),
  },
  (t) => [
    uniqueIndex('users_email_idx').on(t.email),
    index('users_role_idx').on(t.role),
    index('users_phone_idx').on(t.phone),
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
// 2. CUSTOMER PROFILES
// ═══════════════════════════════════════════════════════════════════════════
export const customerProfiles = sqliteTable(
  'customer_profiles',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    phone: text('phone'),
    defaultAddressId: text('default_address_id'),
    lifetimeSpent: money('lifetime_spent').notNull().default(0),
    orderCount: integer('order_count').notNull().default(0),
    notes: text('notes'),
    createdAt: timestamp('created_at')
      .notNull()
      .$defaultFn(now),
  },
  (t) => [
    index('cp_user_id_idx').on(t.userId),
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
// 3. ADDRESSES
// ═══════════════════════════════════════════════════════════════════════════
export const addresses = sqliteTable(
  'addresses',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    label: text('label'),
    fullName: text('full_name').notNull(),
    phone: text('phone').notNull(),
    governorate: text('governorate').notNull(),
    city: text('city').notNull(),
    addressLine1: text('address_line1').notNull(),
    addressLine2: text('address_line2'),
    buildingInfo: text('building_info'),
    deliveryInstructions: text('delivery_instructions'),
    isDefault: bool('is_default').notNull().default(0),
    createdAt: timestamp('created_at')
      .notNull()
      .$defaultFn(now),
  },
  (t) => [
    index('addr_user_id_idx').on(t.userId),
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
// 4. CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════
export const categories = sqliteTable(
  'categories',
  {
    id: text('id').primaryKey(),
    nameAr: text('name_ar').notNull(),
    nameEn: text('name_en').notNull(),
    slug: text('slug').notNull(),
    descriptionAr: text('description_ar'),
    descriptionEn: text('description_en'),
    imageUrl: text('image_url'),
    parentId: text('parent_id'),
    displayOrder: integer('display_order').notNull().default(0),
    isVisible: bool('is_visible').notNull().default(1),
    createdAt: timestamp('created_at')
      .notNull()
      .$defaultFn(now),
    updatedAt: timestamp('updated_at')
      .notNull()
      .$defaultFn(now),
  },
  (t) => [
    uniqueIndex('cat_slug_idx').on(t.slug),
    index('cat_parent_idx').on(t.parentId),
    index('cat_order_idx').on(t.displayOrder),
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
// 5. COLLECTIONS
// ═══════════════════════════════════════════════════════════════════════════
export const collections = sqliteTable(
  'collections',
  {
    id: text('id').primaryKey(),
    nameAr: text('name_ar').notNull(),
    nameEn: text('name_en').notNull(),
    slug: text('slug').notNull(),
    descriptionAr: text('description_ar'),
    descriptionEn: text('description_en'),
    imageUrl: text('image_url'),
    bannerUrl: text('banner_url'),
    type: text('type', { enum: ['manual', 'rule_based'] })
      .notNull()
      .default('manual'),
    isVisible: bool('is_visible').notNull().default(1),
    displayOrder: integer('display_order').notNull().default(0),
    createdAt: timestamp('created_at')
      .notNull()
      .$defaultFn(now),
    updatedAt: timestamp('updated_at')
      .notNull()
      .$defaultFn(now),
  },
  (t) => [
    uniqueIndex('coll_slug_idx').on(t.slug),
    index('coll_order_idx').on(t.displayOrder),
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
// 6. COLLECTION ↔ PRODUCT (join)
// ═══════════════════════════════════════════════════════════════════════════
export const collectionProducts = sqliteTable(
  'collection_products',
  {
    collectionId: text('collection_id')
      .notNull()
      .references(() => collections.id, { onDelete: 'cascade' }),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    displayOrder: integer('display_order').notNull().default(0),
  },
  (t) => [
    primaryKey({ columns: [t.collectionId, t.productId] }),
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
// 7. PRODUCTS
// ═══════════════════════════════════════════════════════════════════════════
export const products = sqliteTable(
  'products',
  {
    id: text('id').primaryKey(),
    nameAr: text('name_ar').notNull(),
    nameEn: text('name_en').notNull(),
    slug: text('slug').notNull(),
    descriptionAr: text('description_ar'),
    descriptionEn: text('description_en'),
    sku: text('sku').notNull(),
    categoryId: text('category_id').references(() => categories.id, {
      onDelete: 'set null',
    }),
    price: money('price').notNull(),
    salePrice: money('sale_price'),
    costPrice: money('cost_price'),
    status: text('status', {
      enum: ['draft', 'published', 'archived'],
    })
      .notNull()
      .default('draft'),
    isFeatured: bool('is_featured').notNull().default(0),
    isBestseller: bool('is_bestseller').notNull().default(0),
    tags: text('tags'),
    seoTitleAr: text('seo_title_ar'),
    seoTitleEn: text('seo_title_en'),
    seoDescriptionAr: text('seo_description_ar'),
    seoDescriptionEn: text('seo_description_en'),
    publishedAt: timestamp('published_at'),
    createdAt: timestamp('created_at')
      .notNull()
      .$defaultFn(now),
    updatedAt: timestamp('updated_at')
      .notNull()
      .$defaultFn(now),
  },
  (t) => [
    uniqueIndex('prod_slug_idx').on(t.slug),
    uniqueIndex('prod_sku_idx').on(t.sku),
    index('prod_category_idx').on(t.categoryId),
    index('prod_status_idx').on(t.status),
    index('prod_featured_idx').on(t.isFeatured),
    index('prod_bestseller_idx').on(t.isBestseller),
    index('prod_created_idx').on(t.createdAt),
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
// 8. PRODUCT IMAGES
// ═══════════════════════════════════════════════════════════════════════════
export const productImages = sqliteTable(
  'product_images',
  {
    id: text('id').primaryKey(),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    altTextAr: text('alt_text_ar'),
    altTextEn: text('alt_text_en'),
    displayOrder: integer('display_order').notNull().default(0),
    isPrimary: bool('is_primary').notNull().default(0),
    createdAt: timestamp('created_at')
      .notNull()
      .$defaultFn(now),
  },
  (t) => [
    index('pi_product_idx').on(t.productId),
    index('pi_order_idx').on(t.displayOrder),
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
// 9. PRODUCT VARIANTS
// ═══════════════════════════════════════════════════════════════════════════
export const productVariants = sqliteTable(
  'product_variants',
  {
    id: text('id').primaryKey(),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    sku: text('sku').notNull(),
    size: text('size'),
    colorNameAr: text('color_name_ar'),
    colorNameEn: text('color_name_en'),
    colorHex: text('color_hex'),
    priceOverride: money('price_override'),
    quantityOnHand: integer('quantity_on_hand').notNull().default(0),
    quantityReserved: integer('quantity_reserved').notNull().default(0),
    lowStockThreshold: integer('low_stock_threshold').notNull().default(5),
    barcode: text('barcode'),
    isActive: bool('is_active').notNull().default(1),
    createdAt: timestamp('created_at')
      .notNull()
      .$defaultFn(now),
    updatedAt: timestamp('updated_at')
      .notNull()
      .$defaultFn(now),
  },
  (t) => [
    uniqueIndex('pv_sku_idx').on(t.sku),
    index('pv_product_idx').on(t.productId),
    index('pv_barcode_idx').on(t.barcode),
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
// 10. INVENTORY MOVEMENTS
// ═══════════════════════════════════════════════════════════════════════════
export const inventoryMovements = sqliteTable(
  'inventory_movements',
  {
    id: text('id').primaryKey(),
    variantId: text('variant_id')
      .notNull()
      .references(() => productVariants.id, { onDelete: 'cascade' }),
    type: text('type', {
      enum: [
        'receipt',
        'sale',
        'return',
        'adjustment',
        'reservation',
        'release',
      ],
    }).notNull(),
    quantity: integer('quantity').notNull(),
    referenceType: text('reference_type', {
      enum: ['order', 'manual', 'return'],
    }),
    referenceId: text('reference_id'),
    notes: text('notes'),
    createdBy: text('created_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at')
      .notNull()
      .$defaultFn(now),
  },
  (t) => [
    index('im_variant_idx').on(t.variantId),
    index('im_type_idx').on(t.type),
    index('im_ref_idx').on(t.referenceType, t.referenceId),
    index('im_created_idx').on(t.createdAt),
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
// 11. CARTS
// ═══════════════════════════════════════════════════════════════════════════
export const carts = sqliteTable(
  'carts',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    sessionId: text('session_id'),
    couponCode: text('coupon_code'),
    createdAt: timestamp('created_at')
      .notNull()
      .$defaultFn(now),
    updatedAt: timestamp('updated_at')
      .notNull()
      .$defaultFn(now),
  },
  (t) => [
    index('cart_user_idx').on(t.userId),
    index('cart_session_idx').on(t.sessionId),
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
// 12. CART ITEMS
// ═══════════════════════════════════════════════════════════════════════════
export const cartItems = sqliteTable(
  'cart_items',
  {
    id: text('id').primaryKey(),
    cartId: text('cart_id')
      .notNull()
      .references(() => carts.id, { onDelete: 'cascade' }),
    variantId: text('variant_id')
      .notNull()
      .references(() => productVariants.id, { onDelete: 'cascade' }),
    quantity: integer('quantity').notNull().default(1),
    createdAt: timestamp('created_at')
      .notNull()
      .$defaultFn(now),
  },
  (t) => [
    index('ci_cart_idx').on(t.cartId),
    index('ci_variant_idx').on(t.variantId),
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
// 13. ORDERS
// ═══════════════════════════════════════════════════════════════════════════
export const orders = sqliteTable(
  'orders',
  {
    id: text('id').primaryKey(),
    orderNumber: text('order_number').notNull(),
    userId: text('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    guestEmail: text('guest_email'),
    guestPhone: text('guest_phone'),
    status: text('status', {
      enum: [
        'pending',
        'confirmed',
        'processing',
        'packed',
        'shipped',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'return_requested',
        'returned',
        'refunded',
      ],
    })
      .notNull()
      .default('pending'),
    paymentStatus: text('payment_status', {
      enum: [
        'pending',
        'paid',
        'failed',
        'refunded',
        'partially_refunded',
      ],
    })
      .notNull()
      .default('pending'),
    paymentMethod: text('payment_method', {
      enum: ['cod', 'online', 'bank_transfer', 'instapay'],
    }),
    subtotal: money('subtotal').notNull().default(0),
    discountAmount: money('discount_amount').notNull().default(0),
    shippingFee: money('shipping_fee').notNull().default(0),
    taxAmount: money('tax_amount').notNull().default(0),
    total: money('total').notNull().default(0),
    couponId: text('coupon_id').references(() => coupons.id, {
      onDelete: 'set null',
    }),
    customerName: text('customer_name'),
    customerPhone: text('customer_phone'),
    customerEmail: text('customer_email'),
    shippingGovernorate: text('shipping_governorate'),
    shippingCity: text('shipping_city'),
    shippingAddress: text('shipping_address'),
    shippingBuilding: text('shipping_building'),
    shippingInstructions: text('shipping_instructions'),
    shippingMethod: text('shipping_method'),
    trackingNumber: text('tracking_number'),
    estimatedDelivery: text('estimated_delivery'),
    internalNotes: text('internal_notes'),
    customerNotes: text('customer_notes'),
    cancellationReason: text('cancellation_reason'),
    createdAt: timestamp('created_at')
      .notNull()
      .$defaultFn(now),
    updatedAt: timestamp('updated_at')
      .notNull()
      .$defaultFn(now),
  },
  (t) => [
    uniqueIndex('ord_number_idx').on(t.orderNumber),
    index('ord_user_idx').on(t.userId),
    index('ord_status_idx').on(t.status),
    index('ord_pay_status_idx').on(t.paymentStatus),
    index('ord_created_idx').on(t.createdAt),
    index('ord_guest_email_idx').on(t.guestEmail),
    index('ord_guest_phone_idx').on(t.guestPhone),
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
// 14. ORDER ITEMS
// ═══════════════════════════════════════════════════════════════════════════
export const orderItems = sqliteTable(
  'order_items',
  {
    id: text('id').primaryKey(),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    productId: text('product_id')
      .notNull()
      .references(() => products.id),
    variantId: text('variant_id')
      .notNull()
      .references(() => productVariants.id),
    productNameSnapshot: text('product_name_snapshot'),
    skuSnapshot: text('sku_snapshot'),
    variantInfoSnapshot: text('variant_info_snapshot'),
    unitPrice: money('unit_price').notNull(),
    discount: money('discount').notNull().default(0),
    quantity: integer('quantity').notNull(),
    total: money('total').notNull(),
    createdAt: timestamp('created_at')
      .notNull()
      .$defaultFn(now),
  },
  (t) => [
    index('oi_order_idx').on(t.orderId),
    index('oi_product_idx').on(t.productId),
    index('oi_variant_idx').on(t.variantId),
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
// 15. ORDER STATUS HISTORY
// ═══════════════════════════════════════════════════════════════════════════
export const orderStatusHistory = sqliteTable(
  'order_status_history',
  {
    id: text('id').primaryKey(),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    oldStatus: text('old_status'),
    newStatus: text('new_status').notNull(),
    changedBy: text('changed_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    reason: text('reason'),
    createdAt: timestamp('created_at')
      .notNull()
      .$defaultFn(now),
  },
  (t) => [
    index('osh_order_idx').on(t.orderId),
    index('osh_created_idx').on(t.createdAt),
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
// 16. PAYMENTS
// ═══════════════════════════════════════════════════════════════════════════
export const payments = sqliteTable(
  'payments',
  {
    id: text('id').primaryKey(),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    method: text('method'),
    provider: text('provider'),
    providerTransactionId: text('provider_transaction_id'),
    amount: money('amount').notNull(),
    status: text('status', {
      enum: ['pending', 'success', 'failed', 'refunded'],
    })
      .notNull()
      .default('pending'),
    providerResponse: text('provider_response'),
    createdAt: timestamp('created_at')
      .notNull()
      .$defaultFn(now),
  },
  (t) => [
    index('pay_order_idx').on(t.orderId),
    index('pay_status_idx').on(t.status),
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
// 17. COUPONS
// ═══════════════════════════════════════════════════════════════════════════
export const coupons = sqliteTable(
  'coupons',
  {
    id: text('id').primaryKey(),
    code: text('code').notNull(),
    type: text('type', {
      enum: ['percentage', 'fixed', 'free_shipping'],
    }).notNull(),
    value: integer('value').notNull(),
    minOrderValue: money('min_order_value'),
    maxDiscount: money('max_discount'),
    startDate: timestamp('start_date'),
    endDate: timestamp('end_date'),
    totalLimit: integer('total_limit'),
    perCustomerLimit: integer('per_customer_limit').notNull().default(1),
    usageCount: integer('usage_count').notNull().default(0),
    appliesToProducts: text('applies_to_products'),
    appliesToCategories: text('applies_to_categories'),
    newCustomersOnly: bool('new_customers_only').notNull().default(0),
    isActive: bool('is_active').notNull().default(1),
    createdAt: timestamp('created_at')
      .notNull()
      .$defaultFn(now),
    updatedAt: timestamp('updated_at')
      .notNull()
      .$defaultFn(now),
  },
  (t) => [
    uniqueIndex('coup_code_idx').on(t.code),
    index('coup_active_idx').on(t.isActive),
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
// 18. COUPON REDEMPTIONS
// ═══════════════════════════════════════════════════════════════════════════
export const couponRedemptions = sqliteTable(
  'coupon_redemptions',
  {
    id: text('id').primaryKey(),
    couponId: text('coupon_id')
      .notNull()
      .references(() => coupons.id, { onDelete: 'cascade' }),
    orderId: text('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    userId: text('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    discountAmount: money('discount_amount').notNull(),
    createdAt: timestamp('created_at')
      .notNull()
      .$defaultFn(now),
  },
  (t) => [
    index('cr_coupon_idx').on(t.couponId),
    index('cr_order_idx').on(t.orderId),
    index('cr_user_idx').on(t.userId),
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
// 19. SHIPPING ZONES
// ═══════════════════════════════════════════════════════════════════════════
export const shippingZones = sqliteTable(
  'shipping_zones',
  {
    id: text('id').primaryKey(),
    nameAr: text('name_ar').notNull(),
    nameEn: text('name_en').notNull(),
    governorates: text('governorates').notNull(), // JSON array
    shippingFee: money('shipping_fee').notNull(),
    freeShippingThreshold: money('free_shipping_threshold'),
    estimatedDaysMin: integer('estimated_days_min').notNull(),
    estimatedDaysMax: integer('estimated_days_max').notNull(),
    isActive: bool('is_active').notNull().default(1),
    createdAt: timestamp('created_at')
      .notNull()
      .$defaultFn(now),
  },
  (t) => [
    index('sz_active_idx').on(t.isActive),
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
// 20. REVIEWS
// ═══════════════════════════════════════════════════════════════════════════
export const reviews = sqliteTable(
  'reviews',
  {
    id: text('id').primaryKey(),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    rating: integer('rating').notNull(),
    title: text('title'),
    comment: text('comment'),
    isApproved: bool('is_approved').notNull().default(0),
    createdAt: timestamp('created_at')
      .notNull()
      .$defaultFn(now),
  },
  (t) => [
    index('rev_product_idx').on(t.productId),
    index('rev_user_idx').on(t.userId),
    index('rev_approved_idx').on(t.isApproved),
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
// 21. WISHLISTS
// ═══════════════════════════════════════════════════════════════════════════
export const wishlists = sqliteTable(
  'wishlists',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at')
      .notNull()
      .$defaultFn(now),
  },
  (t) => [
    uniqueIndex('wl_user_product_idx').on(t.userId, t.productId),
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
// 22. CMS SECTIONS
// ═══════════════════════════════════════════════════════════════════════════
export const cmsSections = sqliteTable(
  'cms_sections',
  {
    id: text('id').primaryKey(),
    page: text('page').notNull(),
    sectionType: text('section_type', {
      enum: [
        'hero',
        'announcement',
        'categories',
        'new_arrivals',
        'bestsellers',
        'featured_collection',
        'campaign',
        'newsletter',
        'trust_badges',
        'instagram',
      ],
    }).notNull(),
    titleAr: text('title_ar'),
    titleEn: text('title_en'),
    subtitleAr: text('subtitle_ar'),
    subtitleEn: text('subtitle_en'),
    content: text('content'), // JSON
    imageUrl: text('image_url'),
    linkUrl: text('link_url'),
    displayOrder: integer('display_order').notNull().default(0),
    isVisible: bool('is_visible').notNull().default(1),
    createdAt: timestamp('created_at')
      .notNull()
      .$defaultFn(now),
    updatedAt: timestamp('updated_at')
      .notNull()
      .$defaultFn(now),
  },
  (t) => [
    index('cms_page_idx').on(t.page),
    index('cms_order_idx').on(t.page, t.displayOrder),
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
// 23. CMS PAGES
// ═══════════════════════════════════════════════════════════════════════════
export const cmsPages = sqliteTable(
  'cms_pages',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull(),
    titleAr: text('title_ar').notNull(),
    titleEn: text('title_en').notNull(),
    contentAr: text('content_ar'),
    contentEn: text('content_en'),
    seoTitleAr: text('seo_title_ar'),
    seoTitleEn: text('seo_title_en'),
    seoDescriptionAr: text('seo_description_ar'),
    seoDescriptionEn: text('seo_description_en'),
    isPublished: bool('is_published').notNull().default(0),
    createdAt: timestamp('created_at')
      .notNull()
      .$defaultFn(now),
    updatedAt: timestamp('updated_at')
      .notNull()
      .$defaultFn(now),
  },
  (t) => [
    uniqueIndex('cmsp_slug_idx').on(t.slug),
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
// 24. NOTIFICATION TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════
export const notificationTemplates = sqliteTable(
  'notification_templates',
  {
    id: text('id').primaryKey(),
    eventType: text('event_type').notNull(),
    subjectAr: text('subject_ar'),
    subjectEn: text('subject_en'),
    bodyAr: text('body_ar'),
    bodyEn: text('body_en'),
    channels: text('channels'), // comma-separated: email,sms,whatsapp
    isActive: bool('is_active').notNull().default(1),
    createdAt: timestamp('created_at')
      .notNull()
      .$defaultFn(now),
  },
  (t) => [
    uniqueIndex('nt_event_idx').on(t.eventType),
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
// 25. NOTIFICATION LOGS
// ═══════════════════════════════════════════════════════════════════════════
export const notificationLogs = sqliteTable(
  'notification_logs',
  {
    id: text('id').primaryKey(),
    templateId: text('template_id').references(
      () => notificationTemplates.id,
      { onDelete: 'set null' },
    ),
    recipient: text('recipient').notNull(),
    channel: text('channel').notNull(),
    subject: text('subject'),
    body: text('body'),
    status: text('status', {
      enum: ['sent', 'failed', 'pending'],
    })
      .notNull()
      .default('pending'),
    error: text('error'),
    createdAt: timestamp('created_at')
      .notNull()
      .$defaultFn(now),
  },
  (t) => [
    index('nl_template_idx').on(t.templateId),
    index('nl_status_idx').on(t.status),
    index('nl_created_idx').on(t.createdAt),
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
// 26. AUDIT LOG
// ═══════════════════════════════════════════════════════════════════════════
export const auditLog = sqliteTable(
  'audit_log',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    action: text('action').notNull(),
    entityType: text('entity_type'),
    entityId: text('entity_id'),
    oldValues: text('old_values'), // JSON
    newValues: text('new_values'), // JSON
    ipAddress: text('ip_address'),
    createdAt: timestamp('created_at')
      .notNull()
      .$defaultFn(now),
  },
  (t) => [
    index('al_user_idx').on(t.userId),
    index('al_entity_idx').on(t.entityType, t.entityId),
    index('al_created_idx').on(t.createdAt),
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
// 27. STORE SETTINGS (key-value)
// ═══════════════════════════════════════════════════════════════════════════
export const storeSettings = sqliteTable('store_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .$defaultFn(now),
});

// ═══════════════════════════════════════════════════════════════════════════
// 28. RECENTLY VIEWED
// ═══════════════════════════════════════════════════════════════════════════
export const recentlyViewed = sqliteTable(
  'recently_viewed',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').references(() => users.id, {
      onDelete: 'cascade',
    }),
    sessionId: text('session_id'),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    viewedAt: timestamp('viewed_at')
      .notNull()
      .$defaultFn(now),
  },
  (t) => [
    index('rv_user_idx').on(t.userId),
    index('rv_session_idx').on(t.sessionId),
    index('rv_product_idx').on(t.productId),
    index('rv_viewed_idx').on(t.viewedAt),
  ],
);

// ═══════════════════════════════════════════════════════════════════════════
// RELATIONS (Drizzle relational query support)
// ═══════════════════════════════════════════════════════════════════════════

export const usersRelations = relations(users, ({ many, one }) => ({
  customerProfile: one(customerProfiles, {
    fields: [users.id],
    references: [customerProfiles.userId],
  }),
  addresses: many(addresses),
  orders: many(orders),
  reviews: many(reviews),
  wishlists: many(wishlists),
  carts: many(carts),
}));

export const customerProfilesRelations = relations(
  customerProfiles,
  ({ one }) => ({
    user: one(users, {
      fields: [customerProfiles.userId],
      references: [users.id],
    }),
  }),
);

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many, one }) => ({
  products: many(products),
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
}));

export const collectionsRelations = relations(collections, ({ many }) => ({
  collectionProducts: many(collectionProducts),
}));

export const collectionProductsRelations = relations(
  collectionProducts,
  ({ one }) => ({
    collection: one(collections, {
      fields: [collectionProducts.collectionId],
      references: [collections.id],
    }),
    product: one(products, {
      fields: [collectionProducts.productId],
      references: [products.id],
    }),
  }),
);

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  images: many(productImages),
  variants: many(productVariants),
  reviews: many(reviews),
  orderItems: many(orderItems),
  wishlists: many(wishlists),
  collectionProducts: many(collectionProducts),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const productVariantsRelations = relations(
  productVariants,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
    inventoryMovements: many(inventoryMovements),
    cartItems: many(cartItems),
  }),
);

export const inventoryMovementsRelations = relations(
  inventoryMovements,
  ({ one }) => ({
    variant: one(productVariants, {
      fields: [inventoryMovements.variantId],
      references: [productVariants.id],
    }),
    creator: one(users, {
      fields: [inventoryMovements.createdBy],
      references: [users.id],
    }),
  }),
);

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  variant: one(productVariants, {
    fields: [cartItems.variantId],
    references: [productVariants.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  coupon: one(coupons, {
    fields: [orders.couponId],
    references: [coupons.id],
  }),
  items: many(orderItems),
  statusHistory: many(orderStatusHistory),
  payments: many(payments),
  couponRedemptions: many(couponRedemptions),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [orderItems.variantId],
    references: [productVariants.id],
  }),
}));

export const orderStatusHistoryRelations = relations(
  orderStatusHistory,
  ({ one }) => ({
    order: one(orders, {
      fields: [orderStatusHistory.orderId],
      references: [orders.id],
    }),
    changedByUser: one(users, {
      fields: [orderStatusHistory.changedBy],
      references: [users.id],
    }),
  }),
);

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));

export const couponsRelations = relations(coupons, ({ many }) => ({
  redemptions: many(couponRedemptions),
  orders: many(orders),
}));

export const couponRedemptionsRelations = relations(
  couponRedemptions,
  ({ one }) => ({
    coupon: one(coupons, {
      fields: [couponRedemptions.couponId],
      references: [coupons.id],
    }),
    order: one(orders, {
      fields: [couponRedemptions.orderId],
      references: [orders.id],
    }),
    user: one(users, {
      fields: [couponRedemptions.userId],
      references: [users.id],
    }),
  }),
);

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [wishlists.productId],
    references: [products.id],
  }),
}));

export const cmsSectionsRelations = relations(cmsSections, () => ({}));
export const cmsPagesRelations = relations(cmsPages, () => ({}));

export const notificationTemplatesRelations = relations(
  notificationTemplates,
  ({ many }) => ({
    logs: many(notificationLogs),
  }),
);

export const notificationLogsRelations = relations(
  notificationLogs,
  ({ one }) => ({
    template: one(notificationTemplates, {
      fields: [notificationLogs.templateId],
      references: [notificationTemplates.id],
    }),
  }),
);

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  user: one(users, {
    fields: [auditLog.userId],
    references: [users.id],
  }),
}));

export const recentlyViewedRelations = relations(
  recentlyViewed,
  ({ one }) => ({
    user: one(users, {
      fields: [recentlyViewed.userId],
      references: [users.id],
    }),
    product: one(products, {
      fields: [recentlyViewed.productId],
      references: [products.id],
    }),
  }),
);

// ═══════════════════════════════════════════════════════════════════════════
// TYPE INFERENCES
// ═══════════════════════════════════════════════════════════════════════════

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type CustomerProfile = typeof customerProfiles.$inferSelect;
export type NewCustomerProfile = typeof customerProfiles.$inferInsert;
export type Address = typeof addresses.$inferSelect;
export type NewAddress = typeof addresses.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Collection = typeof collections.$inferSelect;
export type NewCollection = typeof collections.$inferInsert;
export type CollectionProduct = typeof collectionProducts.$inferSelect;
export type NewCollectionProduct = typeof collectionProducts.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductImage = typeof productImages.$inferSelect;
export type NewProductImage = typeof productImages.$inferInsert;
export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;
export type InventoryMovement = typeof inventoryMovements.$inferSelect;
export type NewInventoryMovement = typeof inventoryMovements.$inferInsert;
export type Cart = typeof carts.$inferSelect;
export type NewCart = typeof carts.$inferInsert;
export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type OrderStatusHistoryEntry = typeof orderStatusHistory.$inferSelect;
export type NewOrderStatusHistoryEntry = typeof orderStatusHistory.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type Coupon = typeof coupons.$inferSelect;
export type NewCoupon = typeof coupons.$inferInsert;
export type CouponRedemption = typeof couponRedemptions.$inferSelect;
export type NewCouponRedemption = typeof couponRedemptions.$inferInsert;
export type ShippingZone = typeof shippingZones.$inferSelect;
export type NewShippingZone = typeof shippingZones.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
export type Wishlist = typeof wishlists.$inferSelect;
export type NewWishlist = typeof wishlists.$inferInsert;
export type CmsSection = typeof cmsSections.$inferSelect;
export type NewCmsSection = typeof cmsSections.$inferInsert;
export type CmsPage = typeof cmsPages.$inferSelect;
export type NewCmsPage = typeof cmsPages.$inferInsert;
export type NotificationTemplate = typeof notificationTemplates.$inferSelect;
export type NewNotificationTemplate = typeof notificationTemplates.$inferInsert;
export type NotificationLog = typeof notificationLogs.$inferSelect;
export type NewNotificationLog = typeof notificationLogs.$inferInsert;
export type AuditLogEntry = typeof auditLog.$inferSelect;
export type NewAuditLogEntry = typeof auditLog.$inferInsert;
export type StoreSetting = typeof storeSettings.$inferSelect;
export type NewStoreSetting = typeof storeSettings.$inferInsert;
export type RecentlyViewedEntry = typeof recentlyViewed.$inferSelect;
export type NewRecentlyViewedEntry = typeof recentlyViewed.$inferInsert;
