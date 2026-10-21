import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/middleware';
import crypto from 'crypto';

// GET /api/admin/content/sections — List CMS sections
export async function GET(request: NextRequest) {
  try {
    requireAdmin(request);

    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');

    let sections;
    if (page) {
      sections = (db as any).$client
        .prepare('SELECT * FROM cms_sections WHERE page = ? ORDER BY display_order ASC')
        .all(page);
    } else {
      sections = (db as any).$client
        .prepare('SELECT * FROM cms_sections ORDER BY page, display_order ASC')
        .all();
    }

    return NextResponse.json({ sections });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/content/sections — Create CMS section
export async function POST(request: NextRequest) {
  try {
    requireAdmin(request);

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

    if (!page || !section_type) {
      return NextResponse.json({ error: 'page and section_type are required' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    (db as any).$client
      .prepare(
        `INSERT INTO cms_sections (id, page, section_type, title_ar, title_en, subtitle_ar, subtitle_en, content, image_url, link_url, display_order, is_visible, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        id,
        page,
        section_type,
        title_ar ?? null,
        title_en ?? null,
        subtitle_ar ?? null,
        subtitle_en ?? null,
        content ? (typeof content === 'string' ? content : JSON.stringify(content)) : null,
        image_url ?? null,
        link_url ?? null,
        display_order ?? 0,
        is_visible != null ? (is_visible ? 1 : 0) : 1,
        now,
        now
      );

    const section = (db as any).$client
      .prepare('SELECT * FROM cms_sections WHERE id = ?')
      .get(id);

    return NextResponse.json({ section }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
