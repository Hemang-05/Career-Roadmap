// utils/Analytics.tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!window.gtag) return;
    window.gtag("config", "G-XXXXXXXXXX", {
      page_path: pathname,
    });
  }, [pathname]);

  return null;
}
