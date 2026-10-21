import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { code, subtotal } = await request.json();
    if (!code) return NextResponse.json({ valid: false, error: 'No code provided' });

    const sqlite = (db as any).$client;
    const now = Date.now();
    const coupon = sqlite.prepare(
      "SELECT * FROM coupons WHERE code = ? AND is_active = 1"
    ).get(code.toUpperCase());

    if (!coupon) return NextResponse.json({ valid: false, error: 'Invalid coupon code' });

    // Check dates
    if (coupon.start_date && coupon.start_date > now) return NextResponse.json({ valid: false, error: 'Coupon not yet active' });
    if (coupon.end_date && coupon.end_date < now) return NextResponse.json({ valid: false, error: 'Coupon expired' });

    // Check usage limits
    if (coupon.total_limit && coupon.usage_count >= coupon.total_limit) return NextResponse.json({ valid: false, error: 'Coupon fully redeemed' });

    // Check minimum order
    if (coupon.min_order_value && subtotal < coupon.min_order_value) {
      return NextResponse.json({ valid: false, error: `Minimum order: EGP ${(coupon.min_order_value / 100).toFixed(0)}` });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = Math.round(subtotal * coupon.value / 100);
      if (coupon.max_discount && discount > coupon.max_discount) discount = coupon.max_discount;
    } else if (coupon.type === 'fixed') {
      discount = Math.min(coupon.value, subtotal);
    } else if (coupon.type === 'free_shipping') {
      discount = 0; // Handled at checkout
    }

    return NextResponse.json({
      valid: true, discount, type: coupon.type,
      description: coupon.type === 'percentage' ? `${coupon.value}% off` : coupon.type === 'fixed' ? `EGP ${(coupon.value / 100).toFixed(0)} off` : 'Free shipping',
    });
  } catch (error) {
    return NextResponse.json({ valid: false, error: 'Error validating coupon' });
  }
}
