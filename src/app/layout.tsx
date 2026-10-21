import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Inter, Cairo, Caveat } from 'next/font/google';
import { I18nProvider } from '@/i18n';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
});

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-script',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'FATMA | فاطمة - أزياء للبنات',
    template: '%s | FATMA - فاطمة',
  },
  description:
    'FATMA - Fashion For Girls. أزياء عصرية للبنات. تسوقي أحدث الملابس والإكسسوارات بأفضل الأسعار في مصر.',
  keywords: [
    'فاطمة',
    'أزياء بنات',
    'ملابس بنات',
    'موضة',
    'ملابس مصر',
    'FATMA',
    'fashion',
    'girls fashion',
    'Egypt fashion',
  ],
  authors: [{ name: 'FATMA' }],
  creator: 'FATMA',
  metadataBase: new URL(process.env.STORE_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    alternateLocale: 'en_US',
    siteName: 'FATMA | فاطمة',
    title: 'FATMA | فاطمة - أزياء للبنات',
    description: 'أزياء عصرية للبنات. تسوقي أحدث الملابس والإكسسوارات بأفضل الأسعار في مصر.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FATMA | فاطمة - أزياء للبنات',
    description: 'أزياء عصرية للبنات. تسوقي أحدث الملابس والإكسسوارات بأفضل الأسعار في مصر.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#B8787D',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${playfair.variable} ${inter.variable} ${cairo.variable} ${caveat.variable}`}
    >
      <body className="min-h-screen bg-[#F8F1EB] font-cairo text-[#292522] antialiased">
        <I18nProvider defaultLocale="ar">{children}</I18nProvider>
      </body>
    </html>
  );
}
