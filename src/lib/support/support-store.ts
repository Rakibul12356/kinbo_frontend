"use client";

/**
 * Frontend-only support / complaint tickets (localStorage).
 * shortcut: no email notify — wire API + Nodemailer when backend exists
 */

export type SupportTicketType = "support" | "complaint";
export type SupportTicketStatus = "open" | "in_progress" | "resolved";

export interface SupportTicket {
  id: string;
  type: SupportTicketType;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  orderId?: string;
  userId?: string;
  status: SupportTicketStatus;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "kinbo_support_tickets";
const STORAGE_VERSION = 1;
const EMPTY: SupportTicket[] = [];

let cache: SupportTicket[] | null = null;
let sortedSnapshot: SupportTicket[] | null = null;
const listeners = new Set<() => void>();

function load(): SupportTicket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { version?: number; tickets?: SupportTicket[] };
    if (parsed.version === STORAGE_VERSION && Array.isArray(parsed.tickets)) {
      return parsed.tickets;
    }
  } catch {
    // ignore corrupt data
  }
  return [];
}

function rebuildSnapshot(tickets: SupportTicket[]) {
  sortedSnapshot = [...tickets].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
  );
}

function persist(tickets: SupportTicket[]) {
  cache = tickets;
  rebuildSnapshot(tickets);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, tickets }));
  } catch {
    // keep memory if storage full
  }
  listeners.forEach((listener) => listener());
}

function getAll(): SupportTicket[] {
  if (typeof window === "undefined") return EMPTY;
  if (!cache) {
    cache = load();
    rebuildSnapshot(cache);
  }
  return cache;
}

export function subscribeSupport(listener: () => void) {
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

export function listSupportTickets(): SupportTicket[] {
  getAll();
  return sortedSnapshot ?? EMPTY;
}

export function getServerSupportTickets(): SupportTicket[] {
  return EMPTY;
}

export function submitSupportTicket(input: {
  type: SupportTicketType;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  orderId?: string;
  userId?: string;
}): { ok: true; ticket: SupportTicket } | { ok: false; error: string } {
  const name = input.name.trim();
  const email = input.email.trim();
  const subject = input.subject.trim();
  const message = input.message.trim();

  if (!name) return { ok: false, error: "Name is required." };
  if (!email || !email.includes("@")) return { ok: false, error: "Enter a valid email." };
  if (!subject) return { ok: false, error: "Subject is required." };
  if (message.length < 10) return { ok: false, error: "Message must be at least 10 characters." };

  const now = new Date().toISOString();
  const ticket: SupportTicket = {
    id: `tkt-${Date.now()}`,
    type: input.type,
    name,
    email,
    phone: input.phone?.trim() || "",
    subject,
    message,
    orderId: input.orderId?.trim() || undefined,
    userId: input.userId,
    status: "open",
    createdAt: now,
    updatedAt: now,
  };

  persist([ticket, ...getAll()]);
  return { ok: true, ticket };
}

export function updateSupportTicketStatus(id: string, status: SupportTicketStatus) {
  persist(
    getAll().map((ticket) =>
      ticket.id === id
        ? { ...ticket, status, updatedAt: new Date().toISOString() }
        : ticket
    )
  );
}
