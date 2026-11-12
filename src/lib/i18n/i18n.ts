"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { messages } from "./messages";

const STORAGE_KEY = "kinbo-language";

function readStoredLanguage(): "en" | "ar" {
  if (typeof window === "undefined") return "en";
  return window.localStorage.getItem(STORAGE_KEY) === "ar" ? "ar" : "en";
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: messages.en },
      ar: { translation: messages.ar },
    },
    lng: "en",
    fallbackLng: "en",
    // Flat keys like "nav.login" — do not split on "."
    keySeparator: false,
    nsSeparator: false,
    interpolation: {
      escapeValue: false,
    },
  });
}

export function syncDocumentLanguage(language: "en" | "ar") {
  if (typeof document === "undefined") return;
  document.documentElement.lang = language;
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
}

export function bootstrapI18nLanguage() {
  const language = readStoredLanguage();
  void i18n.changeLanguage(language);
  syncDocumentLanguage(language);
  return language;
}

export default i18n;
