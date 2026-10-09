import type { ReactNode } from "react";
import { CreateFlowProvider } from "@/features/create/create-flow-context";

/**
 * Layout segment /create — menyediakan CreateFlowProvider untuk ketiga
 * halaman: /create (compose), /create/angle, dan /create/brief.
 */
export default function CreateLayout({ children }: { children: ReactNode }) {
  return <CreateFlowProvider>{children}</CreateFlowProvider>;
}
