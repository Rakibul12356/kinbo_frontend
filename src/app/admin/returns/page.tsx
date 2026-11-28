import type { Metadata } from "next";
import AdminReturnsView from "@/views/admin/AdminReturnsView";

export const metadata: Metadata = { title: "Returns - Kinbo Admin" };

export default function Page() {
  return <AdminReturnsView />;
}
