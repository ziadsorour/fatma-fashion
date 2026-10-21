import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/middleware';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// GET /api/admin/staff — List staff users (role != 'customer')
export async function GET(request: NextRequest) {
  try {
    requireAdmin(request);

    const staff = (db as any).$client
      .prepare(
        `SELECT id, email, name, phone, role, email_verified, created_at, updated_at
         FROM users
         WHERE role != 'customer'
         ORDER BY created_at DESC`
      )
      .all();

    return NextResponse.json({ staff });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/staff — Create staff user
export async function POST(request: NextRequest) {
  try {
    requireAdmin(request);

    const body = await request.json();
    const { name, email, password, role, phone } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'name, email, password, and role are required' }, { status: 400 });
    }

    const validRoles = ['admin', 'manager', 'fulfillment', 'product_manager', 'support', 'analyst'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` }, { status: 400 });
    }

    // Check email uniqueness
    const existingEmail = (db as any).$client
      .prepare('SELECT id FROM users WHERE email = ?')
      .get(email);

    if (existingEmail) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    const id = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);
    const passwordHash = await bcrypt.hash(password, 12);

    (db as any).$client
      .prepare(
        `INSERT INTO users (id, email, password_hash, name, phone, role, email_verified, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)`
      )
      .run(id, email, passwordHash, name, phone ?? null, role, now, now);

    const user = (db as any).$client
      .prepare('SELECT id, email, name, phone, role, email_verified, created_at, updated_at FROM users WHERE id = ?')
      .get(id);

    return NextResponse.json({ user }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
