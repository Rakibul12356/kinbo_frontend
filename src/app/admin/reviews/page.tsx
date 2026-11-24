import type { Metadata } from "next";
import AdminReviewsView from "@/views/admin/AdminReviewsView";

export const metadata: Metadata = { title: "Reviews - Kinbo Admin" };

export default function Page() {
  return <AdminReviewsView />;
}
