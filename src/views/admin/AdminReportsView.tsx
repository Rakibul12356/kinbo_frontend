"use client";

import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Banknote,
  BarChart3,
  Headphones,
  Package,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import AdminShell from "@/views/admin/AdminShell";
import RouteGuard from "@/components/auth/RouteGuard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import GrowthChart from "@/components/dashboard/GrowthChart";
import StatCard from "@/components/dashboard/StatCard";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useAdminSupportTickets } from "@/hooks/use-support";
import { extractApiError } from "@/lib/axios";
import { adminService } from "@/services/admin.service";
import { supportService } from "@/services/support.service";
import { formatPrice } from "@/lib/utils";

function ReportsContent() {
  const queryClient = useQueryClient();
  const { ready: authReady, admin } = useAuth();

  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ["admin", "analytics", "reports"],
    queryFn: () => adminService.getAnalyticsReports(),
    enabled: authReady && Boolean(admin),
  });

  const { data: chartRes } = useQuery({
    queryKey: ["admin", "analytics", "charts", "1m"],
    queryFn: () => adminService.getAnalyticsCharts("1m"),
    enabled: authReady && Boolean(admin),
  });

  const { data: tickets = [] } = useAdminSupportTickets();

  const [refundTicketId, setRefundTicketId] = useState<string | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [adminRemarks, setAdminRemarks] = useState("");
  const [issuingRefund, setIssuingRefund] = useState(false);

  const statusEntries = Object.entries(reports?.statusCounts ?? {});
  const topProducts = reports?.topProducts ?? [];
  const revenueSeries = (chartRes?.data ?? []).map((p) => ({
    key: p.date,
    label: p.date,
    value: p.sales,
  }));

  const handleIssueRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundTicketId) return;
    const amount = Number(refundAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a valid refund amount.");
      return;
    }

    setIssuingRefund(true);
    try {
      const msg = await supportService.issueRefund(refundTicketId, {
        refundAmount: amount,
        adminRemarks: adminRemarks.trim(),
      });
      toast.success(msg);
      setRefundTicketId(null);
      setRefundAmount("");
      setAdminRemarks("");
      await queryClient.invalidateQueries({ queryKey: ["support", "admin"] });
    } catch (error) {
      toast.error(extractApiError(error, "Could not issue refund."));
    } finally {
      setIssuingRefund(false);
    }
  };

  return (
    <AdminShell
      title="Reports"
      description="Order status breakdown, top products, and support refunds."
    >
      {reportsLoading ? (
        <LoadingSpinner label="Loading reports..." />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Average Order Value"
              value={formatPrice(reports?.averageOrderValue ?? 0)}
              icon={Banknote}
            />
            <StatCard
              label="Cancellation Rate"
              value={reports?.cancellationRate ?? "0%"}
              icon={XCircle}
            />
            <StatCard
              label="Return Rate"
              value={reports?.returnRate ?? "0%"}
              icon={RotateCcw}
            />
            <StatCard
              label="Support Tickets"
              value={String(tickets.length)}
              icon={Headphones}
            />
          </div>

          <GrowthChart
            title="Sales Revenue (Last 30 Days)"
            points={revenueSeries}
            color="#082F6B"
            formatValue={(v) => formatPrice(v)}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-[#E5E7EB] bg-white">
              <div className="flex items-center gap-2 border-b border-[#E5E7EB] px-4 py-3">
                <BarChart3 className="h-4 w-4 text-[#082F6B]" />
                <h2 className="text-sm font-bold text-[#1F2937]">Orders by status</h2>
              </div>
              {statusEntries.length === 0 ? (
                <p className="px-4 py-8 text-sm text-zinc-500">No order status data.</p>
              ) : (
                <ul className="divide-y divide-[#E5E7EB]">
                  {statusEntries.map(([status, count]) => (
                    <li
                      key={status}
                      className="flex items-center justify-between px-4 py-3 text-sm"
                    >
                      <span className="font-medium text-zinc-600">{status}</span>
                      <span className="font-bold text-[#1F2937]">{count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-[#E5E7EB] bg-white">
              <div className="flex items-center gap-2 border-b border-[#E5E7EB] px-4 py-3">
                <Package className="h-4 w-4 text-[#082F6B]" />
                <h2 className="text-sm font-bold text-[#1F2937]">Top products</h2>
              </div>
              {topProducts.length === 0 ? (
                <p className="px-4 py-8 text-sm text-zinc-500">No product sales yet.</p>
              ) : (
                <ul className="divide-y divide-[#E5E7EB]">
                  {topProducts.map((product) => (
                    <li key={product.productId} className="px-4 py-3">
                      <p className="truncate text-sm font-semibold text-[#1F2937]">
                        {product.name}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {product.unitsSold} sold · {formatPrice(product.revenue)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
            <div className="flex items-center gap-2 border-b border-[#E5E7EB] px-4 py-3 sm:px-5">
              <Headphones className="h-4 w-4 text-[#082F6B]" />
              <h2 className="text-sm font-bold text-[#1F2937]">Support & Complaints</h2>
            </div>

            {tickets.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <p className="text-sm font-semibold text-[#1F2937]">No tickets yet</p>
                <p className="mt-1 text-xs text-zinc-500">
                  Customer tickets submitted via Contact appear here.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[#E5E7EB]">
                {tickets.map((ticket) => (
                  <li key={ticket.id} className="px-4 py-4 sm:px-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px] text-zinc-400">
                            {ticket.ticketNumber || ticket.id}
                          </span>
                          <span className="rounded-full bg-[#F3F7FC] px-2 py-0.5 text-[10px] font-bold uppercase text-[#082F6B]">
                            {ticket.type}
                          </span>
                          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase text-zinc-700">
                            {ticket.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm font-bold text-[#1F2937]">{ticket.subject}</p>
                        <p className="mt-1 text-xs text-zinc-600">{ticket.message}</p>
                        <p className="mt-2 text-xs text-zinc-500">
                          {ticket.name} · {ticket.email}
                          {ticket.orderId ? ` · Order ${ticket.orderId}` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRefundTicketId(ticket.id)}
                        className="rounded-xl border border-[#E5E7EB] px-3 py-1.5 text-xs font-semibold text-[#082F6B] hover:bg-[#F3F7FC] cursor-pointer"
                      >
                        Issue Refund
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {refundTicketId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleIssueRefund}
            className="w-full max-w-md space-y-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xl"
          >
            <h3 className="text-base font-bold text-[#1F2937]">Issue Refund</h3>
            <Input
              label="Refund Amount (৳)"
              type="number"
              min="1"
              step="0.01"
              required
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
            />
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-[#1F2937]">
                Admin Remarks
              </label>
              <textarea
                rows={3}
                required
                value={adminRemarks}
                onChange={(e) => setAdminRemarks(e.target.value)}
                placeholder="Reason / remarks for this refund"
                className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#082F6B]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRefundTicketId(null)}
                className="rounded-xl border border-[#E5E7EB] px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-[#F8FAFC] cursor-pointer"
              >
                Cancel
              </button>
              <Button type="submit" size="sm" isLoading={issuingRefund}>
                Record Refund
              </Button>
            </div>
          </form>
        </div>
      )}
    </AdminShell>
  );
}

export default function AdminReportsView() {
  return (
    <RouteGuard step="admin">
      <ReportsContent />
    </RouteGuard>
  );
}
