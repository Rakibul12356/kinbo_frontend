"use client";

import React, { useState } from "react";
import { Settings, Check } from "lucide-react";
import { toast } from "react-toastify";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import AdminShell from "@/views/admin/AdminShell";
import RouteGuard from "@/components/auth/RouteGuard";
import { useIsClient } from "@/hooks/use-is-client";
import {
  DEFAULT_SETTINGS,
  loadAdminSettings,
  saveAdminSettings,
  type AdminStoreSettings,
} from "@/lib/admin/settings-store";

function SettingsForm() {
  const [form, setForm] = useState<AdminStoreSettings>(() => loadAdminSettings());
  const [saving, setSaving] = useState(false);

  const setField = <K extends keyof AdminStoreSettings>(key: K, value: AdminStoreSettings[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    saveAdminSettings({
      ...form,
      storeName: form.storeName.trim() || DEFAULT_SETTINGS.storeName,
      supportEmail: form.supportEmail.trim(),
      supportPhone: form.supportPhone.trim(),
      defaultShippingFee: Number(form.defaultShippingFee) || 0,
      freeShippingMin: Number(form.freeShippingMin) || 0,
    });
    toast.success("Settings saved.");
    setSaving(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-2xl space-y-6 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs sm:p-6"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#082F6B] text-white">
          <Settings className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-base font-bold text-[#1F2937]">Store settings</h2>
          <p className="text-xs text-zinc-500">Store profile and display preferences.</p>
        </div>
      </div>

      <div className="space-y-4">
        <Input
          label="Store name"
          value={form.storeName}
          onChange={(e) => setField("storeName", e.target.value)}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Support email"
            type="email"
            value={form.supportEmail}
            onChange={(e) => setField("supportEmail", e.target.value)}
          />
          <Input
            label="Support phone"
            value={form.supportPhone}
            onChange={(e) => setField("supportPhone", e.target.value)}
          />
        </div>
        <Input
          label="Currency label"
          value={form.currencyLabel}
          onChange={(e) => setField("currencyLabel", e.target.value)}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Default shipping fee (৳)"
            type="number"
            min="0"
            value={String(form.defaultShippingFee)}
            onChange={(e) => setField("defaultShippingFee", Number(e.target.value))}
          />
          <Input
            label="Free shipping minimum (৳)"
            type="number"
            min="0"
            value={String(form.freeShippingMin)}
            onChange={(e) => setField("freeShippingMin", Number(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Notifications</p>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-[#1F2937]">
          <input
            type="checkbox"
            checked={form.notifyNewOrders}
            onChange={(e) => setField("notifyNewOrders", e.target.checked)}
            className="h-4 w-4 rounded accent-[#082F6B]"
          />
          Alert on new orders
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-[#1F2937]">
          <input
            type="checkbox"
            checked={form.notifyLowStock}
            onChange={(e) => setField("notifyLowStock", e.target.checked)}
            className="h-4 w-4 rounded accent-[#082F6B]"
          />
          Alert on low stock
        </label>
      </div>

      <Button type="submit" className="w-full sm:w-auto" isLoading={saving}>
        <Check className="h-4 w-4" />
        Save settings
      </Button>
    </form>
  );
}

function SettingsContent() {
  const ready = useIsClient();

  return (
    <AdminShell
      title="Settings"
      description="Store profile, shipping defaults, and notification preferences."
    >
      {!ready ? <p className="text-sm text-zinc-500">Loading settings…</p> : <SettingsForm />}
    </AdminShell>
  );
}

export default function AdminSettingsView() {
  return (
    <RouteGuard step="admin">
      <SettingsContent />
    </RouteGuard>
  );
}
