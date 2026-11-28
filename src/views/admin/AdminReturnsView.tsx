"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import RouteGuard from "@/components/auth/RouteGuard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useAdminReturns } from "@/hooks/use-returns";
import { ADMIN_ROUTES } from "@/lib/auth/auth-store";
import { extractApiError } from "@/lib/axios";
import { returnsService } from "@/services/returns.service";
import { formatPrice } from "@/lib/utils";
import type { AdminReturnRequest, ReturnRequestStatus } from "@/types/ecommerce";
import AdminShell from "./AdminShell";

const PAGE_SIZE = 15;

const FILTERS: { value: ReturnRequestStatus | "all"; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "all", label: "All" },
];

function statusClass(status: ReturnRequestStatus) {
  switch (status) {
    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "APPROVED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "REJECTED":
      return "bg-rose-50 text-rose-700 border-rose-200";
  }
}

function ReturnsContent() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<ReturnRequestStatus | "all">("PENDING");
  const [page, setPage] = useState(1);
  const [active, setActive] = useState<AdminReturnRequest | null>(null);
  const [decision, setDecision] = useState<"APPROVED" | "REJECTED" | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useAdminReturns({
    status: filter,
    page,
    limit: PAGE_SIZE,
  });

  const returns = data?.returns ?? [];
  const meta = data?.meta;
  const totalPages = Math.max(1, meta?.totalPages ?? 1);

  const openProcess = (item: AdminReturnRequest, next: "APPROVED" | "REJECTED") => {
    setActive(item);
    setDecision(next);
    setAdminNote("");
    setRefundAmount(
      next === "APPROVED" && item.order?.finalOrderAmount
        ? String(item.order.finalOrderAmount)
        : ""
    );
  };

  const closeProcess = () => {
    setActive(null);
    setDecision(null);
    setAdminNote("");
    setRefundAmount("");
  };

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!active || !decision) return;

    const refund =
      decision === "APPROVED" && refundAmount.trim()
        ? Number(refundAmount)
        : undefined;
    if (
      decision === "APPROVED" &&
      refundAmount.trim() &&
      (!Number.isFinite(refund) || (refund ?? 0) < 0)
    ) {
      toast.error("Enter a valid refund amount.");
      return;
    }

    setSaving(true);
    try {
      const result = await returnsService.processReturn(active.id, {
        status: decision,
        adminNote: adminNote.trim() || undefined,
        refundAmount: refund,
      });
      toast.success(result.message);
      closeProcess();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "returns"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] }),
        queryClient.invalidateQueries({ queryKey: ["orders"] }),
      ]);
    } catch (error) {
      toast.error(extractApiError(error, "Could not process return request."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      title="Returns"
      description="Review customer return requests — approve or reject within the 3-day window."
    >
      <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E5E7EB] px-4 py-3">
          <RotateCcw className="h-4 w-4 text-orange-600" />
          <h2 className="text-sm font-bold text-[#1F2937]">Return requests</h2>
          {meta && (
            <span className="text-xs text-zinc-400">({meta.total})</span>
          )}
          <div className="ms-auto flex flex-wrap gap-1">
            {FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  setFilter(item.value);
                  setPage(1);
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold cursor-pointer transition ${
                  filter === item.value
                    ? "bg-[#082F6B] text-white"
                    : "text-zinc-600 hover:bg-[#F3F7FC]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner label="Loading return requests..." />
        ) : returns.length === 0 ? (
          <div className="space-y-2 px-4 py-10 text-center">
            <p className="text-sm font-semibold text-[#1F2937]">No return requests</p>
            <p className="text-xs text-zinc-500">
              Customer return requests for delivered orders appear here.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-220 text-left text-sm">
                <thead className="bg-[#F8FAFC] text-xs uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Order</th>
                    <th className="px-4 py-3 font-semibold">Customer</th>
                    <th className="px-4 py-3 font-semibold">Reason</th>
                    <th className="px-4 py-3 font-semibold">Amount</th>
                    <th className="px-4 py-3 font-semibold">Requested</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-end">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {returns.map((item) => (
                    <tr key={item.id} className="align-top hover:bg-[#F8FAFC]/70">
                      <td className="px-4 py-3">
                        <Link
                          href={
                            item.orderId
                              ? ADMIN_ROUTES.orderDetail(item.orderId)
                              : ADMIN_ROUTES.orders
                          }
                          className="font-semibold text-[#082F6B] hover:underline"
                        >
                          {item.order?.orderNumber || item.orderId.slice(0, 8)}
                        </Link>
                        {item.order?.deliveredAt && (
                          <p className="mt-0.5 text-[11px] text-zinc-400">
                            Delivered{" "}
                            {new Date(item.order.deliveredAt).toLocaleDateString()}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#1F2937]">
                          {item.user?.name || "Customer"}
                        </p>
                        <p className="text-xs text-zinc-500">{item.user?.email}</p>
                        {item.user?.phone && (
                          <p className="text-xs text-zinc-400">{item.user.phone}</p>
                        )}
                      </td>
                      <td className="max-w-56 px-4 py-3 text-zinc-600">
                        <p className="line-clamp-3 text-xs">{item.reason}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#1F2937]">
                        {formatPrice(item.order?.finalOrderAmount ?? 0)}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-500">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusClass(item.status)}`}
                        >
                          {item.status}
                        </span>
                        {item.adminNote && (
                          <p className="mt-1 max-w-40 text-[11px] text-zinc-400 line-clamp-2">
                            {item.adminNote}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {item.status === "PENDING" ? (
                          <div className="flex flex-wrap justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openProcess(item, "APPROVED")}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-700 cursor-pointer"
                            >
                              <Check className="h-3 w-3" />
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => openProcess(item, "REJECTED")}
                              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
                            >
                              <X className="h-3 w-3" />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <p className="text-end text-[11px] text-zinc-400">
                            {item.refundAmount != null
                              ? `Refund ${formatPrice(item.refundAmount)}`
                              : "Processed"}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[#E5E7EB] px-4 py-3">
                <p className="text-xs text-zinc-500">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-lg border border-[#E5E7EB] p-1.5 text-zinc-600 hover:bg-[#F3F7FC] disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded-lg border border-[#E5E7EB] p-1.5 text-zinc-600 hover:bg-[#F3F7FC] disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {active && decision && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <form
            onSubmit={handleProcess}
            className="w-full max-w-md space-y-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xl"
          >
            <div>
              <h3 className="text-base font-bold text-[#1F2937]">
                {decision === "APPROVED" ? "Approve return" : "Reject return"}
              </h3>
              <p className="mt-0.5 text-xs text-zinc-500">
                {active.order?.orderNumber || active.orderId} · {active.user?.name}
              </p>
            </div>
            <p className="rounded-xl bg-[#F8FAFC] px-3 py-2 text-xs text-zinc-600">
              {active.reason}
            </p>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#1F2937]">
                Admin note (optional)
              </label>
              <textarea
                rows={3}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder={
                  decision === "APPROVED"
                    ? "Pickup scheduled. Full refund approved."
                    : "Reason for rejection..."
                }
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm outline-none focus:border-[#082F6B] focus:ring-2 focus:ring-[#082F6B]/20"
              />
            </div>
            {decision === "APPROVED" && (
              <Input
                label="Refund amount (optional)"
                type="number"
                min="0"
                step="1"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="3500"
              />
            )}
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={closeProcess}
                className="rounded-xl border border-[#E5E7EB] px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-[#F8FAFC] cursor-pointer"
              >
                Cancel
              </button>
              <Button
                type="submit"
                size="sm"
                isLoading={saving}
                className={
                  decision === "APPROVED"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }
              >
                {decision === "APPROVED" ? "Approve" : "Reject"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </AdminShell>
  );
}

export default function AdminReturnsView() {
  return (
    <RouteGuard step="admin">
      <ReturnsContent />
    </RouteGuard>
  );
}
