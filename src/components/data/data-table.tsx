"use client";

import type { MouseEvent, ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import {
  columnFilteringFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFns,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  useTable,
  type ColumnDef,
  type RowData,
  type SortingState,
} from "@tanstack/react-table";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const tableFeaturesConfig = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  columnFilteringFeature,
  globalFilteringFeature,
  sortedRowModel: createSortedRowModel(),
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns,
  filterFns,
});

export type DataTableFeatures = typeof tableFeaturesConfig;
export type DataTableColumn<T extends RowData, TValue = any> = ColumnDef<DataTableFeatures, T, TValue>;

/** Column helper yang sudah terikat features tabel (sort/filter/pagination). */
export function createDataTableColumn<T extends RowData>() {
  return createColumnHelper<DataTableFeatures, T>();
}

interface DataTableProps<T extends RowData> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowId?: (row: T) => string;
  searchPlaceholder?: string;
  hideSearch?: boolean;
  pageSize?: number;
  defaultSort?: SortingState;
  loading?: boolean;
  emptyMessage?: string;
  /** Sematkan kolom pertama saat scroll horizontal (mobile). */
  stickyFirstColumn?: boolean;
  /** Aksi toolbar di kanan (mis. filter tambahan). */
  toolbarActions?: ReactNode;
  /** Klik baris → handler; baris diberi cursor-pointer saat diisi. */
  onRowClick?: (row: T, event: MouseEvent<HTMLTableRowElement>) => void;
  className?: string;
}

/**
 * Tabel generik: sort, search (global filter), pagination, sticky kolom,
 * responsive scroll horizontal. Berbasis TanStack Table + shadcn Table.
 */
export function DataTable<T extends RowData>({
  columns,
  data,
  getRowId,
  searchPlaceholder,
  hideSearch = false,
  pageSize = 10,
  defaultSort = [],
  loading = false,
  emptyMessage = "Tidak ada data yang cocok.",
  stickyFirstColumn = false,
  toolbarActions,
  onRowClick,
  className,
}: DataTableProps<T>) {
  const table = useTable({
    features: tableFeaturesConfig,
    columns,
    data,
    getRowId: getRowId as ((row: T, index: number, parent?: unknown) => string) | undefined,
    globalFilterFn: "includesString",
    initialState: {
      pagination: { pageIndex: 0, pageSize },
      sorting: defaultSort,
    },
  });

  const headerGroups = table.getHeaderGroups();
  const rows = table.getRowModel().rows;
  const { pagination, globalFilter } = table.state;
  const rowCount = table.getRowCount();
  const columnCount = headerGroups[0]?.headers.length ?? columns.length;
  const searchValue = typeof globalFilter === "string" ? globalFilter : "";

  const firstColumnClass = stickyFirstColumn
    ? "sticky left-0 z-10 bg-white dark:bg-card"
    : undefined;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <DataTableToolbar
        searchValue={searchValue}
        onSearchChange={(value) => table.setGlobalFilter(value)}
        searchPlaceholder={searchPlaceholder}
        hideSearch={hideSearch}
      >
        {toolbarActions}
      </DataTableToolbar>

      <div className="overflow-x-auto rounded-xl">
        <table className="w-full text-sm">
          <thead className="border-b bg-white dark:bg-card">
            {headerGroups.map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => {
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      aria-sort={
                        sorted === "asc"
                          ? "ascending"
                          : sorted === "desc"
                            ? "descending"
                            : undefined
                      }
                      className={cn(
                        "px-3 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap",
                        index === 0 && firstColumnClass
                      )}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={() => header.column.toggleSorting()}
                          className="inline-flex items-center gap-1.5 hover:text-foreground"
                        >
                          <table.FlexRender header={header} />
                          {sorted === "asc" ? (
                            <ArrowUp className="size-3.5" aria-hidden />
                          ) : sorted === "desc" ? (
                            <ArrowDown className="size-3.5" aria-hidden />
                          ) : (
                            <ArrowUpDown className="size-3.5 opacity-50" aria-hidden />
                          )}
                        </button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: Math.min(pageSize, 5) }, (_, rowIndex) => (
                <tr key={rowIndex} className="border-b">
                  {Array.from({ length: columnCount }, (_, colIndex) => (
                    <td key={colIndex} className="px-3 py-2.5">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columnCount}
                  className="px-3 py-10 text-center text-sm text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={onRowClick ? (event) => onRowClick(row.original, event) : undefined}
                  className={cn(
                    "border-b last:border-0 hover:bg-muted/30",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {row.getAllCells().map((cell, index) => (
                    <td
                      key={cell.id}
                      className={cn(
                        "px-3 py-2.5 align-middle",
                        index === 0 && firstColumnClass
                      )}
                    >
                      <table.FlexRender cell={cell} />
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && (
        <DataTablePagination
          pageIndex={pagination.pageIndex}
          pageCount={table.getPageCount()}
          pageSize={pagination.pageSize}
          rowCount={rowCount}
          onPageChange={(index) => table.setPageIndex(index)}
          onPageSizeChange={(size) => {
            table.setPageSize(size);
            table.setPageIndex(0);
          }}
        />
      )}
    </div>
  );
}
