import type { Metadata } from "next";
import AdminCustomersView from "@/views/admin/AdminCustomersView";

export const metadata: Metadata = { title: "Customers - Kinbo Admin" };

export default function Page() {
  return <AdminCustomersView />;
}
