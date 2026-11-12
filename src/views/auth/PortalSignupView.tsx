"use client";

import AuthModalView from "@/views/auth/AuthModalView";

/** Legacy wrapper — prefer `/?auth=signup` modal on home. */
export default function PortalSignupView() {
  return <AuthModalView mode="signup" />;
}
