import type { Metadata } from "next";
import AdminOrderDetailView from "@/views/admin/AdminOrderDetailView";

export const instant = false;
export const metadata: Metadata = { title: "Order Details - Kinbo Admin" };

export default function Page() {
  return <AdminOrderDetailView />;
}
