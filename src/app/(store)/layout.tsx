"use client";

import { StoreHeader, MobileBottomNav } from "@/components/store/header";
import { StoreFooter } from "@/components/store/footer";
import { Toaster } from "@/components/ui/toast";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader />
      <main className="flex-1">{children}</main>
      <StoreFooter />
      <MobileBottomNav />
      <Toaster />
    </div>
  );
}
