import React, { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface PageLayoutProps {
  children: React.ReactNode;
  /** Wires the navbar search box to the page; omit on pages without search. */
  onSearchChange?: (query: string) => void;
  /** Extra classes for the page wrapper, e.g. a background color. */
  className?: string;
}

export default function PageLayout({ children, onSearchChange, className = "" }: PageLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col justify-between ${className}`.trim()}>
      <Suspense
        fallback={
          <header className="sticky top-0 z-50 h-14 sm:h-16 w-full border-b border-[#E5E7EB] bg-white/95" />
        }
      >
        <Navbar onSearchChange={onSearchChange} />
      </Suspense>
      <div className="min-w-0 flex-1 overflow-x-clip">{children}</div>
      <Footer />
    </div>
  );
}
