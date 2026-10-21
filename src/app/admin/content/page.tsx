'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Layout, Plus, Pencil, Trash2, Save, X, Eye, EyeOff, GripVertical } from 'lucide-react';

interface CmsSection {
  id: string; page: string; section_type: string;
  title_ar: string; title_en: string; subtitle_ar: string; subtitle_en: string;
  content: string; image_url: string; link_url: string;
  display_order: number; is_visible: number;
}

interface CmsPage {
  id: string; slug: string;
  title_ar: string; title_en: string; content_ar: string; content_en: string;
  seo_title_ar: string; seo_title_en: string; seo_description_ar: string; seo_description_en: string;
  is_published: number;
}

export default function ContentPage() {
  const [tab, setTab] = useState<'sections' | 'pages'>('sections');
  const [sections, setSections] = useState<CmsSection[]>([]);
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<CmsSection | null>(null);
  const [editingPage, setEditingPage] = useState<CmsPage | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [secRes, pgRes] = await Promise.all([
        fetch('/api/admin/content/sections').then(r => r.json()),
        fetch('/api/admin/content/pages').then(r => r.json()),
      ]);
      setSections(secRes.sections || []);
      setPages(pgRes.pages || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function saveSection() {
    if (!editingSection) return;
    setSaving(true);
    try {
      const isNew = !editingSection.id;
      const url = isNew ? '/api/admin/content/sections' : `/api/admin/content/sections/${editingSection.id}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingSection) });
      if (res.ok) { await loadData(); setEditingSection(null); }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  async function savePage() {
    if (!editingPage) return;
    setSaving(true);
    try {
      const isNew = !editingPage.id;
      const url = isNew ? '/api/admin/content/pages' : `/api/admin/content/pages/${editingPage.id}`;
      const method = isNew ? 'POST' : 'PUT';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingPage) });
      if (res.ok) { await loadData(); setEditingPage(null); }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  }

  async function deleteSection(id: string) {
    if (!confirm('Delete this section?')) return;
    await fetch(`/api/admin/content/sections/${id}`, { method: 'DELETE' });
    await loadData();
  }

  async function deletePage(id: string) {
    if (!confirm('Delete this page?')) return;
    await fetch(`/api/admin/content/pages/${id}`, { method: 'DELETE' });
    await loadData();
  }

  async function toggleSectionVisibility(section: CmsSection) {
    await fetch(`/api/admin/content/sections/${section.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...section, is_visible: section.is_visible ? 0 : 1 }),
    });
    await loadData();
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-gold" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Content Management</h1><p className="text-gray-500 text-sm mt-1">Manage homepage sections and static pages</p></div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button onClick={() => setTab('sections')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'sections' ? 'bg-white text-charcoal shadow-sm' : 'text-gray-500'}`}><Layout className="w-4 h-4" /> Homepage Sections</button>
        <button onClick={() => setTab('pages')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'pages' ? 'bg-white text-charcoal shadow-sm' : 'text-gray-500'}`}><FileText className="w-4 h-4" /> Static Pages</button>
      </div>

      {/* Sections Tab */}
      {tab === 'sections' && (
        <div className="space-y-4">
          {editingSection && (
            <Card className="border-rose-gold/30">
              <CardHeader><CardTitle className="text-base">{editingSection.id ? 'Edit Section' : 'New Section'}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>Section Type</Label><Input value={editingSection.section_type} onChange={e => setEditingSection({ ...editingSection, section_type: e.target.value })} placeholder="hero, announcement, categories..." /></div>
                  <div className="space-y-1.5"><Label>Page</Label><Input value={editingSection.page} onChange={e => setEditingSection({ ...editingSection, page: e.target.value })} placeholder="homepage" /></div>
                  <div className="space-y-1.5"><Label>Title (Arabic)</Label><Input value={editingSection.title_ar} onChange={e => setEditingSection({ ...editingSection, title_ar: e.target.value })} dir="rtl" /></div>
                  <div className="space-y-1.5"><Label>Title (English)</Label><Input value={editingSection.title_en} onChange={e => setEditingSection({ ...editingSection, title_en: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Subtitle (Arabic)</Label><Input value={editingSection.subtitle_ar} onChange={e => setEditingSection({ ...editingSection, subtitle_ar: e.target.value })} dir="rtl" /></div>
                  <div className="space-y-1.5"><Label>Subtitle (English)</Label><Input value={editingSection.subtitle_en} onChange={e => setEditingSection({ ...editingSection, subtitle_en: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Image URL</Label><Input value={editingSection.image_url} onChange={e => setEditingSection({ ...editingSection, image_url: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Link URL</Label><Input value={editingSection.link_url} onChange={e => setEditingSection({ ...editingSection, link_url: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>Display Order</Label><Input type="number" value={editingSection.display_order} onChange={e => setEditingSection({ ...editingSection, display_order: Number(e.target.value) })} /></div>
                </div>
                <div className="space-y-1.5"><Label>Content (JSON)</Label><Textarea value={editingSection.content} onChange={e => setEditingSection({ ...editingSection, content: e.target.value })} rows={4} placeholder='{"key": "value"}' /></div>
                <div className="flex gap-2">
                  <Button onClick={saveSection} disabled={saving} className="bg-rose-gold hover:bg-rose-gold/90 text-white"><Save className="w-4 h-4 me-2" />{saving ? 'Saving...' : 'Save'}</Button>
                  <Button variant="outline" onClick={() => setEditingSection(null)}><X className="w-4 h-4 me-2" />Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!editingSection && (
            <Button onClick={() => setEditingSection({ id: '', page: 'homepage', section_type: '', title_ar: '', title_en: '', subtitle_ar: '', subtitle_en: '', content: '', image_url: '', link_url: '', display_order: sections.length, is_visible: 1 })}
              className="bg-rose-gold hover:bg-rose-gold/90 text-white"><Plus className="w-4 h-4 me-2" /> Add Section</Button>
          )}

          {sections.sort((a, b) => a.display_order - b.display_order).map(section => (
            <Card key={section.id} className={!section.is_visible ? 'opacity-50' : ''}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-gray-300" />
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{section.section_type}</Badge>
                        <span className="font-medium text-sm">{section.title_en || section.title_ar || 'Untitled'}</span>
                        {section.is_visible ? <Eye className="w-3 h-3 text-green-500" /> : <EyeOff className="w-3 h-3 text-gray-400" />}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">Order: {section.display_order} · Page: {section.page}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Switch checked={!!section.is_visible} onCheckedChange={() => toggleSectionVisibility(section)} />
                    <Button variant="ghost" size="sm" onClick={() => setEditingSection(section)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteSection(section.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pages Tab */}
      {tab === 'pages' && (
        <div className="space-y-4">
          {editingPage && (
            <Card className="border-rose-gold/30">
              <CardHeader><CardTitle className="text-base">{editingPage.id ? 'Edit Page' : 'New Page'}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>Slug</Label><Input value={editingPage.slug} onChange={e => setEditingPage({ ...editingPage, slug: e.target.value })} placeholder="privacy-policy" /></div>
                  <div className="space-y-1.5"><Label>Published</Label><div className="pt-2"><Switch checked={!!editingPage.is_published} onCheckedChange={v => setEditingPage({ ...editingPage, is_published: v ? 1 : 0 })} /></div></div>
                  <div className="space-y-1.5"><Label>Title (Arabic)</Label><Input value={editingPage.title_ar} onChange={e => setEditingPage({ ...editingPage, title_ar: e.target.value })} dir="rtl" /></div>
                  <div className="space-y-1.5"><Label>Title (English)</Label><Input value={editingPage.title_en} onChange={e => setEditingPage({ ...editingPage, title_en: e.target.value })} /></div>
                </div>
                <div className="space-y-1.5"><Label>Content (Arabic)</Label><Textarea value={editingPage.content_ar} onChange={e => setEditingPage({ ...editingPage, content_ar: e.target.value })} rows={8} dir="rtl" /></div>
                <div className="space-y-1.5"><Label>Content (English)</Label><Textarea value={editingPage.content_en} onChange={e => setEditingPage({ ...editingPage, content_en: e.target.value })} rows={8} /></div>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>SEO Title (Arabic)</Label><Input value={editingPage.seo_title_ar} onChange={e => setEditingPage({ ...editingPage, seo_title_ar: e.target.value })} dir="rtl" /></div>
                  <div className="space-y-1.5"><Label>SEO Title (English)</Label><Input value={editingPage.seo_title_en} onChange={e => setEditingPage({ ...editingPage, seo_title_en: e.target.value })} /></div>
                  <div className="space-y-1.5"><Label>SEO Description (Arabic)</Label><Textarea value={editingPage.seo_description_ar} onChange={e => setEditingPage({ ...editingPage, seo_description_ar: e.target.value })} rows={2} dir="rtl" /></div>
                  <div className="space-y-1.5"><Label>SEO Description (English)</Label><Textarea value={editingPage.seo_description_en} onChange={e => setEditingPage({ ...editingPage, seo_description_en: e.target.value })} rows={2} /></div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={savePage} disabled={saving} className="bg-rose-gold hover:bg-rose-gold/90 text-white"><Save className="w-4 h-4 me-2" />{saving ? 'Saving...' : 'Save'}</Button>
                  <Button variant="outline" onClick={() => setEditingPage(null)}><X className="w-4 h-4 me-2" />Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!editingPage && (
            <Button onClick={() => setEditingPage({ id: '', slug: '', title_ar: '', title_en: '', content_ar: '', content_en: '', seo_title_ar: '', seo_title_en: '', seo_description_ar: '', seo_description_en: '', is_published: 0 })}
              className="bg-rose-gold hover:bg-rose-gold/90 text-white"><Plus className="w-4 h-4 me-2" /> Add Page</Button>
          )}

          {pages.map(page => (
            <Card key={page.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{page.title_en || page.title_ar}</span>
                      {page.is_published ? <Badge className="bg-green-100 text-green-700 text-xs">Published</Badge> : <Badge className="bg-gray-100 text-gray-500 text-xs">Draft</Badge>}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">/{page.slug}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setEditingPage(page)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deletePage(page.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
