"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import i18n, { bootstrapI18nLanguage, syncDocumentLanguage } from "@/lib/i18n/i18n";

export type AppLanguage = "en" | "ar";

const STORAGE_KEY = "kinbo-language";

interface LanguageContextValue {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>("en");

  useEffect(() => {
    const next = bootstrapI18nLanguage();
    setLanguageState(next);
  }, []);

  const setLanguage = (next: AppLanguage) => {
    setLanguageState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    void i18n.changeLanguage(next);
    syncDocumentLanguage(next);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return ctx;
}
