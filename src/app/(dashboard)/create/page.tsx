import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateView } from "@/features/create/create-view";

export const metadata = { title: "Buat Konten" };

/** Fallback saat <CreateView> (useSearchParams) belum siap dirender. */
function CreateFallback() {
  return (
    <div className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-4 md:p-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<CreateFallback />}>
      <CreateView />
    </Suspense>
  );
}
