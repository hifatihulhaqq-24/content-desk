"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Check, FileText } from "lucide-react";
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
import { TopicCard } from "@/components/data/topic-card";
import { getIdeationService } from "@/services/ideation-service";
import { getBriefProjectService } from "@/services/brief-project-service";
import { contentTypeLabel } from "@/config/content-types";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  BriefProject,
  BriefProjectStatus,
} from "@/types/brief-project";
import { BriefComposer } from "./brief-composer";
import { BriefHero } from "./brief-hero";

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

type StatusFilter = BriefProjectStatus | "all";

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "draft", label: "Draf" },
  { value: "review", label: "Review" },
  { value: "published", label: "Terbit" },
];

/** Dashboard Workspace "Konten Brief" — hero, rail cepat, dan daftar proyek. */
export function BriefDashboard() {
  const router = useRouter();
  const topicsRef = useRef<HTMLElement>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

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

  const stats = {
    total: projects.length,
    draft: projects.filter((project) => project.status === "draft").length,
    review: projects.filter((project) => project.status === "review").length,
    published: projects.filter((project) => project.status === "published")
      .length,
  };

  const draftProject =
    projects.find((project) => project.status === "draft") ?? null;

  const visibleProjects =
    statusFilter === "all"
      ? projects
      : projects.filter((project) => project.status === statusFilter);

  const goToCreate = (params?: { topic?: string; title?: string }) => {
    const search = new URLSearchParams();
    if (params?.topic) search.set("topic", params.topic);
    if (params?.title) search.set("title", params.title);
    const query = search.toString();
    router.push(query ? `/create?${query}` : "/create");
  };

  const scrollToTopics = () =>
    topicsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <PageContainer>
      <PageHeader
        title="Konten Brief"
        description="Daftar proyek konten dan shortcut rekomendasi topik untuk memulai brief baru."
      />

      <BriefHero
        stats={stats}
        onCreate={() => goToCreate()}
        onSeeTopics={scrollToTopics}
      />

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <BriefComposer
          stats={stats}
          draftProject={draftProject}
          onCreateWith={(title) => goToCreate({ title })}
          onStartBlank={() => goToCreate()}
          onSeeTopics={scrollToTopics}
        />

        <div className="min-w-0 space-y-6">
          <section ref={topicsRef} className="scroll-mt-20 space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-base font-semibold">Rekomendasi topik</h2>
                <p className="text-xs text-muted-foreground">
                  Klik salah satu untuk langsung memulai brief dengan topik
                  tersebut.
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
                    <div className="flex gap-3">
                      <Skeleton className="size-9 shrink-0 rounded-lg" />
                      <div className="min-w-0 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="mt-2 h-1.5 w-full rounded-full" />
                      </div>
                    </div>
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
                message="Belum ada topik yang bisa direkomendasikan. Kamu tetap bisa membuat brief dari nol."
                className="min-h-40"
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {topics.map((topic, index) => (
                  <TopicCard
                    key={topic.id}
                    topic={topic}
                    index={index}
                    onSelect={() => goToCreate({ topic: topic.id })}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">Daftar proyek</h2>
                <p className="text-xs text-muted-foreground">
                  Brief yang sudah dikerjakan beserta angle, format, dan
                  statusnya.
                </p>
              </div>

              <div
                role="group"
                aria-label="Filter status proyek"
                className="flex flex-wrap items-center gap-1.5"
              >
                {FILTERS.map((filter) => {
                  const active = statusFilter === filter.value;
                  return (
                    <button
                      key={filter.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setStatusFilter(filter.value)}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                        active
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground hover:bg-muted/60"
                      )}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>
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
                    onClick={() => goToCreate()}
                  >
                    Buat dari nol
                  </Button>
                }
              />
            ) : visibleProjects.length === 0 ? (
              <EmptyState
                title={`Tidak ada proyek berstatus ${STATUS_LABEL[statusFilter as BriefProjectStatus]}`}
                message="Pilih filter lain untuk melihat proyek lainnya."
                className="min-h-40"
                action={
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setStatusFilter("all")}
                  >
                    Tampilkan semua
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
                    {visibleProjects.map((project) => (
                      <ProjectRow key={project.id} project={project} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </section>
        </div>
      </div>
    </PageContainer>
  );
}

function ProjectRow({ project }: { project: BriefProject }) {
  const router = useRouter();

  return (
    <TableRow className="hover:bg-muted/40">
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
