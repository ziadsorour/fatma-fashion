"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import {
  Store,
  Truck,
  CreditCard,
  Share2,
  Search,
  Megaphone,
  Save,
  Loader2,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────
interface SettingRecord {
  key: string;
  value: string;
}

interface SettingsMap {
  [key: string]: string;
}

// ── Section wrapper ──────────────────────────────────────
function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
  onSave,
  saving,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-beige/50 flex items-center justify-center">
            <Icon className="h-5 w-5 text-rose-gold" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-400">{description}</p>
          </div>
        </div>
        <Button size="sm" onClick={onSave} loading={saving}>
          <Save className="h-3.5 w-3.5" /> Save
        </Button>
      </div>
      {children}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────
export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────
  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      const map: SettingsMap = {};
      (data.settings || []).forEach((s: SettingRecord) => {
        map[s.key] = s.value;
      });
      setSettings(map);
    } catch {
      toast({ title: "Failed to load settings", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // ── Helpers ────────────────────────────────────────
  const get = (key: string) => settings[key] || "";
  const set = (key: string, value: string) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const saveKeys = async (sectionName: string, keys: string[]) => {
    setSavingSection(sectionName);
    try {
      const pairs = keys.map((k) => ({ key: k, value: settings[k] || "" }));
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: pairs }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Settings saved", variant: "success" });
      } else {
        toast({ title: data.error || "Error saving", variant: "error" });
      }
    } catch {
      toast({ title: "Network error", variant: "error" });
    } finally {
      setSavingSection(null);
    }
  };

  // ── Loading ────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure your store information, payments, and preferences
        </p>
      </div>

      {/* ── Store Info ───────────────────────────────── */}
      <SettingsSection
        icon={Store}
        title="Store Information"
        description="Basic store details and contact info"
        onSave={() =>
          saveKeys("store", [
            "store_name",
            "store_tagline",
            "store_phone",
            "store_email",
            "store_address",
            "store_whatsapp",
          ])
        }
        saving={savingSection === "store"}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Store Name"
            value={get("store_name")}
            onChange={(e) => set("store_name", e.target.value)}
            placeholder="FATMA Fashion"
          />
          <Input
            label="Tagline"
            value={get("store_tagline")}
            onChange={(e) => set("store_tagline", e.target.value)}
            placeholder="Fashion For Girls"
          />
          <Input
            label="Phone"
            value={get("store_phone")}
            onChange={(e) => set("store_phone", e.target.value)}
            placeholder="+20 1xx xxxx xxx"
          />
          <Input
            label="Email"
            value={get("store_email")}
            onChange={(e) => set("store_email", e.target.value)}
            placeholder="info@fatma.com"
          />
          <Input
            label="WhatsApp Number"
            value={get("store_whatsapp")}
            onChange={(e) => set("store_whatsapp", e.target.value)}
            placeholder="+201xxxxxxxxx"
          />
          <Input
            label="Address"
            value={get("store_address")}
            onChange={(e) => set("store_address", e.target.value)}
            placeholder="Cairo, Egypt"
          />
        </div>
      </SettingsSection>

      {/* ── Shipping ─────────────────────────────────── */}
      <SettingsSection
        icon={Truck}
        title="Shipping Defaults"
        description="Default shipping fee and free shipping threshold"
        onSave={() =>
          saveKeys("shipping", [
            "default_shipping_fee",
            "free_shipping_threshold",
          ])
        }
        saving={savingSection === "shipping"}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Default Shipping Fee (EGP)"
            type="number"
            value={get("default_shipping_fee")}
            onChange={(e) => set("default_shipping_fee", e.target.value)}
            placeholder="50"
          />
          <Input
            label="Free Shipping Threshold (EGP)"
            type="number"
            value={get("free_shipping_threshold")}
            onChange={(e) => set("free_shipping_threshold", e.target.value)}
            placeholder="500"
          />
        </div>
      </SettingsSection>

      {/* ── Payment Methods ──────────────────────────── */}
      <SettingsSection
        icon={CreditCard}
        title="Payment Methods"
        description="Enable or disable payment options"
        onSave={() =>
          saveKeys("payment", [
            "payment_cod_enabled",
            "payment_online_enabled",
            "payment_online_provider",
            "payment_online_key",
            "payment_bank_enabled",
            "payment_bank_name",
            "payment_bank_account",
            "payment_bank_iban",
            "payment_instapay_enabled",
            "payment_instapay_number",
          ])
        }
        saving={savingSection === "payment"}
      >
        <div className="space-y-4">
          {/* COD */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Cash on Delivery (COD)
              </p>
              <p className="text-xs text-gray-400">
                Accept cash when order is delivered
              </p>
            </div>
            <Switch
              checked={get("payment_cod_enabled") === "true"}
              onCheckedChange={(checked) =>
                set("payment_cod_enabled", checked ? "true" : "false")
              }
            />
          </div>

          {/* Online */}
          <div className="p-3 rounded-lg bg-gray-50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Online Payment
                </p>
                <p className="text-xs text-gray-400">
                  Credit/debit card, mobile wallets
                </p>
              </div>
              <Switch
                checked={get("payment_online_enabled") === "true"}
                onCheckedChange={(checked) =>
                  set("payment_online_enabled", checked ? "true" : "false")
                }
              />
            </div>
            {get("payment_online_enabled") === "true" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                <Input
                  label="Provider"
                  value={get("payment_online_provider")}
                  onChange={(e) =>
                    set("payment_online_provider", e.target.value)
                  }
                  placeholder="Paymob, Fawry, etc."
                />
                <Input
                  label="API Key"
                  type="password"
                  value={get("payment_online_key")}
                  onChange={(e) => set("payment_online_key", e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            )}
          </div>

          {/* Bank Transfer */}
          <div className="p-3 rounded-lg bg-gray-50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Bank Transfer
                </p>
                <p className="text-xs text-gray-400">
                  Direct bank account transfer
                </p>
              </div>
              <Switch
                checked={get("payment_bank_enabled") === "true"}
                onCheckedChange={(checked) =>
                  set("payment_bank_enabled", checked ? "true" : "false")
                }
              />
            </div>
            {get("payment_bank_enabled") === "true" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-200">
                <Input
                  label="Bank Name"
                  value={get("payment_bank_name")}
                  onChange={(e) => set("payment_bank_name", e.target.value)}
                  placeholder="CIB"
                />
                <Input
                  label="Account Number"
                  value={get("payment_bank_account")}
                  onChange={(e) => set("payment_bank_account", e.target.value)}
                  placeholder="100xxxxxxxxx"
                />
                <Input
                  label="IBAN"
                  value={get("payment_bank_iban")}
                  onChange={(e) => set("payment_bank_iban", e.target.value)}
                  placeholder="EG..."
                />
              </div>
            )}
          </div>

          {/* InstaPay */}
          <div className="p-3 rounded-lg bg-gray-50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">InstaPay</p>
                <p className="text-xs text-gray-400">
                  InstaPay mobile payment
                </p>
              </div>
              <Switch
                checked={get("payment_instapay_enabled") === "true"}
                onCheckedChange={(checked) =>
                  set("payment_instapay_enabled", checked ? "true" : "false")
                }
              />
            </div>
            {get("payment_instapay_enabled") === "true" && (
              <div className="pt-2 border-t border-gray-200">
                <Input
                  label="InstaPay Number"
                  value={get("payment_instapay_number")}
                  onChange={(e) =>
                    set("payment_instapay_number", e.target.value)
                  }
                  placeholder="01xxxxxxxxx"
                />
              </div>
            )}
          </div>
        </div>
      </SettingsSection>

      {/* ── Social Media ─────────────────────────────── */}
      <SettingsSection
        icon={Share2}
        title="Social Media"
        description="Your social media profile URLs"
        onSave={() =>
          saveKeys("social", [
            "social_instagram",
            "social_facebook",
            "social_tiktok",
            "social_twitter",
          ])
        }
        saving={savingSection === "social"}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Instagram"
            value={get("social_instagram")}
            onChange={(e) => set("social_instagram", e.target.value)}
            placeholder="https://instagram.com/fatma"
          />
          <Input
            label="Facebook"
            value={get("social_facebook")}
            onChange={(e) => set("social_facebook", e.target.value)}
            placeholder="https://facebook.com/fatma"
          />
          <Input
            label="TikTok"
            value={get("social_tiktok")}
            onChange={(e) => set("social_tiktok", e.target.value)}
            placeholder="https://tiktok.com/@fatma"
          />
          <Input
            label="Twitter / X"
            value={get("social_twitter")}
            onChange={(e) => set("social_twitter", e.target.value)}
            placeholder="https://x.com/fatma"
          />
        </div>
      </SettingsSection>

      {/* ── SEO ───────────────────────────────────────── */}
      <SettingsSection
        icon={Search}
        title="SEO Defaults"
        description="Default meta tags for search engines"
        onSave={() =>
          saveKeys("seo", ["seo_meta_title", "seo_meta_description"])
        }
        saving={savingSection === "seo"}
      >
        <div className="space-y-3">
          <Input
            label="Default Meta Title"
            value={get("seo_meta_title")}
            onChange={(e) => set("seo_meta_title", e.target.value)}
            placeholder="FATMA Fashion — Trendy Fashion For Girls"
          />
          <Textarea
            label="Default Meta Description"
            value={get("seo_meta_description")}
            onChange={(e) => set("seo_meta_description", e.target.value)}
            placeholder="Shop the latest fashion trends for girls..."
            rows={3}
          />
        </div>
      </SettingsSection>

      {/* ── Appearance ────────────────────────────────── */}
      <SettingsSection
        icon={Megaphone}
        title="Appearance"
        description="Announcement bar and visual customizations"
        onSave={() =>
          saveKeys("appearance", [
            "announcement_text",
            "announcement_visible",
          ])
        }
        saving={savingSection === "appearance"}
      >
        <div className="space-y-3">
          <Input
            label="Announcement Bar Text"
            value={get("announcement_text")}
            onChange={(e) => set("announcement_text", e.target.value)}
            placeholder="🎉 Free shipping on orders over EGP 500!"
          />
          <div className="flex items-center gap-3">
            <Switch
              checked={get("announcement_visible") === "true"}
              onCheckedChange={(checked) =>
                set("announcement_visible", checked ? "true" : "false")
              }
            />
            <span className="text-sm text-gray-700">
              Show announcement bar
            </span>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}
