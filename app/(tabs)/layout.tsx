import type { ReactNode } from "react";

import { TabShell } from "@/components/navigation/TabShell";

export default function TabsLayout({ children }: { children: ReactNode }) {
  return <TabShell>{children}</TabShell>;
}
