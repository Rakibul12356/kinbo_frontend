"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AuthModalView from "@/views/auth/AuthModalView";

function AuthModalFromQuery() {
  const searchParams = useSearchParams();
  const auth = searchParams.get("auth");

  if (auth !== "login" && auth !== "signup" && auth !== "admin") return null;

  return <AuthModalView mode={auth === "signup" ? "signup" : "login"} />;
}

/** Opens login/signup as a modal over the current storefront page via `?auth=login|signup`. */
export default function AuthModalHost() {
  return (
    <Suspense fallback={null}>
      <AuthModalFromQuery />
    </Suspense>
  );
}
