"use client";

import React from "react";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import { USER_ROUTES } from "@/lib/auth/auth-store";

export default function ForgotPasswordPage() {
  return (
    <PageLayout className="bg-[#F8FAFC]">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xs sm:p-8">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#082F6B] text-white">
            <KeyRound className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1F2937]">Password Recovery</h1>
          <p className="mt-2 text-sm text-zinc-500">
            If you forgot your password, please contact Kinbo support to recover your account.
            Once signed in, you can change your password anytime from your Account settings.
          </p>

          <div className="mt-6 space-y-3">
            <Link
              href="/contact?subject=Account%20Password%20Recovery"
              className="inline-flex w-full items-center justify-center rounded-xl bg-[#082F6B] px-4 py-3 text-sm font-semibold text-white hover:bg-[#062452]"
            >
              Contact Support
            </Link>
            <Link
              href={USER_ROUTES.login}
              className="inline-flex w-full items-center justify-center rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm font-semibold text-[#1F2937] hover:bg-[#F3F7FC]"
            >
              Back to login
            </Link>
          </div>
        </div>
      </main>
    </PageLayout>
  );
}
