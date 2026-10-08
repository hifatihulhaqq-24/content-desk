import type { ReactNode } from "react";
import { Shell } from "@/components/layout/shell";
import { DateRangeProvider } from "@/hooks/use-date-range";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DateRangeProvider>
      <Shell>{children}</Shell>
    </DateRangeProvider>
  );
}
