"use client";

import React from "react";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { USER_ROUTES } from "@/lib/auth/auth-store";

export default function ResetPasswordClient() {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xs sm:p-8">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF6B00] text-white">
        <LockKeyhole className="h-5 w-5" />
      </div>
      <h1 className="text-2xl font-extrabold text-[#1F2937]">Change password</h1>
      <p className="mt-2 text-sm text-zinc-500">
        You can update your password directly from your Account page while signed in, or contact
        support if you are locked out.
      </p>

      <div className="mt-6 space-y-3">
        <Link
          href={USER_ROUTES.account}
          className="inline-flex w-full items-center justify-center rounded-xl bg-[#082F6B] px-4 py-3 text-sm font-semibold text-white hover:bg-[#062452]"
        >
          Go to Account
        </Link>
        <Link
          href={USER_ROUTES.login}
          className="inline-flex w-full items-center justify-center rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm font-semibold text-[#1F2937] hover:bg-[#F3F7FC]"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}
