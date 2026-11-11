"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
} from "lucide-react";

interface NavbarProps {
  onSearchChange?: (query: string) => void;
}

export default function Navbar({ onSearchChange }: NavbarProps) {
  const { totalItems, setIsCartOpen } = useCart();
  const { user, admin } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const isClient = useIsClient();
  const signedIn = isClient && Boolean(user || admin);
  const dashboardHref = isClient && admin ? "/admin/dashboard" : "/account";

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchChange) {
      onSearchChange(searchInput);
    }
  };

  const closeMenus = () => {
    setAccountOpen(false);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="relative sticky top-0 z-40 w-full border-b border-[#E5E7EB] bg-white/90 backdrop-blur-md transition-all">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
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

          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-lg items-center relative"
          >
            <div className="absolute left-3.5 text-zinc-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search premium electronics, gadgets, essentials..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                if (onSearchChange) onSearchChange(e.target.value);
              }}
              className="w-full bg-[#F3F7FC] text-[#1F2937] placeholder:text-zinc-400 text-sm pl-10 pr-4 py-2.5 rounded-full border border-[#E5E7EB] focus:outline-none focus:border-[#082F6B] focus:ring-2 focus:ring-[#082F6B]/20 transition-all shadow-2xs"
            />
          </form>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <LanguageSwitcher />

            {signedIn ? (
              <div ref={accountRef} className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setAccountOpen((v) => !v)}
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F2937] hover:text-[#082F6B] transition px-2.5 py-2 rounded-lg hover:bg-[#F3F7FC] cursor-pointer"
                >
                  <User className="w-4 h-4 text-[#082F6B]" />
                  <span>Account</span>
                  <ChevronDown className={`h-3.5 w-3.5 text-zinc-400 transition ${accountOpen ? "rotate-180" : ""}`} />
                </button>

                {accountOpen && (
                  <div
                    role="menu"
                    className="absolute end-0 top-full z-50 mt-1 min-w-[10.5rem] overflow-hidden rounded-xl border border-[#E5E7EB] bg-white py-1 shadow-lg"
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
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F2937] hover:text-[#082F6B] transition px-2.5 py-2 rounded-lg hover:bg-[#F3F7FC]"
              >
                <LogIn className="w-4 h-4 text-[#082F6B]" />
                <span>Login</span>
              </Link>
            )}

            {signedIn && (
              <>
                <Link
                  href="/orders"
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F2937] hover:text-[#082F6B] transition px-2.5 py-2 rounded-lg hover:bg-[#F3F7FC]"
                >
                  <Package className="w-4 h-4 text-[#082F6B]" />
                  <span>Orders</span>
                </Link>

                <Link
                  href="/inbox"
                  aria-label="Notifications"
                  className="inline-flex items-center justify-center p-2 rounded-lg text-[#082F6B] hover:bg-[#F3F7FC] transition"
                >
                  <Bell className="w-5 h-5" />
                </Link>
              </>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="group flex items-center gap-2 sm:gap-2.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl hover:bg-[#F3F7FC] transition-all cursor-pointer"
              aria-label="View Shopping Cart"
            >
              <div className="relative flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-[#082F6B] transition-transform duration-200 group-hover:scale-105" strokeWidth={2} />
                {isClient && (
                  <span className="absolute -top-1.5 -right-2 bg-[#FF6B00] text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center ring-2 ring-white shadow-xs">
                    {totalItems}
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 md:hidden text-[#1F2937] hover:bg-[#F3F7FC] rounded-lg transition"
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="absolute left-3.5 top-3 text-zinc-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                if (onSearchChange) onSearchChange(e.target.value);
              }}
              className="w-full bg-[#F3F7FC] text-[#1F2937] placeholder:text-zinc-400 text-sm pl-10 pr-4 py-2 rounded-xl border border-[#E5E7EB] focus:outline-none focus:border-[#082F6B]"
            />
          </form>
        </div>

      </div>

      {isMobileMenuOpen && (
        <div className="absolute left-0 right-0 top-full z-50 md:hidden">
          <div className="border-t border-[#E5E7EB] bg-white px-4 sm:px-6 py-3 shadow-xl animate-in slide-in-from-top-2">
            <nav className="container mx-auto space-y-1">
              {signedIn ? (
                <>
                  <Link
                    href={dashboardHref}
                    onClick={closeMenus}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#1F2937] hover:bg-[#F3F7FC] rounded-lg"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#082F6B]" />
                    <span>Dashboard</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      closeMenus();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-[#1F2937] hover:bg-[#F3F7FC] rounded-lg cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-[#082F6B]" />
                    <span>Log out</span>
                  </button>
                  <Link
                    href="/orders"
                    onClick={closeMenus}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#1F2937] hover:bg-[#F3F7FC] rounded-lg"
                  >
                    <Package className="w-4 h-4 text-[#082F6B]" />
                    <span>Orders</span>
                  </Link>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={closeMenus}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#1F2937] hover:bg-[#F3F7FC] rounded-lg"
                >
                  <LogIn className="w-4 h-4 text-[#082F6B]" />
                  <span>Login</span>
                </Link>
              )}
              {signedIn && (
                <Link
                  href="/inbox"
                  onClick={closeMenus}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#1F2937] hover:bg-[#F3F7FC] rounded-lg"
                >
                  <Bell className="w-4 h-4 text-[#082F6B]" />
                  <span>Notifications</span>
                </Link>
              )}
              <Link
                href="/cart"
                onClick={closeMenus}
                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#1F2937] hover:bg-[#F3F7FC] rounded-lg"
              >
                <ShoppingCart className="w-4 h-4 text-[#082F6B]" />
                <span>View Cart</span>
              </Link>
            </nav>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setIsMobileMenuOpen(false)}
            className="h-[100dvh] w-full bg-[#04101f]/35 backdrop-blur-[1px] cursor-pointer"
          />
        </div>
      )}
    </header>
  );
}
