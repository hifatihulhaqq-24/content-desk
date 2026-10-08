"use client";

import { formatCompact, formatPercent } from "@/lib/format";
import { PlatformBadge } from "@/components/data/platform-badge";
import { DataTable, createDataTableColumn } from "@/components/data/data-table";
import { KitSection } from "./kit-section";
import { DEMO_POST_ROWS, type DemoPostRow } from "./demo-data";

const column = createDataTableColumn<DemoPostRow>();

const columns = [
  column.accessor("caption", {
    header: "Konten",
    cell: (context) => (
      <span className="line-clamp-1 max-w-64">{context.getValue()}</span>
    ),
  }),
  column.accessor("platform", {
    header: "Platform",
    cell: (context) => <PlatformBadge platform={context.getValue()} />,
  }),
  column.accessor("type", { header: "Tipe" }),
  column.accessor("reach", {
    header: "Reach",
    cell: (context) => (
      <span className="block text-right tabular-nums">
        {formatCompact(context.getValue())}
      </span>
    ),
  }),
  column.accessor("engagementRate", {
    header: "ER",
    cell: (context) => (
      <span className="block text-right tabular-nums">
        {formatPercent(context.getValue())}
      </span>
    ),
  }),
];

export function TableSection() {
  return (
    <KitSection
      id="data-table"
      title="DataTable"
      description="Sort (klik header), search global, pagination, dan scroll horizontal di mobile. Berbasis TanStack Table."
    >
      <DataTable
        columns={columns}
        data={DEMO_POST_ROWS}
        getRowId={(row) => row.id}
        searchPlaceholder="Cari konten, platform, tipe…"
        pageSize={5}
        defaultSort={[{ id: "reach", desc: true }]}
      />
    </KitSection>
  );
}
