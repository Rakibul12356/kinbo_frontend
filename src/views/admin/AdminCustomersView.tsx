"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Eye, Search, Users, X } from "lucide-react";
import AdminShell from "@/views/admin/AdminShell";
import RouteGuard from "@/components/auth/RouteGuard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useAuth } from "@/hooks/use-auth";
import { adminService } from "@/services/admin.service";
import { formatPrice } from "@/lib/utils";

function CustomersContent() {
  const { ready: authReady, admin } = useAuth();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "customers", page, search],
    queryFn: () =>
      adminService.getCustomers({
        page,
        limit: 10,
        search: search.trim() || undefined,
      }),
    enabled: authReady && Boolean(admin),
  });

  const { data: dossier, isLoading: dossierLoading } = useQuery({
    queryKey: ["admin", "customer", selectedId],
    queryFn: () => adminService.getCustomerDossier(selectedId!),
    enabled: Boolean(selectedId),
  });

  const customers = data?.customers ?? [];
  const meta = data?.meta ?? { total: 0, page: 1, limit: 10 };
  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));

  return (
    <AdminShell
      title="Customers"
      description="Registered customers, lifetime spend, and customer dossier details."
    >
      <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-[#E5E7EB] px-4 py-3 sm:px-5">
          <Users className="h-4 w-4 text-[#082F6B]" />
          <h2 className="text-sm font-bold text-[#1F2937]">All customers</h2>
          <span className="text-xs text-zinc-400">({meta.total})</span>
          <div className="relative ms-auto w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search name, email, phone…"
              className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#082F6B] focus:bg-white focus:ring-2 focus:ring-[#082F6B]/20"
            />
          </div>
        </div>

        {isLoading ? (
          <LoadingSpinner label="Loading customers..." />
        ) : customers.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-semibold text-[#1F2937]">No customers found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-180 text-left text-sm">
                <thead className="bg-[#F8FAFC] text-xs uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Customer</th>
                    <th className="px-4 py-3 font-semibold">Contact</th>
                    <th className="px-4 py-3 font-semibold">Orders</th>
                    <th className="px-4 py-3 font-semibold">Lifetime Spend</th>
                    <th className="px-4 py-3 font-semibold">Last Order</th>
                    <th className="px-4 py-3 font-semibold text-right">Dossier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#1F2937]">{customer.name}</p>
                        <p className="text-[11px] text-zinc-400">
                          Joined {new Date(customer.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-[#1F2937]">{customer.phone || "—"}</p>
                        <p className="text-[11px] text-zinc-400">{customer.email}</p>
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#1F2937]">
                        {customer.totalOrders}
                      </td>
                      <td className="px-4 py-3 font-bold text-[#082F6B]">
                        {formatPrice(customer.lifetimeSpend)}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-500">
                        {customer.lastOrderDate
                          ? new Date(customer.lastOrderDate).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedId(customer.id)}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#082F6B] hover:bg-[#F3F7FC] cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-[#E5E7EB] px-4 py-3 text-xs">
                <span className="text-zinc-500">
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="rounded-lg border border-[#E5E7EB] px-3 py-1.5 font-semibold disabled:opacity-40 cursor-pointer"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-lg border border-[#E5E7EB] px-3 py-1.5 font-semibold disabled:opacity-40 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {selectedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h3 className="text-base font-bold text-[#1F2937]">Customer Dossier</h3>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {dossierLoading ? (
              <LoadingSpinner size="sm" label="Loading customer details..." />
            ) : !dossier ? (
              <p className="text-sm text-zinc-500">Could not load customer dossier.</p>
            ) : (
              <div className="space-y-5 text-sm">
                <div className="grid grid-cols-2 gap-4 rounded-xl bg-[#F8FAFC] p-4">
                  <div>
                    <p className="text-xs text-zinc-500">Customer</p>
                    <p className="font-bold text-[#1F2937]">{dossier.profile.name}</p>
                    <p className="text-xs text-zinc-600">{dossier.profile.email}</p>
                    <p className="text-xs text-zinc-600">{dossier.profile.phone || "—"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-500">Total Spent ({dossier.totalOrders} orders)</p>
                    <p className="text-lg font-extrabold text-[#082F6B]">
                      {formatPrice(dossier.totalSpent)}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500">
                    Addresses ({dossier.addresses.length})
                  </h4>
                  {dossier.addresses.length === 0 ? (
                    <p className="text-xs text-zinc-500">No saved addresses.</p>
                  ) : (
                    <ul className="space-y-2">
                      {dossier.addresses.map((addr) => (
                        <li key={addr.id} className="rounded-xl border border-[#E5E7EB] p-3 text-xs">
                          <p className="font-semibold text-[#1F2937]">{addr.customerName}</p>
                          <p className="text-zinc-600">
                            {addr.streetAddress}, {addr.city} ({addr.deliveryArea})
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500">
                    Orders ({dossier.orders.length})
                  </h4>
                  {dossier.orders.length === 0 ? (
                    <p className="text-xs text-zinc-500">No orders yet.</p>
                  ) : (
                    <ul className="divide-y divide-[#E5E7EB] rounded-xl border border-[#E5E7EB]">
                      {dossier.orders.map((order) => (
                        <li
                          key={order.id}
                          className="flex items-center justify-between px-3 py-2 text-xs"
                        >
                          <span className="font-mono font-semibold text-[#082F6B]">
                            {order.orderNumber || order.id}
                          </span>
                          <span className="text-zinc-500">{order.status}</span>
                          <span className="font-bold text-[#1F2937]">
                            {formatPrice(order.finalOrderAmount)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}

export default function AdminCustomersView() {
  return (
    <RouteGuard step="admin">
      <CustomersContent />
    </RouteGuard>
  );
}
