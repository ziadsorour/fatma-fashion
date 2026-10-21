import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/middleware';

// PUT /api/admin/staff/[id] — Update staff user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAdmin(request);
    const { id } = await params;

    const existing = (db as any).$client
      .prepare("SELECT * FROM users WHERE id = ? AND role != 'customer'")
      .get(id);

    if (!existing) {
      return NextResponse.json({ error: 'Staff user not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, email, role, phone } = body;

    const validRoles = ['admin', 'manager', 'fulfillment', 'product_manager', 'support', 'analyst'];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` }, { status: 400 });
    }

    // Check email uniqueness if changing
    if (email && email !== existing.email) {
      const emailExists = (db as any).$client
        .prepare('SELECT id FROM users WHERE email = ? AND id != ?')
        .get(email, id);
      if (emailExists) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
      }
    }

    const now = Math.floor(Date.now() / 1000);

    (db as any).$client
      .prepare(
        `UPDATE users
         SET name = COALESCE(?, name),
             email = COALESCE(?, email),
             role = COALESCE(?, role),
             phone = COALESCE(?, phone),
             updated_at = ?
         WHERE id = ?`
      )
      .run(
        name ?? null,
        email ?? null,
        role ?? null,
        phone ?? null,
        now,
        id
      );

    const user = (db as any).$client
      .prepare('SELECT id, email, name, phone, role, email_verified, created_at, updated_at FROM users WHERE id = ?')
      .get(id);

    return NextResponse.json({ user });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/staff/[id] — Deactivate staff (don't allow deleting last admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAdmin(request);
    const { id } = await params;

    const existing = (db as any).$client
      .prepare("SELECT * FROM users WHERE id = ? AND role != 'customer'")
      .get(id);

    if (!existing) {
      return NextResponse.json({ error: 'Staff user not found' }, { status: 404 });
    }

    // Don't allow deleting the last admin
    if (existing.role === 'admin') {
      const adminCount = (db as any).$client
        .prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'")
        .get();

      if (adminCount.count <= 1) {
        return NextResponse.json({ error: 'Cannot delete the last admin user' }, { status: 400 });
      }
    }

    // Deactivate by changing role to 'customer' (soft-disable)
    const now = Math.floor(Date.now() / 1000);
    (db as any).$client
      .prepare(
        `UPDATE users SET role = 'customer', updated_at = ? WHERE id = ?`
      )
      .run(now, id);

    return NextResponse.json({ success: true, message: 'Staff user deactivated' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
