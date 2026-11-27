"use client";

import React, { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import i18n, { bootstrapI18nLanguage, syncDocumentLanguage } from "@/lib/i18n/i18n";

export type AppLanguage = "en" | "ar";

const STORAGE_KEY = "kinbo-language";

interface LanguageContextValue {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const listeners = new Set<() => void>();

function subscribeLanguage(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getClientLanguage(): AppLanguage {
  if (typeof window === "undefined") return "en";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === "ar" ? "ar" : "en";
}

function getServerLanguage(): AppLanguage {
  return "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(
    subscribeLanguage,
    getClientLanguage,
    getServerLanguage
  );

  useEffect(() => {
    bootstrapI18nLanguage();
  }, []);

  const setLanguage = (next: AppLanguage) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    void i18n.changeLanguage(next);
    syncDocumentLanguage(next);
    listeners.forEach((l) => l());
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
