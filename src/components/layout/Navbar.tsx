"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { logout } from "@/lib/auth/auth-store";
import { useQueryClient } from "@tanstack/react-query";
import { useIsClient } from "@/hooks/use-is-client";
import { useT } from "@/hooks/use-t";
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

const menuItemClass =
  "flex w-full items-center gap-2 px-3 py-3 text-sm font-semibold text-[#1F2937] hover:bg-[#F3F7FC] rounded-lg active:bg-[#F3F7FC]";

export default function Navbar({ onSearchChange }: NavbarProps) {
  const t = useT();
  const router = useRouter();
  const { totalItems, setIsCartOpen } = useCart();
  const { user, admin } = useAuth();
  const { unreadCount } = useNotifications();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const isClient = useIsClient();
  const isAdmin = isClient && Boolean(admin);
  const signedIn = isClient && Boolean(user || admin);
  const dashboardHref = isAdmin ? "/admin/dashboard" : "/account";
  const notificationsHref = isAdmin ? "/admin/notifications" : "/inbox";

  useEffect(() => {
    if (!accountOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [accountOpen, setAccountOpen]);

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
  }, [isMobileMenuOpen, setIsMobileMenuOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [setIsMobileMenuOpen]);

  const runSearch = (value: string) => {
    const query = value.trim();
    if (onSearchChange && window.location.pathname === "/products") {
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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#E5E7EB] bg-white/95 backdrop-blur-md">
      <div className="mx-auto w-full container px-4 sm:px-6">
        <div className="flex h-14 sm:h-16 items-center gap-2">
          <Link href="/" className="relative z-10 flex shrink-0 items-center" aria-label={t("nav.home")}>
            <Image
              src="/images/logo-trimmed.png"
              alt="Kinbo"
              width={131}
              height={36}
              style={{ width: "auto" }}
              className="h-7 sm:h-8 w-auto object-contain"
              priority
            />
          </Link>

          <div className="mx-auto hidden min-w-0 max-w-lg flex-1 lg:block">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <div className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-zinc-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="search"
                enterKeyHint="search"
                placeholder={t("nav.searchDesktop")}
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  if (onSearchChange && window.location.pathname === "/products") {
                    onSearchChange(e.target.value);
                  }
                }}
                className="w-full rounded-full border border-[#E5E7EB] bg-[#F3F7FC] py-2.5 ps-10 pe-4 text-sm text-[#1F2937] placeholder:text-zinc-400 shadow-2xs outline-none focus:border-[#082F6B] focus:ring-2 focus:ring-[#082F6B]/20"
              />
            </form>
          </div>

          <div className="relative z-10 ms-auto flex shrink-0 items-center gap-0.5">
            <Link
              href="/products"
              className="hidden items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#1F2937] transition hover:bg-[#F3F7FC] hover:text-[#082F6B] lg:inline-flex"
            >
              <Layers className="h-4 w-4 text-[#082F6B]" />
              <span>{t("nav.allProducts")}</span>
            </Link>

            <LanguageSwitcher />

            {signedIn ? (
              <div ref={accountRef} className="relative hidden lg:block">
                <button
                  type="button"
                  onClick={() => setAccountOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#1F2937] transition hover:bg-[#F3F7FC] hover:text-[#082F6B]"
                >
                  <User className="h-4 w-4 text-[#082F6B]" />
                  <span>{t("nav.account")}</span>
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
                      {t("nav.dashboard")}
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        logout();
                        queryClient.clear();
                        closeMenus();
                      }}
                      className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-xs font-semibold text-[#1F2937] hover:bg-[#F3F7FC]"
                    >
                      <LogOut className="h-4 w-4 text-[#082F6B]" />
                      {t("nav.logout")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/?auth=login"
                className="hidden items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#1F2937] transition hover:bg-[#F3F7FC] hover:text-[#082F6B] lg:inline-flex"
              >
                <LogIn className="h-4 w-4 text-[#082F6B]" />
                <span>{t("nav.login")}</span>
              </Link>
            )}

            {signedIn && (
              <>
                {!isAdmin && (
                  <Link
                    href="/orders"
                    className="hidden items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#1F2937] transition hover:bg-[#F3F7FC] hover:text-[#082F6B] lg:inline-flex"
                  >
                    <Package className="h-4 w-4 text-[#082F6B]" />
                    <span>{t("nav.orders")}</span>
                  </Link>
                )}
                <Link
                  href={notificationsHref}
                  aria-label={t("nav.notifications")}
                  className="relative hidden items-center justify-center rounded-lg p-2 text-[#082F6B] transition hover:bg-[#F3F7FC] sm:inline-flex"
                >
                  <Bell className="h-5 w-5" />
                  {isClient && unreadCount > 0 && (
                    <span className="absolute -top-0.5 -end-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF6B00] px-1 text-[9px] font-bold text-white ring-2 ring-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {!isAdmin && (
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="inline-flex cursor-pointer items-center justify-center rounded-xl p-2.5 transition hover:bg-[#F3F7FC]"
                aria-label={t("nav.cart")}
              >
                <span className="relative inline-flex">
                  <ShoppingCart className="h-6 w-6 text-[#082F6B]" strokeWidth={2} />
                  {isClient && (
                    <span className="absolute -top-1.5 -end-2 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#FF6B00] px-1 text-[10px] font-bold text-white ring-2 ring-white shadow-xs">
                      {totalItems}
                    </span>
                  )}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="inline-flex cursor-pointer items-center justify-center rounded-lg p-2.5 text-[#1F2937] transition hover:bg-[#F3F7FC] lg:hidden"
              aria-label={t("nav.menu")}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <div className="pb-3 lg:hidden">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <div className="pointer-events-none absolute top-3 start-3.5 text-zinc-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="search"
              enterKeyHint="search"
              placeholder={t("nav.searchMobile")}
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                if (onSearchChange && window.location.pathname === "/products") {
                  onSearchChange(e.target.value);
                }
              }}
              className="w-full rounded-xl border border-[#E5E7EB] bg-[#F3F7FC] py-2.5 ps-10 pe-4 text-sm text-[#1F2937] placeholder:text-zinc-400 outline-none focus:border-[#082F6B]"
            />
          </form>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-14 z-40 lg:hidden sm:top-16">
          <button
            type="button"
            aria-label={t("auth.close")}
            className="absolute inset-0 bg-[#04101f]/40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative z-10 max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-b border-[#E5E7EB] bg-white px-4 py-3 shadow-xl sm:max-h-[calc(100dvh-4rem)] sm:px-6">
            <nav className="mx-auto flex max-w-7xl flex-col gap-1">
              <Link href="/products" onClick={closeMenus} className={menuItemClass}>
                <Layers className="h-4 w-4 text-[#082F6B]" />
                <span>{t("nav.allProducts")}</span>
              </Link>

              {signedIn ? (
                <>
                  <Link href={dashboardHref} onClick={closeMenus} className={menuItemClass}>
                    <LayoutDashboard className="h-4 w-4 text-[#082F6B]" />
                    <span>{t("nav.dashboard")}</span>
                  </Link>
                  {!isAdmin && (
                    <>
                      <Link href="/account" onClick={closeMenus} className={menuItemClass}>
                        <User className="h-4 w-4 text-[#082F6B]" />
                        <span>{t("nav.account")}</span>
                      </Link>
                      <Link href="/orders" onClick={closeMenus} className={menuItemClass}>
                        <Package className="h-4 w-4 text-[#082F6B]" />
                        <span>{t("nav.orders")}</span>
                      </Link>
                    </>
                  )}
                  <Link href={notificationsHref} onClick={closeMenus} className={menuItemClass}>
                    <Bell className="h-4 w-4 text-[#082F6B]" />
                    <span>{t("nav.notifications")}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      queryClient.clear();
                      closeMenus();
                    }}
                    className={`${menuItemClass} cursor-pointer`}
                  >
                    <LogOut className="h-4 w-4 text-[#082F6B]" />
                    <span>{t("nav.logout")}</span>
                  </button>
                </>
              ) : (
                <Link href="/?auth=login" onClick={closeMenus} className={menuItemClass}>
                  <LogIn className="h-4 w-4 text-[#082F6B]" />
                  <span>{t("nav.login")}</span>
                </Link>
              )}

              {!isAdmin && (
                <Link href="/cart" onClick={closeMenus} className={menuItemClass}>
                  <ShoppingCart className="h-4 w-4 text-[#082F6B]" />
                  <span>{t("nav.viewCart")}</span>
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
