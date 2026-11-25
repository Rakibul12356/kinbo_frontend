"use client";

import React, { useMemo, useState } from "react";
import { Briefcase, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import RouteGuard from "@/components/auth/RouteGuard";
import { useJobs } from "@/hooks/use-careers";
import {
  createJob,
  deleteJob,
  updateJob,
  type JobInput,
  type JobPosting,
  type JobStatus,
  type JobType,
} from "@/lib/careers/careers-store";
import AdminShell from "@/views/admin/AdminShell";

const EMPTY_FORM: JobInput = {
  title: "",
  department: "",
  location: "Dhaka",
  type: "full-time",
  description: "",
  requirements: "",
  status: "open",
};

const TYPE_LABEL: Record<JobType, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
};

function CareersContent() {
  const jobs = useJobs();
  const [filter, setFilter] = useState<"all" | JobStatus>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<JobPosting | null>(null);
  const [form, setForm] = useState<JobInput>(EMPTY_FORM);

  const filtered = useMemo(() => {
    if (filter === "all") return jobs;
    return jobs.filter((job) => job.status === filter);
  }, [jobs, filter]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (job: JobPosting) => {
    setEditing(job);
    setForm({
      title: job.title,
      department: job.department,
      location: job.location,
      type: job.type,
      description: job.description,
      requirements: job.requirements,
      status: job.status,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title.trim() || !form.department.trim() || !form.description.trim()) {
      toast.error("Title, department and description are required.");
      return;
    }
    if (editing) {
      updateJob(editing.id, form);
      toast.success("Job updated.");
    } else {
      createJob(form);
      toast.success("Job published.");
    }
    closeModal();
  };

  const handleDelete = async (job: JobPosting) => {
    const result = await Swal.fire({
      title: "Delete job?",
      text: `Remove “${job.title}” from careers?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#FF6B00",
      cancelButtonColor: "#082F6B",
      reverseButtons: true,
      focusCancel: true,
    });
    if (!result.isConfirmed) return;
    deleteJob(job.id);
    toast.success("Job deleted.");
  };

  return (
    <AdminShell
      title="Careers"
      description="Create and manage job openings shown on the public Careers page."
      actions={
        <Button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Add job
        </Button>
      }
    >
      <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E5E7EB] px-4 py-3 sm:px-5">
          <Briefcase className="h-4 w-4 text-[#082F6B]" />
          <h2 className="text-sm font-bold text-[#1F2937]">Job openings</h2>
          <span className="text-xs text-zinc-400">({filtered.length})</span>
          <div className="ms-auto flex gap-1">
            {(["all", "open", "closed"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize cursor-pointer ${
                  filter === value
                    ? "bg-[#082F6B] text-white"
                    : "border border-[#E5E7EB] text-zinc-600 hover:bg-[#F3F7FC]"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-semibold text-[#1F2937]">No jobs here</p>
            <p className="mt-1 text-xs text-zinc-500">Add a role to show it on /careers.</p>
          </div>
        ) : (
          <ul className="divide-y divide-[#E5E7EB]">
            {filtered.map((job) => (
              <li
                key={job.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-[#1F2937]">{job.title}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        job.status === "open"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {job.department} · {TYPE_LABEL[job.type]} · {job.location}
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs text-zinc-600">{job.description}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(job)}
                    className="rounded-lg p-2 text-zinc-500 hover:bg-[#F8FAFC] cursor-pointer"
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(job)}
                    className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <form
            onSubmit={handleSave}
            className="max-h-[90vh] w-full max-w-lg space-y-3 overflow-y-auto rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xl"
          >
            <h3 className="text-base font-bold text-[#1F2937]">
              {editing ? "Edit job" : "Create job"}
            </h3>
            <Input
              label="Job title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                label="Department"
                value={form.department}
                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
                required
              />
              <Input
                label="Location"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#1F2937]">Type</label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, type: e.target.value as JobType }))
                  }
                  className="w-full cursor-pointer rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#082F6B] focus:ring-2 focus:ring-[#082F6B]/20"
                >
                  {(Object.keys(TYPE_LABEL) as JobType[]).map((type) => (
                    <option key={type} value={type}>
                      {TYPE_LABEL[type]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-[#1F2937]">Status</label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value as JobStatus }))
                  }
                  className="w-full cursor-pointer rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#082F6B] focus:ring-2 focus:ring-[#082F6B]/20"
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#1F2937]">
                Description
              </label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#082F6B] focus:ring-2 focus:ring-[#082F6B]/20"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#1F2937]">
                Requirements
              </label>
              <textarea
                rows={3}
                value={form.requirements}
                onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))}
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#082F6B] focus:ring-2 focus:ring-[#082F6B]/20"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-[#E5E7EB] px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-[#F8FAFC] cursor-pointer"
              >
                Cancel
              </button>
              <Button type="submit" size="sm">
                {editing ? "Save changes" : "Create job"}
              </Button>
            </div>
          </form>
        </div>
      )}
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
