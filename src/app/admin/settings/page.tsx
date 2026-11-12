import type { Metadata } from "next";
import AdminSettingsView from "@/views/admin/AdminSettingsView";

export const metadata: Metadata = { title: "Settings - Kinbo Admin" };

export default function Page() {
  return <AdminSettingsView />;
}
