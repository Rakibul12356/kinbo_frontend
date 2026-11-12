"use client";

import { useTranslation } from "react-i18next";
import type { MessageKey } from "@/lib/i18n/messages";

/** Typed wrapper around react-i18next. Product copy stays backend-owned. */
export function useT() {
  const { t } = useTranslation();

  return (key: MessageKey, vars?: Record<string, string | number>) => {
    if (vars) return t(key, vars);
    return t(key);
  };
}
