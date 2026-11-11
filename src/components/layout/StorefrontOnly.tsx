"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";

const NON_STOREFRONT_PREFIXES = ["/vendor", "/admin"];

function StorefrontContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hidden = NON_STOREFRONT_PREFIXES.some(
    (p) => pathname === p || (pathname && pathname.startsWith(`${p}/`))
  );
  return hidden ? null : <>{children}</>;
}

/** Hides shopper-only UI (cart drawer, support chat) on seller and admin pages. */
export default function StorefrontOnly({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <StorefrontContent>{children}</StorefrontContent>
    </Suspense>
  );
}

