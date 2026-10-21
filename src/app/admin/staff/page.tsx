'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, Plus, Pencil, Trash2, Save, X, UserPlus } from 'lucide-react';

interface StaffMember {
  id: string; name: string; email: string; role: string;
  created_at: number; email_verified: number;
}

const ROLES = [
  { value: 'admin', label: 'Admin', color: 'bg-red-100 text-red-700' },
  { value: 'manager', label: 'Manager', color: 'bg-purple-100 text-purple-700' },
  { value: 'fulfillment', label: 'Fulfillment', color: 'bg-blue-100 text-blue-700' },
  { value: 'product_manager', label: 'Product Manager', color: 'bg-green-100 text-green-700' },
  { value: 'support', label: 'Support', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'analyst', label: 'Analyst', color: 'bg-gray-100 text-gray-700' },
];

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'support' });

  useEffect(() => { loadStaff(); }, []);

  async function loadStaff() {
    try {
      const res = await fetch('/api/admin/staff');
      if (res.ok) { const data = await res.json(); setStaff(data.staff || []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleSave() {
    setSaving(true); setError('');
    try {
      if (editing) {
        const res = await fetch(`/api/admin/staff/${editing}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: form.name, email: form.email, role: form.role }),
        });
        if (!res.ok) { const d = await res.json(); setError(d.error || 'Failed'); return; }
      } else {
        if (!form.password || form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
        const res = await fetch('/api/admin/staff', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) { const d = await res.json(); setError(d.error || 'Failed'); return; }
      }
      await loadStaff(); setAdding(false); setEditing(null);
      setForm({ name: '', email: '', password: '', role: 'support' });
    } catch (e) { setError('Network error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to remove this staff member?')) return;
    const res = await fetch(`/api/admin/staff/${id}`, { method: 'DELETE' });
    if (!res.ok) { const d = await res.json(); alert(d.error || 'Failed'); return; }
    await loadStaff();
  }

  function startEdit(member: StaffMember) {
    setEditing(member.id); setAdding(true);
    setForm({ name: member.name, email: member.email, password: '', role: member.role });
  }

  function getRoleBadge(role: string) {
    const r = ROLES.find(r => r.value === role);
    return <Badge className={`text-xs ${r?.color || 'bg-gray-100 text-gray-700'}`}>{r?.label || role}</Badge>;
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-gold" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Staff Management</h1><p className="text-gray-500 text-sm mt-1">Manage admin and staff accounts</p></div>
        {!adding && <Button onClick={() => { setAdding(true); setEditing(null); setForm({ name: '', email: '', password: '', role: 'support' }); }} className="bg-rose-gold hover:bg-rose-gold/90 text-white"><UserPlus className="w-4 h-4 me-2" /> Add Staff</Button>}
      </div>

      {adding && (
        <Card className="border-rose-gold/30">
          <CardHeader><CardTitle className="text-base">{editing ? 'Edit Staff Member' : 'New Staff Member'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Full Name</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required dir="ltr" className="text-left" /></div>
              {!editing && <div className="space-y-1.5"><Label>Password</Label><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={8} placeholder="Min 8 characters" /></div>}
              <div className="space-y-1.5">
                <Label>Role</Label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
                  {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} className="bg-rose-gold hover:bg-rose-gold/90 text-white"><Save className="w-4 h-4 me-2" />{saving ? 'Saving...' : 'Save'}</Button>
              <Button variant="outline" onClick={() => { setAdding(false); setEditing(null); setError(''); }}><X className="w-4 h-4 me-2" />Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {staff.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-gray-400"><Shield className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No staff members</p></CardContent></Card>
        ) : staff.map(member => (
          <Card key={member.id}>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-rose-gold/10 text-rose-gold flex items-center justify-center font-bold text-sm">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{member.name}</span>
                      {getRoleBadge(member.role)}
                    </div>
                    <p className="text-xs text-gray-400">{member.email}</p>
                    <p className="text-xs text-gray-300">Joined {new Date(member.created_at * 1000).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(member)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(member.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
