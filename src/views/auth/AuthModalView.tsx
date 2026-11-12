"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Mail, UserRound, X } from "lucide-react";
import { Lottie } from "lottie-react";
import { toast } from "react-toastify";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import PasswordInput from "@/components/auth/PasswordInput";
import { useAuth } from "@/hooks/use-auth";
import { DEMO_USER } from "@/lib/auth/demo-accounts";
import {
  ADMIN_ROUTES,
  USER_ROUTES,
  loginAdmin,
  loginUser,
  loginWithGoogle,
  registerUser,
} from "@/lib/auth/auth-store";
import {
  validateEmail,
  validateName,
  validatePassword,
} from "@/lib/auth/validation";
import { useT } from "@/hooks/use-t";
import type { MessageKey } from "@/lib/i18n/messages";

type AuthMode = "login" | "signup";

const SLIDES: { title: MessageKey; body: MessageKey; lottie: string }[] = [
  {
    title: "auth.slide1.title",
    body: "auth.slide1.body",
    lottie: "/lottie/ordering.json",
  },
  {
    title: "auth.slide2.title",
    body: "auth.slide2.body",
    lottie: "/lottie/secure.json",
  },
  {
    title: "auth.slide3.title",
    body: "auth.slide3.body",
    lottie: "/lottie/delivery.json",
  },
];

export default function AuthModalView({ mode }: { mode: AuthMode }) {
  const t = useT();
  const router = useRouter();
  const { ready, admin, user } = useAuth();
  const [slide, setSlide] = useState(0);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (admin) router.replace(ADMIN_ROUTES.dashboard);
    else if (user) router.replace(USER_ROUTES.account);
  }, [ready, admin, user, router]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.replace("/");
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [router]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setSlide((s) => (s + 1) % SLIDES.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, []);

  const close = () => router.replace("/");

  const setAuthQuery = (next: "login" | "signup") => {
    setError(null);
    router.replace(`/?auth=${next}`, { scroll: false });
  };

  if (!ready || admin || user) return null;

  const activeSlide = SLIDES[slide];

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailErr = validateEmail(email);
    if (mode === "signup") {
      if (!agreed) {
        setError("Please agree to the terms to continue.");
        return;
      }
      const nameErr = validateName(fullName);
      const passErr = validatePassword(password);
      const confirmErr = confirm === password ? undefined : "Passwords do not match.";
      if (nameErr || emailErr || passErr || confirmErr) {
        setError(nameErr || emailErr || passErr || confirmErr || null);
        return;
      }
      setSubmitting(true);
      const result = registerUser(fullName, email, password);
      if (!result.ok) {
        setError(result.error);
        setSubmitting(false);
        return;
      }
      toast.success("Account created.");
      router.push(USER_ROUTES.account);
      return;
    }

    const passErr = password ? undefined : "Password is required.";
    if (emailErr || passErr) {
      setError(emailErr || passErr || null);
      return;
    }
    setSubmitting(true);

    const asAdmin = loginAdmin(email, password);
    if (asAdmin.ok) {
      toast.success("Signed in as admin.");
      router.push(ADMIN_ROUTES.dashboard);
      return;
    }

    const result = loginUser(email, password);
    if (!result.ok) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
    toast.success("Welcome back.");
    router.push(USER_ROUTES.account);
  };

  const fillDemoUser = () => {
    setEmail(DEMO_USER.email);
    setPassword(DEMO_USER.password);
    setError(null);
  };

  const handleForgotPassword = () => {
    // shortcut: no email reset backend yet — show message only
    toast.info(t("auth.forgotToast"));
  };

  const handleGoogle = () => {
    if (mode === "signup" && !agreed) {
      setError("Please agree to the terms to continue.");
      return;
    }
    const result = loginWithGoogle();
    if (result.ok) {
      toast.success("Signed in with Google.");
      router.push(USER_ROUTES.account);
    }
  };

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-[#04101f]/55 backdrop-blur-[2px] cursor-default"
        onClick={close}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative z-10 grid w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl md:grid-cols-2"
      >
        <aside className="relative hidden flex-col justify-between border-r border-[#E5E7EB] bg-white px-8 py-10 md:flex">
          <Link href="/" onClick={close} className="relative inline-flex w-fit">
            <Image
              src="/images/logo-trimmed.png"
              alt="Kinbo"
              width={110}
              height={30}
              className="h-7 w-auto"
              style={{ width: "auto" }}
              priority
            />
          </Link>

          <div className="relative mt-6 flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-2 h-52 w-full max-w-65">
              <Lottie key={activeSlide.lottie} src={activeSlide.lottie} autoplay loop />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#1F2937]">
              {t(activeSlide.title)}
            </h2>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-500">
              {t(activeSlide.body)}
            </p>
            <div className="mt-8 flex items-center gap-2">
              {SLIDES.map((item, i) => (
                <button
                  key={item.lottie}
                  type="button"
                  aria-label={`Slide ${i + 1}`}
                  onClick={() => setSlide(i)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    i === slide ? "w-6 bg-[#FF6B00]" : "w-2 bg-zinc-200 hover:bg-zinc-300"
                  }`}
                />
              ))}
            </div>
          </div>

          <p className="relative text-center text-xs text-zinc-400">{t("auth.tagline")}</p>
        </aside>

        <div className="relative px-5 py-6 sm:px-8 sm:py-8">
          <button
            type="button"
            onClick={close}
            className="absolute end-3 top-3 rounded-full p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 cursor-pointer"
            aria-label={t("auth.close")}
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-5 flex items-center gap-2 md:hidden">
            <Image
              src="/images/logo-trimmed.png"
              alt="Kinbo"
              width={100}
              height={28}
              className="h-7 w-auto"
              style={{ width: "auto" }}
              priority
            />
          </div>

          <h1 id="auth-modal-title" className="text-2xl font-extrabold text-[#1F2937]">
            {mode === "login" ? t("auth.login") : t("auth.signup")}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {mode === "login" ? t("auth.loginSubtitle") : t("auth.signupSubtitle")}
          </p>

          <form onSubmit={handleEmailSubmit} className="mt-5 space-y-3.5" noValidate>
            {mode === "signup" && (
              <Input
                id="auth-name"
                label={t("auth.fullName")}
                autoComplete="name"
                placeholder={t("auth.fullNamePh")}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                leftIcon={<UserRound className="h-4 w-4" />}
              />
            )}

            <Input
              id="auth-email"
              label={t("auth.email")}
              type="email"
              autoComplete="email"
              placeholder={t("auth.emailPh")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-4 w-4" />}
            />

            <PasswordInput
              id="auth-password"
              label={t("auth.password")}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              placeholder={mode === "signup" ? t("auth.passwordNewPh") : t("auth.passwordPh")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {mode === "login" && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-semibold text-[#082F6B] hover:underline cursor-pointer"
                >
                  {t("auth.forgot")}
                </button>
              </div>
            )}

            {mode === "signup" && (
              <PasswordInput
                id="auth-confirm"
                label={t("auth.confirm")}
                autoComplete="new-password"
                placeholder={t("auth.confirmPh")}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            )}

            {mode === "signup" && (
              <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-zinc-600">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded accent-[#082F6B]"
                />
                <span>
                  {t("auth.agree")}{" "}
                  <Link href="/terms" className="font-medium text-[#082F6B] hover:underline">
                    {t("auth.terms")}
                  </Link>
                  ,{" "}
                  <Link href="/privacy" className="font-medium text-[#082F6B] hover:underline">
                    {t("auth.privacy")}
                  </Link>
                  .
                </span>
              </label>
            )}

            {mode === "login" && (
              <div className="rounded-xl border border-dashed border-[#082F6B]/25 bg-[#F3F7FC] px-3 py-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#082F6B]">
                  {t("auth.demoTitle")}
                </p>
                <p className="mt-1 text-xs text-zinc-600">
                  {t("auth.demoEmail")}{" "}
                  <span className="font-semibold text-[#1F2937]">{DEMO_USER.email}</span>
                </p>
                <p className="text-xs text-zinc-600">
                  {t("auth.demoPassword")}{" "}
                  <span className="font-semibold text-[#1F2937]">{DEMO_USER.password}</span>
                </p>
                <button
                  type="button"
                  onClick={fillDemoUser}
                  className="mt-1.5 text-xs font-semibold text-[#082F6B] hover:underline cursor-pointer"
                >
                  {t("auth.fillDemo")}
                </button>
              </div>
            )}

            {error && (
              <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" isLoading={submitting}>
              {mode === "login" ? t("auth.signIn") : t("auth.createAccount")}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-[#E5E7EB]" />
            <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              {t("auth.or")}
            </span>
            <span className="h-px flex-1 bg-[#E5E7EB]" />
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-xs">
              <GoogleSignInButton onClick={handleGoogle} label={t("auth.google")} />
            </div>
          </div>

          <p className="mt-5 text-center text-sm text-zinc-500">
            {mode === "login" ? (
              <>
                {t("auth.noAccount")}{" "}
                <button
                  type="button"
                  onClick={() => setAuthQuery("signup")}
                  className="font-semibold text-[#082F6B] hover:underline cursor-pointer"
                >
                  {t("auth.signup")}
                </button>
              </>
            ) : (
              <>
                {t("auth.hasAccount")}{" "}
                <button
                  type="button"
                  onClick={() => setAuthQuery("login")}
                  className="font-semibold text-[#082F6B] hover:underline cursor-pointer"
                >
                  {t("auth.login")}
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
