import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Loader2 } from "lucide-react";
import PortalLoginView from "@/views/auth/PortalLoginView";

export const metadata: Metadata = { title: "Sign In - Kinbo" };

function LoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F7FC]">
      <Loader2 className="h-8 w-8 animate-spin text-[#082F6B]" aria-label="Loading" />
    </div>
  );
}

async function LoginScreen({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  return <PortalLoginView initialRole={role === "admin" ? "admin" : "user"} />;
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginScreen searchParams={searchParams} />
    </Suspense>
  );
}
