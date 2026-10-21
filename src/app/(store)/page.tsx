import { getPublishedProducts, getCategories, getCmsSections } from '@/lib/db/queries';
import { HomepageClient } from './homepage-client';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  let categories: any[] = [];
  let newArrivals: any[] = [];
  let bestSellers: any[] = [];
  let featuredProducts: any[] = [];
  let cmsSections: any[] = [];

  try {
    categories = getCategories();
    newArrivals = getPublishedProducts({ limit: 8, sort: 'newest' });
    bestSellers = getPublishedProducts({ limit: 8, bestseller: true });
    featuredProducts = getPublishedProducts({ limit: 6, featured: true });
    cmsSections = getCmsSections('homepage');
  } catch (e) {
    // DB not initialized yet - show setup prompt
    console.log('Database not initialized yet. Run: npx tsx src/lib/db/seed.ts');
  }

  return (
    <HomepageClient
      categories={categories}
      newArrivals={newArrivals}
      bestSellers={bestSellers}
      featuredProducts={featuredProducts}
      cmsSections={cmsSections}
    />
  );
}
