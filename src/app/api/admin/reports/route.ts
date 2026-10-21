import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/middleware';

// GET /api/admin/reports — Generate reports
export async function GET(request: NextRequest) {
  try {
    requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'sales';
    const from = searchParams.get('from'); // Unix timestamp or ISO date
    const to = searchParams.get('to');

    // Convert date strings to unix timestamps if needed
    let fromTs: number | null = null;
    let toTs: number | null = null;
    if (from) {
      fromTs = isNaN(Number(from)) ? Math.floor(new Date(from).getTime() / 1000) : Number(from);
    }
    if (to) {
      toTs = isNaN(Number(to)) ? Math.floor(new Date(to).getTime() / 1000) : Number(to);
    }

    const dateFilter = buildDateFilter(fromTs, toTs);

    switch (type) {
      case 'sales':
        return NextResponse.json({ report: generateSalesReport(dateFilter, fromTs, toTs) });
      case 'products':
        return NextResponse.json({ report: generateProductsReport(dateFilter, fromTs, toTs) });
      case 'categories':
        return NextResponse.json({ report: generateCategoriesReport(dateFilter, fromTs, toTs) });
      case 'customers':
        return NextResponse.json({ report: generateCustomersReport(dateFilter, fromTs, toTs) });
      case 'coupons':
        return NextResponse.json({ report: generateCouponsReport(dateFilter, fromTs, toTs) });
      default:
        return NextResponse.json({ error: 'Invalid report type. Use: sales, products, categories, customers, coupons' }, { status: 400 });
    }
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function buildDateFilter(from: number | null, to: number | null): string {
  const conditions: string[] = [];
  if (from) conditions.push(`o.created_at >= ${from}`);
  if (to) conditions.push(`o.created_at <= ${to}`);
  return conditions.length > 0 ? 'AND ' + conditions.join(' AND ') : '';
}

function generateSalesReport(dateFilter: string, from: number | null, to: number | null) {
  const summary = (db as any).$client
    .prepare(
      `SELECT
         COUNT(*) as total_orders,
         COALESCE(SUM(total), 0) as total_revenue,
         COALESCE(AVG(total), 0) as avg_order_value,
         COALESCE(SUM(discount_amount), 0) as total_discounts,
         COALESCE(SUM(shipping_fee), 0) as total_shipping
       FROM orders o
       WHERE 1=1 ${dateFilter}`
    )
    .get();

  const byStatus = (db as any).$client
    .prepare(
      `SELECT status, COUNT(*) as count, COALESCE(SUM(total), 0) as revenue
       FROM orders o
       WHERE 1=1 ${dateFilter}
       GROUP BY status
       ORDER BY count DESC`
    )
    .all();

  const byPaymentStatus = (db as any).$client
    .prepare(
      `SELECT payment_status, COUNT(*) as count, COALESCE(SUM(total), 0) as revenue
       FROM orders o
       WHERE 1=1 ${dateFilter}
       GROUP BY payment_status
       ORDER BY count DESC`
    )
    .all();

  return {
    type: 'sales',
    period: { from, to },
    summary,
    by_status: byStatus,
    by_payment_status: byPaymentStatus,
  };
}

function generateProductsReport(dateFilter: string, from: number | null, to: number | null) {
  const topByQuantity = (db as any).$client
    .prepare(
      `SELECT
         oi.product_id,
         p.name_ar,
         p.name_en,
         p.sku,
         SUM(oi.quantity) as total_quantity,
         SUM(oi.total) as total_revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       JOIN products p ON p.id = oi.product_id
       WHERE o.status NOT IN ('cancelled', 'refunded') ${dateFilter}
       GROUP BY oi.product_id
       ORDER BY total_quantity DESC
       LIMIT 20`
    )
    .all();

  const topByRevenue = (db as any).$client
    .prepare(
      `SELECT
         oi.product_id,
         p.name_ar,
         p.name_en,
         p.sku,
         SUM(oi.quantity) as total_quantity,
         SUM(oi.total) as total_revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       JOIN products p ON p.id = oi.product_id
       WHERE o.status NOT IN ('cancelled', 'refunded') ${dateFilter}
       GROUP BY oi.product_id
       ORDER BY total_revenue DESC
       LIMIT 20`
    )
    .all();

  return {
    type: 'products',
    period: { from, to },
    top_by_quantity: topByQuantity,
    top_by_revenue: topByRevenue,
  };
}

function generateCategoriesReport(dateFilter: string, from: number | null, to: number | null) {
  const salesByCategory = (db as any).$client
    .prepare(
      `SELECT
         c.id as category_id,
         c.name_ar,
         c.name_en,
         COUNT(DISTINCT o.id) as order_count,
         SUM(oi.quantity) as total_quantity,
         SUM(oi.total) as total_revenue
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       JOIN products p ON p.id = oi.product_id
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE o.status NOT IN ('cancelled', 'refunded') ${dateFilter}
       GROUP BY c.id
       ORDER BY total_revenue DESC`
    )
    .all();

  return {
    type: 'categories',
    period: { from, to },
    sales_by_category: salesByCategory,
  };
}

function generateCustomersReport(dateFilter: string, from: number | null, to: number | null) {
  // New customers in period
  const userDateFilter: string[] = [];
  if (from) userDateFilter.push(`created_at >= ${from}`);
  if (to) userDateFilter.push(`created_at <= ${to}`);
  const userWhere = userDateFilter.length > 0 ? 'WHERE ' + userDateFilter.join(' AND ') : '';

  const newCustomers = (db as any).$client
    .prepare(
      `SELECT COUNT(*) as count
       FROM users
       ${userWhere}`
    )
    .get();

  const topSpenders = (db as any).$client
    .prepare(
      `SELECT
         o.user_id,
         u.name,
         u.email,
         COUNT(o.id) as order_count,
         SUM(o.total) as total_spent
       FROM orders o
       JOIN users u ON u.id = o.user_id
       WHERE o.status NOT IN ('cancelled', 'refunded') AND o.user_id IS NOT NULL ${dateFilter}
       GROUP BY o.user_id
       ORDER BY total_spent DESC
       LIMIT 20`
    )
    .all();

  return {
    type: 'customers',
    period: { from, to },
    new_customers: newCustomers.count,
    top_spenders: topSpenders,
  };
}

function generateCouponsReport(dateFilter: string, from: number | null, to: number | null) {
  const couponUsage = (db as any).$client
    .prepare(
      `SELECT
         c.id as coupon_id,
         c.code,
         c.type,
         c.value,
         COUNT(cr.id) as usage_count,
         COALESCE(SUM(cr.discount_amount), 0) as total_discount
       FROM coupons c
       LEFT JOIN coupon_redemptions cr ON cr.coupon_id = c.id
       LEFT JOIN orders o ON o.id = cr.order_id ${dateFilter.replace(/AND/g, 'AND')}
       GROUP BY c.id
       ORDER BY usage_count DESC`
    )
    .all();

  return {
    type: 'coupons',
    period: { from, to },
    coupon_usage: couponUsage,
  };
}
