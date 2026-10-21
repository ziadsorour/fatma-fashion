"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

export default function RegisterPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = t('common.required');
    if (!form.email.trim()) errs.email = t('common.required');
    if (form.password.length < 8) errs.password = locale === 'ar' ? 'كلمة المرور لازم تكون ٨ أحرف على الأقل' : 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = locale === 'ar' ? 'كلمات المرور مش متطابقة' : 'Passwords do not match';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: t('auth.registerSuccess'), variant: 'success' });
        router.push('/auth/login');
      } else {
        toast({ title: data.error || (locale === 'ar' ? 'حصل خطأ' : 'Error'), variant: 'error' });
      }
    } catch {
      toast({ title: locale === 'ar' ? 'حصل خطأ' : 'Error occurred', variant: 'error' });
    }
    setLoading(false);
  };

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-lg border border-beige/50">
        <div className="text-center mb-8">
          <Image src="/images/fatma-logo.jpg" alt="FATMA" width={100} height={40} className="h-12 w-auto mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-charcoal">{t('auth.register')}</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label={t('account.name')} value={form.name} onChange={e => update('name', e.target.value)} error={errors.name} required />
          <Input label={t('auth.email')} type="email" value={form.email} onChange={e => update('email', e.target.value)} error={errors.email} required dir="ltr" />
          <Input label={t('account.phone')} type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="01xxxxxxxxx" dir="ltr" />
          <Input label={t('auth.password')} type="password" value={form.password} onChange={e => update('password', e.target.value)} error={errors.password} required dir="ltr" />
          <Input label={t('account.confirmPassword')} type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} error={errors.confirmPassword} required dir="ltr" />
          <Button type="submit" className="w-full" size="lg" loading={loading}>{t('auth.register')}</Button>
        </form>
        <div className="mt-6 text-center text-sm text-charcoal/60">
          {t('auth.hasAccount')}{' '}
          <Link href="/auth/login" className="text-rose-gold hover:underline font-medium">{t('auth.login')}</Link>
        </div>
      </div>
    </div>
  );
}
