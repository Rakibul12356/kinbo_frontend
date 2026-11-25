"use client";

/**
 * Admin-managed job postings for /careers (localStorage).
 * shortcut: no applicant inbox yet — wire apply API when backend exists
 */

export type JobStatus = "open" | "closed";
export type JobType = "full-time" | "part-time" | "contract" | "internship";

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: JobType;
  description: string;
  requirements: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "kinbo_careers_jobs";
const STORAGE_VERSION = 1;
const EMPTY: JobPosting[] = [];

let cache: JobPosting[] | null = null;
let sortedSnapshot: JobPosting[] | null = null;
const listeners = new Set<() => void>();

function seedJobs(): JobPosting[] {
  // Fixed timestamps — new Date() breaks Next prerender for Client Components.
  const seededAt = "2026-01-15T10:00:00.000Z";
  return [
    {
      id: "job-ops-1",
      title: "Operations Associate",
      department: "Operations",
      location: "Dhaka",
      type: "full-time",
      description:
        "Coordinate warehouse picks, packing quality, and last-mile handoff with courier partners.",
      requirements: "1+ year ops experience, strong Bangla/English, comfort with spreadsheets.",
      status: "open",
      createdAt: seededAt,
      updatedAt: seededAt,
    },
    {
      id: "job-cs-1",
      title: "Customer Support Specialist",
      department: "Support",
      location: "Dhaka / Remote",
      type: "full-time",
      description:
        "Handle order questions, complaints, and returns with empathy across chat and tickets.",
      requirements: "Clear written communication, patience, retail or BPO experience preferred.",
      status: "open",
      createdAt: seededAt,
      updatedAt: seededAt,
    },
  ];
}

function load(): JobPosting[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedJobs();
    const parsed = JSON.parse(raw) as { version?: number; jobs?: JobPosting[] };
    if (parsed.version === STORAGE_VERSION && Array.isArray(parsed.jobs)) {
      return parsed.jobs;
    }
  } catch {
    // ignore
  }
  return seedJobs();
}

function rebuildSnapshot(jobs: JobPosting[]) {
  sortedSnapshot = [...jobs].sort(
    (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)
  );
}

function persist(jobs: JobPosting[]) {
  cache = jobs;
  rebuildSnapshot(jobs);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, jobs }));
  } catch {
    // keep memory
  }
  listeners.forEach((listener) => listener());
}

function getAll(): JobPosting[] {
  if (typeof window === "undefined") return EMPTY;
  if (!cache) {
    cache = load();
    rebuildSnapshot(cache);
  }
  return cache;
}

export function subscribeCareers(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      cache = load();
      rebuildSnapshot(cache);
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function listJobs(): JobPosting[] {
  getAll();
  return sortedSnapshot ?? EMPTY;
}

export function getServerJobs(): JobPosting[] {
  return seedJobs();
}

export function listOpenJobs(): JobPosting[] {
  return listJobs().filter((job) => job.status === "open");
}

export type JobInput = {
  title: string;
  department: string;
  location: string;
  type: JobType;
  description: string;
  requirements: string;
  status: JobStatus;
};

export function createJob(input: JobInput): JobPosting {
  const now = new Date().toISOString();
  const job: JobPosting = {
    id: `job-${Date.now()}`,
    title: input.title.trim(),
    department: input.department.trim(),
    location: input.location.trim(),
    type: input.type,
    description: input.description.trim(),
    requirements: input.requirements.trim(),
    status: input.status,
    createdAt: now,
    updatedAt: now,
  };
  persist([job, ...getAll()]);
  return job;
}

export function updateJob(id: string, input: JobInput): JobPosting | null {
  const jobs = getAll();
  const index = jobs.findIndex((job) => job.id === id);
  if (index < 0) return null;
  const next: JobPosting = {
    ...jobs[index],
    title: input.title.trim(),
    department: input.department.trim(),
    location: input.location.trim(),
    type: input.type,
    description: input.description.trim(),
    requirements: input.requirements.trim(),
    status: input.status,
    updatedAt: new Date().toISOString(),
  };
  const copy = [...jobs];
  copy[index] = next;
  persist(copy);
  return next;
}

export function deleteJob(id: string) {
  persist(getAll().filter((job) => job.id !== id));
}
