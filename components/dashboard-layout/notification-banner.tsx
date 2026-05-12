"use client";

import useFcmToken from "@/hooks/use-fcm-token";
import { useEffect, useState } from "react";
import { Bell, X, ChevronRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "notif-banner-v3";

export default function NotificationBanner() {
  const { notificationPermissionStatus, refreshToken } = useFcmToken();

  const [visible, setVisible] = useState(false);
  const [denied, setDenied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [leaving, setLeaving] = useState(false);

  /* ── Bootstrap ───────────────────────────────────────────── */
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    const p = Notification.permission;
    if (p === "granted") return;
    setDenied(p === "denied");
    setVisible(true);
  }, []);

  /* ── Hook sync ───────────────────────────────────────────── */
  useEffect(() => {
    if (!notificationPermissionStatus) return;
    if (notificationPermissionStatus === "granted") { close(); return; }
    setDenied(notificationPermissionStatus === "denied");
  }, [notificationPermissionStatus]);

  /* ── Helpers ─────────────────────────────────────────────── */
  const close = () => {
    setLeaving(true);
    setTimeout(() => setVisible(false), 200);
  };

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "1");
    close();
  };

  const enable = async () => {
    if (!("Notification" in window)) return;
    setLoading(true);
    try {
      const p = await Notification.requestPermission();
      if (p === "granted") { await refreshToken?.(); close(); }
      else setDenied(p === "denied");
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  /* ── Denied ──────────────────────────────────────────────── */
  if (denied) {
    return (
      <div
        role="alert"
        className={cn(
          "w-full border-t border-amber-200/70 dark:border-amber-700/40",
          "bg-amber-50/80 dark:bg-amber-950/20",
          leaving
            ? "animate-out fade-out-0 slide-out-to-top-1 duration-200"
            : "animate-in fade-in-0 slide-in-from-top-1 duration-300",
        )}
      >
        <div className="flex items-center gap-2.5 px-4 py-2 sm:px-6">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500 dark:text-amber-400" />
          <p className="flex-1 text-[12px] leading-relaxed text-amber-800 dark:text-amber-300">
            <span className="font-semibold">Notifications blocked —</span>{" "}
            click the lock icon in your address bar, open{" "}
            <span className="font-medium text-amber-900 dark:text-amber-200">Site settings</span>{" "}
            and set Notifications to Allow.
          </p>
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded
                       text-amber-400 hover:text-amber-600 dark:hover:text-amber-300
                       hover:bg-amber-100 dark:hover:bg-amber-900/50
                       transition-colors duration-100"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  }

  /* ── Default ─────────────────────────────────────────────── */
  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "w-full border-t border-border/60",
        "bg-muted/40 dark:bg-muted/20",
        leaving
          ? "animate-out fade-out-0 slide-out-to-top-1 duration-200"
          : "animate-in fade-in-0 slide-in-from-top-1 duration-300",
      )}
    >
      <div className="flex items-center gap-3 px-4 py-2 sm:px-6">

        {/* Icon */}
        <div className="relative flex shrink-0 items-center justify-center h-6 w-6
                        rounded-md bg-primary/10 border border-primary/20">
          <Bell className="h-3 w-3 text-primary" />
          <span className="absolute -right-0.5 -top-0.5 flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
        </div>

        {/* Text */}
        <div className="flex min-w-0 flex-1 items-center gap-1.5">
          <span className="text-[12px] font-semibold text-foreground whitespace-nowrap">
            Enable push notifications
          </span>
          <span className="hidden text-[12px] text-muted-foreground sm:inline truncate">
            — get instant alerts for fees, attendance &amp; updates.
          </span>
        </div>

        {/* CTA */}
        <div className="flex shrink-0 items-center gap-1">
          {/* Primary button */}
          <button
            onClick={enable}
            disabled={loading}
            className={cn(
              "inline-flex items-center gap-1 h-6 rounded-md px-2.5",
              "text-[11px] font-semibold tracking-wide",
              "bg-primary text-primary-foreground",
              "ring-1 ring-primary/80 shadow-sm shadow-primary/25",
              "hover:bg-primary/90 active:scale-[0.97]",
              "transition-all duration-100",
              "disabled:opacity-55 disabled:pointer-events-none",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            )}
          >
            {loading ? (
              <span className="h-2.5 w-2.5 animate-spin rounded-full
                               border-[1.5px] border-primary-foreground/30
                               border-t-primary-foreground" />
            ) : (
              <>
                Turn on
                <ChevronRight className="h-3 w-3 -mr-0.5" />
              </>
            )}
          </button>

          {/* Not now — desktop */}
          <button
            onClick={dismiss}
            className="hidden sm:flex h-6 items-center px-2 rounded-md
                       text-[11px] font-medium text-muted-foreground
                       hover:text-foreground hover:bg-muted
                       transition-colors duration-100
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Not now
          </button>

          {/* Divider */}
          <span className="hidden sm:block h-3.5 w-px bg-border mx-0.5" />

          {/* X */}
          <button
            onClick={dismiss}
            aria-label="Close"
            className="flex h-6 w-6 items-center justify-center rounded-md
                       text-muted-foreground hover:text-foreground hover:bg-muted
                       transition-colors duration-100
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}