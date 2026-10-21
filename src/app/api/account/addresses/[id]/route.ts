import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/auth/middleware';

// PUT /api/account/addresses/[id] — Update address
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = (db as any).$client
      .prepare('SELECT * FROM addresses WHERE id = ? AND user_id = ?')
      .get(id, authUser.id);

    if (!existing) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
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

    // If setting as default, unset others
    if (is_default) {
      (db as any).$client
        .prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?')
        .run(authUser.id);
    }

    (db as any).$client
      .prepare(
        `UPDATE addresses
         SET label = ?,
             full_name = COALESCE(?, full_name),
             phone = COALESCE(?, phone),
             governorate = COALESCE(?, governorate),
             city = COALESCE(?, city),
             address_line1 = COALESCE(?, address_line1),
             address_line2 = ?,
             building_info = ?,
             delivery_instructions = ?,
             is_default = COALESCE(?, is_default)
         WHERE id = ?`
      )
      .run(
        label !== undefined ? label : existing.label,
        full_name ?? null,
        phone ?? null,
        governorate ?? null,
        city ?? null,
        address_line1 ?? null,
        address_line2 !== undefined ? address_line2 : existing.address_line2,
        building_info !== undefined ? building_info : existing.building_info,
        delivery_instructions !== undefined ? delivery_instructions : existing.delivery_instructions,
        is_default != null ? (is_default ? 1 : 0) : null,
        id
      );

    const address = (db as any).$client
      .prepare('SELECT * FROM addresses WHERE id = ?')
      .get(id);

    return NextResponse.json({ address });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/account/addresses/[id] — Delete address (verify ownership)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = (db as any).$client
      .prepare('SELECT * FROM addresses WHERE id = ? AND user_id = ?')
      .get(id, authUser.id);

    if (!existing) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    (db as any).$client
      .prepare('DELETE FROM addresses WHERE id = ?')
      .run(id);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
