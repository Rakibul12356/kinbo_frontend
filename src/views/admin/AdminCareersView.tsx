"use client";

import React from "react";
import Link from "next/link";
import { Briefcase, ExternalLink } from "lucide-react";
import RouteGuard from "@/components/auth/RouteGuard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useJobs } from "@/hooks/use-careers";
import AdminShell from "@/views/admin/AdminShell";

function CareersContent() {
  const { data: jobs = [], isLoading } = useJobs();

  return (
    <AdminShell
      title="Careers"
      description="Open job postings loaded from the backend API."
      actions={
        <Link
          href="/careers"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-xs font-semibold text-[#082F6B] hover:bg-[#F3F7FC]"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Public Careers Page
        </Link>
      }
    >
      <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E5E7EB] px-4 py-3 sm:px-5">
          <Briefcase className="h-4 w-4 text-[#082F6B]" />
          <h2 className="text-sm font-bold text-[#1F2937]">Open Job Postings</h2>
          <span className="text-xs text-zinc-400">({jobs.length})</span>
        </div>

        {isLoading ? (
          <LoadingSpinner label="Loading jobs..." />
        ) : jobs.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-semibold text-[#1F2937]">No open positions</p>
            <p className="mt-1 text-xs text-zinc-500">
              Open jobs returned by GET /jobs appear here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[#E5E7EB]">
            {jobs.map((job) => (
              <li key={job.id} className="px-4 py-4 sm:px-5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold text-[#1F2937]">{job.title}</p>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                    {job.type.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {job.department} · {job.location}
                </p>
                <p className="mt-2 text-xs text-zinc-600">{job.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminShell>
  );
}

export default function AdminCareersView() {
  return (
    <RouteGuard step="admin">
      <CareersContent />
    </RouteGuard>
  );
}
