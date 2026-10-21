import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(piasters: number, locale: string = 'ar-EG'): string {
  const egp = piasters / 100;
  if (locale === 'ar-EG' || locale === 'ar') {
    return `${egp.toLocaleString('ar-EG', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ج.م`;
  }
  return `EGP ${egp.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

export function generateOrderNumber(): string {
  const prefix = 'FM';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

export function getRelativeTime(timestamp: number, locale: string = 'ar-EG'): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const diff = timestamp - Date.now();
  const seconds = Math.round(diff / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  if (Math.abs(days) >= 1) return rtf.format(days, 'day');
  if (Math.abs(hours) >= 1) return rtf.format(hours, 'hour');
  if (Math.abs(minutes) >= 1) return rtf.format(minutes, 'minute');
  return rtf.format(seconds, 'second');
}

export function formatDate(timestamp: number, locale: string = 'ar-EG'): string {
  return new Date(timestamp).toLocaleDateString(locale, {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export function formatDateTime(timestamp: number, locale: string = 'ar-EG'): string {
  return new Date(timestamp).toLocaleString(locale, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export const ORDER_STATUSES = [
  'pending', 'confirmed', 'processing', 'packed', 'shipped',
  'out_for_delivery', 'delivered', 'cancelled', 'return_requested', 'returned', 'refunded',
] as const;

export type OrderStatus = typeof ORDER_STATUSES[number];

export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'] as const;
export type PaymentStatus = typeof PAYMENT_STATUSES[number];

export const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية', 'المنوفية', 'القليوبية',
  'الغربية', 'كفر الشيخ', 'البحيرة', 'دمياط', 'بورسعيد', 'الإسماعيلية', 'السويس',
  'شمال سيناء', 'جنوب سيناء', 'الفيوم', 'بني سويف', 'المنيا', 'أسيوط', 'سوهاج',
  'قنا', 'الأقصر', 'أسوان', 'البحر الأحمر', 'الوادي الجديد', 'مطروح',
];

export const GOVERNORATES_EN = [
  'Cairo', 'Giza', 'Alexandria', 'Dakahlia', 'Sharqia', 'Monufia', 'Qalyubia',
  'Gharbia', 'Kafr El Sheikh', 'Beheira', 'Damietta', 'Port Said', 'Ismailia', 'Suez',
  'North Sinai', 'South Sinai', 'Fayoum', 'Beni Suef', 'Minya', 'Asyut', 'Sohag',
  'Qena', 'Luxor', 'Aswan', 'Red Sea', 'New Valley', 'Matrouh',
];
