import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// GET /api/admin/setup — Check if an admin already exists
export async function GET() {
  try {
    const existingAdmin = (db as any).$client
      .prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'")
      .get();

    return NextResponse.json({ hasAdmin: existingAdmin.count > 0 });
  } catch (error) {
    console.error('Check admin error:', error);
    return NextResponse.json({ hasAdmin: false });
  }
}

// POST /api/admin/setup — Initial admin setup (only when no admins exist)
export async function POST(request: NextRequest) {
  try {
    // Check if any admin users already exist
    const existingAdmin = (db as any).$client
      .prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'")
      .get();

    if (existingAdmin.count > 0) {
      return NextResponse.json(
        { error: 'Admin user already exists. Setup is not allowed.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const now = Math.floor(Date.now() / 1000);
    const passwordHash = await bcrypt.hash(password, 12);

    // Check if email already registered as customer
    const existingUser = (db as any).$client
      .prepare('SELECT id FROM users WHERE email = ?')
      .get(email);

    if (existingUser) {
      // Upgrade existing account to admin
      (db as any).$client
        .prepare("UPDATE users SET role = 'admin', name = ?, password_hash = ?, updated_at = ? WHERE email = ?")
        .run(name, passwordHash, now, email);

      return NextResponse.json({
        success: true,
        message: 'Existing account promoted to admin successfully',
        user: { id: existingUser.id, email, name, role: 'admin' },
      }, { status: 200 });
    }

    const id = crypto.randomUUID();
    (db as any).$client
      .prepare(
        `INSERT INTO users (id, email, password_hash, name, role, email_verified, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'admin', 1, ?, ?)`
      )
      .run(id, email, passwordHash, name, now, now);

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      user: { id, email, name, role: 'admin' },
    }, { status: 201 });
  } catch (error) {
    console.error('Admin setup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
