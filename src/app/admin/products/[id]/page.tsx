"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { ArrowLeft, Plus, Trash2, Save, Upload, Eye, ExternalLink } from "lucide-react";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name_en: string; name_ar: string }[]>([]);
  const [form, setForm] = useState({
    nameEn: '',
    nameAr: '',
    descriptionEn: '',
    descriptionAr: '',
    sku: '',
    categoryId: '',
    price: '',
    salePrice: '',
    status: 'draft',
    isFeatured: false,
    isBestseller: false,
    slug: '',
  });
  const [variants, setVariants] = useState<{
    id?: string;
    size: string;
    colorEn: string;
    colorAr: string;
    colorHex: string;
    quantity: number;
    sku: string;
  }[]>([]);
  const [images, setImages] = useState<{ url: string; altTextEn?: string; altTextAr?: string }[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`/api/admin/products/${id}`),
          fetch('/api/categories'),
        ]);

        if (!prodRes.ok) throw new Error('Product not found');
        const prodData = await prodRes.json();
        const catData = await catRes.json();

        const p = prodData.product;
        setForm({
          nameEn: p.name_en || '',
          nameAr: p.name_ar || '',
          descriptionEn: p.description_en || '',
          descriptionAr: p.description_ar || '',
          sku: p.sku || '',
          categoryId: p.category_id || '',
          price: p.price ? (p.price / 100).toString() : '',
          salePrice: p.sale_price ? (p.sale_price / 100).toString() : '',
          status: p.status || 'draft',
          isFeatured: Boolean(p.is_featured),
          isBestseller: Boolean(p.is_bestseller),
          slug: p.slug || '',
        });

        if (prodData.variants && prodData.variants.length > 0) {
          setVariants(
            prodData.variants.map((v: any) => ({
              id: v.id,
              size: v.size,
              colorEn: v.color_name_en,
              colorAr: v.color_name_ar,
              colorHex: v.color_hex,
              quantity: v.quantity_on_hand,
              sku: v.sku,
            }))
          );
        }

        if (prodData.images && prodData.images.length > 0) {
          setImages(
            prodData.images.map((img: any) => ({
              url: img.url,
              altTextEn: img.alt_text_en,
              altTextAr: img.alt_text_ar,
            }))
          );
        }

        setCategories(catData.categories || []);
      } catch (err: any) {
        toast({ title: err.message || 'Error loading product', variant: 'error' });
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadData();
    }
  }, [id]);

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  const addVariant = () =>
    setVariants(prev => [
      ...prev,
      { size: 'M', colorEn: '', colorAr: '', colorHex: '#000000', quantity: 10, sku: '' },
    ]);

  const removeVariant = (i: number) => setVariants(prev => prev.filter((_, idx) => idx !== i));

  const updateVariant = (i: number, field: string, value: any) =>
    setVariants(prev => prev.map((v, idx) => (idx === i ? { ...v, [field]: value } : v)));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('file', files[i]);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const errData = await res.json();
          toast({ title: errData.error || 'Upload failed', variant: 'error' });
          continue;
        }

        const data = await res.json();
        setImages(prev => [...prev, { url: data.url }]);
        toast({ title: 'Image uploaded', variant: 'success' });
      } catch {
        toast({ title: 'Upload error', variant: 'error' });
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nameEn || !form.price) {
      toast({ title: 'Name and price are required', variant: 'error' });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: Math.round(parseFloat(form.price) * 100),
          salePrice: form.salePrice ? Math.round(parseFloat(form.salePrice) * 100) : null,
          variants,
          images,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast({ title: 'Product updated successfully!', variant: 'success' });
        router.refresh();
      } else {
        toast({ title: data.error || 'Error updating product', variant: 'error' });
      }
    } catch {
      toast({ title: 'Network error', variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to permanently delete this product?')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: 'Product deleted', variant: 'success' });
        router.push('/admin/products');
      } else {
        toast({ title: 'Failed to delete product', variant: 'error' });
      }
    } catch {
      toast({ title: 'Network error', variant: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {form.slug && (
            <Link
              href={`/product/${form.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <Eye className="w-4 h-4" /> View in Store
            </Link>
          )}
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            className="text-sm"
          >
            <Trash2 className="w-4 h-4 mr-1.5" /> Delete
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Name (English) *"
              value={form.nameEn}
              onChange={e => update('nameEn', e.target.value)}
              required
            />
            <Input
              label="Name (Arabic)"
              value={form.nameAr}
              onChange={e => update('nameAr', e.target.value)}
              dir="rtl"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textarea
              label="Description (English)"
              value={form.descriptionEn}
              onChange={e => update('descriptionEn', e.target.value)}
              rows={3}
            />
            <Textarea
              label="Description (Arabic)"
              value={form.descriptionAr}
              onChange={e => update('descriptionAr', e.target.value)}
              rows={3}
              dir="rtl"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Input
              label="SKU *"
              value={form.sku}
              onChange={e => update('sku', e.target.value)}
              required
            />
            <Input
              label="Price (EGP) *"
              type="number"
              step="0.01"
              value={form.price}
              onChange={e => update('price', e.target.value)}
              required
            />
            <Input
              label="Sale Price (EGP)"
              type="number"
              step="0.01"
              value={form.salePrice}
              onChange={e => update('salePrice', e.target.value)}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <select
                value={form.categoryId}
                onChange={e => update('categoryId', e.target.value)}
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white"
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name_en} ({c.name_ar})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={e => update('status', e.target.value)}
                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex items-center gap-4 md:col-span-2 pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={e => update('isFeatured', e.target.checked)}
                  className="rounded text-rose-gold focus:ring-rose-gold"
                />
                Featured Product
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={form.isBestseller}
                  onChange={e => update('isBestseller', e.target.checked)}
                  className="rounded text-rose-gold focus:ring-rose-gold"
                />
                Best Seller
              </label>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Product Images</h3>
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-gold/10 text-rose-gold hover:bg-rose-gold/20 text-xs font-medium rounded-lg cursor-pointer">
              <Upload className="w-3.5 h-3.5" /> Upload Image
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          </div>

          {images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative group aspect-[3/4] rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                  <Image src={img.url} alt="" fill className="object-cover" />
                  {idx === 0 && (
                    <span className="absolute top-1 left-1 bg-charcoal text-white text-[10px] px-1.5 py-0.5 rounded">
                      Primary
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No images added yet. Click Upload Image above.</p>
          )}
        </div>

        {/* Variants */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Variants (Size / Color / Stock)</h3>
            <Button type="button" variant="outline" size="sm" onClick={addVariant}>
              <Plus className="h-3 w-3 mr-1" /> Add Variant
            </Button>
          </div>
          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end border-b border-gray-50 pb-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Size</label>
                <select
                  value={v.size}
                  onChange={e => updateVariant(i, 'size', e.target.value)}
                  className="w-full h-9 px-2 border border-gray-200 rounded text-sm bg-white"
                >
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'].map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Color (EN)"
                value={v.colorEn}
                onChange={e => updateVariant(i, 'colorEn', e.target.value)}
              />
              <Input
                label="Color (AR)"
                value={v.colorAr}
                onChange={e => updateVariant(i, 'colorAr', e.target.value)}
                dir="rtl"
              />
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Color Picker</label>
                <input
                  type="color"
                  value={v.colorHex || '#000000'}
                  onChange={e => updateVariant(i, 'colorHex', e.target.value)}
                  className="w-full h-9 rounded border border-gray-200 cursor-pointer p-0.5"
                />
              </div>
              <Input
                label="Stock"
                type="number"
                value={String(v.quantity)}
                onChange={e => updateVariant(i, 'quantity', parseInt(e.target.value) || 0)}
              />
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  className="p-2 text-red-400 hover:text-red-600 rounded"
                  disabled={variants.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Link href="/admin/products">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            className="bg-rose-gold hover:bg-rose-gold/90 text-white"
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-1.5" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
