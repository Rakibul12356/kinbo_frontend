"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import { extractApiError } from "@/lib/axios";
import { supportService } from "@/services/support.service";

function ContactContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const paramSubject = searchParams.get("subject") || "";

  const [submittedTicket, setSubmittedTicket] = useState<{
    ticketNumber: string;
    status: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState<"SUPPORT" | "COMPLAINT">("SUPPORT");
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [emailDraft, setEmailDraft] = useState<string | null>(null);
  const [phoneDraft, setPhoneDraft] = useState<string | null>(null);
  const [orderId, setOrderId] = useState("");
  const [subjectDraft, setSubjectDraft] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const name = nameDraft ?? user?.name ?? "";
  const email = emailDraft ?? user?.email ?? "";
  const phone = phoneDraft ?? user?.phone ?? "";
  const subject = subjectDraft ?? paramSubject;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      toast.error("Please fill all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await supportService.submitTicket({
        type,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        orderId: orderId.trim() || undefined,
        subject: subject.trim(),
        message: message.trim(),
      });
      setSubmittedTicket({
        ticketNumber: result.ticketNumber,
        status: result.status,
      });
      setSubjectDraft("");
      setMessage("");
      setOrderId("");
      toast.success(result.message || "Ticket submitted successfully.");
    } catch (error) {
      toast.error(extractApiError(error, "Could not submit ticket."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto w-full flex-1 px-4 py-10 sm:px-6 sm:py-12">
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
            Send a support request or complaint. Our support team reviews every ticket.
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
            {submittedTicket ? (
              <div className="space-y-4 py-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-[#1F2937]">Ticket submitted</h3>
                <p className="mx-auto max-w-sm text-xs text-zinc-500">
                  Ticket{" "}
                  <span className="font-mono font-semibold">
                    {submittedTicket.ticketNumber}
                  </span>{" "}
                  ({submittedTicket.status}). We will review it shortly.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSubmittedTicket(null)}
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
                      { value: "SUPPORT", label: "Support" },
                      { value: "COMPLAINT", label: "Complaint" },
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
                    placeholder="e.g. Rakibul Hasan"
                    required
                    value={name}
                    onChange={(e) => setNameDraft(e.target.value)}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmailDraft(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Phone (optional)"
                    placeholder="+8801XXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhoneDraft(e.target.value)}
                  />
                  <Input
                    label="Order ID (optional)"
                    placeholder="Order UUID"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                  />
                </div>

                <Input
                  label="Subject"
                  placeholder="Inquiry about order, delivery, product…"
                  required
                  value={subject}
                  onChange={(e) => setSubjectDraft(e.target.value)}
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
      </div>
    </main>
  );
}

export default function ContactPage() {
  return (
    <PageLayout>
      <Suspense
        fallback={
          <main className="mx-auto w-full flex-1 px-4 py-12 text-center text-sm text-zinc-500">
            Loading support page…
          </main>
        }
      >
        <ContactContent />
      </Suspense>
    </PageLayout>
  );
}
