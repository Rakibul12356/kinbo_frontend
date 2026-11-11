"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import { placeOrder } from "@/lib/orders/order-store";
import { Truck, ShieldCheck, ArrowLeft } from "lucide-react";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { toast } from "react-toastify";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    subtotal,
    discount,
    shipping,
    total,
    appliedCoupon,
    clearCart,
    ready,
  } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const updateField = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setIsSubmitting(true);

    try {
      const order = placeOrder({
        shipping: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          postalCode: form.postalCode.trim(),
        },
        items: cart.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          image: item.product.images[0] ?? "",
          price: item.product.price,
          quantity: item.quantity,
        })),
        subtotal,
        discount,
        shippingFee: shipping,
        total,
        couponCode: appliedCoupon?.code ?? null,
      });

      clearCart();
      toast.success(`Order ${order.id} confirmed`);
      router.push(`/checkout/success?orderId=${encodeURIComponent(order.id)}`);
    } catch {
      toast.error("Could not place order. Please try again.");
      setIsSubmitting(false);
    }
  };

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

        <h1 className="text-3xl font-extrabold text-[#1F2937] mb-8">Confirm Order</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-base font-bold text-[#1F2937] border-b border-[#E5E7EB] pb-3">
                <Truck className="w-5 h-5 text-[#082F6B]" />
                <span>Shipping Information</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  placeholder="e.g. John Doe"
                  required
                  value={form.fullName}
                  onChange={updateField("fullName")}
                />
                <Input
                  label="Phone Number"
                  placeholder="+880 1XXXXXXXXX"
                  required
                  value={form.phone}
                  onChange={updateField("phone")}
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="john@example.com"
                    required
                    value={form.email}
                    onChange={updateField("email")}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="Street Address"
                    placeholder="Apartment, suite, street"
                    required
                    value={form.address}
                    onChange={updateField("address")}
                  />
                </div>
                <Input
                  label="City"
                  placeholder="Dhaka"
                  required
                  value={form.city}
                  onChange={updateField("city")}
                />
                <Input
                  label="Postal Code"
                  placeholder="1212"
                  required
                  value={form.postalCode}
                  onChange={updateField("postalCode")}
                />
              </div>

              <p className="text-xs text-zinc-500 pt-1">
                No online payment here — confirm with your details and we&apos;ll process the order.
                Admin gets a notification instantly.
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
                      src={item.product.images[0]}
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
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#1F2937]">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Coupon{appliedCoupon ? ` (${appliedCoupon.code})` : ""}</span>
                  <span className="font-semibold">-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-[#1F2937] pt-2 border-t border-[#E5E7EB]">
                <span>Total Due</span>
                <span className="text-[#082F6B]">{formatPrice(total)}</span>
              </div>
            </div>

            <Button
              type="submit"
              variant="secondary"
              size="lg"
              isLoading={isSubmitting}
              className="w-full mt-4 font-bold"
            >
              Confirm Order ({formatPrice(total)})
            </Button>

            <div className="flex items-center gap-2 text-xs text-zinc-400 justify-center pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Order goes to admin dashboard after confirm</span>
            </div>
          </div>
        </form>
      </main>
    </PageLayout>
  );
}
