"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toast";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag, Truck, CreditCard,
  BarChart3, Settings, FileText, Bell, Shield, Menu, X, LogOut, ChevronDown,
  Layers, Image as ImageIcon, Globe
} from "lucide-react";

const sidebarLinks = [
  { href: '/admin', label: 'Dashboard', labelAr: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', labelAr: 'المنتجات', icon: Package },
  { href: '/admin/orders', label: 'Orders', labelAr: 'الطلبات', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Customers', labelAr: 'العملاء', icon: Users },
  { href: '/admin/categories', label: 'Categories', labelAr: 'الفئات', icon: Layers },
  { href: '/admin/coupons', label: 'Coupons', labelAr: 'الكوبونات', icon: Tag },
  { href: '/admin/shipping', label: 'Shipping', labelAr: 'الشحن', icon: Truck },
  { href: '/admin/payments', label: 'Payments', labelAr: 'المدفوعات', icon: CreditCard },
  { href: '/admin/content', label: 'Content', labelAr: 'المحتوى', icon: FileText },
  { href: '/admin/reports', label: 'Reports', labelAr: 'التقارير', icon: BarChart3 },
  { href: '/admin/staff', label: 'Staff', labelAr: 'الموظفين', icon: Shield },
  { href: '/admin/settings', label: 'Settings', labelAr: 'الإعدادات', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="ltr">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 start-0 z-50 w-64 bg-charcoal text-white transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-white/10">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-white/20 flex-shrink-0 bg-white/5">
                <Image src="/images/fatma-logo.jpg" alt="FATMA" fill className="object-cover" />
              </div>
              <div>
                <h1 className="font-bold text-sm tracking-wide">FATMA Admin</h1>
                <p className="text-[10px] text-white/50">Fashion For Girls</p>
              </div>
            </Link>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-rose-gold text-white font-medium"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  <link.icon className="h-4 w-4 flex-shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom */}
          <div className="p-3 border-t border-white/10">
            <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/5 transition-colors">
              <Globe className="h-4 w-4" />
              <span>View Store</span>
            </Link>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-red-400 hover:bg-white/5 transition-colors">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 h-14 flex items-center px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ms-2 me-2">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-800 text-sm">
              {sidebarLinks.find(l => l.href === pathname || (l.href !== '/admin' && pathname.startsWith(l.href)))?.label || 'Admin'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-400 hover:text-gray-600">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 end-1 h-2 w-2 bg-rose-blush rounded-full" />
            </button>
            <div className="h-8 w-8 rounded-full bg-rose-gold text-white flex items-center justify-center text-xs font-bold">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>

      <Toaster />
    </div>
  );
}
