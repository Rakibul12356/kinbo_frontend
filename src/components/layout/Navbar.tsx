"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { logout } from "@/lib/auth/auth-store";
import { useIsClient } from "@/hooks/use-is-client";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import {
  ShoppingCart,
  Search,
  Menu,
  X,
  User,
  Package,
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogIn,
  LogOut,
  Layers,
} from "lucide-react";

interface NavbarProps {
  onSearchChange?: (query: string) => void;
}

const navLinkClass =
  "inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F2937] hover:text-[#082F6B] transition px-2.5 py-2 rounded-lg hover:bg-[#F3F7FC]";

const menuItemClass =
  "flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-[#1F2937] hover:bg-[#F3F7FC] rounded-lg";

export default function Navbar({ onSearchChange }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();
  const { user, admin } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const isClient = useIsClient();
  const signedIn = isClient && Boolean(user || admin);
  const dashboardHref = isClient && admin ? "/admin/dashboard" : "/account";
  const onProductsListing = pathname === "/products";

  useEffect(() => {
    if (!accountOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [accountOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  const runSearch = (value: string) => {
    const query = value.trim();
    if (onSearchChange && onProductsListing) {
      onSearchChange(query);
      return;
    }
    const href = query ? `/products?q=${encodeURIComponent(query)}` : "/products";
    router.push(href);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(searchInput);
  };

  const closeMenus = () => {
    setAccountOpen(false);
    setIsMobileMenuOpen(false);
  };

  const searchField = (mobile: boolean) => (
    <form onSubmit={handleSearchSubmit} className="relative w-full">
      <div
        className={`absolute left-3.5 text-zinc-400 pointer-events-none ${
          mobile ? "top-3" : "top-1/2 -translate-y-1/2"
        }`}
      >
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        placeholder={mobile ? "Search products..." : "Search premium electronics, gadgets, essentials..."}
        value={searchInput}
        onChange={(e) => {
          setSearchInput(e.target.value);
          if (onSearchChange && onProductsListing) onSearchChange(e.target.value);
        }}
        className={`w-full bg-[#F3F7FC] text-[#1F2937] placeholder:text-zinc-400 text-sm pl-10 pr-4 border border-[#E5E7EB] focus:outline-none focus:border-[#082F6B] ${
          mobile
            ? "py-2 rounded-xl"
            : "py-2.5 rounded-full focus:ring-2 focus:ring-[#082F6B]/20 transition-all shadow-2xs"
        }`}
      />
    </form>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E5E7EB] bg-white/90 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3 h-16 sm:h-20">
          <Link href="/" className="flex items-center shrink-0" aria-label="Kinbo home">
            <Image
              src="/images/logo-trimmed.png"
              alt="Kinbo"
              width={131}
              height={36}
              style={{ width: "auto" }}
              className="h-8 sm:h-9 w-auto object-contain"
              priority
            />
          </Link>

          <div className="hidden lg:flex flex-1 max-w-lg mx-auto">{searchField(false)}</div>

          <div className="ml-auto flex items-center gap-0.5 sm:gap-1 shrink-0">
            <Link href="/products" className={`hidden lg:inline-flex ${navLinkClass}`}>
              <Layers className="w-4 h-4 text-[#082F6B]" />
              <span>All Products</span>
            </Link>

            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

            {signedIn ? (
              <div ref={accountRef} className="relative hidden lg:block">
                <button
                  type="button"
                  onClick={() => setAccountOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  className={`${navLinkClass} cursor-pointer`}
                >
                  <User className="w-4 h-4 text-[#082F6B]" />
                  <span>Account</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-zinc-400 transition ${accountOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {accountOpen && (
                  <div
                    role="menu"
                    className="absolute end-0 top-full z-50 mt-1 min-w-42 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white py-1 shadow-lg"
                  >
                    <Link
                      href={dashboardHref}
                      role="menuitem"
                      onClick={closeMenus}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#1F2937] hover:bg-[#F3F7FC]"
                    >
                      <LayoutDashboard className="h-4 w-4 text-[#082F6B]" />
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        logout();
                        closeMenus();
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-[#1F2937] hover:bg-[#F3F7FC] cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 text-[#082F6B]" />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className={`hidden lg:inline-flex ${navLinkClass}`}>
                <LogIn className="w-4 h-4 text-[#082F6B]" />
                <span>Login</span>
              </Link>
            )}

            {signedIn && (
              <>
                <Link href="/orders" className={`hidden lg:inline-flex ${navLinkClass}`}>
                  <Package className="w-4 h-4 text-[#082F6B]" />
                  <span>Orders</span>
                </Link>

                <Link
                  href="/inbox"
                  aria-label="Notifications"
                  className="hidden sm:inline-flex items-center justify-center p-2 rounded-lg text-[#082F6B] hover:bg-[#F3F7FC] transition"
                >
                  <Bell className="w-5 h-5" />
                </Link>
              </>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="group flex items-center justify-center p-2 rounded-xl hover:bg-[#F3F7FC] transition-all cursor-pointer"
              aria-label="View Shopping Cart"
            >
              <div className="relative flex items-center justify-center">
                <ShoppingCart
                  className="w-6 h-6 text-[#082F6B] transition-transform duration-200 group-hover:scale-105"
                  strokeWidth={2}
                />
                {isClient && (
                  <span className="absolute -top-1.5 -right-2 bg-[#FF6B00] text-white text-[10px] font-bold min-w-4.5 h-4.5 px-1 rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
                    {totalItems}
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 lg:hidden text-[#1F2937] hover:bg-[#F3F7FC] rounded-lg transition cursor-pointer"
              aria-label="Toggle Mobile Menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <div className="lg:hidden pb-3">{searchField(true)}</div>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute left-0 right-0 top-full z-50 lg:hidden">
          <div className="border-t border-[#E5E7EB] bg-white px-4 sm:px-6 py-3 shadow-xl animate-in slide-in-from-top-2">
            <nav className="container mx-auto space-y-1">
              <Link href="/products" onClick={closeMenus} className={menuItemClass}>
                <Layers className="w-4 h-4 text-[#082F6B]" />
                <span>All Products</span>
              </Link>

              <div className="sm:hidden px-3 py-2">
                <LanguageSwitcher />
              </div>

              {signedIn ? (
                <>
                  <Link href={dashboardHref} onClick={closeMenus} className={menuItemClass}>
                    <LayoutDashboard className="w-4 h-4 text-[#082F6B]" />
                    <span>Dashboard</span>
                  </Link>
                  <Link href="/account" onClick={closeMenus} className={menuItemClass}>
                    <User className="w-4 h-4 text-[#082F6B]" />
                    <span>Account</span>
                  </Link>
                  <Link href="/orders" onClick={closeMenus} className={menuItemClass}>
                    <Package className="w-4 h-4 text-[#082F6B]" />
                    <span>Orders</span>
                  </Link>
                  <Link href="/inbox" onClick={closeMenus} className={menuItemClass}>
                    <Bell className="w-4 h-4 text-[#082F6B]" />
                    <span>Notifications</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      closeMenus();
                    }}
                    className={`${menuItemClass} w-full cursor-pointer`}
                  >
                    <LogOut className="w-4 h-4 text-[#082F6B]" />
                    <span>Log out</span>
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={closeMenus} className={menuItemClass}>
                  <LogIn className="w-4 h-4 text-[#082F6B]" />
                  <span>Login</span>
                </Link>
              )}

              <Link href="/cart" onClick={closeMenus} className={menuItemClass}>
                <ShoppingCart className="w-4 h-4 text-[#082F6B]" />
                <span>View Cart</span>
              </Link>
            </nav>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setIsMobileMenuOpen(false)}
            className="h-dvh w-full bg-[#04101f]/35 backdrop-blur-[1px] cursor-pointer"
          />
        </div>
      )}
    </header>
  );
}
