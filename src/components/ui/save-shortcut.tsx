"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type SaveShortcutProps = {
  className?: string;
  keyClassName?: string;
};

export function SaveShortcut({ className, keyClassName }: SaveShortcutProps) {
  const [modifier] = useState<"mod" | "cmd" | "ctrl">(() => {
    if (typeof navigator === "undefined") return "mod";
    const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
    const platform = String(
      nav.userAgentData?.platform || navigator.platform || navigator.userAgent || ""
    ).toLowerCase();
    const isApple = /mac|iphone|ipad|ipod/.test(platform);
    return isApple ? "cmd" : "ctrl";
  });

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <kbd className={cn("rounded bg-muted px-1 py-0.5 font-mono text-xs text-muted-foreground", keyClassName)}>
        {modifier === "cmd" ? "⌘" : modifier === "ctrl" ? "Ctrl" : "Mod"}
      </kbd>
      <span className="text-muted-foreground/70">+</span>
      <kbd className={cn("rounded bg-muted px-1 py-0.5 font-mono text-xs text-muted-foreground", keyClassName)}>
        S
      </kbd>
    </span>
  );
}
