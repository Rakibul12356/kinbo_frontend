"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { toast } from "react-toastify";
import Button from "@/components/ui/button";
import PasswordInput from "@/components/auth/PasswordInput";
import {
  findResetToken,
  resetPasswordWithToken,
  USER_ROUTES,
} from "@/lib/auth/auth-store";
import { validatePassword } from "@/lib/auth/validation";

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [recordEmail, setRecordEmail] = useState<string | null>(null);
  const [tokenReady, setTokenReady] = useState(false);

  useEffect(() => {
    const match = token ? findResetToken(token) : null;
    setRecordEmail(match?.email ?? null);
    setTokenReady(true);
  }, [token]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const passErr = validatePassword(password);
    if (passErr) {
      setError(passErr);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    const result = resetPasswordWithToken(token, password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success("Password updated. Please sign in.");
    router.push(USER_ROUTES.login);
  };

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xs sm:p-8">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF6B00] text-white">
        <LockKeyhole className="h-5 w-5" />
      </div>
      <h1 className="text-2xl font-extrabold text-[#1F2937]">Reset password</h1>
      <p className="mt-1 text-sm text-zinc-500">
        {!tokenReady
          ? "Checking your reset link…"
          : recordEmail
            ? `Choose a new password for ${recordEmail}.`
            : "This reset link is invalid or has expired."}
      </p>

      {tokenReady && !recordEmail ? (
        <div className="mt-6 space-y-3">
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Request a new link from the forgot password page.
          </p>
          <Link
            href="/forgot-password"
            className="inline-flex w-full items-center justify-center rounded-xl bg-[#082F6B] px-4 py-3 text-sm font-semibold text-white hover:bg-[#062452]"
          >
            Forgot password
          </Link>
        </div>
      ) : tokenReady && recordEmail ? (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <PasswordInput
            id="reset-password"
            label="New password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
          <PasswordInput
            id="reset-confirm"
            label="Confirm password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat new password"
          />
          {error && (
            <p
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
            >
              {error}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full" isLoading={submitting}>
            Update password
          </Button>
        </form>
      ) : null}

      <p className="mt-5 text-center text-sm text-zinc-500">
        <Link href={USER_ROUTES.login} className="font-semibold text-[#082F6B] hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
