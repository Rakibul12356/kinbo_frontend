"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Briefcase, MapPin } from "lucide-react";
import PageLayout from "@/components/layout/PageLayout";
import { useJobs } from "@/hooks/use-careers";
import type { JobPosting, JobType } from "@/lib/careers/careers-store";

const TYPE_LABEL: Record<JobType, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
};

function JobCard({ job }: { job: JobPosting }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-2xs">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#1F2937]">{job.title}</h2>
          <p className="mt-1 text-xs text-zinc-500">
            {job.department} · {TYPE_LABEL[job.type]}
          </p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-zinc-500">
            <MapPin className="h-3.5 w-3.5" />
            {job.location}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-xl border border-[#E5E7EB] px-3 py-1.5 text-xs font-semibold text-[#082F6B] hover:bg-[#F3F7FC] cursor-pointer"
        >
          {open ? "Hide details" : "View details"}
        </button>
      </div>
      {open && (
        <div className="mt-4 space-y-3 border-t border-[#E5E7EB] pt-4 text-sm text-zinc-600">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">About the role</p>
            <p className="mt-1 whitespace-pre-wrap">{job.description}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">Requirements</p>
            <p className="mt-1 whitespace-pre-wrap">{job.requirements}</p>
          </div>
          <Link
            href={`/contact?subject=${encodeURIComponent(`Job application: ${job.title}`)}`}
            className="inline-flex rounded-xl bg-[#082F6B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#062452]"
          >
            Apply via Contact
          </Link>
        </div>
      )}
    </li>
  );
}

export default function CareersPage() {
  const jobs = useJobs().filter((job) => job.status === "open");

  return (
    <PageLayout className="bg-[#F8FAFC]">
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-500 sm:text-sm">
          <Link href="/" className="hover:text-[#082F6B] transition-colors">
            Home
          </Link>
          <span className="text-zinc-400">&gt;</span>
          <span className="font-semibold text-zinc-800">Careers</span>
        </div>

        <div className="mx-auto max-w-3xl space-y-6">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-2xs sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#082F6B] text-white">
                <Briefcase className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-2xl font-extrabold text-[#1F2937]">Careers at Kinbo</h1>
                <p className="mt-1 text-sm text-zinc-500">
                  Join the team building ecommerce for Bangladesh.
                </p>
              </div>
            </div>
          </div>

          {jobs.length === 0 ? (
            <div className="rounded-2xl border border-[#E5E7EB] bg-white px-5 py-12 text-center">
              <p className="text-sm font-semibold text-[#1F2937]">No open roles right now</p>
              <p className="mt-1 text-xs text-zinc-500">
                Check back soon, or send your CV through Contact.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </ul>
          )}
        </div>
      </main>
    </PageLayout>
  );
}
