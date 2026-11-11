"use client";

import React, { useEffect, useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { X, ShoppingCart, ArrowRight, Tag } from "lucide-react";
import Link from "next/link";
import CartItemRow from "./CartItemRow";
import { formatPrice } from "@/lib/utils";

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    discount,
    shipping,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    if (isCartOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isCartOpen]);

  useEffect(() => {
    if (appliedCoupon) {
      setCouponInput(appliedCoupon.code);
      setCouponError(null);
    }
  }, [appliedCoupon]);

  if (!isCartOpen) return null;

  const handleApplyCoupon = () => {
    const result = applyCoupon(couponInput);
    if (!result.ok) {
      setCouponError(result.error);
      return;
    }
    setCouponError(null);
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#082F6B]" />
              <h2 className="text-lg font-bold text-[#1F2937]">
                Shopping Cart ({cart.length})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-zinc-500 hover:text-zinc-800 rounded-full hover:bg-zinc-100 transition cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 rounded-full bg-[#082F6B]/10 flex items-center justify-center mb-4">
                  <ShoppingCart className="w-10 h-10 text-[#082F6B]" />
                </div>
                <h3 className="text-lg font-semibold text-[#1F2937] mb-1">
                  Your cart is empty
                </h3>
                <p className="text-sm text-zinc-500 max-w-xs mb-6">
                  Explore our curated products and find something you love.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-[#082F6B] text-white text-sm font-semibold hover:bg-[#062452] transition cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <CartItemRow
                  key={item.product.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-5 border-t border-[#E5E7EB] bg-[#F3F7FC]/50 space-y-3">
              {/* Coupon */}
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F2937]">
                  <Tag className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>Have a coupon?</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value.toUpperCase());
                      setCouponError(null);
                    }}
                    placeholder="Enter code"
                    className="min-w-0 flex-1 rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-2 text-xs font-semibold text-[#1F2937] uppercase tracking-wide outline-none focus:border-[#082F6B]"
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={() => {
                        removeCoupon();
                        setCouponInput("");
                        setCouponError(null);
                      }}
                      className="shrink-0 rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="shrink-0 rounded-lg bg-[#082F6B] px-3 py-2 text-xs font-bold text-white hover:bg-[#062452] cursor-pointer"
                    >
                      Apply
                    </button>
                  )}
                </div>
                {couponError && (
                  <p className="text-[11px] font-medium text-rose-600">{couponError}</p>
                )}
                {appliedCoupon && (
                  <p className="text-[11px] font-medium text-emerald-700">
                    {appliedCoupon.code} applied — {appliedCoupon.label}
                  </p>
                )}
                <p className="text-[10px] text-zinc-400">
                  Try KINBO10, SAVE100 or WELCOME15
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#1F2937]">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Coupon discount</span>
                    <span className="font-semibold">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#1F2937] pt-2 border-t border-[#E5E7EB]">
                  <span>Total</span>
                  <span className="text-[#082F6B]">{formatPrice(total)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full py-3.5 px-4 rounded-xl bg-[#FF6B00] hover:bg-[#E85D00] text-white font-semibold text-sm shadow-md flex items-center justify-center gap-2 transition"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
