"use client";

import { ChartCard } from "@/components/data/chart-card";
import { DataTable, createDataTableColumn } from "@/components/data/data-table";
import { formatDate, formatNumber, formatPercent } from "@/lib/format";
import { articleUrl, EXTERNAL_LINK_PROPS } from "@/lib/content-links";
import type { QueryUiState } from "@/hooks/use-analytics";
import type { ArticleSummary } from "@/types/analytics";

const column = createDataTableColumn<ArticleSummary>();

const columns = [
  column.accessor("title", {
    id: "title",
    header: "Judul",
    cell: (context) => (
      <a
        {...EXTERNAL_LINK_PROPS}
        href={articleUrl(context.row.original)}
        className="line-clamp-2 max-w-md hover:text-primary hover:underline"
      >
        {context.getValue()}
      </a>
    ),
  }),
  column.accessor("publishedAt", {
    id: "publishedAt",
    header: "Tanggal",
    cell: (context) => (
      <span className="whitespace-nowrap tabular-nums">
        {formatDate(context.getValue())}
      </span>
    ),
  }),
  column.accessor("pv", {
    id: "pv",
    header: "PV",
    cell: (context) => (
      <span className="block text-right tabular-nums">
        {formatNumber(context.getValue())}
      </span>
    ),
  }),
  column.accessor("impressions", {
    id: "impressions",
    header: "Impresi",
    cell: (context) => (
      <span className="block text-right tabular-nums">
        {formatNumber(context.getValue())}
      </span>
    ),
  }),
  column.accessor("engagementRate", {
    id: "engagementRate",
    header: "Engagement",
    cell: (context) => (
      <span className="block text-right tabular-nums">
        {formatPercent(context.getValue())}
      </span>
    ),
  }),
];

interface TopArticlesSectionProps {
  status: QueryUiState;
  articles: ArticleSummary[];
  onRetry: () => void;
}

export function TopArticlesSection({
  status,
  articles,
  onRetry,
}: TopArticlesSectionProps) {
  const cardStatus =
    status === "loading" ? "pending" : status === "error" ? "error" : "success";

  return (
    <ChartCard
      title="🔥 Top Artikel"
      titleClassName="text-lg font-semibold"
      description="5 artikel dengan performa terbaik berdasarkan page views"
      status={cardStatus}
      isEmpty={status === "empty" || articles.length === 0}
      onRetry={onRetry}
      emptyTitle="Belum ada artikel"
      emptyMessage="Belum ada artikel terbit pada periode ini."
      height={240}
    >
      <DataTable
        columns={columns}
        data={articles}
        getRowId={(article) => article.id}
        searchPlaceholder="Cari artikel…"
        pageSize={5}
        defaultSort={[{ id: "pv", desc: true }]}
        stickyFirstColumn
        className="gap-2"
        onRowClick={(article, event) => {
          if ((event.target as HTMLElement).closest("a")) return;
          window.open(articleUrl(article), "_blank", "noopener");
        }}
      />
    </ChartCard>
  );
}
