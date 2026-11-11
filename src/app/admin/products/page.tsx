import type { Metadata } from "next";
import AdminProductsView from "@/views/admin/AdminProductsView";

export const metadata: Metadata = { title: "Products - Kinbo Admin" };

export default function Page() {
  return <AdminProductsView />;
}
