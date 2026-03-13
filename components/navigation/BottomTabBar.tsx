"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, House, Settings2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface BottomTabBarProps {
  onTabClick?: () => void;
}

const tabs = [
  {
    href: "/",
    icon: House,
    label: "Home",
    testId: "tab-home",
  },
  {
    href: "/calendar",
    icon: CalendarDays,
    label: "Calendar",
    testId: "tab-calendar",
  },
  {
    href: "/settings",
    icon: Settings2,
    label: "Settings",
    testId: "tab-settings",
  },
] as const;

export function BottomTabBar({ onTabClick }: BottomTabBarProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-6xl px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
      <div className="rounded-[28px] border border-white/10 bg-[rgba(6,12,24,0.88)] p-2 shadow-[0_30px_80px_-38px_rgba(12,242,255,0.45)] backdrop-blur-2xl">
        <ul className="grid grid-cols-3 gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active =
              tab.href === "/"
                ? pathname === tab.href
                : pathname.startsWith(tab.href);

            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  className={cn(
                    "flex min-h-16 flex-col items-center justify-center rounded-[22px] border border-transparent px-2 py-3 text-xs uppercase tracking-[0.24em] text-slate-400 transition",
                    active &&
                      "border-cyan-300/20 bg-[linear-gradient(135deg,rgba(12,242,255,0.16),rgba(59,130,246,0.18))] text-white shadow-[0_0_30px_-18px_rgba(12,242,255,0.75)]"
                  )}
                  data-testid={tab.testId}
                  onClick={onTabClick}
                >
                  <Icon className="mb-2 h-4 w-4" />
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
