import type { Metadata } from "next";
import AdminReportsView from "@/views/admin/AdminReportsView";

export const metadata: Metadata = { title: "Reports - Kinbo Admin" };

export default function Page() {
  return <AdminReportsView />;
}
