import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/middleware';

// PUT /api/admin/content/sections/[id] — Update CMS section
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAdmin(request);
    const { id } = await params;

    const existing = (db as any).$client
      .prepare('SELECT * FROM cms_sections WHERE id = ?')
      .get(id);

    if (!existing) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      page,
      section_type,
      title_ar,
      title_en,
      subtitle_ar,
      subtitle_en,
      content,
      image_url,
      link_url,
      display_order,
      is_visible,
    } = body;

    const now = Math.floor(Date.now() / 1000);

    (db as any).$client
      .prepare(
        `UPDATE cms_sections
         SET page = COALESCE(?, page),
             section_type = COALESCE(?, section_type),
             title_ar = ?,
             title_en = ?,
             subtitle_ar = ?,
             subtitle_en = ?,
             content = ?,
             image_url = ?,
             link_url = ?,
             display_order = COALESCE(?, display_order),
             is_visible = COALESCE(?, is_visible),
             updated_at = ?
         WHERE id = ?`
      )
      .run(
        page ?? null,
        section_type ?? null,
        title_ar !== undefined ? title_ar : existing.title_ar,
        title_en !== undefined ? title_en : existing.title_en,
        subtitle_ar !== undefined ? subtitle_ar : existing.subtitle_ar,
        subtitle_en !== undefined ? subtitle_en : existing.subtitle_en,
        content !== undefined ? (typeof content === 'string' ? content : JSON.stringify(content)) : existing.content,
        image_url !== undefined ? image_url : existing.image_url,
        link_url !== undefined ? link_url : existing.link_url,
        display_order ?? null,
        is_visible != null ? (is_visible ? 1 : 0) : null,
        now,
        id
      );

    const section = (db as any).$client
      .prepare('SELECT * FROM cms_sections WHERE id = ?')
      .get(id);

    return NextResponse.json({ section });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/content/sections/[id] — Delete CMS section
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAdmin(request);
    const { id } = await params;

    const existing = (db as any).$client
      .prepare('SELECT * FROM cms_sections WHERE id = ?')
      .get(id);

    if (!existing) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    (db as any).$client
      .prepare('DELETE FROM cms_sections WHERE id = ?')
      .run(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
