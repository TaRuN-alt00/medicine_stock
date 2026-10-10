"use client";

import React from "react";
import { useI18n } from "@/lib/i18n";
import { ShieldAlert } from "lucide-react";

export function DisclaimerBanner() {
  const { t } = useI18n();

  return (
    <aside aria-label="Legal and Medical Disclaimer" className="bg-paper border-b border-stone text-xs text-ink-muted py-2 px-4">
      <div className="max-w-6xl mx-auto flex items-center justify-center gap-2 text-center">
        <ShieldAlert className="w-3.5 h-3.5 text-forest shrink-0" aria-hidden="true" />
        <span>{t("common.disclaimerBanner")}</span>
      </div>
    </aside>
  );
}
