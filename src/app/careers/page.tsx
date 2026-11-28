"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Briefcase, MapPin } from "lucide-react";
import { toast } from "react-toastify";
import PageLayout from "@/components/layout/PageLayout";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { ResumeUpload } from "@/components/ui/MediaUpload";
import { useJobs } from "@/hooks/use-careers";
import { extractApiError } from "@/lib/axios";
import { careersService } from "@/services/careers.service";
import type { JobPosting } from "@/types/ecommerce";

function JobCard({
  job,
  onApply,
}: {
  job: JobPosting;
  onApply: (job: JobPosting) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <li className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-2xs">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#1F2937]">{job.title}</h2>
          <p className="mt-1 text-xs text-zinc-500">
            {job.department} · {job.type.replace(/_/g, " ")}
          </p>
          <p className="mt-1 inline-flex items-center gap-1 text-xs text-zinc-500">
            <MapPin className="h-3.5 w-3.5" />
            {job.location}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-xl border border-[#E5E7EB] px-3 py-1.5 text-xs font-semibold text-[#082F6B] hover:bg-[#F3F7FC] cursor-pointer"
          >
            {open ? "Hide details" : "View details"}
          </button>
          <button
            type="button"
            onClick={() => onApply(job)}
            className="rounded-xl bg-[#082F6B] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#062452] cursor-pointer"
          >
            Apply
          </button>
        </div>
      </div>
      {open && (
        <div className="mt-4 space-y-3 border-t border-[#E5E7EB] pt-4 text-sm text-zinc-600">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
              About the role
            </p>
            <p className="mt-1 whitespace-pre-wrap">{job.description}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
              Requirements
            </p>
            <p className="mt-1 whitespace-pre-wrap">{job.requirements}</p>
          </div>
        </div>
      )}
    </li>
  );
}

export default function CareersPage() {
  const { data: jobs = [], isLoading } = useJobs();
  const [applyingJob, setApplyingJob] = useState<JobPosting | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    resumeUrl: "",
    coverLetter: "",
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | undefined>();

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingJob) return;
    if (!resumeFile && !form.resumeUrl.trim()) {
      setResumeError("Upload a resume file or paste a resume URL.");
      return;
    }
    setResumeError(undefined);
    setSubmitting(true);
    try {
      const msg = await careersService.applyJob(applyingJob.id, {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        resumeFile,
        resumeUrl: resumeFile ? undefined : form.resumeUrl.trim(),
        coverLetter: form.coverLetter.trim(),
      });
      toast.success(msg);
      setApplyingJob(null);
      setResumeFile(null);
      setForm({ fullName: "", email: "", phone: "", resumeUrl: "", coverLetter: "" });
    } catch (error) {
      toast.error(extractApiError(error, "Could not submit application."));
    } finally {
      setSubmitting(false);
    }
  };

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

          {isLoading ? (
            <LoadingSpinner label="Loading open positions..." />
          ) : jobs.length === 0 ? (
            <div className="rounded-2xl border border-[#E5E7EB] bg-white px-5 py-12 text-center">
              <p className="text-sm font-semibold text-[#1F2937]">No open roles right now</p>
              <p className="mt-1 text-xs text-zinc-500">
                Check back soon, or reach out through Contact.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} onApply={setApplyingJob} />
              ))}
            </ul>
          )}
        </div>
      </main>

      {applyingJob && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <form
            onSubmit={handleApply}
            className="w-full max-w-lg space-y-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xl sm:p-6"
          >
            <div>
              <h3 className="text-base font-bold text-[#1F2937]">
                Apply for {applyingJob.title}
              </h3>
              <p className="mt-0.5 text-xs text-zinc-500">
                {applyingJob.department} · {applyingJob.location}
              </p>
            </div>
            <Input
              label="Full Name"
              required
              value={form.fullName}
              onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="Email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
              <Input
                label="Phone"
                required
                placeholder="+8801XXXXXXXXX"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <ResumeUpload
              file={resumeFile}
              onFileChange={(file: File | null) => {
                setResumeFile(file);
                setResumeError(undefined);
              }}
              url={form.resumeUrl}
              onUrlChange={(resumeUrl: string) => {
                setForm((f) => ({ ...f, resumeUrl }));
                setResumeError(undefined);
              }}
              error={resumeError}
            />
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#1F2937]">
                Cover Letter
              </label>
              <textarea
                rows={4}
                required
                value={form.coverLetter}
                onChange={(e) => setForm((f) => ({ ...f, coverLetter: e.target.value }))}
                placeholder="Tell us why you're a great fit..."
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#082F6B]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setApplyingJob(null)}
                className="rounded-xl border border-[#E5E7EB] px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-[#F8FAFC] cursor-pointer"
              >
                Cancel
              </button>
              <Button type="submit" size="sm" isLoading={submitting}>
                Submit Application
              </Button>
            </div>
          </form>
        </div>
      )}
    </PageLayout>
  );
}
