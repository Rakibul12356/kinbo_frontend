"use client";

import React from "react";
import { I18nextProvider } from "react-i18next";
import { ToastContainer } from "react-toastify";
import QueryProvider from "./query-provider";
import { CartProvider } from "@/context/cart-context";
import { LanguageProvider } from "@/context/language-context";
import i18n from "@/lib/i18n/i18n";

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <I18nextProvider i18n={i18n}>
      <QueryProvider>
        <LanguageProvider>
          <CartProvider>
            {children}
            <ToastContainer
              position="top-right"
              autoClose={2500}
              newestOnTop
              closeOnClick={false}
              closeButton={false}
              pauseOnFocusLoss={false}
              limit={3}
            />
          </CartProvider>
        </LanguageProvider>
      </QueryProvider>
    </I18nextProvider>
  );
}
