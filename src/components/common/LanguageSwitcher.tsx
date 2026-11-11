"use client";

import { useLanguage, type AppLanguage } from "@/context/language-context";

const OPTIONS: { id: AppLanguage; label: string }[] = [
  { id: "en", label: "English" },
  { id: "ar", label: "العربية" },
];

/** Public English / Arabic control. No account role is required. */
export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-[#F3F7FC] p-0.5"
      role="group"
      aria-label={language === "ar" ? "اللغة" : "Language"}
    >
      {OPTIONS.map((option) => {
        const active = language === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => setLanguage(option.id)}
            aria-pressed={active}
            lang={option.id}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
              active ? "bg-[#082F6B] text-white" : "text-[#1F2937] hover:text-[#082F6B]"
            }`}
          >
            {option.id === "en" ? "EN" : option.label}
          </button>
        );
      })}
    </div>
  );
}
