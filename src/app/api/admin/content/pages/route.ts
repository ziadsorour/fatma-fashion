import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/middleware';
import crypto from 'crypto';

// GET /api/admin/content/pages — List CMS pages
export async function GET(request: NextRequest) {
  try {
    requireAdmin(request);

    const pages = (db as any).$client
      .prepare('SELECT * FROM cms_pages ORDER BY created_at DESC')
      .all();

    return NextResponse.json({ pages });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/content/pages — Create CMS page
export async function POST(request: NextRequest) {
  try {
    requireAdmin(request);

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

    if (!slug || !title_ar || !title_en) {
      return NextResponse.json({ error: 'slug, title_ar, and title_en are required' }, { status: 400 });
    }

    // Check slug uniqueness
    const existingSlug = (db as any).$client
      .prepare('SELECT id FROM cms_pages WHERE slug = ?')
      .get(slug);

    if (existingSlug) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }

    const id = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    (db as any).$client
      .prepare(
        `INSERT INTO cms_pages (id, slug, title_ar, title_en, content_ar, content_en, seo_title_ar, seo_title_en, seo_description_ar, seo_description_en, is_published, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        id,
        slug,
        title_ar,
        title_en,
        content_ar ?? null,
        content_en ?? null,
        seo_title_ar ?? null,
        seo_title_en ?? null,
        seo_description_ar ?? null,
        seo_description_en ?? null,
        is_published != null ? (is_published ? 1 : 0) : 0,
        now,
        now
      );

    const page = (db as any).$client
      .prepare('SELECT * FROM cms_pages WHERE id = ?')
      .get(id);

    return NextResponse.json({ page }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
