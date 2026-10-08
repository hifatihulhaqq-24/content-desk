import { redirect } from "next/navigation";

// The root segment only hands off to `/overview`, so there is no static shell
// to validate here — allow the redirect to block.
export const instant = false;

export default function Home() {
  redirect("/overview");
}
