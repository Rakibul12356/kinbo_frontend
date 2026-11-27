"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PageLayout from "@/components/layout/PageLayout";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useAddresses } from "@/hooks/use-account";
import { ORDER_QUERY_KEYS } from "@/hooks/use-orders";
import { NOTIFICATION_QUERY_KEY } from "@/hooks/use-notifications";
import { refreshCurrentUser, USER_ROUTES } from "@/lib/auth/auth-store";
import { extractApiError } from "@/lib/axios";
import { orderService } from "@/services/order.service";
import type { DeliveryArea, SavedAddress } from "@/types/ecommerce";
import { formatPrice } from "@/lib/utils";
import { Truck, ShieldCheck, ArrowLeft, MapPin } from "lucide-react";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { toast } from "react-toastify";

export default function CheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { ready: authReady, user } = useAuth();
  const { cart, subtotal, clearCart, ready: cartReady } = useCart();
  const { data: addresses = [] } = useAddresses();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [formDraft, setFormDraft] = useState<
    Partial<{
      customerName: string;
      phone: string;
      streetAddress: string;
      city: string;
      deliveryArea: DeliveryArea;
    }>
  >({});

  const activeAddress = useMemo(() => {
    if (selectedAddressId) {
      return addresses.find((a) => a.id === selectedAddressId) ?? null;
    }
    return addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;
  }, [addresses, selectedAddressId]);

  const form = {
    customerName: formDraft.customerName ?? activeAddress?.customerName ?? user?.name ?? "",
    phone: formDraft.phone ?? activeAddress?.phone ?? user?.phone ?? "",
    streetAddress: formDraft.streetAddress ?? activeAddress?.streetAddress ?? "",
    city: formDraft.city ?? activeAddress?.city ?? "Dhaka",
    deliveryArea: formDraft.deliveryArea ?? activeAddress?.deliveryArea ?? ("INSIDE_DHAKA" as DeliveryArea),
  };

  const itemsPayload = useMemo(
    () =>
      cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    [cart]
  );

  const { data: summary = null, isLoading: summaryLoading } = useQuery({
    queryKey: ["checkout", "summary", form.deliveryArea, itemsPayload],
    queryFn: () =>
      orderService.calculateSummary({
        deliveryArea: form.deliveryArea,
        items: itemsPayload,
      }),
    enabled: Boolean(user) && itemsPayload.length > 0,
  });

  const selectAddress = (address: SavedAddress) => {
    setSelectedAddressId(address.id);
    setFormDraft({
      customerName: address.customerName,
      phone: address.phone,
      streetAddress: address.streetAddress,
      city: address.city,
      deliveryArea: address.deliveryArea,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || !user) return;

    const customerName = form.customerName.trim();
    const phone = form.phone.trim();
    const streetAddress = form.streetAddress.trim();
    const city = form.city.trim();

    if (!customerName || !phone || !streetAddress || !city) {
      toast.error("Please fill all shipping fields.");
      return;
    }

    const matchesSelectedAddress = Boolean(
      activeAddress &&
        customerName === activeAddress.customerName.trim() &&
        phone === activeAddress.phone.trim() &&
        streetAddress === activeAddress.streetAddress.trim() &&
        city === activeAddress.city.trim() &&
        form.deliveryArea === activeAddress.deliveryArea
    );

    setIsSubmitting(true);
    try {
      const order = await orderService.placeOrder({
        ...(matchesSelectedAddress && activeAddress ? { addressId: activeAddress.id } : {}),
        customerName,
        phone,
        streetAddress,
        city,
        deliveryArea: form.deliveryArea,
        items: itemsPayload,
      });

      clearCart();
      await Promise.all([
        refreshCurrentUser(),
        queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEYS.myOrders }),
        queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEY }),
      ]);
      toast.success(`Order ${order.orderNumber} placed!`);
      router.push(
        `/checkout/success?orderId=${encodeURIComponent(order.orderNumber || order.id)}`
      );
    } catch (error) {
      toast.error(extractApiError(error, "Could not place order. Please try again."));
      setIsSubmitting(false);
    }
  };

  if (!authReady || !cartReady) {
    return (
      <PageLayout>
        <main className="flex-1 container mx-auto px-4 sm:px-6 py-16 text-center">
          <p className="text-sm text-zinc-500">Loading checkout…</p>
        </main>
      </PageLayout>
    );
  }

  if (!user) {
    return (
      <PageLayout>
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-[#1F2937]">Sign in to checkout</h2>
            <p className="text-sm text-zinc-500">
              Please sign in to your customer account to place a Cash on Delivery order.
            </p>
            <Link
              href={USER_ROUTES.login}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#082F6B] text-white text-sm font-semibold hover:bg-[#062452]"
            >
              Sign In
            </Link>
          </div>
        </main>
      </PageLayout>
    );
  }

  if (cart.length === 0) {
    return (
      <PageLayout>
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-[#1F2937]">Your cart is empty</h2>
            <p className="text-sm text-zinc-500">
              Please add items to your cart before proceeding to checkout.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#082F6B] text-white text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Shop</span>
            </Link>
          </div>
        </main>
      </PageLayout>
    );
  }

  const fallbackDelivery = form.deliveryArea === "INSIDE_DHAKA" ? 70 : 120;
  const displaySubtotal = summary?.subtotal ?? subtotal;
  const displayDelivery = summary?.finalDeliveryCharge ?? fallbackDelivery;
  const displayTotal = summary?.finalOrderAmount ?? displaySubtotal + displayDelivery;

  return (
    <PageLayout>
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
          <Link href="/cart" className="hover:text-[#082F6B] flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cart</span>
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#1F2937]">Checkout</span>
        </div>

        <h1 className="text-3xl font-extrabold text-[#1F2937] mb-8">Confirm Order (COD)</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {addresses.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[#1F2937]">
                  <MapPin className="w-4 h-4 text-[#082F6B]" />
                  <span>Saved Delivery Addresses</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addresses.map((addr) => {
                    const isSelected = activeAddress?.id === addr.id;
                    return (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => selectAddress(addr)}
                        className={`text-left rounded-xl border p-3 transition cursor-pointer ${
                          isSelected
                            ? "border-[#082F6B] bg-[#F3F7FC]"
                            : "border-[#E5E7EB] hover:border-zinc-300"
                        }`}
                      >
                        <p className="text-xs font-bold text-[#1F2937]">{addr.customerName}</p>
                        <p className="text-[11px] text-zinc-500">{addr.phone}</p>
                        <p className="mt-1 text-xs text-zinc-600 line-clamp-1">
                          {addr.streetAddress}, {addr.city}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-base font-bold text-[#1F2937] border-b border-[#E5E7EB] pb-3">
                <Truck className="w-5 h-5 text-[#082F6B]" />
                <span>Shipping Information</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Customer Name"
                  placeholder="e.g. Rakibul Hasan"
                  required
                  value={form.customerName}
                  onChange={(e) =>
                    setFormDraft((prev) => ({ ...prev, customerName: e.target.value }))
                  }
                />
                <Input
                  label="Phone Number"
                  placeholder="+8801XXXXXXXXX"
                  required
                  value={form.phone}
                  onChange={(e) =>
                    setFormDraft((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Street Address"
                    placeholder="House, Road, Block, Area"
                    required
                    value={form.streetAddress}
                    onChange={(e) =>
                      setFormDraft((prev) => ({ ...prev, streetAddress: e.target.value }))
                    }
                  />
                </div>
                <Input
                  label="City"
                  placeholder="Dhaka"
                  required
                  value={form.city}
                  onChange={(e) =>
                    setFormDraft((prev) => ({ ...prev, city: e.target.value }))
                  }
                />
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[#1F2937]">
                    Delivery Area
                  </label>
                  <select
                    value={form.deliveryArea}
                    onChange={(e) =>
                      setFormDraft((prev) => ({
                        ...prev,
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

              <p className="text-xs text-zinc-500 pt-1">
                100% Cash on Delivery (COD). Pay when your order arrives at your doorstep.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs h-fit space-y-4">
            <h2 className="text-lg font-bold text-[#1F2937]">Order Summary</h2>

            <div className="divide-y divide-[#E5E7EB] max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="py-2.5 flex justify-between items-center text-xs"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={item.product.images[0] || "/images/logo.png"}
                      alt=""
                      className="w-10 h-10 object-cover rounded-lg bg-zinc-100"
                    />
                    <div>
                      <p className="font-semibold text-[#1F2937] line-clamp-1">
                        {item.product.name}
                      </p>
                      <p className="text-zinc-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-[#082F6B]">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-xs border-t border-[#E5E7EB] pt-4 text-zinc-600">
              {summary && summary.totalProductPrice != null && (
                <div className="flex justify-between">
                  <span>Total Product Price</span>
                  <span>{formatPrice(summary.totalProductPrice)}</span>
                </div>
              )}
              {summary && Number(summary.discountAmount) > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Product Discount</span>
                  <span className="font-semibold">
                    -{formatPrice(summary.discountAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#1F2937]">
                  {formatPrice(displaySubtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span>
                  {summaryLoading
                    ? "Calculating…"
                    : displayDelivery === 0
                      ? "Free"
                      : formatPrice(displayDelivery)}
                </span>
              </div>
              {summary?.isFirstOrderFreeDelivery && summary.deliveryDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>First Order Free Delivery</span>
                  <span>-{formatPrice(summary.deliveryDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-[#1F2937] pt-2 border-t border-[#E5E7EB]">
                <span>Total Due (COD)</span>
                <span className="text-[#082F6B]">{formatPrice(displayTotal)}</span>
              </div>
            </div>

            <Button
              type="submit"
              variant="secondary"
              size="lg"
              isLoading={isSubmitting}
              className="w-full mt-4 font-bold"
            >
              Confirm COD Order ({formatPrice(displayTotal)})
            </Button>

            <div className="flex items-center gap-2 text-xs text-zinc-400 justify-center pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Cash On Delivery</span>
            </div>
          </div>
        </form>
      </main>
    </PageLayout>
  );
}
