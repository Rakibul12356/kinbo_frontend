"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ADMIN_ROUTES } from "@/lib/auth/auth-store";

export type GuardStep = "admin-guest" | "admin";

type AuthView = ReturnType<typeof useAuth>;

/** Returns where the user should be sent instead, or null if they may see this step. */
function resolveRedirect(step: GuardStep, auth: AuthView): string | null {
  const { admin } = auth;

  switch (step) {
    case "admin-guest":
      return admin ? ADMIN_ROUTES.dashboard : null;
    case "admin":
      return admin ? null : ADMIN_ROUTES.login;
  }
}

export default function RouteGuard({
  step,
  children,
}: {
  step: GuardStep;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const auth = useAuth();
  const redirectTo = auth.ready ? resolveRedirect(step, auth) : null;

  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  if (!auth.ready || redirectTo) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center bg-[#F3F7FC]">
        <Loader2 className="h-8 w-8 animate-spin text-[#082F6B]" aria-label="Loading" />
      </div>
    );
  }

  return <>{children}</>;
}
