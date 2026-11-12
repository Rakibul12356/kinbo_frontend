"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Users } from "lucide-react";
import AdminShell from "@/views/admin/AdminShell";
import RouteGuard from "@/components/auth/RouteGuard";
import { useOrders } from "@/hooks/use-orders";
import { ADMIN_ROUTES } from "@/lib/auth/auth-store";
import { formatPrice } from "@/lib/utils";

interface CustomerRow {
  key: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  orders: number;
  spent: number;
  lastOrderId: string;
  lastOrderAt: string;
}

function CustomersContent() {
  const { ready, orders } = useOrders();
  const [search, setSearch] = useState("");

  const customers = useMemo(() => {
    const map = new Map<string, CustomerRow>();

    for (const order of orders) {
      const phone = order.shipping.phone.trim();
      const email = order.shipping.email.trim().toLowerCase();
      const key = phone || email || order.shipping.fullName.toLowerCase();
      const existing = map.get(key);
      const countable =
        order.status !== "cancelled" && order.status !== "returned" ? order.total : 0;

      if (!existing) {
        map.set(key, {
          key,
          fullName: order.shipping.fullName,
          phone: order.shipping.phone,
          email: order.shipping.email,
          city: order.shipping.city,
          address: order.shipping.address,
          orders: 1,
          spent: countable,
          lastOrderId: order.id,
          lastOrderAt: order.createdAt,
        });
        continue;
      }

      existing.orders += 1;
      existing.spent += countable;
      if (+new Date(order.createdAt) > +new Date(existing.lastOrderAt)) {
        existing.lastOrderId = order.id;
        existing.lastOrderAt = order.createdAt;
        existing.fullName = order.shipping.fullName;
        existing.phone = order.shipping.phone;
        existing.email = order.shipping.email;
        existing.city = order.shipping.city;
        existing.address = order.shipping.address;
      }
    }

    return [...map.values()].sort((a, b) => b.spent - a.spent);
  }, [orders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (customer) =>
        customer.fullName.toLowerCase().includes(q) ||
        customer.phone.includes(q) ||
        customer.email.toLowerCase().includes(q) ||
        customer.city.toLowerCase().includes(q)
    );
  }, [customers, search]);

  return (
    <AdminShell
      title="Customers"
      description="People who placed orders — contact and spend summary."
    >
      <section className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-[#E5E7EB] px-4 py-3 sm:px-5">
          <Users className="h-4 w-4 text-[#082F6B]" />
          <h2 className="text-sm font-bold text-[#1F2937]">All customers</h2>
          <span className="text-xs text-zinc-400">({filtered.length})</span>
          <div className="relative ms-auto w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone, city…"
              className="w-full rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#082F6B] focus:bg-white focus:ring-2 focus:ring-[#082F6B]/20"
            />
          </div>
        </div>

        {!ready ? (
          <p className="px-4 py-8 text-sm text-zinc-500">Loading customers…</p>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm font-semibold text-[#1F2937]">No customers yet</p>
            <p className="mt-1 text-xs text-zinc-500">Customers appear after checkout orders.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-180 text-left text-sm">
              <thead className="bg-[#F8FAFC] text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  <th className="px-4 py-3 font-semibold">City</th>
                  <th className="px-4 py-3 font-semibold">Orders</th>
                  <th className="px-4 py-3 font-semibold">Spent</th>
                  <th className="px-4 py-3 font-semibold">Last order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filtered.map((customer) => (
                  <tr key={customer.key}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#1F2937]">{customer.fullName}</p>
                      <p className="text-[11px] text-zinc-400 line-clamp-1">{customer.address}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-[#1F2937]">{customer.phone}</p>
                      <p className="text-[11px] text-zinc-400">{customer.email || "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-600">{customer.city}</td>
                    <td className="px-4 py-3 font-semibold text-[#1F2937]">{customer.orders}</td>
                    <td className="px-4 py-3 font-bold text-[#082F6B]">
                      {formatPrice(customer.spent)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={ADMIN_ROUTES.orderDetail(customer.lastOrderId)}
                        className="font-mono text-xs font-semibold text-[#082F6B] hover:underline"
                      >
                        {customer.lastOrderId}
                      </Link>
                      <p className="text-[11px] text-zinc-400">
                        {new Date(customer.lastOrderAt).toLocaleDateString()}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
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
