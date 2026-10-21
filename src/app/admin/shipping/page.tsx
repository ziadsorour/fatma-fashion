"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatPrice, GOVERNORATES_EN } from "@/lib/utils";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  Truck,
  MapPin,
  X,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────
interface ShippingZone {
  id: string;
  name_ar: string;
  name_en: string;
  governorates: string[];
  shipping_fee: number; // piasters
  free_shipping_threshold: number | null;
  estimated_days_min: number;
  estimated_days_max: number;
  is_active: boolean;
  created_at?: string;
}

type ZoneFormData = {
  name_ar: string;
  name_en: string;
  governorates: string[];
  shipping_fee: string; // EGP string input
  free_shipping_threshold: string;
  estimated_days_min: string;
  estimated_days_max: string;
  is_active: boolean;
};

const emptyForm: ZoneFormData = {
  name_ar: "",
  name_en: "",
  governorates: [],
  shipping_fee: "",
  free_shipping_threshold: "",
  estimated_days_min: "",
  estimated_days_max: "",
  is_active: true,
};

// ── Component ────────────────────────────────────────────
export default function AdminShippingPage() {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const [form, setForm] = useState<ZoneFormData>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // ── Fetch zones ──────────────────────────────────────
  const fetchZones = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/shipping");
      const data = await res.json();
      setZones(data.zones || []);
    } catch {
      toast({ title: "Failed to load shipping zones", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  // ── Open dialog ──────────────────────────────────────
  const openCreate = () => {
    setEditingZone(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (zone: ShippingZone) => {
    setEditingZone(zone);
    setForm({
      name_ar: zone.name_ar,
      name_en: zone.name_en,
      governorates: zone.governorates,
      shipping_fee: (zone.shipping_fee / 100).toString(),
      free_shipping_threshold: zone.free_shipping_threshold
        ? (zone.free_shipping_threshold / 100).toString()
        : "",
      estimated_days_min: zone.estimated_days_min.toString(),
      estimated_days_max: zone.estimated_days_max.toString(),
      is_active: zone.is_active,
    });
    setDialogOpen(true);
  };

  // ── Save zone ────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name_en || !form.shipping_fee) {
      toast({ title: "Name and shipping fee are required", variant: "error" });
      return;
    }
    if (form.governorates.length === 0) {
      toast({ title: "Select at least one governorate", variant: "error" });
      return;
    }

    setSaving(true);
    try {
      const body = {
        id: editingZone?.id,
        name_ar: form.name_ar,
        name_en: form.name_en,
        governorates: form.governorates,
        shipping_fee: Math.round(parseFloat(form.shipping_fee) * 100),
        free_shipping_threshold: form.free_shipping_threshold
          ? Math.round(parseFloat(form.free_shipping_threshold) * 100)
          : null,
        estimated_days_min: parseInt(form.estimated_days_min) || 1,
        estimated_days_max: parseInt(form.estimated_days_max) || 3,
        is_active: form.is_active,
      };

      const res = await fetch("/api/admin/shipping", {
        method: editingZone ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        toast({
          title: editingZone ? "Zone updated" : "Zone created",
          variant: "success",
        });
        setDialogOpen(false);
        fetchZones();
      } else {
        toast({ title: data.error || "Error saving zone", variant: "error" });
      }
    } catch {
      toast({ title: "Network error", variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle active ────────────────────────────────────
  const toggleActive = async (zone: ShippingZone) => {
    try {
      const res = await fetch("/api/admin/shipping", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: zone.id, is_active: !zone.is_active }),
      });
      const data = await res.json();
      if (data.success) {
        setZones((prev) =>
          prev.map((z) =>
            z.id === zone.id ? { ...z, is_active: !z.is_active } : z
          )
        );
      }
    } catch {
      toast({ title: "Failed to update", variant: "error" });
    }
  };

  // ── Delete zone ──────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch("/api/admin/shipping", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Zone deleted", variant: "success" });
        setZones((prev) => prev.filter((z) => z.id !== id));
      } else {
        toast({ title: data.error || "Error deleting", variant: "error" });
      }
    } catch {
      toast({ title: "Network error", variant: "error" });
    } finally {
      setDeleteConfirm(null);
    }
  };

  // ── Governorate selection ────────────────────────────
  const toggleGovernorate = (gov: string) => {
    setForm((prev) => ({
      ...prev,
      governorates: prev.governorates.includes(gov)
        ? prev.governorates.filter((g) => g !== gov)
        : [...prev.governorates, gov],
    }));
  };

  const selectAllGovernorates = () => {
    setForm((prev) => ({
      ...prev,
      governorates:
        prev.governorates.length === GOVERNORATES_EN.length
          ? []
          : [...GOVERNORATES_EN],
    }));
  };

  // ── Loading skeleton ─────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shipping Zones</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage delivery zones, fees, and estimated delivery times
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> New Zone
        </Button>
      </div>

      {/* Empty state */}
      {zones.length === 0 && (
        <EmptyState
          icon={Truck}
          title="No shipping zones"
          description="Create your first shipping zone to start accepting deliveries."
          actionLabel="Create Zone"
          onAction={openCreate}
        />
      )}

      {/* Desktop table */}
      {zones.length > 0 && (
        <div className="hidden md:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-4 py-3 font-medium text-gray-500">Zone</th>
                <th className="px-4 py-3 font-medium text-gray-500">
                  Governorates
                </th>
                <th className="px-4 py-3 font-medium text-gray-500">
                  Shipping Fee
                </th>
                <th className="px-4 py-3 font-medium text-gray-500">
                  Free Threshold
                </th>
                <th className="px-4 py-3 font-medium text-gray-500">
                  Est. Days
                </th>
                <th className="px-4 py-3 font-medium text-gray-500">Active</th>
                <th className="px-4 py-3 font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {zones.map((zone) => (
                <tr key={zone.id} className="border-b border-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {zone.name_en}
                    </div>
                    <div className="text-xs text-gray-400" dir="rtl">
                      {zone.name_ar}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {(zone.governorates || []).slice(0, 3).map((gov) => (
                        <Badge
                          key={gov}
                          variant="outline"
                          className="text-[10px] px-1.5 py-0.5"
                        >
                          {gov}
                        </Badge>
                      ))}
                      {(zone.governorates || []).length > 3 && (
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0.5"
                        >
                          +{zone.governorates.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatPrice(zone.shipping_fee, "en")}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {zone.free_shipping_threshold
                      ? formatPrice(zone.free_shipping_threshold, "en")
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {zone.estimated_days_min}–{zone.estimated_days_max} days
                  </td>
                  <td className="px-4 py-3">
                    <Switch
                      checked={zone.is_active}
                      onCheckedChange={() => toggleActive(zone)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(zone)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-gray-50"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {deleteConfirm === zone.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(zone.id)}
                            className="px-2 py-1 text-xs bg-red-500 text-white rounded-md hover:bg-red-600"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(zone.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile cards */}
      {zones.length > 0 && (
        <div className="md:hidden space-y-3">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {zone.name_en}
                  </h3>
                  <p className="text-xs text-gray-400" dir="rtl">
                    {zone.name_ar}
                  </p>
                </div>
                <Switch
                  checked={zone.is_active}
                  onCheckedChange={() => toggleActive(zone)}
                />
              </div>

              <div className="flex flex-wrap gap-1">
                {(zone.governorates || []).map((gov) => (
                  <Badge
                    key={gov}
                    variant="outline"
                    className="text-[10px] px-1.5 py-0.5"
                  >
                    {gov}
                  </Badge>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-gray-400 text-xs block">Fee</span>
                  <span className="font-medium">
                    {formatPrice(zone.shipping_fee, "en")}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs block">
                    Free above
                  </span>
                  <span className="font-medium">
                    {zone.free_shipping_threshold
                      ? formatPrice(zone.free_shipping_threshold, "en")
                      : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-xs block">Delivery</span>
                  <span className="font-medium">
                    {zone.estimated_days_min}–{zone.estimated_days_max}d
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEdit(zone)}
                >
                  <Edit className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDelete(zone.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create / Edit Dialog ───────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingZone ? "Edit Shipping Zone" : "New Shipping Zone"}
            </DialogTitle>
            <DialogDescription>
              Configure zone details, governorates, and delivery fees.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Zone Name (EN) *"
                value={form.name_en}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name_en: e.target.value }))
                }
                placeholder="Greater Cairo"
              />
              <Input
                label="Zone Name (AR)"
                value={form.name_ar}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name_ar: e.target.value }))
                }
                placeholder="القاهرة الكبرى"
                dir="rtl"
              />
            </div>

            {/* Fees & days */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Input
                label="Shipping Fee (EGP) *"
                type="number"
                value={form.shipping_fee}
                onChange={(e) =>
                  setForm((p) => ({ ...p, shipping_fee: e.target.value }))
                }
                placeholder="50"
              />
              <Input
                label="Free Threshold (EGP)"
                type="number"
                value={form.free_shipping_threshold}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    free_shipping_threshold: e.target.value,
                  }))
                }
                placeholder="500"
              />
              <Input
                label="Min Days"
                type="number"
                value={form.estimated_days_min}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    estimated_days_min: e.target.value,
                  }))
                }
                placeholder="1"
              />
              <Input
                label="Max Days"
                type="number"
                value={form.estimated_days_max}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    estimated_days_max: e.target.value,
                  }))
                }
                placeholder="3"
              />
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-3">
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) =>
                  setForm((p) => ({ ...p, is_active: checked }))
                }
              />
              <span className="text-sm text-gray-700">Active</span>
            </div>

            {/* Governorates */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Governorates ({form.governorates.length} selected)
                </label>
                <button
                  type="button"
                  onClick={selectAllGovernorates}
                  className="text-xs text-rose-gold hover:underline"
                >
                  {form.governorates.length === GOVERNORATES_EN.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto border border-gray-100 rounded-lg p-3">
                {GOVERNORATES_EN.map((gov) => (
                  <label
                    key={gov}
                    className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 rounded px-2 py-1"
                  >
                    <input
                      type="checkbox"
                      checked={form.governorates.includes(gov)}
                      onChange={() => toggleGovernorate(gov)}
                      className="rounded border-gray-300 text-rose-gold focus:ring-rose-gold"
                    />
                    <span className="text-gray-700">{gov}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              <Save className="h-4 w-4" />{" "}
              {editingZone ? "Update Zone" : "Create Zone"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
