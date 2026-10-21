import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/middleware';

// PUT /api/admin/content/pages/[id] — Update CMS page
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAdmin(request);
    const { id } = await params;

    const existing = (db as any).$client
      .prepare('SELECT * FROM cms_pages WHERE id = ?')
      .get(id);

    if (!existing) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      slug,
      title_ar,
      title_en,
      content_ar,
      content_en,
      seo_title_ar,
      seo_title_en,
      seo_description_ar,
      seo_description_en,
      is_published,
    } = body;

    // Check slug uniqueness if changing
    if (slug && slug !== existing.slug) {
      const slugExists = (db as any).$client
        .prepare('SELECT id FROM cms_pages WHERE slug = ? AND id != ?')
        .get(slug, id);
      if (slugExists) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
      }
    }

    const now = Math.floor(Date.now() / 1000);

    (db as any).$client
      .prepare(
        `UPDATE cms_pages
         SET slug = COALESCE(?, slug),
             title_ar = COALESCE(?, title_ar),
             title_en = COALESCE(?, title_en),
             content_ar = ?,
             content_en = ?,
             seo_title_ar = ?,
             seo_title_en = ?,
             seo_description_ar = ?,
             seo_description_en = ?,
             is_published = COALESCE(?, is_published),
             updated_at = ?
         WHERE id = ?`
      )
      .run(
        slug ?? null,
        title_ar ?? null,
        title_en ?? null,
        content_ar !== undefined ? content_ar : existing.content_ar,
        content_en !== undefined ? content_en : existing.content_en,
        seo_title_ar !== undefined ? seo_title_ar : existing.seo_title_ar,
        seo_title_en !== undefined ? seo_title_en : existing.seo_title_en,
        seo_description_ar !== undefined ? seo_description_ar : existing.seo_description_ar,
        seo_description_en !== undefined ? seo_description_en : existing.seo_description_en,
        is_published != null ? (is_published ? 1 : 0) : null,
        now,
        id
      );

    const page = (db as any).$client
      .prepare('SELECT * FROM cms_pages WHERE id = ?')
      .get(id);

    return NextResponse.json({ page });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/admin/content/pages/[id] — Delete CMS page
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireAdmin(request);
    const { id } = await params;

    const existing = (db as any).$client
      .prepare('SELECT * FROM cms_pages WHERE id = ?')
      .get(id);

    if (!existing) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    (db as any).$client
      .prepare('DELETE FROM cms_pages WHERE id = ?')
      .run(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
