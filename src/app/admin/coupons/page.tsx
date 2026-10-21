"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { Plus, Tag, Save } from "lucide-react";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', type: 'percentage', value: '', minOrderValue: '', maxDiscount: '', totalLimit: '', isActive: true });

  useEffect(() => { fetch('/api/admin/coupons').then(r => r.json()).then(d => setCoupons(d.coupons || [])).catch(() => {}); }, []);

  const handleCreate = async () => {
    if (!form.code || !form.value) { toast({ title: 'Code and value required', variant: 'error' }); return; }
    const res = await fetch('/api/admin/coupons', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, value: Math.round(parseFloat(form.value) * (form.type === 'percentage' ? 1 : 100)), minOrderValue: form.minOrderValue ? Math.round(parseFloat(form.minOrderValue) * 100) : null, maxDiscount: form.maxDiscount ? Math.round(parseFloat(form.maxDiscount) * 100) : null, totalLimit: form.totalLimit ? parseInt(form.totalLimit) : null }),
    });
    const data = await res.json();
    if (data.success) { toast({ title: 'Coupon created!', variant: 'success' }); setShowForm(false); setForm({ code: '', type: 'percentage', value: '', minOrderValue: '', maxDiscount: '', totalLimit: '', isActive: true }); fetch('/api/admin/coupons').then(r => r.json()).then(d => setCoupons(d.coupons || [])); }
    else toast({ title: data.error || 'Error', variant: 'error' });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Coupons & Promotions</h1>
        <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4" /> New Coupon</Button>
      </div>
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Input label="Code *" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="WELCOME20" />
            <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label><select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm"><option value="percentage">Percentage</option><option value="fixed">Fixed Amount</option><option value="free_shipping">Free Shipping</option></select></div>
            <Input label={form.type === 'percentage' ? 'Value (%) *' : 'Value (EGP) *'} type="number" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} />
            <Input label="Min Order (EGP)" type="number" value={form.minOrderValue} onChange={e => setForm(p => ({ ...p, minOrderValue: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Input label="Max Discount (EGP)" type="number" value={form.maxDiscount} onChange={e => setForm(p => ({ ...p, maxDiscount: e.target.value }))} />
            <Input label="Usage Limit" type="number" value={form.totalLimit} onChange={e => setForm(p => ({ ...p, totalLimit: e.target.value }))} />
          </div>
          <Button onClick={handleCreate} size="sm"><Save className="h-3 w-3" /> Create Coupon</Button>
        </div>
      )}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-100 text-left">
            <th className="px-4 py-3 font-medium text-gray-500">Code</th><th className="px-4 py-3 font-medium text-gray-500">Type</th>
            <th className="px-4 py-3 font-medium text-gray-500">Value</th><th className="px-4 py-3 font-medium text-gray-500">Used</th>
            <th className="px-4 py-3 font-medium text-gray-500">Active</th>
          </tr></thead>
          <tbody>
            {coupons.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No coupons yet</td></tr> : coupons.map((c: any) => (
              <tr key={c.id} className="border-b border-gray-50">
                <td className="px-4 py-3 font-mono font-medium">{c.code}</td>
                <td className="px-4 py-3">{c.type}</td>
                <td className="px-4 py-3">{c.type === 'percentage' ? `${c.value}%` : `EGP ${(c.value / 100).toFixed(0)}`}</td>
                <td className="px-4 py-3">{c.usage_count}{c.total_limit ? `/${c.total_limit}` : ''}</td>
                <td className="px-4 py-3">{c.is_active ? <span className="text-green-600">✓</span> : <span className="text-red-500">✕</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
