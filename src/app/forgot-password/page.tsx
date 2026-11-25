"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, KeyRound } from "lucide-react";
import { toast } from "react-toastify";
import PageLayout from "@/components/layout/PageLayout";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { requestPasswordReset, USER_ROUTES } from "@/lib/auth/auth-store";
import { validateEmail } from "@/lib/auth/validation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resetPath, setResetPath] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = requestPasswordReset(email);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setResetPath(result.resetPath);
    toast.success("Reset link ready.");
  };

  return (
    <PageLayout className="bg-[#F8FAFC]">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xs sm:p-8">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#082F6B] text-white">
            <KeyRound className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1F2937]">Forgot password</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Enter your account email. We will generate a reset link for this demo
            (email delivery comes with the backend).
          </p>

          {resetPath ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                Reset link created. Open it to choose a new password.
              </div>
              <Link
                href={resetPath}
                className="inline-flex w-full items-center justify-center rounded-xl bg-[#082F6B] px-4 py-3 text-sm font-semibold text-white hover:bg-[#062452]"
              >
                Continue to reset password
              </Link>
              <p className="break-all text-[11px] text-zinc-400">{resetPath}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                leftIcon={<Mail className="h-4 w-4" />}
                required
              />
              {error && (
                <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {error}
                </p>
              )}
              <Button type="submit" size="lg" className="w-full" isLoading={submitting}>
                Send reset link
              </Button>
            </form>
          )}

          <p className="mt-5 text-center text-sm text-zinc-500">
            Remembered it?{" "}
            <Link href={USER_ROUTES.login} className="font-semibold text-[#082F6B] hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </main>
    </PageLayout>
  );
}
