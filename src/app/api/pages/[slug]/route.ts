import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const client = (db as any).$client;

    const page = client.prepare(
      'SELECT * FROM cms_pages WHERE slug = ? AND is_published = 1'
    ).get(slug);

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    return NextResponse.json({ page });
  } catch (error: any) {
    console.error('Get page error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch page' }, { status: 500 });
  }
}
