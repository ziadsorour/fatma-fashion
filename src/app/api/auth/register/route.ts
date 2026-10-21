import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';
import { generateId } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password } = await request.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password required' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const sqlite = (db as any).$client;
    const existing = sqlite.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await hash(password, 12);
    const id = generateId();
    const now = Date.now();

    sqlite.prepare(
      'INSERT INTO users (id, email, password_hash, name, phone, role, email_verified, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)'
    ).run(id, email, passwordHash, name, phone || null, 'customer', now, now);

    // Create customer profile
    sqlite.prepare(
      'INSERT INTO customer_profiles (id, user_id, phone, lifetime_spent, order_count, created_at) VALUES (?, ?, ?, 0, 0, ?)'
    ).run(generateId(), id, phone || null, now);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
