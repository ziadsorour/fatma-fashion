import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth/middleware';
import crypto from 'crypto';

// GET /api/account/addresses — List user addresses
export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const addresses = (db as any).$client
      .prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC')
      .all(authUser.id);

    return NextResponse.json({ addresses });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/account/addresses — Create address
export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      label,
      full_name,
      phone,
      governorate,
      city,
      address_line1,
      address_line2,
      building_info,
      delivery_instructions,
      is_default,
    } = body;

    if (!full_name || !phone || !governorate || !city || !address_line1) {
      return NextResponse.json({ error: 'full_name, phone, governorate, city, and address_line1 are required' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    // If this is the default address, unset others
    if (is_default) {
      (db as any).$client
        .prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?')
        .run(authUser.id);
    }

    (db as any).$client
      .prepare(
        `INSERT INTO addresses (id, user_id, label, full_name, phone, governorate, city, address_line1, address_line2, building_info, delivery_instructions, is_default, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        id,
        authUser.id,
        label ?? null,
        full_name,
        phone,
        governorate,
        city,
        address_line1,
        address_line2 ?? null,
        building_info ?? null,
        delivery_instructions ?? null,
        is_default ? 1 : 0,
        now
      );

    const address = (db as any).$client
      .prepare('SELECT * FROM addresses WHERE id = ?')
      .get(id);

    return NextResponse.json({ address }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
