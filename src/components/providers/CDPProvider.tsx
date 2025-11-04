"use client";

import { CDPReactProvider, type Config, type Theme } from "@coinbase/cdp-react";
import { ReactNode } from "react";

const config: Config = {
  projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID || "",
  ethereum: {
    createOnLogin: "smart", // Creates smart wallet on login
  },
  appName: "Creator Loan Platform",
  appLogoUrl: "",
  authMethods: ["email", "sms", "oauth:google", "oauth:apple", "oauth:x"],
  showCoinbaseFooter: true,
};

const theme: Partial<Theme> = {
  "colors-bg-default": "#020617",
  "colors-bg-alternate": "#0f172a",
  "colors-bg-primary": "#3b82f6",
  "colors-bg-secondary": "#1e293b",
  "colors-fg-default": "#ffffff",
  "colors-fg-muted": "#94a3b8",
  "colors-fg-primary": "#3b82f6",
  "colors-fg-onPrimary": "#ffffff",
  "colors-fg-onSecondary": "#ffffff",
  "colors-fg-positive": "#10b981",
  "colors-fg-negative": "#ef4444",
  "colors-fg-warning": "#f59e0b",
  "colors-line-default": "#334155",
  "colors-line-heavy": "#475569",
  "borderRadius-cta": "var(--cdp-web-borderRadius-md)",
  "borderRadius-link": "var(--cdp-web-borderRadius-md)",
  "borderRadius-input": "var(--cdp-web-borderRadius-sm)",
  "borderRadius-select-trigger": "var(--cdp-web-borderRadius-sm)",
  "borderRadius-select-list": "var(--cdp-web-borderRadius-sm)",
  "borderRadius-modal": "var(--cdp-web-borderRadius-sm)",
  "font-family-sans": "'Geist Sans', 'Geist Sans Fallback'",
};

interface CDPProviderProps {
  children: ReactNode;
}

export function CDPProvider({ children }: CDPProviderProps) {
  return (
    <CDPReactProvider config={config} theme={theme}>
      {children}
    </CDPReactProvider>
  );
}
