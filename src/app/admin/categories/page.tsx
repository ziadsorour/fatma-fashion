"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { Plus, Edit, Trash2, Save } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ nameEn: '', nameAr: '', slug: '' });

  useEffect(() => { fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || [])); }, []);

  const handleSave = async () => {
    if (!form.nameEn) return;
    const res = await fetch('/api/admin/categories', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, id: editing?.id }),
    });
    const data = await res.json();
    if (data.success) {
      toast({ title: editing ? 'Category updated' : 'Category created', variant: 'success' });
      setForm({ nameEn: '', nameAr: '', slug: '' }); setEditing(null);
      const r = await fetch('/api/categories'); const d = await r.json(); setCategories(d.categories || []);
    } else toast({ title: data.error || 'Error', variant: 'error' });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h3 className="font-semibold">{editing ? 'Edit Category' : 'Add Category'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input label="Name (EN)" value={form.nameEn} onChange={e => setForm(p => ({ ...p, nameEn: e.target.value }))} />
          <Input label="Name (AR)" value={form.nameAr} onChange={e => setForm(p => ({ ...p, nameAr: e.target.value }))} dir="rtl" />
          <Input label="Slug" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} placeholder="auto-generated" />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} size="sm"><Save className="h-3 w-3" /> {editing ? 'Update' : 'Create'}</Button>
          {editing && <Button variant="outline" size="sm" onClick={() => { setEditing(null); setForm({ nameEn: '', nameAr: '', slug: '' }); }}>Cancel</Button>}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 text-left">
            <th className="px-4 py-3 font-medium text-gray-500">Name (EN)</th>
            <th className="px-4 py-3 font-medium text-gray-500">Name (AR)</th>
            <th className="px-4 py-3 font-medium text-gray-500">Slug</th>
            <th className="px-4 py-3 font-medium text-gray-500">Visible</th>
            <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
          </tr></thead>
          <tbody>
            {categories.map((c: any) => (
              <tr key={c.id} className="border-b border-gray-50">
                <td className="px-4 py-3 font-medium">{c.name_en}</td>
                <td className="px-4 py-3" dir="rtl">{c.name_ar}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.slug}</td>
                <td className="px-4 py-3">{c.is_visible ? '✓' : '✕'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => { setEditing(c); setForm({ nameEn: c.name_en, nameAr: c.name_ar, slug: c.slug }); }} className="p-1 text-gray-400 hover:text-blue-600"><Edit className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
