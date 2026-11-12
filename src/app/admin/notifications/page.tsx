import type { Metadata } from "next";
import AdminNotificationsView from "@/views/admin/AdminNotificationsView";

export const metadata: Metadata = { title: "Notifications - Kinbo Admin" };

export default function Page() {
  return <AdminNotificationsView />;
}
