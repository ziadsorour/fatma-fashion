import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const number = request.nextUrl.searchParams.get('number');
  const phone = request.nextUrl.searchParams.get('phone');
  if (!number || !phone) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });

  try {
    const sqlite = (db as any).$client;
    const order = sqlite.prepare(
      'SELECT order_number, status, payment_status, payment_method, total, shipping_fee, discount_amount, tracking_number, estimated_delivery, created_at FROM orders WHERE order_number = ? AND customer_phone = ?'
    ).get(number, phone);

    if (!order) return NextResponse.json({ order: null });
    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
