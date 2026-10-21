import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateId, slugify } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { nameEn, nameAr, slug: customSlug } = await request.json();
    if (!nameEn) return NextResponse.json({ error: 'Name required' }, { status: 400 });
    const sqlite = (db as any).$client;
    const id = generateId();
    const slug = customSlug || slugify(nameEn);
    const now = Date.now();
    const maxOrder = sqlite.prepare('SELECT MAX(display_order) as m FROM categories').get()?.m || 0;
    sqlite.prepare('INSERT INTO categories (id, name_ar, name_en, slug, display_order, is_visible, created_at, updated_at) VALUES (?,?,?,?,?,1,?,?)').run(id, nameAr || nameEn, nameEn, slug, maxOrder + 1, now, now);
    return NextResponse.json({ success: true, id });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, nameEn, nameAr, slug: customSlug } = await request.json();
    if (!id || !nameEn) return NextResponse.json({ error: 'ID and name required' }, { status: 400 });
    const sqlite = (db as any).$client;
    const slug = customSlug || slugify(nameEn);
    sqlite.prepare('UPDATE categories SET name_en = ?, name_ar = ?, slug = ?, updated_at = ? WHERE id = ?').run(nameEn, nameAr || nameEn, slug, Date.now(), id);
    return NextResponse.json({ success: true });
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
