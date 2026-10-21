import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateId } from '@/lib/utils';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name_ar, name_en, governorates, shipping_fee,
      free_shipping_threshold, estimated_days_min, estimated_days_max, is_active
    } = body;

    const client = (db as any).$client;
    const govStr = typeof governorates === 'string' ? governorates : JSON.stringify(governorates || []);

    client.prepare(`
      UPDATE shipping_zones SET
        name_ar = ?, name_en = ?, governorates = ?, shipping_fee = ?,
        free_shipping_threshold = ?, estimated_days_min = ?, estimated_days_max = ?, is_active = ?
      WHERE id = ?
    `).run(
      name_ar, name_en, govStr,
      typeof shipping_fee === 'number' ? shipping_fee : 0,
      free_shipping_threshold || null,
      estimated_days_min || 2, estimated_days_max || 5,
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      id
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update shipping zone error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const client = (db as any).$client;
    client.prepare('DELETE FROM shipping_zones WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete shipping zone error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete' }, { status: 500 });
  }
}
