'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Pencil, Trash2, Star, Save, X } from 'lucide-react';

interface Address {
  id: string; label: string; full_name: string; phone: string;
  governorate: string; city: string; address_line1: string; address_line2: string;
  building_info: string; delivery_instructions: string; is_default: number;
}

const emptyAddress: Omit<Address, 'id'> = {
  label: '', full_name: '', phone: '', governorate: '', city: '',
  address_line1: '', address_line2: '', building_info: '', delivery_instructions: '', is_default: 0,
};

export default function AddressesPage() {
  const { t, locale } = useI18n();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyAddress);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadAddresses(); }, []);

  async function loadAddresses() {
    try {
      const res = await fetch('/api/account/addresses');
      if (res.ok) { const data = await res.json(); setAddresses(data.addresses || []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const url = editing ? `/api/account/addresses/${editing}` : '/api/account/addresses';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) { await loadAddresses(); setAdding(false); setEditing(null); setForm(emptyAddress); }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm(locale === 'ar' ? 'حذف هذا العنوان؟' : 'Delete this address?')) return;
    await fetch(`/api/account/addresses/${id}`, { method: 'DELETE' });
    await loadAddresses();
  }

  async function setDefault(id: string) {
    await fetch(`/api/account/addresses/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...addresses.find(a => a.id === id), is_default: 1 }),
    });
    await loadAddresses();
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-gold" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-serif text-charcoal">{t('account.addresses')}</h2>
        {!adding && <Button size="sm" onClick={() => { setAdding(true); setEditing(null); setForm(emptyAddress); }} className="bg-rose-gold hover:bg-rose-gold/90 text-white"><Plus className="w-4 h-4 me-1" />{t('common.add')}</Button>}
      </div>

      {adding && (
        <Card className="border-rose-gold/30">
          <CardContent className="py-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><Label>{locale === 'ar' ? 'تسمية العنوان' : 'Label'}</Label><Input value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} placeholder={locale === 'ar' ? 'المنزل، العمل...' : 'Home, Work...'} /></div>
              <div><Label>{t('checkout.fullName')}</Label><Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} /></div>
              <div><Label>{t('checkout.phone')}</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} dir="ltr" /></div>
              <div><Label>{t('checkout.governorate')}</Label><Input value={form.governorate} onChange={e => setForm({ ...form, governorate: e.target.value })} /></div>
              <div><Label>{t('checkout.city')}</Label><Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
              <div><Label>{t('checkout.address')}</Label><Input value={form.address_line1} onChange={e => setForm({ ...form, address_line1: e.target.value })} /></div>
              <div><Label>{t('checkout.building')}</Label><Input value={form.building_info} onChange={e => setForm({ ...form, building_info: e.target.value })} /></div>
              <div><Label>{t('checkout.deliveryInstructions')}</Label><Input value={form.delivery_instructions} onChange={e => setForm({ ...form, delivery_instructions: e.target.value })} /></div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} className="bg-rose-gold hover:bg-rose-gold/90 text-white"><Save className="w-4 h-4 me-1" />{saving ? '...' : t('common.save')}</Button>
              <Button variant="outline" onClick={() => { setAdding(false); setEditing(null); }}><X className="w-4 h-4 me-1" />{t('common.cancel')}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {addresses.length === 0 && !adding ? (
        <Card><CardContent className="py-12 text-center text-gray-400"><MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>{locale === 'ar' ? 'لا توجد عناوين محفوظة' : 'No saved addresses'}</p></CardContent></Card>
      ) : addresses.map(addr => (
        <Card key={addr.id} className={addr.is_default ? 'border-rose-gold/30' : ''}>
          <CardContent className="py-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{addr.label || addr.full_name}</span>
                  {addr.is_default ? <Badge className="bg-rose-gold/10 text-rose-gold text-xs"><Star className="w-3 h-3 me-1" />{locale === 'ar' ? 'الافتراضي' : 'Default'}</Badge> : null}
                </div>
                <p className="text-sm text-gray-600">{addr.full_name} · {addr.phone}</p>
                <p className="text-sm text-gray-500">{addr.address_line1}{addr.building_info ? `, ${addr.building_info}` : ''}</p>
                <p className="text-sm text-gray-500">{addr.city}, {addr.governorate}</p>
              </div>
              <div className="flex gap-1">
                {!addr.is_default && <Button variant="ghost" size="sm" onClick={() => setDefault(addr.id)} title="Set as default"><Star className="w-4 h-4" /></Button>}
                <Button variant="ghost" size="sm" onClick={() => { setEditing(addr.id); setAdding(true); setForm(addr); }}><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(addr.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
