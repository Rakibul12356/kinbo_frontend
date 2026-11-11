"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Globe } from "lucide-react";
import { useLanguage, type AppLanguage } from "@/context/language-context";

const OPTIONS: { id: AppLanguage; short: string; label: string }[] = [
  { id: "en", short: "EN", label: "English" },
  { id: "ar", short: "AR", label: "العربية" },
];

/** Public English / Arabic control. No account role is required. */
export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const active = OPTIONS.find((o) => o.id === language) ?? OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={language === "ar" ? "اللغة" : "Language"}
        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#1F2937] hover:bg-[#F3F7FC] hover:text-[#082F6B] transition cursor-pointer"
      >
        <Globe className="h-4 w-4 text-[#082F6B]" />
        <span>{active.short}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-zinc-400 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Language"
          className="absolute end-0 top-full z-50 mt-1 min-w-[9.5rem] overflow-hidden rounded-xl border border-[#E5E7EB] bg-white py-1 shadow-lg"
        >
          {OPTIONS.map((option) => {
            const selected = language === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="option"
                aria-selected={selected}
                lang={option.id}
                onClick={() => {
                  setLanguage(option.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-xs font-semibold transition cursor-pointer ${
                  selected
                    ? "bg-[#F3F7FC] text-[#082F6B]"
                    : "text-[#1F2937] hover:bg-[#F3F7FC]"
                }`}
              >
                <span>{option.label}</span>
                <span className="text-[10px] uppercase tracking-wide text-zinc-400">{option.short}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
