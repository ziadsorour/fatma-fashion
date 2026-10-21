"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nameEn: '', nameAr: '', descriptionEn: '', descriptionAr: '', sku: '', categoryId: '',
    price: '', salePrice: '', status: 'draft', isFeatured: false, isBestseller: false,
  });
  const [variants, setVariants] = useState([{ size: 'M', colorEn: 'Black', colorAr: 'أسود', colorHex: '#000000', quantity: 10, sku: '' }]);

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const addVariant = () => setVariants(prev => [...prev, { size: 'M', colorEn: '', colorAr: '', colorHex: '#000000', quantity: 10, sku: '' }]);
  const removeVariant = (i: number) => setVariants(prev => prev.filter((_, idx) => idx !== i));
  const updateVariant = (i: number, field: string, value: any) => setVariants(prev => prev.map((v, idx) => idx === i ? { ...v, [field]: value } : v));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nameEn || !form.price) { toast({ title: 'Name and price are required', variant: 'error' }); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, price: Math.round(parseFloat(form.price) * 100), salePrice: form.salePrice ? Math.round(parseFloat(form.salePrice) * 100) : null, variants }),
      });
      const data = await res.json();
      if (data.success) { toast({ title: 'Product created!', variant: 'success' }); router.push('/admin/products'); }
      else toast({ title: data.error || 'Error creating product', variant: 'error' });
    } catch { toast({ title: 'Error', variant: 'error' }); }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="h-5 w-5" /></Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Name (English) *" value={form.nameEn} onChange={e => update('nameEn', e.target.value)} required />
            <Input label="Name (Arabic)" value={form.nameAr} onChange={e => update('nameAr', e.target.value)} dir="rtl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textarea label="Description (English)" value={form.descriptionEn} onChange={e => update('descriptionEn', e.target.value)} rows={3} />
            <Textarea label="Description (Arabic)" value={form.descriptionAr} onChange={e => update('descriptionAr', e.target.value)} rows={3} dir="rtl" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input label="SKU *" value={form.sku} onChange={e => update('sku', e.target.value)} />
            <Input label="Price (EGP) *" type="number" step="0.01" value={form.price} onChange={e => update('price', e.target.value)} required />
            <Input label="Sale Price (EGP)" type="number" step="0.01" value={form.salePrice} onChange={e => update('salePrice', e.target.value)} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select value={form.status} onChange={e => update('status', e.target.value)} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isFeatured} onChange={e => update('isFeatured', e.target.checked)} className="accent-blue-600" /> Featured</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.isBestseller} onChange={e => update('isBestseller', e.target.checked)} className="accent-blue-600" /> Best Seller</label>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Variants (Size / Color)</h3>
            <Button type="button" variant="outline" size="sm" onClick={addVariant}><Plus className="h-3 w-3" /> Add Variant</Button>
          </div>
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end border-b border-gray-50 pb-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Size</label>
                <select value={v.size} onChange={e => updateVariant(i, 'size', e.target.value)} className="w-full h-9 px-2 border border-gray-200 rounded text-sm">
                  {['XS','S','M','L','XL','XXL'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <Input label="Color (EN)" value={v.colorEn} onChange={e => updateVariant(i, 'colorEn', e.target.value)} />
              <Input label="Color (AR)" value={v.colorAr} onChange={e => updateVariant(i, 'colorAr', e.target.value)} dir="rtl" />
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Color</label>
                <input type="color" value={v.colorHex} onChange={e => updateVariant(i, 'colorHex', e.target.value)} className="w-full h-9 rounded border border-gray-200 cursor-pointer" />
              </div>
              <Input label="Stock" type="number" value={String(v.quantity)} onChange={e => updateVariant(i, 'quantity', parseInt(e.target.value) || 0)} />
              <div className="flex items-end">
                <button type="button" onClick={() => removeVariant(i)} className="p-2 text-red-400 hover:text-red-600" disabled={variants.length <= 1}><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => router.push('/admin/products')}>Cancel</Button>
          <Button type="submit" loading={loading}><Save className="h-4 w-4" /> Save Product</Button>
        </div>
      </form>
    </div>
  );
}
