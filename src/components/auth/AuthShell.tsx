"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F3F7FC] px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,#082F6B14,transparent_55%),radial-gradient(ellipse_at_bottom_right,#FF6B0012,transparent_45%)]"
      />
      <div className="relative w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <Link href="/" aria-label="Kinbo home" className="inline-flex rounded-2xl bg-white px-4 py-3 shadow-sm">
            <Image
              src="/images/logo-trimmed.png"
              alt="Kinbo"
              width={131}
              height={36}
              className="h-8 w-auto"
              style={{ width: "auto" }}
              priority
            />
          </Link>
          <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-[#1F2937] sm:text-[28px]">
            {title}
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500">{subtitle}</p>
        </div>

        <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-sm sm:p-7">
          {children}
        </div>
      </div>
    </div>
  );
}
