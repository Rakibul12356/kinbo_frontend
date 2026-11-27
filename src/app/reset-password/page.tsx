import { Suspense } from "react";
import type { Metadata } from "next";
import PageLayout from "@/components/layout/PageLayout";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ResetPasswordClient from "./reset-password-client";

export const instant = false;

export const metadata: Metadata = { title: "Reset Password - Kinbo" };

export default function ResetPasswordPage() {
  return (
    <PageLayout className="bg-[#F8FAFC]">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12 sm:px-6">
        <Suspense fallback={<LoadingSpinner label="Loading..." />}>
          <ResetPasswordClient />
        </Suspense>
      </main>
    </PageLayout>
  );
}
