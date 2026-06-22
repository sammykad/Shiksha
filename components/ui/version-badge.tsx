"use client";

import { APP_VERSION } from "@/lib/version";

export function VersionBadge() {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-white/60 px-2.5 py-0.5 text-[11px] font-medium text-[#747686] shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
      title={`Shiksha Cloud ${APP_VERSION}`}
    >
      <span className="size-1.5 rounded-full bg-emerald-400" />
      {APP_VERSION}
    </span>
  );
}
