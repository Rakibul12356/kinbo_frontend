"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Headphones,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
} from "lucide-react";
import { toast } from "react-toastify";
import PageLayout from "@/components/layout/PageLayout";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useSupportTickets } from "@/hooks/use-support";
import {
  submitSupportTicket,
  type SupportTicketStatus,
  type SupportTicketType,
} from "@/lib/support/support-store";

const STATUS_STYLE: Record<SupportTicketStatus, string> = {
  open: "bg-amber-50 text-amber-700",
  in_progress: "bg-sky-50 text-sky-700",
  resolved: "bg-emerald-50 text-emerald-700",
};

const STATUS_LABEL: Record<SupportTicketStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  resolved: "Resolved",
};

export default function ContactPage() {
  const { user } = useAuth();
  const tickets = useSupportTickets();
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState<SupportTicketType>("support");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [orderId, setOrderId] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;
    setName((current) => current || user.fullName);
    setEmail((current) => current || user.email);
  }, [user]);

  const myTickets = useMemo(() => {
    if (user) {
      return tickets.filter(
        (ticket) => ticket.userId === user.id || ticket.email === user.email
      );
    }
    if (!email.trim()) return [];
    return tickets.filter(
      (ticket) => ticket.email.toLowerCase() === email.trim().toLowerCase()
    );
  }, [tickets, user, email]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    const result = submitSupportTicket({
      type,
      name: name || user?.fullName || "",
      email: email || user?.email || "",
      phone,
      subject,
      message,
      orderId,
      userId: user?.id,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    setSubmittedId(result.ticket.id);
    setSubject("");
    setMessage("");
    setOrderId("");
    toast.success("Your message was sent. Admin can see it on Reports.");
  };

  return (
    <PageLayout>
      <main className="mx-auto w-full  flex-1 px-4 py-10 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-7xl space-y-10">
          <div className="space-y-3 text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#082F6B]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#082F6B]">
              <MessageSquare className="h-3.5 w-3.5 text-[#FF6B00]" />
              <span>Support & Complaints</span>
            </div>
            <h1 className="text-3xl font-extrabold text-[#1F2937] sm:text-4xl">
              Get help from Kinbo
            </h1>
            <p className="mx-auto max-w-lg text-sm text-zinc-500">
              Send a support request or complaint. Our team reviews every ticket from the
              admin Reports page.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="space-y-4">
              <div className="space-y-2 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-2xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#082F6B]/10 text-[#082F6B]">
                  <Mail className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-[#1F2937]">Email Us</h3>
                <p className="text-xs text-zinc-500">support@kinbo.com</p>
              </div>
              <div className="space-y-2 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-2xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF6B00]/10 text-[#FF6B00]">
                  <Phone className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-[#1F2937]">Call Us</h3>
                <p className="text-xs text-zinc-500">+880 1700-000000</p>
              </div>
              <div className="space-y-2 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-2xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-[#1F2937]">Headquarters</h3>
                <p className="text-xs text-zinc-500">Gulshan-2, Dhaka 1212</p>
              </div>
            </div>

            <div className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-xs sm:p-8 md:col-span-2">
              {submittedId ? (
                <div className="space-y-4 py-10 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1F2937]">Ticket submitted</h3>
                  <p className="mx-auto max-w-sm text-xs text-zinc-500">
                    Reference <span className="font-mono font-semibold">{submittedId}</span>.
                    We will review it shortly.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSubmittedId(null)}
                    className="mt-2 text-xs"
                  >
                    Send another
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="mb-1 flex items-center gap-2">
                    <Headphones className="h-5 w-5 text-[#082F6B]" />
                    <h3 className="text-lg font-bold text-[#1F2937]">Submit a ticket</h3>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        { value: "support", label: "Support" },
                        { value: "complaint", label: "Complaint" },
                      ] as const
                    ).map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setType(option.value)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                          type === option.value
                            ? "bg-[#082F6B] text-white"
                            : "border border-[#E5E7EB] text-zinc-600 hover:bg-[#F3F7FC]"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                      label="Your Name"
                      placeholder="e.g. John Doe"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="john@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                      label="Phone (optional)"
                      placeholder="01XXXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <Input
                      label="Order ID (optional)"
                      placeholder="e.g. ORD-…"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                    />
                  </div>

                  <Input
                    label="Subject"
                    placeholder="Inquiry about order, delivery, product…"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#1F2937]">
                      Message
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your issue clearly…"
                      className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm text-[#1F2937] placeholder:text-zinc-400 focus:border-[#082F6B] focus:outline-none focus:ring-2 focus:ring-[#082F6B]/20"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    className="w-full px-8 sm:w-auto"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    <span>Submit ticket</span>
                  </Button>
                </form>
              )}
            </div>
          </div>

          {myTickets.length > 0 && (
            <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
              <div className="border-b border-[#E5E7EB] px-4 py-3 sm:px-5">
                <h2 className="text-sm font-bold text-[#1F2937]">Your recent tickets</h2>
              </div>
              <ul className="divide-y divide-[#E5E7EB]">
                {myTickets.slice(0, 8).map((ticket) => (
                  <li key={ticket.id} className="px-4 py-3 sm:px-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] text-zinc-400">{ticket.id}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          ticket.type === "complaint"
                            ? "bg-rose-50 text-rose-700"
                            : "bg-[#F3F7FC] text-[#082F6B]"
                        }`}
                      >
                        {ticket.type}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLE[ticket.status]}`}
                      >
                        {STATUS_LABEL[ticket.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-[#1F2937]">{ticket.subject}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500">{ticket.message}</p>
                    <p className="mt-1 text-[11px] text-zinc-400">
                      {new Date(ticket.createdAt).toLocaleString()}
                      {ticket.orderId ? ` · Order ${ticket.orderId}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
              {!user && (
                <p className="border-t border-[#E5E7EB] px-4 py-3 text-xs text-zinc-500 sm:px-5">
                  <Link href="/?auth=login" className="font-semibold text-[#082F6B] hover:underline">
                    Sign in
                  </Link>{" "}
                  to keep your tickets tied to your account.
                </p>
              )}
            </section>
          )}
        </div>
      </main>
    </PageLayout>
  );
}
