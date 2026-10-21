# FATMA — FASHION FOR GIRLS (فاطمة — أزياء للبنات)

> Production-ready, mobile-first women's fashion e-commerce platform built for the Egyptian market.

---

## 🌟 Brand Overview

- **Brand Name:** FATMA (فاطمة)
- **Tagline:** FASHION FOR GIRLS (أزياء للبنات)
- **Target Audience:** Young women shopping for stylish casual wear, tops, sweaters, trousers, dresses, matching sets, and seasonal collections.
- **Market:** Egypt (EGP / ج.م)
- **Languages:** Arabic (Default, complete RTL support) & English (LTR switchable)
- **Design Philosophy:** Feminine, modern, premium editorial, warm cream & blush tones, charcoal typography.

### 🎨 Design System & Color Tokens

| Token | Hex | Usage |
| :--- | :--- | :--- |
| **Cream** | `#F8F1EB` | Primary background, clean editorial feel |
| **Warm Beige** | `#E8D7C9` | Secondary cards, subtle borders, chips |
| **Rose Blush** | `#B8787D` | Accent badges, sale tags, subtle highlights |
| **Rose Gold** | `#B58A68` | Primary CTA buttons, brand badges, active links |
| **Charcoal** | `#292522` | Typography, primary headers, dark sidebar |
| **White** | `#FFFFFF` | Surface containers, modals, crisp contrast |

---

## 🛠️ Architecture & Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Turbopack, Server Actions)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4 with custom brand tokens, RTL support (`dir="rtl"`)
- **Database:** SQLite (`better-sqlite3` with WAL mode & foreign keys enabled)
- **ORM:** Drizzle ORM (28 strongly typed tables with integer piasters storage)
- **State Management:** Zustand with LocalStorage persistence for Cart & Wishlist
- **Authentication:** Role-Based Access Control (Admin, Manager, Fulfillment, Product Manager, Support, Analyst, Customer) with JWT HTTP-only cookies
- **Security:**
  - Zero default admin credentials (secure initial setup wizard at `/admin/setup`)
  - Server-side stock deduction & transactional reservation
  - Server-side price recalculation (never trust client totals)
  - Security headers (CSP, X-Frame-Options, Nosniff, Referrer-Policy)

---

## 📱 Features

### 🛍️ Customer Experience
1. **Homepage:**
   - Announcement banner for drops and shipping thresholds
   - Hero section with brand headline: *"Style That Feels Like You"*
   - Category grid navigation
   - New arrivals & best sellers carousel/grid
   - Trust badges (Fast shipping across Egypt, easy 7-day returns, secure payment)
2. **Shop Catalog (`/shop`):**
   - Category filtering, price sorting, availability badges
   - Real-time stock status (In stock, Low stock, Out of stock)
   - One-click wishlist toggle
3. **Product Detail (`/product/[slug]`):**
   - Multi-image gallery with thumbnail preview
   - Variant picker (Size & Color) that updates SKU, stock, and price
   - Quantity selector bounded by live available stock
   - Size guide & shipping info accordions
   - Related products recommendations
4. **Cart (`/cart`):**
   - Dynamic persistent cart across sessions
   - Coupon code entry & validation against server rules
   - Real-time subtotal & shipping estimates
5. **Checkout (`/checkout`):**
   - Streamlined mobile-first checkout
   - Governorate selection with dynamic shipping fees
   - Payment options: Cash on Delivery (COD), Online (Paymob), InstaPay, Bank Transfer
   - Transaction-safe inventory decrement
   - Immediate order confirmation with order code (`FM-XXXX`)
6. **Order Tracking (`/track-order`):**
   - Order progress timeline: Pending → Confirmed → Processing → Packed → Shipped → Delivered
7. **Customer Portal (`/account`):**
   - Order history with full itemized breakdown & cancellation capability
   - Address book management (Multiple delivery addresses)
   - Wishlist management
   - Profile settings & password change

---

### 🛡️ Admin Dashboard (`/admin`)

Protected server-side via Next.js Proxy/Middleware. Only staff with approved roles have access.

- **Initial Setup (`/admin/setup`):** One-time wizard to create the root administrator account. Automatically locks once an admin exists.
- **Dashboard Overview (`/admin`):** Real-time KPI metrics calculated directly from database records (Total Revenue, Orders, Average Order Value, Best Sellers, Low-Stock alerts).
- **Product Management (`/admin/products` & `/admin/products/[id]`):**
  - Full CRUD with bilingual titles and descriptions
  - Variant manager (Sizes, Color names in AR/EN, Hex codes, Individual stock)
  - Image uploader (`/api/upload`) with instant preview
- **Order Management (`/admin/orders` & `/admin/orders/[id]`):**
  - Order status workflow transitions
  - Auto stock restoration if order is cancelled
  - Tracking number assignment & shipping address inspection
  - Export orders to CSV
- **Categories (`/admin/categories`):** Hierarchical category management with Arabic & English translations.
- **Coupons (`/admin/coupons`):** Percentage, fixed, or free-shipping discount codes with min order values and usage limits.
- **Shipping Zones (`/admin/shipping`):** Dynamic governorate grouping, fee structure, and free-shipping thresholds.
- **Payment Settings (`/admin/payments`):**
  - Enable/disable payment providers
  - Paymob credentials configuration
  - InstaPay / Bank transfer instructions
- **CMS & Content (`/admin/content`):** Configure homepage sections and publish static policy pages.
- **Reports & Analytics (`/admin/reports`):** Date-filtered sales, top products, customer spending, and coupon performance with CSV exports.
- **Staff Access (`/admin/staff`):** Role-based team member permissions.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ (tested on Node 20 / 24)
- npm or pnpm

### 1. Installation
```bash
cd fatma-fashion
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Initialize & Seed Database
Seeds 7 categories, 14+ products with multi-size variants, shipping zones for Egyptian governorates, CMS pages, and settings:
```bash
npm run seed
```

### 4. Run Automated Integrity Tests
```bash
npm test
```

### 5. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3001](http://localhost:3001) in your browser.

### 6. Create Your Administrator Account
Navigate to:
```
http://localhost:3001/admin/setup
```
Fill in your name, email, and password to establish the first administrator account. Once created, this endpoint safely locks.

---

## 🔒 Security Best Practices

- **Zero Hardcoded Secrets:** All secrets, keys, and credentials use environment variables.
- **Password Security:** Passwords hashed using `bcryptjs` with salt rounds.
- **Monetary Precision:** All currency amounts are stored in **integer piasters** (e.g. 250 EGP = 25,000 piasters) to eliminate floating-point arithmetic errors.
- **Stock Protection:** Atomic database transactions prevent race conditions during concurrent order placement.

---

## 📄 License
All rights reserved © FATMA Fashion.
