"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Heart,
  MapPin,
  Package,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "react-toastify";
import PageLayout from "@/components/layout/PageLayout";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useAccount } from "@/hooks/use-account";
import { useAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import {
  deleteAddress,
  removeStockAlert,
  removeWishlistItem,
  saveAddress,
  setDefaultAddress,
  type SavedAddress,
} from "@/lib/account/account-store";
import { formatPrice } from "@/lib/utils";

type TabId = "profile" | "products" | "notified" | "wishlists" | "address";

const SIDEBAR: { id: TabId; label: string; icon: typeof Package }[] = [
  { id: "products", label: "My Products", icon: Package },
  { id: "notified", label: "Notified Products", icon: Bell },
  { id: "wishlists", label: "Wishlists", icon: Heart },
  { id: "address", label: "Delivery Address", icon: MapPin },
];

const emptyAddressForm = {
  label: "Home",
  fullName: "",
  phone: "",
  address: "",
  city: "",
  postalCode: "",
};

function ProductListEmpty({
  title,
  hint,
  href,
  cta,
}: {
  title: string;
  hint: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="px-2 py-12 text-center sm:px-4">
      <p className="text-sm font-semibold text-[#1F2937]">{title}</p>
      <p className="mt-1 text-xs text-zinc-500">{hint}</p>
      <Link
        href={href}
        className="mt-4 inline-flex rounded-xl bg-[#082F6B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#062452]"
      >
        {cta}
      </Link>
    </div>
  );
}

function ProfilePanel({
  fullName,
  setFullName,
  gender,
  setGender,
  dob,
  setDob,
  email,
  mobile,
  isUpdating,
  onSubmit,
}: {
  fullName: string;
  setFullName: (v: string) => void;
  gender: string;
  setGender: (v: string) => void;
  dob: string;
  setDob: (v: string) => void;
  email: string;
  mobile: string;
  isUpdating: boolean;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <>
      <div className="mb-8 flex justify-center">
        <div className="relative">
          <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-zinc-300 bg-zinc-50 sm:h-32 sm:w-32">
            <User className="h-16 w-16 text-zinc-700 stroke-[1.5] sm:h-20 sm:w-20" />
          </div>
          <label
            htmlFor="profile-avatar-upload"
            className="absolute bottom-1 right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#082F6B] text-white shadow-md transition hover:bg-[#062452] active:scale-95"
            title="Upload Photo"
          >
            <Camera className="h-4 w-4" />
            <input
              id="profile-avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={() => toast.info("Photo upload will connect when media API is ready.")}
            />
          </label>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5 sm:space-y-6">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-[#1F2937] sm:text-sm">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm text-[#1F2937] transition placeholder:text-zinc-400 focus:border-[#082F6B] focus:outline-none focus:ring-1 focus:ring-[#082F6B]/20 sm:py-3"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#1F2937] sm:text-sm">
              Gender
            </label>
            <div className="relative">
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full cursor-pointer appearance-none rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 pr-10 text-sm text-[#1F2937] transition focus:border-[#082F6B] focus:outline-none focus:ring-1 focus:ring-[#082F6B]/20 sm:py-3"
              >
                <option value="">Select an option</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#1F2937] sm:text-sm">
              Date of Birth
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm text-[#1F2937] transition focus:border-[#082F6B] focus:outline-none focus:ring-1 focus:ring-[#082F6B]/20 sm:py-3"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#1F2937] sm:text-sm">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                readOnly
                className="w-full cursor-not-allowed select-none rounded-lg border border-[#E5E7EB] bg-zinc-100/80 px-4 py-2.5 pr-10 text-sm text-zinc-600 sm:py-3"
              />
              <CheckCircle2 className="absolute right-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 fill-emerald-500 text-white" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-[#1F2937] sm:text-sm">
              Mobile No
            </label>
            <div className="relative">
              <input
                type="tel"
                value={mobile}
                readOnly
                className="w-full cursor-not-allowed select-none rounded-lg border border-[#E5E7EB] bg-zinc-100/80 px-4 py-2.5 pr-10 text-sm text-zinc-600 sm:py-3"
              />
              <CheckCircle2 className="absolute right-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 fill-emerald-500 text-white" />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isUpdating}
            className="flex w-full min-w-[200px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#082F6B] px-8 py-3 text-sm font-semibold text-white shadow-xs transition hover:bg-[#062452] active:scale-[0.99] disabled:opacity-70 sm:w-auto"
          >
            {isUpdating ? "Updating..." : "Update Profile"}
          </button>
        </div>
      </form>
    </>
  );
}

export default function AccountPage() {
  const { user } = useAuth();
  const { orders, ready: ordersReady } = useOrders();
  const { wishlist, notified, addresses } = useAccount();

  const [fullName, setFullName] = useState(user?.fullName ?? "Rakibul Hasan");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const email = user?.email ?? "rakibulhasan.maktech@gmail.com";
  const mobile = "+8801328524369";
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [addressForm, setAddressForm] = useState(emptyAddressForm);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  const purchasedProducts = useMemo(() => {
    // shortcut: demo shows products from all local orders; filter by userId when backend exists
    const map = new Map<
      string,
      { productId: string; name: string; image: string; price: number; qty: number }
    >();
    for (const order of orders) {
      for (const item of order.items) {
        const current = map.get(item.productId) ?? {
          productId: item.productId,
          name: item.name,
          image: item.image,
          price: item.price,
          qty: 0,
        };
        current.qty += item.quantity;
        map.set(item.productId, current);
      }
    }
    return [...map.values()];
  }, [orders]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3500);
    }, 700);
  };

  const openAddAddressModal = () => {
    setEditingAddressId(null);
    setAddressForm(emptyAddressForm);
    setAddressModalOpen(true);
  };

  const startEditAddress = (address: SavedAddress) => {
    setEditingAddressId(address.id);
    setAddressForm({
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      postalCode: address.postalCode,
    });
    setAddressModalOpen(true);
  };

  const closeAddressModal = () => {
    setAddressModalOpen(false);
    setEditingAddressId(null);
    setAddressForm(emptyAddressForm);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.fullName.trim() || !addressForm.phone.trim() || !addressForm.address.trim()) {
      toast.error("Name, phone and address are required.");
      return;
    }
    const editingId = editingAddressId;
    setSavingAddress(true);
    saveAddress({
      id: editingId ?? undefined,
      ...addressForm,
      isDefault: editingId
        ? addresses.find((a) => a.id === editingId)?.isDefault
        : addresses.length === 0,
    });
    setSavingAddress(false);
    closeAddressModal();
    toast.success(editingId ? "Address updated." : "Address saved.");
  };

  const panelTitle =
    activeTab === "profile"
      ? "Profile"
      : SIDEBAR.find((item) => item.id === activeTab)?.label ?? "Account";

  return (
    <PageLayout className="bg-[#F8FAFC]">
      <main className="container mx-auto flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex items-center gap-2 text-xs font-medium text-zinc-500 sm:text-sm">
          <Link href="/" className="transition-colors hover:text-[#082F6B]">
            Home
          </Link>
          <span className="text-zinc-400">&gt;</span>
          <span className="font-semibold text-zinc-800">Account</span>
          {activeTab !== "profile" && (
            <>
              <span className="text-zinc-400">&gt;</span>
              <span className="font-semibold text-zinc-800">{panelTitle}</span>
            </>
          )}
        </div>

        {showSuccessToast && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 shadow-xs">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span>Profile information updated successfully!</span>
            </div>
            <button
              type="button"
              onClick={() => setShowSuccessToast(false)}
              className="px-2 py-1 text-xs font-bold text-emerald-600 hover:text-emerald-900"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="space-y-2.5 lg:col-span-4">
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`flex w-full cursor-pointer items-center gap-3.5 rounded-2xl border bg-white p-4 text-left shadow-2xs transition ${
                activeTab === "profile"
                  ? "border-[#082F6B] bg-[#F3F7FC]/70"
                  : "border-[#E5E7EB] hover:border-zinc-300"
              }`}
            >
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-2 border-zinc-200 bg-zinc-50">
                <User className="h-8 w-8 text-zinc-700 stroke-[1.7]" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-bold text-[#1F2937] sm:text-base">
                  {fullName}
                </h3>
                <p className="truncate text-xs text-zinc-500">{mobile}</p>
                <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                  <LanguageSwitcher />
                </div>
              </div>
            </button>

            <div className="space-y-2 pt-1">
              {SIDEBAR.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`group flex w-full cursor-pointer items-center justify-between rounded-xl border bg-white px-4 py-3 text-left text-xs transition shadow-2xs sm:text-sm ${
                      isActive
                        ? "border-[#082F6B] bg-[#F3F7FC]/70 font-semibold text-[#082F6B]"
                        : "border-[#E5E7EB] text-[#1F2937] hover:border-zinc-300 hover:bg-[#F3F7FC]/50"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Icon className="h-4.5 w-4.5 flex-shrink-0 text-zinc-600 transition-colors group-hover:text-[#082F6B]" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 flex-shrink-0 text-zinc-400 transition-all group-hover:translate-x-0.5 group-hover:text-[#082F6B]" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-2xs sm:p-8 lg:col-span-8">
            {activeTab !== "profile" && (
              <div className="mb-5 border-b border-[#E5E7EB] pb-4">
                <h2 className="text-lg font-bold text-[#1F2937]">{panelTitle}</h2>
              </div>
            )}

            {activeTab === "profile" && (
              <ProfilePanel
                fullName={fullName}
                setFullName={setFullName}
                gender={gender}
                setGender={setGender}
                dob={dob}
                setDob={setDob}
                email={email}
                mobile={mobile}
                isUpdating={isUpdating}
                onSubmit={handleUpdateProfile}
              />
            )}

            {activeTab === "products" && (
              <>
                {!ordersReady ? (
                  <p className="text-sm text-zinc-500">Loading products…</p>
                ) : purchasedProducts.length === 0 ? (
                  <ProductListEmpty
                    title="No purchased products yet"
                    hint="Items from your orders will show up here."
                    href="/products"
                    cta="Browse products"
                  />
                ) : (
                  <ul className="divide-y divide-[#E5E7EB]">
                    {purchasedProducts.map((product) => (
                      <li key={product.productId} className="flex items-center gap-3 py-3">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#F3F7FC]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={product.image}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/products/${product.productId}`}
                            className="line-clamp-1 text-sm font-semibold text-[#1F2937] hover:text-[#082F6B]"
                          >
                            {product.name}
                          </Link>
                          <p className="mt-0.5 text-xs text-zinc-500">
                            Bought {product.qty} · {formatPrice(product.price)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            {activeTab === "notified" && (
              <>
                <p className="mb-4 text-xs text-zinc-500">
                  Products you asked to be notified about when back in stock.
                </p>
                {notified.length === 0 ? (
                  <ProductListEmpty
                    title="No stock alerts"
                    hint="When a product is out of stock, you can request a restock alert from the product page."
                    href="/products"
                    cta="Browse products"
                  />
                ) : (
                  <ul className="divide-y divide-[#E5E7EB]">
                    {notified.map((item) => (
                      <li key={item.productId} className="flex items-center gap-3 py-3">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#F3F7FC]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/products/${item.productId}`}
                            className="line-clamp-1 text-sm font-semibold text-[#1F2937] hover:text-[#082F6B]"
                          >
                            {item.name}
                          </Link>
                          <p className="mt-0.5 text-xs text-zinc-500">
                            {formatPrice(item.price)} · waiting for stock
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            removeStockAlert(item.productId);
                            toast.success("Alert removed.");
                          }}
                          className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 cursor-pointer"
                          aria-label="Remove alert"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            {activeTab === "wishlists" && (
              <>
                {wishlist.length === 0 ? (
                  <ProductListEmpty
                    title="Wishlist is empty"
                    hint="Save products you like and find them here later."
                    href="/products"
                    cta="Find products"
                  />
                ) : (
                  <ul className="divide-y divide-[#E5E7EB]">
                    {wishlist.map((item) => (
                      <li key={item.productId} className="flex items-center gap-3 py-3">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#F3F7FC]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/products/${item.productId}`}
                            className="line-clamp-1 text-sm font-semibold text-[#1F2937] hover:text-[#082F6B]"
                          >
                            {item.name}
                          </Link>
                          <p className="mt-0.5 text-xs font-semibold text-[#082F6B]">
                            {formatPrice(item.price)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            removeWishlistItem(item.productId);
                            toast.success("Removed from wishlist.");
                          }}
                          className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 cursor-pointer"
                          aria-label="Remove from wishlist"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            {activeTab === "address" && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={openAddAddressModal}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B00] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#E85D00] cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Add new address
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-[#F8FAFC] px-4 py-12 text-center">
                    <p className="text-sm font-semibold text-[#1F2937]">No saved addresses</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Add a delivery address to use at checkout.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {addresses.map((address) => (
                      <li
                        key={address.id}
                        className={`rounded-xl border p-4 ${
                          address.isDefault
                            ? "border-[#082F6B] bg-[#F3F7FC]/60"
                            : "border-[#E5E7EB]"
                        }`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-bold text-[#1F2937]">{address.label}</p>
                              {address.isDefault && (
                                <span className="rounded-full bg-[#082F6B] px-2 py-0.5 text-[10px] font-bold text-white">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-[#1F2937]">{address.fullName}</p>
                            <p className="text-xs text-zinc-500">{address.phone}</p>
                            <p className="mt-1 text-xs leading-relaxed text-zinc-600">
                              {address.address}, {address.city}
                              {address.postalCode ? ` ${address.postalCode}` : ""}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {!address.isDefault && (
                              <button
                                type="button"
                                onClick={() => {
                                  setDefaultAddress(address.id);
                                  toast.success("Default address updated.");
                                }}
                                className="rounded-lg border border-[#E5E7EB] px-2.5 py-1 text-[11px] font-semibold text-[#082F6B] hover:bg-white cursor-pointer"
                              >
                                Set default
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => startEditAddress(address)}
                              className="rounded-lg border border-[#E5E7EB] px-2.5 py-1 text-[11px] font-semibold text-zinc-600 hover:bg-white cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                deleteAddress(address.id);
                                toast.success("Address deleted.");
                              }}
                              className="rounded-lg px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <form
            onSubmit={handleSaveAddress}
            className="w-full max-w-lg space-y-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xl sm:p-6"
          >
            <div>
              <h3 className="text-base font-bold text-[#1F2937]">
                {editingAddressId ? "Edit address" : "Add new address"}
              </h3>
              <p className="mt-0.5 text-xs text-zinc-500">
                Saved addresses can be reused at checkout.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="Label"
                value={addressForm.label}
                onChange={(e) => setAddressForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="Home / Office"
              />
              <Input
                label="Full name"
                value={addressForm.fullName}
                onChange={(e) => setAddressForm((f) => ({ ...f, fullName: e.target.value }))}
                required
              />
              <Input
                label="Phone"
                value={addressForm.phone}
                onChange={(e) => setAddressForm((f) => ({ ...f, phone: e.target.value }))}
                required
              />
              <Input
                label="City"
                value={addressForm.city}
                onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))}
              />
            </div>
            <Input
              label="Address"
              value={addressForm.address}
              onChange={(e) => setAddressForm((f) => ({ ...f, address: e.target.value }))}
              required
            />
            <Input
              label="Postal code"
              value={addressForm.postalCode}
              onChange={(e) => setAddressForm((f) => ({ ...f, postalCode: e.target.value }))}
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={closeAddressModal}
                className="rounded-xl border border-[#E5E7EB] px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-[#F8FAFC] cursor-pointer"
              >
                Cancel
              </button>
              <Button type="submit" size="sm" isLoading={savingAddress}>
                {editingAddressId ? "Update address" : "Save address"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </PageLayout>
  );
}
