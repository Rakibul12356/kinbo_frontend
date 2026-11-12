"use client";

import AuthModalView from "@/views/auth/AuthModalView";

/** Legacy wrapper — prefer `/?auth=login` modal on home. */
export default function PortalLoginView() {
  return <AuthModalView mode="login" />;
}
