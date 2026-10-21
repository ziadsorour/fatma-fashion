"use client";

import Link from "next/link";
import Image from "next/image";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus, Search, Package, Edit, Eye, Archive, MoreHorizontal } from "lucide-react";
import { useState } from "react";

interface Props { products: any[]; }

const statusBadge: Record<string, string> = {
  published: 'bg-green-100 text-green-700',
  draft: 'bg-gray-100 text-gray-600',
  archived: 'bg-red-100 text-red-600',
};

export function ProductsListClient({ products }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = products.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (search && !p.name_en.toLowerCase().includes(search.toLowerCase()) && !p.sku?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Products ({products.length})</h1>
        <Button asChild><Link href="/admin/products/new"><Plus className="h-4 w-4" /> Add Product</Link></Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full h-10 pl-10 pr-4 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white">
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Products Table */}
      {filtered.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-4 py-3 font-medium text-gray-500">Product</th>
                <th className="px-4 py-3 font-medium text-gray-500">SKU</th>
                <th className="px-4 py-3 font-medium text-gray-500">Category</th>
                <th className="px-4 py-3 font-medium text-gray-500">Price</th>
                <th className="px-4 py-3 font-medium text-gray-500">Stock</th>
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p: any) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-12 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                        {p.image_url ? <Image src={p.image_url} alt="" width={40} height={48} className="w-full h-full object-cover" /> : <Package className="w-full h-full p-2 text-gray-300" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">{p.name_en}</p>
                        <p className="text-xs text-gray-400 line-clamp-1">{p.name_ar}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.sku}</td>
                  <td className="px-4 py-3 text-gray-600">{p.category_name || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{formatPrice(p.sale_price || p.price, 'en')}</span>
                    {p.sale_price && <span className="text-xs text-gray-400 line-through ml-1">{formatPrice(p.price, 'en')}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${(p.total_stock || 0) <= 5 ? 'text-red-600' : 'text-gray-700'}`}>{p.total_stock || 0}</span>
                    <span className="text-xs text-gray-400 ml-1">({p.variant_count} variants)</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge[p.status] || 'bg-gray-100 text-gray-600'}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/products/${p.id}`} className="p-1.5 text-gray-400 hover:text-blue-600 rounded"><Edit className="h-4 w-4" /></Link>
                      <Link href={`/product/${p.slug}`} target="_blank" className="p-1.5 text-gray-400 hover:text-green-600 rounded"><Eye className="h-4 w-4" /></Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState icon={Package} title="No products found" description="Start by adding your first product" actionLabel="Add Product" onAction={() => window.location.href = '/admin/products/new'} />
      )}
    </div>
  );
}
