import React from "react";
import { cn } from "@/lib/utils";

export interface LoadingSpinnerProps {
  /** Optional status text displayed beneath the spinner circle. */
  label?: string;
  /** Size preset for the circular spinner. Defaults to "md". */
  size?: "sm" | "md" | "lg";
  /** Fills the viewport height (useful for route guards and full-page loads). */
  fullScreen?: boolean;
  className?: string;
}

const SIZE_CLASSES = {
  sm: {
    outer: "h-7 w-7 border-2",
    inner: "inset-1 border-2",
    dot: "h-1.5 w-1.5",
    text: "text-xs",
    wrap: "py-6",
  },
  md: {
    outer: "h-11 w-11 border-[3px]",
    inner: "inset-1.5 border-[2.5px]",
    dot: "h-2 w-2",
    text: "text-sm",
    wrap: "min-h-[14rem] py-12",
  },
  lg: {
    outer: "h-14 w-14 border-[3.5px]",
    inner: "inset-2 border-[3px]",
    dot: "h-2.5 w-2.5",
    text: "text-sm",
    wrap: "min-h-[45vh] py-16",
  },
} as const;

export default function LoadingSpinner({
  label = "Loading...",
  size = "md",
  fullScreen = false,
  className,
}: LoadingSpinnerProps) {
  const s = SIZE_CLASSES[size];

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label || "Loading"}
      className={cn(
        "flex w-full flex-col items-center justify-center gap-3.5 text-center",
        fullScreen ? "min-h-screen flex-1 bg-[#F3F7FC] px-4" : s.wrap,
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        {/* Soft ambient glow */}
        <span
          aria-hidden="true"
          className="absolute -inset-2 rounded-full bg-[#082F6B]/10 blur-md animate-pulse"
        />
        {/* Outer navy ring */}
        <span
          aria-hidden="true"
          className={cn(
            "relative block rounded-full border-[#082F6B]/15 border-t-[#082F6B] border-r-[#082F6B]/60 animate-spin",
            s.outer
          )}
        />
        {/* Inner orange counter-accent ring */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute rounded-full border-transparent border-b-[#FF6B00] border-l-[#FF6B00]/50 animate-spin",
            s.inner
          )}
          style={{ animationDirection: "reverse", animationDuration: "0.9s" }}
        />
        {/* Center dot */}
        <span
          aria-hidden="true"
          className={cn(
            "absolute rounded-full bg-[#082F6B]",
            s.dot
          )}
        />
      </div>

      {label && (
        <p className={cn("font-medium tracking-wide text-zinc-500", s.text)}>
          {label}
        </p>
      )}
    </div>
  );
}
