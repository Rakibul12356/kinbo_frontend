"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CartItem, Product } from "@/types/ecommerce";
import { useAuth } from "@/hooks/use-auth";
import { cartService } from "@/services/cart.service";
import { extractApiError, resolveAssetUrl } from "@/lib/axios";

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  isInCart: (productId: string) => boolean;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
  totalItems: number;
  subtotal: number;
  /** False until initial cart state has been loaded on the client. */
  ready: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const GUEST_CART_KEY = "shopping_cart";

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

function normalizeCartItemImages(items: CartItem[]): CartItem[] {
  return items.map((item) => ({
    ...item,
    product: {
      ...item.product,
      images: (item.product.images ?? []).map((src) => resolveAssetUrl(src)).filter(Boolean),
    },
  }));
}

function readGuestCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? normalizeCartItemImages(parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { ready: authReady, user, admin } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const syncFromServer = useCallback(async () => {
    try {
      const serverCart = await cartService.getCart();
      setCart((prev) => {
        const next = serverCart.items;
        // Preserve known-good https images when API returns empty/broken paths.
        return next.map((item) => {
          const apiImg = item.product.images?.[0];
          const prevImg = prev.find((p) => p.product.id === item.product.id)?.product
            .images?.[0];
          const apiOk = Boolean(apiImg && /^https?:\/\//i.test(apiImg));
          if (apiOk || !prevImg) return item;
          return {
            ...item,
            product: { ...item.product, images: [prevImg] },
          };
        });
      });
    } catch {
      // Keep current state if transient network error
    }
  }, []);

  useEffect(() => {
    if (!authReady) return;

    let cancelled = false;

    async function initCart() {
      if (user) {
        // Merge any guest cart items into backend cart upon login
        const guestItems = readGuestCart();
        if (guestItems.length > 0) {
          localStorage.removeItem(GUEST_CART_KEY);
          await Promise.allSettled(
            guestItems.map((item) => cartService.addItem(item.product.id, item.quantity))
          );
        }
        try {
          const serverCart = await cartService.getCart();
          if (!cancelled) setCart(serverCart.items);
        } catch {
          if (!cancelled) setCart([]);
        }
      } else {
        if (!cancelled) setCart(readGuestCart());
      }
      if (!cancelled) setReady(true);
    }

    void initCart();

    return () => {
      cancelled = true;
    };
  }, [authReady, user]);

  useEffect(() => {
    if (!ready || user) return;
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    } catch {
      // Ignore localStorage quota error
    }
  }, [cart, ready, user]);

  const isInCart = (productId: string) =>
    cart.some((item) => item.product.id === productId);

  const showCartToast = (productName: string, message: string, productId: string) => {
    const toastId = `cart-${productId}`;
    const content = <CartToast productName={productName} message={message} />;
    if (toast.isActive(toastId)) {
      toast.update(toastId, { render: content, autoClose: 2500 });
    } else {
      toast.success(content, { toastId });
    }
  };

  const addToCart = (product: Product, quantity = 1) => {
    if (product.stock <= 0 || product.isOutOfStockManual) {
      toast.error("This product is currently out of stock.");
      return;
    }

    if (!user) {
      if (!authReady) return;
      if (admin) {
        toast.info("Please sign in with a customer account to add items to cart.");
        return;
      }
      const pathname = window.location.pathname || "/";
      const params = new URLSearchParams(window.location.search);
      params.set("auth", "login");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
      return;
    }

    const alreadyInCart = isInCart(product.id);

    void (async () => {
      try {
        await cartService.addItem(product.id, quantity);
        await syncFromServer();
        // Cart API image field is often missing or a dead /uploads path — keep card image.
        const preview = product.images?.[0];
        if (preview) {
          setCart((prev) =>
            prev.map((item) =>
              item.product.id === product.id
                ? {
                    ...item,
                    product: {
                      ...item.product,
                      images: [preview],
                    },
                  }
                : item
            )
          );
        }
        showCartToast(
          product.name,
          alreadyInCart ? "Quantity updated in cart" : "Added to cart",
          product.id
        );
      } catch (error) {
        toast.error(extractApiError(error, "Could not add item to cart."));
      }
    })();
  };

  const removeFromCart = (productId: string) => {
    if (user) {
      const target = cart.find((item) => item.product.id === productId);
      if (!target?.itemId) return;
      void (async () => {
        try {
          await cartService.removeItem(target.itemId!);
          await syncFromServer();
        } catch (error) {
          toast.error(extractApiError(error, "Could not remove item."));
        }
      })();
      return;
    }

    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (user) {
      const target = cart.find((item) => item.product.id === productId);
      if (!target?.itemId) return;
      void (async () => {
        try {
          await cartService.updateItemQuantity(target.itemId!, quantity);
          await syncFromServer();
        } catch (error) {
          toast.error(extractApiError(error, "Could not update quantity."));
        }
      })();
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    if (user) {
      setCart([]);
      void cartService.clearCart().catch(() => {
        void syncFromServer();
      });
      return;
    }
    setCart([]);
    try {
      localStorage.removeItem(GUEST_CART_KEY);
    } catch {
      // ignore
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        isInCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart: syncFromServer,
        totalItems,
        subtotal,
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
