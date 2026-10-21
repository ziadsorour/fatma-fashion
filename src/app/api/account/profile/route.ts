import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth/middleware';

// GET /api/account/profile — Get current user profile
export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = (db as any).$client
      .prepare(
        'SELECT id, email, name, phone, role, email_verified, created_at, updated_at FROM users WHERE id = ?'
      )
      .get(authUser.id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/account/profile — Update profile (name, phone)
export async function PUT(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone } = body;

    if (!name && !phone) {
      return NextResponse.json({ error: 'At least one of name or phone is required' }, { status: 400 });
    }

    const now = Math.floor(Date.now() / 1000);

    (db as any).$client
      .prepare(
        `UPDATE users
         SET name = COALESCE(?, name),
             phone = COALESCE(?, phone),
             updated_at = ?
         WHERE id = ?`
      )
      .run(name ?? null, phone ?? null, now, authUser.id);

    const user = (db as any).$client
      .prepare(
        'SELECT id, email, name, phone, role, email_verified, created_at, updated_at FROM users WHERE id = ?'
      )
      .get(authUser.id);

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
