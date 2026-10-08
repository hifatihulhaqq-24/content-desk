"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="max-w-md">
        <CardHeader>
          <div className="flex size-10 items-center justify-center rounded-md bg-destructive/10 text-destructive">
            <AlertTriangle className="size-5" />
          </div>
          <CardTitle className="mt-2">Terjadi kesalahan</CardTitle>
          <CardDescription>
            Terjadi masalah saat memuat bagian ini. Data Anda tetap aman.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={reset}>Coba lagi</Button>
        </CardContent>
      </Card>
    </div>
  );
}
