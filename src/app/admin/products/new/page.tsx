import type { Metadata } from "next";
import AdminProductNewView from "@/views/admin/AdminProductNewView";

export const metadata: Metadata = { title: "Add Product - Kinbo Admin" };

export default function Page() {
  return <AdminProductNewView />;
}
