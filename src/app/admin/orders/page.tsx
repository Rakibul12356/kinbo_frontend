import type { Metadata } from "next";
import AdminOrdersView from "@/views/admin/AdminOrdersView";

export const metadata: Metadata = { title: "Orders - Kinbo Admin" };

export default function Page() {
  return <AdminOrdersView />;
}
