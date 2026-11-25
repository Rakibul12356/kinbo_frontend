import type { Metadata } from "next";
import AdminCareersView from "@/views/admin/AdminCareersView";

export const metadata: Metadata = { title: "Careers - Kinbo Admin" };

export default function Page() {
  return <AdminCareersView />;
}
