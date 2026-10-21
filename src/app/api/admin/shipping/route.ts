import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/middleware';
import crypto from 'crypto';

// GET /api/admin/shipping — List all shipping zones
export async function GET(request: NextRequest) {
  try {
    requireAdmin(request);

    const zones = (db as any).$client
      .prepare('SELECT * FROM shipping_zones ORDER BY created_at DESC')
      .all();

    return NextResponse.json({ zones });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/shipping — Create shipping zone
export async function POST(request: NextRequest) {
  try {
    requireAdmin(request);

    const body = await request.json();
    const {
      name_ar,
      name_en,
      governorates,
      shipping_fee,
      free_shipping_threshold,
      estimated_days_min,
      estimated_days_max,
      is_active,
    } = body;

    if (!name_ar || !name_en || !governorates || shipping_fee == null || estimated_days_min == null || estimated_days_max == null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    (db as any).$client
      .prepare(
        `INSERT INTO shipping_zones (id, name_ar, name_en, governorates, shipping_fee, free_shipping_threshold, estimated_days_min, estimated_days_max, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        id,
        name_ar,
        name_en,
        JSON.stringify(governorates),
        shipping_fee,
        free_shipping_threshold ?? null,
        estimated_days_min,
        estimated_days_max,
        is_active != null ? (is_active ? 1 : 0) : 1,
        now
      );

    const zone = (db as any).$client
      .prepare('SELECT * FROM shipping_zones WHERE id = ?')
      .get(id);

    return NextResponse.json({ zone }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
