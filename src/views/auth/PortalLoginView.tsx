"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Shield, ShoppingBag, UserRound } from "lucide-react";
import { toast } from "react-toastify";
import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/use-auth";
import { DEMO_ADMIN, DEMO_USER } from "@/lib/auth/demo-accounts";
import { ADMIN_ROUTES, USER_ROUTES, loginAdmin, loginUser } from "@/lib/auth/auth-store";

type PortalRole = "user" | "admin";

const ROLES: {
  id: PortalRole;
  label: string;
  hint: string;
  icon: typeof UserRound;
}[] = [
  { id: "user", label: "User", hint: "Shop and manage your account", icon: UserRound },
  { id: "admin", label: "Admin", hint: "Add products and run the store", icon: Shield },
];

export default function PortalLoginView({ initialRole = "user" }: { initialRole?: PortalRole }) {
  const router = useRouter();
  const { ready, admin, user } = useAuth();
  const [role, setRole] = useState<PortalRole>(initialRole);

  useEffect(() => {
    if (!ready) return;
    if (admin) router.replace(ADMIN_ROUTES.dashboard);
    else if (user) router.replace(USER_ROUTES.account);
  }, [ready, admin, user, router]);

  if (!ready || admin || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F7FC]">
        <Loader2 className="h-8 w-8 animate-spin text-[#082F6B]" aria-label="Loading" />
      </div>
    );
  }

  const handleLogin = (email: string, password: string) => {
    if (role === "admin") {
      const result = loginAdmin(email, password);
      if (result.ok) {
        toast.success("Signed in as admin.");
        router.push(ADMIN_ROUTES.dashboard);
      }
      return result;
    }
    const result = loginUser(email, password);
    if (result.ok) {
      toast.success("Welcome back.");
      router.push(USER_ROUTES.account);
    }
    return result;
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-[#082F6B] text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#FF6B00]/30 blur-3xl" />
        <div className="absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <Link href="/" aria-label="Kinbo home" className="relative inline-flex w-fit rounded-2xl bg-white px-4 py-3">
          <Image
            src="/images/logo-trimmed.png"
            alt="Kinbo"
            width={131}
            height={36}
            className="h-8 w-auto"
            style={{ width: "auto" }}
            priority
          />
        </Link>
        <div className="relative max-w-md">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FF6B00]">Kinbo</p>
          <h2 className="mt-3 text-4xl font-extrabold leading-tight tracking-tight">
            One door for shoppers and the store team.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/75">
            Customers browse, order and manage their account. Admins add products from a sidebar dashboard.
          </p>
        </div>
        <div className="relative flex items-center gap-3 text-sm text-white/80">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <ShoppingBag className="h-5 w-5" />
          </span>
          Curated products, delivered across Bangladesh.
        </div>
      </aside>

      <main className="flex min-h-screen items-center justify-center bg-[#F3F7FC] px-4 py-10">
        <div className="w-full max-w-md">
          <Link href="/" aria-label="Kinbo home" className="mb-8 inline-flex lg:hidden">
            <Image
              src="/images/logo-trimmed.png"
              alt="Kinbo"
              width={131}
              height={36}
              className="h-8 w-auto"
              style={{ width: "auto" }}
              priority
            />
          </Link>

          <h1 className="text-2xl font-extrabold tracking-tight text-[#1F2937] sm:text-[28px]">Sign in</h1>
          <p className="mt-1.5 text-sm text-zinc-500">Choose user or admin, then continue.</p>

          <div className="mt-6 grid grid-cols-2 gap-3" role="tablist" aria-label="Account type">
            {ROLES.map((item) => {
              const active = role === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setRole(item.id)}
                  className={`rounded-2xl border px-3 py-3 text-left transition cursor-pointer ${
                    active
                      ? "border-[#082F6B] bg-white shadow-sm ring-2 ring-[#082F6B]/15"
                      : "border-[#E5E7EB] bg-white/70 hover:border-[#082F6B]/40"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      active ? "bg-[#082F6B] text-white" : "bg-[#F3F7FC] text-[#082F6B]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="mt-2 block text-sm font-bold text-[#1F2937]">{item.label}</span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-zinc-500">{item.hint}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-xs sm:p-6">
            <LoginForm
              key={role}
              onSubmit={handleLogin}
              submitLabel={role === "admin" ? "Sign in as admin" : "Sign in as user"}
              demoAccounts={
                role === "admin"
                  ? [
                      {
                        label: "Admin",
                        description: "Password Admin@123",
                        email: DEMO_ADMIN.email,
                        password: DEMO_ADMIN.password,
                      },
                    ]
                  : [
                      {
                        label: "Customer",
                        description: "Password User@123",
                        email: DEMO_USER.email,
                        password: DEMO_USER.password,
                      },
                    ]
              }
            />
          </div>
        </div>
      </main>
    </div>
  );
}
