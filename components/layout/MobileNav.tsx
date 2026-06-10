"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-40 flex items-center gap-2 overflow-x-auto px-4 pb-4 pt-2 bg-surface/90 backdrop-blur-md rounded-t-xl border-t-2 border-primary-container/20 scrollbar-hide">
      {[
        { href: "/", icon: "grid_view", label: "Home" },
        { href: "/projects", icon: "folder", label: "Projects" },
        { href: "/calendar", icon: "calendar_month", label: "Calendar" },
        { href: "/plan", icon: "psychology", label: "Plan" },
      ].map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center rounded-full squishy-interaction min-w-fit transition-colors ${
              isActive
                ? "bg-primary-container text-on-primary-container px-6 py-1.5"
                : "text-on-surface-variant px-4 py-2 hover:bg-surface-container-highest"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span className="font-label-sm text-[10px]">{item.label}</span>
          </Link>
        );
      })}
      <Link
        href="/import"
        className={`flex flex-col items-center justify-center rounded-full squishy-interaction min-w-fit transition-colors ${
          pathname === "/import"
            ? "bg-primary-container text-on-primary-container px-6 py-1.5"
            : "text-on-surface-variant px-4 py-2 hover:bg-surface-container-highest"
        }`}
      >
        <span
          className="material-symbols-outlined"
          style={
            pathname === "/import" ? { fontVariationSettings: "'FILL' 1" } : {}
          }
        >
          upload_file
        </span>
        <span className="font-label-sm text-[10px]">Import</span>
      </Link>
      <a
        href="/api/export"
        className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-2 hover:bg-surface-container-highest rounded-full transition-colors squishy-interaction min-w-fit"
      >
        <span className="material-symbols-outlined">download</span>
        <span className="font-label-sm text-[10px]">Export</span>
      </a>{" "}
      <Link
        href="/logs"
        className={`flex flex-col items-center justify-center rounded-full squishy-interaction min-w-fit transition-colors ${
          pathname === "/logs"
            ? "bg-primary-container text-on-primary-container px-6 py-1.5"
            : "text-on-surface-variant px-4 py-2 hover:bg-surface-container-highest"
        }`}
      >
        <span
          className="material-symbols-outlined"
          style={
            pathname === "/logs" ? { fontVariationSettings: "'FILL' 1" } : {}
          }
        >
          assignment
        </span>
        <span className="font-label-sm text-[10px]">Logs</span>
      </Link>
    </nav>
  );
}
