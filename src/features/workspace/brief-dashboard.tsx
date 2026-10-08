"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Check, FileText, Plus, TrendingUp } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState, ErrorState } from "@/components/data/states";
import { getIdeationService } from "@/services/ideation-service";
import { getBriefProjectService } from "@/services/brief-project-service";
import { contentTypeLabel } from "@/config/content-types";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  BriefProject,
  BriefProjectStatus,
} from "@/types/brief-project";

const STATUS_LABEL: Record<BriefProjectStatus, string> = {
  draft: "Draf",
  review: "Review",
  published: "Terbit",
};

const STATUS_VARIANT: Record<
  BriefProjectStatus,
  "secondary" | "outline" | "default"
> = {
  draft: "outline",
  review: "secondary",
  published: "default",
};

/** Dashboard Workspace "Konten Brief" — shortcut topik + daftar proyek. */
export function BriefDashboard() {
  const router = useRouter();

  const topicsQuery = useQuery({
    queryKey: ["ideation-topics"],
    queryFn: () => getIdeationService().listTopicIdeas(),
  });

  const projectsQuery = useQuery({
    queryKey: ["brief-projects"],
    queryFn: () => getBriefProjectService().listBriefProjects(),
  });

  const topics = topicsQuery.data ?? [];
  const projects = projectsQuery.data ?? [];

  return (
    <PageContainer>
      <PageHeader
        title="Konten Brief"
        description="Daftar proyek konten dan shortcut rekomendasi topik untuk memulai brief baru."
        actions={
          <Button type="button" onClick={() => router.push("/create")}>
            <Plus className="size-4" aria-hidden />
            Buat dari nol
          </Button>
        }
      />

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold">Rekomendasi topik</h2>
            <p className="text-xs text-muted-foreground">
              Klik salah satu untuk langsung memulai brief dengan topik tersebut.
            </p>
          </div>
          {topicsQuery.isFetching && !topicsQuery.isPending && (
            <span className="text-xs text-muted-foreground">
              Memperbarui…
            </span>
          )}
        </div>

        {topicsQuery.isPending ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="rounded-xl border border-border bg-card p-4 shadow-xs"
              >
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="mt-3 h-3 w-full" />
                <Skeleton className="mt-2 h-3 w-2/3" />
                <Skeleton className="mt-4 h-5 w-24" />
              </div>
            ))}
          </div>
        ) : topicsQuery.isError ? (
          <ErrorState
            onRetry={() => void topicsQuery.refetch()}
            className="min-h-40"
          />
        ) : topics.length === 0 ? (
          <EmptyState
            title="Belum ada rekomendasi"
            message="Belum ada topik yang bisa direkomendasikan. Anda tetap bisa membuat brief dari nol."
            className="min-h-40"
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {topics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                aria-pressed={false}
                onClick={() => router.push(`/create?topic=${topic.id}`)}
                className={cn(
                  "flex flex-col rounded-xl border bg-card p-4 text-left shadow-xs transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                  "border-border hover:border-primary/40 hover:bg-muted/40"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold leading-snug">
                    {topic.title}
                  </h3>
                  <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    Skor {topic.score}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                  {topic.reason}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  <span className="inline-flex items-center gap-1 font-medium text-positive">
                    <TrendingUp className="size-3.5" aria-hidden />
                    {topic.trendSignal}
                  </span>
                  <span className="text-muted-foreground">{topic.source}</span>
                </div>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
                  Mulai brief dengan topik ini
                  <ArrowRight className="size-3.5" aria-hidden />
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">Daftar proyek</h2>
          <p className="text-xs text-muted-foreground">
            Brief yang sudah dikerjakan beserta angle, format, dan statusnya.
          </p>
        </div>

        {projectsQuery.isPending ? (
          <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
            <div className="space-y-3">
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} className="h-9 w-full" />
              ))}
            </div>
          </div>
        ) : projectsQuery.isError ? (
          <ErrorState
            onRetry={() => void projectsQuery.refetch()}
            className="min-h-40"
          />
        ) : projects.length === 0 ? (
          <EmptyState
            title="Belum ada proyek"
            message="Belum ada brief yang dibuat. Mulai dari rekomendasi topik di atas atau buat dari nol."
            className="min-h-40"
            action={
              <Button
                type="button"
                size="sm"
                onClick={() => router.push("/create")}
              >
                Buat dari nol
              </Button>
            }
          />
        ) : (
          <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Topik</TableHead>
                  <TableHead>Angle</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <ProjectRow key={project.id} project={project} />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </PageContainer>
  );
}

function ProjectRow({ project }: { project: BriefProject }) {
  const router = useRouter();

  return (
    <TableRow>
      <TableCell className="max-w-64">
        <span className="line-clamp-1 font-medium">
          {project.topicTitle}
        </span>
      </TableCell>
      <TableCell className="max-w-48">
        <span className="line-clamp-1 text-muted-foreground">
          {project.angleTitle}
        </span>
      </TableCell>
      <TableCell>
        <span className="inline-flex items-center gap-1.5">
          <FileText className="size-3.5 text-muted-foreground" aria-hidden />
          {contentTypeLabel(project.contentType)}
        </span>
      </TableCell>
      <TableCell className="whitespace-nowrap text-muted-foreground">
        {formatDate(project.updatedAt)}
      </TableCell>
      <TableCell>
        <Badge variant={STATUS_VARIANT[project.status]}>
          {STATUS_LABEL[project.status]}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            router.push(
              `/create?title=${encodeURIComponent(project.topicTitle)}`
            )
          }
        >
          <Check className="size-4" aria-hidden />
          Buka
        </Button>
      </TableCell>
    </TableRow>
  );
}
