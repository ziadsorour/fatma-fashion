import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/middleware';

// GET /api/admin/settings — Get all store settings as key-value pairs
export async function GET(request: NextRequest) {
  try {
    requireAdmin(request);

    const rows = (db as any).$client
      .prepare('SELECT key, value FROM store_settings')
      .all();

    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/settings — Update settings (upsert key-value pairs)
export async function PUT(request: NextRequest) {
  try {
    requireAdmin(request);

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Settings object is required' }, { status: 400 });
    }

    const now = Math.floor(Date.now() / 1000);
    const upsert = (db as any).$client.prepare(
      `INSERT INTO store_settings (key, value, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
    );

    const transaction = (db as any).$client.transaction((entries: [string, string][]) => {
      for (const [key, value] of entries) {
        upsert.run(key, String(value), now);
      }
    });

    transaction(Object.entries(settings));

    // Return updated settings
    const rows = (db as any).$client
      .prepare('SELECT key, value FROM store_settings')
      .all();

    const updated: Record<string, string> = {};
    for (const row of rows) {
      updated[row.key] = row.value;
    }

    return NextResponse.json({ settings: updated });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
