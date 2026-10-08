import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="text-xl font-semibold">Halaman tidak ditemukan</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Halaman yang kamu tuju tidak ada atau sudah dipindahkan.
      </p>
      <Button asChild>
        <Link href="/overview">Kembali ke Overview</Link>
      </Button>
    </div>
  );
}
