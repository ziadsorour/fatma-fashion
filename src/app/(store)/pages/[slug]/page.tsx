'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/i18n';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function StaticPage() {
  const { t, locale, dir } = useI18n();
  const params = useParams();
  const slug = params.slug as string;
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const BackArrow = dir === 'rtl' ? ChevronRight : ChevronLeft;

  useEffect(() => {
    fetch(`/api/pages/${slug}`)
      .then(r => { if (!r.ok) throw new Error('Not found'); return r.json(); })
      .then(data => setPage(data.page))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-gold" /></div>;

  if (error || !page) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-serif text-charcoal mb-2">{t('errors.pageNotFound')}</h1>
      <p className="text-gray-500 mb-4">{t('errors.pageNotFoundDesc')}</p>
      <Link href="/" className="text-rose-gold hover:underline">{t('common.backToHome')}</Link>
    </div>
  );

  const title = locale === 'ar' ? page.title_ar : page.title_en;
  const content = locale === 'ar' ? page.content_ar : page.content_en;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-rose-gold">{t('nav.home')}</Link>
        <span>/</span>
        <span className="text-charcoal">{title}</span>
      </nav>

      <h1 className="text-3xl font-serif text-charcoal mb-6">{title}</h1>
      <Separator className="mb-8" />

      <div className="prose prose-gray max-w-none leading-relaxed text-gray-600 whitespace-pre-wrap"
        style={{ direction: dir }}>
        {content || (locale === 'ar' ? 'المحتوى قيد التحديث...' : 'Content is being updated...')}
      </div>
    </div>
  );
}
