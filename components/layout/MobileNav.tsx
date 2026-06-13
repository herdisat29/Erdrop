"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProBadge } from '@/components/paywall/ProBadge'

export function MobileNav({ isPro = false }: { isPro?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-40 flex items-center gap-2 overflow-x-auto px-4 pb-4 pt-2 bg-surface/90 backdrop-blur-md rounded-t-xl border-t-2 border-primary-container/20 scrollbar-hide">
      {[
        { href: "/", icon: "grid_view", label: "Dashboard" },
        { href: "/projects", icon: "folder", label: "Projects" },
        { href: "/calendar", icon: "calendar_month", label: "Calendar" },
        { href: "/report", icon: "analytics", label: "Ledger" },
        { href: "/plan", icon: "psychology", label: "AI Plan" },
        { href: "/logs", icon: "assignment", label: "Logs" },
        { href: "/wallets", icon: "account_balance_wallet", label: "Wallets" },
        { href: "/import", icon: "upload_file", label: "Import" },
      ].map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex flex-col items-center justify-center rounded-2xl squishy-interaction min-w-[72px] px-3 py-2 transition-colors ${
              isActive
                ? "bg-primary-container text-on-primary-container"
                : "text-on-surface-variant hover:bg-surface-container-highest"
            }`}
          >
            <div className="relative">
              <span
                className="material-symbols-outlined"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              {item.label === 'AI Plan' && !isPro && (
                <div className="absolute -top-1.5 -right-6 scale-[0.6] origin-bottom-left pointer-events-none">
                  <ProBadge />
                </div>
              )}
            </div>
            <span className="font-label-sm text-[10px] mt-0.5 text-center">
              {item.label}
            </span>
          </Link>
        );
      })}

      <a
        href="/api/export"
        className="relative flex flex-col items-center justify-center text-on-surface-variant px-3 py-2 min-w-[72px] hover:bg-surface-container-highest rounded-2xl transition-colors squishy-interaction"
      >
        <div className="relative">
          <span className="material-symbols-outlined">download</span>
          {!isPro && (
            <div className="absolute -top-1.5 -right-6 scale-[0.6] origin-bottom-left pointer-events-none">
              <ProBadge />
            </div>
          )}
        </div>
        <span className="font-label-sm text-[10px] mt-0.5 text-center">
          Export
        </span>
      </a>
    </nav>
  );
}
