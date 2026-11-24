import type { Metadata } from "next";
import AdminCategoriesView from "@/views/admin/AdminCategoriesView";

export const metadata: Metadata = { title: "Categories - Kinbo Admin" };

export default function Page() {
  return <AdminCategoriesView />;
}
