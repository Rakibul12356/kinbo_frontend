import type { Metadata } from "next";
import AdminProductEditView from "@/views/admin/AdminProductEditView";

export const instant = false;
export const metadata: Metadata = { title: "Edit Product - Kinbo Admin" };

export default function Page() {
  return <AdminProductEditView />;
}
