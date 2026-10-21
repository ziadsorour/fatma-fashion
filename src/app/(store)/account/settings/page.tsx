'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Check, Save, Key, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const { t, locale } = useI18n();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/account/profile')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.user) { setUser(data.user); setProfileForm({ name: data.user.name || '', phone: data.user.phone || '' }); }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSaveProfile() {
    setSaving(true); setError(''); setSaved(false);
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });
      if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
      else { const d = await res.json(); setError(d.error || 'Failed'); }
    } catch { setError('Network error'); }
    finally { setSaving(false); }
  }

  async function handleChangePassword() {
    setChangingPassword(true); setPasswordError(''); setPasswordSuccess(false);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError(locale === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      setChangingPassword(false); return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError(locale === 'ar' ? 'كلمة المرور يجب أن تكون ٨ أحرف على الأقل' : 'Password must be at least 8 characters');
      setChangingPassword(false); return;
    }
    try {
      const res = await fetch('/api/account/password', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }),
      });
      if (res.ok) { setPasswordSuccess(true); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }
      else { const d = await res.json(); setPasswordError(d.error || 'Failed'); }
    } catch { setPasswordError('Network error'); }
    finally { setChangingPassword(false); }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-gold" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-serif text-charcoal">{t('account.settings')}</h2>

      {/* Profile */}
      <Card>
        <CardHeader><CardTitle className="text-base">{t('account.profile')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"><AlertCircle className="w-4 h-4" />{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>{t('account.name')}</Label><Input value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} /></div>
            <div><Label>{t('account.phone')}</Label><Input value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} dir="ltr" className="text-left" /></div>
          </div>
          <div><Label>{t('account.email')}</Label><Input value={user?.email || ''} disabled className="bg-gray-50" dir="ltr" /></div>
          <Button onClick={handleSaveProfile} disabled={saving} className="bg-rose-gold hover:bg-rose-gold/90 text-white">
            {saving ? '...' : saved ? <><Check className="w-4 h-4 me-1" />{locale === 'ar' ? 'تم الحفظ' : 'Saved!'}</> : <><Save className="w-4 h-4 me-1" />{t('common.save')}</>}
          </Button>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Key className="w-4 h-4" />{t('account.changePassword')}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {passwordError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{passwordError}</div>}
          {passwordSuccess && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{locale === 'ar' ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully'}</div>}
          <div><Label>{t('account.currentPassword')}</Label><Input type="password" value={passwordForm.currentPassword} onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} dir="ltr" className="text-left" /></div>
          <div><Label>{t('account.newPassword')}</Label><Input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} dir="ltr" className="text-left" /></div>
          <div><Label>{t('account.confirmPassword')}</Label><Input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} dir="ltr" className="text-left" /></div>
          <Button onClick={handleChangePassword} disabled={changingPassword} variant="outline">{changingPassword ? '...' : t('account.changePassword')}</Button>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-red-200">
        <CardHeader><CardTitle className="text-base text-red-600 flex items-center gap-2"><Trash2 className="w-4 h-4" />{t('account.deleteAccount')}</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-3">{locale === 'ar' ? 'حذف حسابك نهائي ولا يمكن التراجع عنه. سيتم حذف جميع بياناتك.' : 'Deleting your account is permanent and cannot be undone. All your data will be deleted.'}</p>
          <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => alert(locale === 'ar' ? 'يرجى التواصل مع خدمة العملاء لحذف حسابك' : 'Please contact support to delete your account')}>
            {t('account.deleteAccount')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
