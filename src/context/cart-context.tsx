"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { CartItem, Product } from "@/types/ecommerce";
import {
  FREE_DELIVERY_THRESHOLD,
  applyCouponCode,
  calculateCouponDiscount,
  findCoupon,
  getCartOffers,
  type CartOffer,
  type CouponDefinition,
} from "@/lib/coupons";

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  isInCart: (productId: string) => boolean;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  appliedCoupon: CouponDefinition | null;
  applyCoupon: (code: string) => { ok: true } | { ok: false; error: string };
  removeCoupon: () => void;
  offers: CartOffer[];
  /** False until localStorage cart has been loaded on the client. */
  ready: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const COUPON_STORAGE_KEY = "kinbo_cart_coupon";

function CartToast({
  productName,
  message,
}: {
  productName: string;
  message: string;
}) {
  return (
    <div className="min-w-0 w-full">
      <p className="text-sm font-bold text-[#082F6B]">{message}</p>
      <p className="text-xs text-zinc-500 truncate">{productName}</p>
    </div>
  );
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Always start empty so SSR HTML matches the first client render.
  const [cart, setCart] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("shopping_cart");
      if (stored) setCart(JSON.parse(stored) as CartItem[]);
      setCouponCode(localStorage.getItem(COUPON_STORAGE_KEY));
    } catch {
      // Ignore corrupt storage
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem("shopping_cart", JSON.stringify(cart));
    } catch {
      // Ignore localStorage save error
    }
  }, [cart, ready]);

  useEffect(() => {
    if (!ready) return;
    try {
      if (couponCode) localStorage.setItem(COUPON_STORAGE_KEY, couponCode);
      else localStorage.removeItem(COUPON_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, [couponCode, ready]);

  const isInCart = (productId: string) =>
    cart.some((item) => item.product.id === productId);

  const addToCart = (product: Product, quantity = 1) => {
    const alreadyInCart = isInCart(product.id);
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    const toastId = `cart-${product.id}`;
    const content = (
      <CartToast
        productName={product.name}
        message={alreadyInCart ? "Quantity updated in cart" : "Added to cart"}
      />
    );
    if (toast.isActive(toastId)) {
      toast.update(toastId, { render: content, autoClose: 2500 });
    } else {
      toast.success(content, { toastId });
    }
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setCouponCode(null);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const appliedCoupon = useMemo(() => {
    if (!couponCode) return null;
    const coupon = findCoupon(couponCode);
    if (!coupon) return null;
    if (coupon.minSubtotal && subtotal < coupon.minSubtotal) return null;
    return coupon;
  }, [couponCode, subtotal]);

  const discount = appliedCoupon
    ? calculateCouponDiscount(appliedCoupon, subtotal)
    : 0;

  const shipping =
    subtotal === 0 || subtotal - discount >= FREE_DELIVERY_THRESHOLD ? 0 : 60;

  const total = Math.max(0, subtotal - discount + shipping);
  const offers = getCartOffers(subtotal);

  const applyCoupon = (code: string) => {
    const result = applyCouponCode(code, subtotal);
    if (!result.ok) return result;
    setCouponCode(result.coupon.code);
    toast.success(`${result.coupon.code} applied — ${result.coupon.label}`);
    return { ok: true as const };
  };

  const removeCoupon = () => {
    setCouponCode(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        isInCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        discount,
        shipping,
        total,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        offers,
        ready,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
