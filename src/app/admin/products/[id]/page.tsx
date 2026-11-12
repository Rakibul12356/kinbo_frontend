import type { Metadata } from "next";
import AdminProductDetailView from "@/views/admin/AdminProductDetailView";

export const metadata: Metadata = { title: "Product Details - Kinbo Admin" };

export default function Page() {
  return <AdminProductDetailView />;
}
