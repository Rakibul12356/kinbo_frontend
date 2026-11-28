"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import PasswordInput from "./PasswordInput";
import type { ActionResult } from "@/lib/auth/auth-store";
import { validateEmail } from "@/lib/auth/validation";

export const LOGIN_EMAIL_HINT_KEY = "kinbo_login_email";

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<ActionResult> | ActionResult;
  submitLabel?: string;
}

export default function LoginForm({
  onSubmit,
  submitLabel = "Sign In",
}: LoginFormProps) {
  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") return "";
    const hint = sessionStorage.getItem(LOGIN_EMAIL_HINT_KEY) ?? "";
    sessionStorage.removeItem(LOGIN_EMAIL_HINT_KEY);
    return hint;
  });
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = {
      email: validateEmail(email),
      password: password ? undefined : "Password is required.",
    };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;

    setIsSubmitting(true);
    const result = await onSubmit(email, password);
    if (!result.ok) {
      setErrors({ form: result.error });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {errors.form && (
          <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {errors.form}
          </p>
        )}
        <Input
          id="login-email"
          label="Email Address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          leftIcon={<Mail className="h-4 w-4" />}
        />
        <PasswordInput
          id="login-password"
          label="Password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-zinc-600 cursor-pointer">
            <input type="checkbox" className="h-4 w-4 rounded accent-[#082F6B]" defaultChecked />
            Remember me
          </label>
          <Link
            href="/contact"
            className="font-semibold text-[#082F6B] hover:underline"
          >
            Need help signing in?
          </Link>
        </div>
        <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </form>
    </div>
  );
}
