import React from "react";
import Link from "next/link";
import PageLayout from "@/components/layout/PageLayout";

export default function SiteContent({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <PageLayout className="bg-[#F8FAFC]">
      <main className="mx-auto w-full  container flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-500 sm:text-sm">
          <Link href="/" className="hover:text-[#082F6B] transition-colors">
            Home
          </Link>
          <span className="text-zinc-400">&gt;</span>
          <span className="font-semibold text-zinc-800">{title}</span>
        </div>
        <article className="mx-auto container rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-2xs sm:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1F2937] sm:text-3xl">
            {title}
          </h1>
          {subtitle ? <p className="mt-2 text-sm text-zinc-500">{subtitle}</p> : null}
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-zinc-600">{children}</div>
        </article>
      </main>
    </PageLayout>
  );
}
