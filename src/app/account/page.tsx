"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Heart,
  Lock,
  MapPin,
  Package,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { toast } from "react-toastify";
import PageLayout from "@/components/layout/PageLayout";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import {
  useAddresses,
  useNotifiedProducts,
  useWishlist,
  ACCOUNT_QUERY_KEYS,
} from "@/hooks/use-account";
import { useAuth } from "@/hooks/use-auth";
import { useMyOrders } from "@/hooks/use-orders";
import { setCurrentUserProfile, USER_ROUTES } from "@/lib/auth/auth-store";
import { extractApiError } from "@/lib/axios";
import { accountService } from "@/services/account.service";
import { authService } from "@/services/auth.service";
import type { DeliveryArea, Gender } from "@/types/ecommerce";
import { formatPrice } from "@/lib/utils";

type TabId = "profile" | "products" | "notified" | "wishlists" | "address";

const SIDEBAR: { id: TabId; label: string; icon: typeof Package }[] = [
  { id: "products", label: "My Orders", icon: Package },
  { id: "notified", label: "Notified Products", icon: Bell },
  { id: "wishlists", label: "Wishlists", icon: Heart },
  { id: "address", label: "Delivery Address", icon: MapPin },
];

const emptyAddressForm = {
  customerName: "",
  phone: "",
  streetAddress: "",
  city: "",
  deliveryArea: "INSIDE_DHAKA" as DeliveryArea,
  isDefault: true,
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

export default function AccountPage() {
  const queryClient = useQueryClient();
  const { ready: authReady, user } = useAuth();
  const { data: orders = [], isLoading: ordersLoading } = useMyOrders();
  const { data: wishlist = [], isLoading: wishlistLoading } = useWishlist();
  const { data: notified = [], isLoading: notifiedLoading } = useNotifiedProducts();
  const { data: addresses = [], isLoading: addressesLoading } = useAddresses();

  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [genderDraft, setGenderDraft] = useState<string | null>(null);
  const [dobDraft, setDobDraft] = useState<string | null>(null);
  const [emailDraft, setEmailDraft] = useState<string | null>(null);
  const [phoneDraft, setPhoneDraft] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewDraft, setAvatarPreviewDraft] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const name = nameDraft ?? user?.name ?? "";
  const gender = genderDraft ?? user?.gender ?? "";
  const dob = dobDraft ?? (user?.dateOfBirth ? user.dateOfBirth.slice(0, 10) : "");
  const email = emailDraft ?? user?.email ?? "";
  const phone = phoneDraft ?? user?.phone ?? "";
  const avatarPreview = avatarPreviewDraft ?? user?.avatar ?? null;

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [addressForm, setAddressForm] = useState(emptyAddressForm);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreviewDraft(previewUrl);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Full name is required.");
      return;
    }

    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      if (phone.trim()) formData.append("phone", phone.trim());
      if (email.trim()) formData.append("email", email.trim());
      if (gender) formData.append("gender", gender as Gender);
      if (dob) formData.append("dateOfBirth", dob);
      if (avatarFile) formData.append("avatar", avatarFile);

      const updated = await authService.updateProfile(formData);
      setCurrentUserProfile(updated);
      setAvatarFile(null);
      setAvatarPreviewDraft(null);
      setNameDraft(null);
      setGenderDraft(null);
      setDobDraft(null);
      setEmailDraft(null);
      setPhoneDraft(null);
      toast.success("Profile information updated successfully!");
    } catch (error) {
      toast.error(extractApiError(error, "Could not update profile."));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }
    setChangingPassword(true);
    try {
      const msg = await authService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      toast.success(msg);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(extractApiError(error, "Could not change password."));
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !addressForm.customerName.trim() ||
      !addressForm.phone.trim() ||
      !addressForm.streetAddress.trim() ||
      !addressForm.city.trim()
    ) {
      toast.error("Customer name, phone, street address and city are required.");
      return;
    }

    setSavingAddress(true);
    try {
      await accountService.addAddress({
        customerName: addressForm.customerName.trim(),
        phone: addressForm.phone.trim(),
        streetAddress: addressForm.streetAddress.trim(),
        city: addressForm.city.trim(),
        deliveryArea: addressForm.deliveryArea,
        isDefault: addressForm.isDefault || addresses.length === 0,
      });
      await queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.addresses });
      setAddressModalOpen(false);
      setAddressForm(emptyAddressForm);
      toast.success("Address added successfully.");
    } catch (error) {
      toast.error(extractApiError(error, "Could not add address."));
    } finally {
      setSavingAddress(false);
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await accountService.setDefaultAddress(id);
      await queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.addresses });
      toast.success("Default address updated.");
    } catch (error) {
      toast.error(extractApiError(error, "Could not update default address."));
    }
  };

  const handleRemoveWishlist = async (productId: string) => {
    try {
      const msg = await accountService.removeFromWishlist(productId);
      await queryClient.invalidateQueries({ queryKey: ACCOUNT_QUERY_KEYS.wishlist });
      toast.success(msg);
    } catch (error) {
      toast.error(extractApiError(error, "Could not remove from wishlist."));
    }
  };

  const panelTitle =
    activeTab === "profile"
      ? "Profile"
      : SIDEBAR.find((item) => item.id === activeTab)?.label ?? "Account";

  if (!authReady) {
    return (
      <PageLayout className="bg-[#F8FAFC]">
        <main className="container mx-auto flex-1 px-4 py-16">
          <LoadingSpinner size="lg" label="Loading account..." />
        </main>
      </PageLayout>
    );
  }

  if (!user) {
    return (
      <PageLayout className="bg-[#F8FAFC]">
        <main className="container mx-auto flex-1 px-4 py-16 text-center">
          <div className="mx-auto max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-8 shadow-xs space-y-4">
            <h1 className="text-xl font-bold text-[#1F2937]">Sign in required</h1>
            <p className="text-sm text-zinc-500">
              Sign in with your Kinbo customer account to manage your profile, addresses, wishlist, and orders.
            </p>
            <Link
              href={USER_ROUTES.login}
              className="inline-flex rounded-xl bg-[#082F6B] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#062452]"
            >
              Sign In
            </Link>
          </div>
        </main>
      </PageLayout>
    );
  }

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

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="space-y-2.5 lg:col-span-4">
            <div
              role="button"
              tabIndex={0}
              onClick={() => setActiveTab("profile")}
              onKeyDown={(e) => {
                if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  setActiveTab("profile");
                }
              }}
              className={`flex w-full cursor-pointer items-center gap-3.5 rounded-2xl border bg-white p-4 text-left shadow-2xs transition ${
                activeTab === "profile"
                  ? "border-[#082F6B] bg-[#F3F7FC]/70"
                  : "border-[#E5E7EB] hover:border-zinc-300"
              }`}
            >
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-zinc-200 bg-zinc-50">
                {avatarPreview ? (
                  <img src={avatarPreview} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-8 w-8 text-zinc-700 stroke-[1.7]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-bold text-[#1F2937] sm:text-base">
                  {user.name}
                </h3>
                <p className="truncate text-xs text-zinc-500">{user.phone || user.email}</p>
                {!user.firstOrderFreeDeliveryUsed && (
                  <span className="mt-1 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    Free first-order delivery available
                  </span>
                )}
                <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                  <LanguageSwitcher />
                </div>
              </div>
            </div>

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
              <div className="space-y-10">
                <div>
                  <div className="mb-8 flex justify-center">
                    <div className="relative">
                      <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-zinc-300 bg-zinc-50 sm:h-32 sm:w-32">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt={name} className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-16 w-16 text-zinc-700 stroke-[1.5] sm:h-20 sm:w-20" />
                        )}
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
                          accept="image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                      </label>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-5 sm:space-y-6">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-[#1F2937] sm:text-sm">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setNameDraft(e.target.value)}
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
                            onChange={(e) => setGenderDraft(e.target.value)}
                            className="w-full cursor-pointer appearance-none rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 pr-10 text-sm text-[#1F2937] transition focus:border-[#082F6B] focus:outline-none focus:ring-1 focus:ring-[#082F6B]/20 sm:py-3"
                          >
                            <option value="">Select an option</option>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
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
                          onChange={(e) => setDobDraft(e.target.value)}
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
                            onChange={(e) => setEmailDraft(e.target.value)}
                            className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 pr-10 text-sm text-[#1F2937] focus:border-[#082F6B] focus:outline-none sm:py-3"
                          />
                          <CheckCircle2 className="absolute right-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 fill-emerald-500 text-white" />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-[#1F2937] sm:text-sm">
                          Mobile No
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhoneDraft(e.target.value)}
                          placeholder="+8801XXXXXXXXX"
                          className="w-full rounded-lg border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm text-[#1F2937] focus:border-[#082F6B] focus:outline-none sm:py-3"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button type="submit" isLoading={isUpdating} className="w-full min-w-[200px] sm:w-auto">
                        {isUpdating ? "Updating..." : "Update Profile"}
                      </Button>
                    </div>
                  </form>
                </div>

                <div className="border-t border-[#E5E7EB] pt-6">
                  <div className="mb-4 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-[#082F6B]" />
                    <h3 className="text-base font-bold text-[#1F2937]">Change Password</h3>
                  </div>
                  <form onSubmit={handleChangePassword} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Input
                      label="Current Password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                    <Input
                      label="New Password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <Input
                      label="Confirm Password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <div className="sm:col-span-3 flex justify-end">
                      <Button type="submit" variant="outline" isLoading={changingPassword}>
                        Change Password
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === "products" && (
              <>
                {ordersLoading ? (
                  <LoadingSpinner size="sm" label="Loading orders..." />
                ) : orders.length === 0 ? (
                  <ProductListEmpty
                    title="No orders yet"
                    hint="Your order history will show up here once you place an order."
                    href="/products"
                    cta="Browse products"
                  />
                ) : (
                  <ul className="divide-y divide-[#E5E7EB]">
                    {orders.map((order) => (
                      <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                        <div>
                          <Link
                            href={`/orders/${encodeURIComponent(order.id)}`}
                            className="text-sm font-bold text-[#082F6B] hover:underline"
                          >
                            {order.orderNumber || order.id}
                          </Link>
                          <p className="mt-0.5 text-xs text-zinc-500">
                            {new Date(order.createdAt).toLocaleDateString()} ·{" "}
                            {order.itemsCount ?? 0} item(s) · {order.status}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-[#1F2937]">
                            {formatPrice(order.finalOrderAmount)}
                          </p>
                          <Link
                            href={`/orders/${encodeURIComponent(order.id)}`}
                            className="text-xs font-semibold text-[#FF6B00] hover:underline"
                          >
                            Track order
                          </Link>
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
                {notifiedLoading ? (
                  <LoadingSpinner size="sm" label="Loading stock alerts..." />
                ) : notified.length === 0 ? (
                  <ProductListEmpty
                    title="No stock alerts"
                    hint="When a product is out of stock, you can request a restock alert from the product page."
                    href="/products"
                    cta="Browse products"
                  />
                ) : (
                  <ul className="divide-y divide-[#E5E7EB]">
                    {notified.map((item) => (
                      <li key={item.id} className="flex items-center gap-3 py-3">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#F3F7FC]">
                          <img
                            src={item.product?.image || "/images/logo.png"}
                            alt={item.product?.name || ""}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/products/${item.productId}`}
                            className="line-clamp-1 text-sm font-semibold text-[#1F2937] hover:text-[#082F6B]"
                          >
                            {item.product?.name || item.productId}
                          </Link>
                          <p className="mt-0.5 text-xs text-zinc-500">
                            Status: {item.status}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            {activeTab === "wishlists" && (
              <>
                {wishlistLoading ? (
                  <LoadingSpinner size="sm" label="Loading wishlist..." />
                ) : wishlist.length === 0 ? (
                  <ProductListEmpty
                    title="Wishlist is empty"
                    hint="Save products you like and find them here later."
                    href="/products"
                    cta="Find products"
                  />
                ) : (
                  <ul className="divide-y divide-[#E5E7EB]">
                    {wishlist.map((item) => (
                      <li key={item.id} className="flex items-center gap-3 py-3">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#F3F7FC]">
                          <img
                            src={item.product.image || "/images/logo.png"}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/products/${item.productId}`}
                            className="line-clamp-1 text-sm font-semibold text-[#1F2937] hover:text-[#082F6B]"
                          >
                            {item.product.name}
                          </Link>
                          <p className="mt-0.5 text-xs font-semibold text-[#082F6B]">
                            {formatPrice(item.product.finalPrice ?? item.product.price)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveWishlist(item.productId)}
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
                    onClick={() => {
                      setAddressForm({
                        ...emptyAddressForm,
                        customerName: user.name || "",
                        phone: user.phone || "",
                        isDefault: addresses.length === 0,
                      });
                      setAddressModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF6B00] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#E85D00] cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Add new address
                  </button>
                </div>

                {addressesLoading ? (
                  <LoadingSpinner size="sm" label="Loading addresses..." />
                ) : addresses.length === 0 ? (
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
                              <p className="text-sm font-bold text-[#1F2937]">
                                {address.customerName}
                              </p>
                              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600">
                                {address.deliveryArea === "INSIDE_DHAKA"
                                  ? "Inside Dhaka (৳70)"
                                  : "Outside Dhaka (৳120)"}
                              </span>
                              {address.isDefault && (
                                <span className="rounded-full bg-[#082F6B] px-2 py-0.5 text-[10px] font-bold text-white">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-zinc-500">{address.phone}</p>
                            <p className="mt-1 text-xs leading-relaxed text-zinc-600">
                              {address.streetAddress}, {address.city}
                            </p>
                          </div>
                          {!address.isDefault && (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultAddress(address.id)}
                              className="rounded-lg border border-[#E5E7EB] px-2.5 py-1 text-[11px] font-semibold text-[#082F6B] hover:bg-white cursor-pointer"
                            >
                              Set default
                            </button>
                          )}
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
              <h3 className="text-base font-bold text-[#1F2937]">Add new address</h3>
              <p className="mt-0.5 text-xs text-zinc-500">
                Saved addresses can be reused at checkout.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="Customer Name"
                value={addressForm.customerName}
                onChange={(e) =>
                  setAddressForm((f) => ({ ...f, customerName: e.target.value }))
                }
                required
              />
              <Input
                label="Phone"
                value={addressForm.phone}
                onChange={(e) =>
                  setAddressForm((f) => ({ ...f, phone: e.target.value }))
                }
                placeholder="+8801XXXXXXXXX"
                required
              />
              <Input
                label="City"
                value={addressForm.city}
                onChange={(e) =>
                  setAddressForm((f) => ({ ...f, city: e.target.value }))
                }
                required
              />
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#1F2937]">
                  Delivery Area
                </label>
                <select
                  value={addressForm.deliveryArea}
                  onChange={(e) =>
                    setAddressForm((f) => ({
                      ...f,
                      deliveryArea: e.target.value as DeliveryArea,
                    }))
                  }
                  className="w-full cursor-pointer rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#082F6B]"
                >
                  <option value="INSIDE_DHAKA">Inside Dhaka (৳70)</option>
                  <option value="OUTSIDE_DHAKA">Outside Dhaka (৳120)</option>
                </select>
              </div>
            </div>
            <Input
              label="Street Address"
              value={addressForm.streetAddress}
              onChange={(e) =>
                setAddressForm((f) => ({ ...f, streetAddress: e.target.value }))
              }
              placeholder="House, Road, Block, Area"
              required
            />
            <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-600">
              <input
                type="checkbox"
                checked={addressForm.isDefault}
                onChange={(e) =>
                  setAddressForm((f) => ({ ...f, isDefault: e.target.checked }))
                }
                className="h-4 w-4 rounded accent-[#082F6B]"
              />
              Set as default delivery address
            </label>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setAddressModalOpen(false)}
                className="rounded-xl border border-[#E5E7EB] px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-[#F8FAFC] cursor-pointer"
              >
                Cancel
              </button>
              <Button type="submit" size="sm" isLoading={savingAddress}>
                Save address
              </Button>
            </div>
          </form>
        </div>
      )}
    </PageLayout>
  );
}
