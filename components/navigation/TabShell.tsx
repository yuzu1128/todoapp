"use client";

import type { ReactNode } from "react";

import { BottomTabBar } from "@/components/navigation/BottomTabBar";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface TabShellProps {
  children: ReactNode;
}

export function TabShell({ children }: TabShellProps) {
  const { play } = useSoundEffects();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#040814] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(12,242,255,0.12),transparent_24%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_22%),linear-gradient(180deg,#040814_0%,#07111f_48%,#040814_100%)]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(12,242,255,0.65),transparent)]" />
      <main className="relative mx-auto min-h-screen w-full max-w-6xl px-4 pb-32 pt-6 sm:px-6 lg:px-8">
        {children}
      </main>
      <BottomTabBar onTabClick={() => play("tab")} />
    </div>
  );
}
