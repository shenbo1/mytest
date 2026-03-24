import { createSignal, For, Show } from "solid-js";
import {
  createSolidTable,
  flexRender,
  getCoreRowModel,
  type ColumnDef,
  type SortingState,
} from "@tanstack/solid-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

import {
  Pagination,
  PaginationItems,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "~/components/ui/pagination";

interface PaginationProps {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  total: number;
  onPageChange: (page: number) => void;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination?: PaginationProps;
}

export function DataTable<TData, TValue>(props: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = createSignal<SortingState>([]);
  const pagination = props.pagination;

  const table = createSolidTable({
    get data() {
      return props.data;
    },
    get columns() {
      return props.columns;
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, // Enable manual/server-side pagination
    state: {
      get sorting() {
        return sorting();
      },
    },
    onSortingChange: setSorting,
  });

  return (
    <div>
      <div class="rounded-md border">
        <div class="max-w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <For each={table.getHeaderGroups()}>
                {(headerGroup) => (
                  <TableRow>
                    <For each={headerGroup.headers}>
                      {(header) => (
                        <TableHead
                          colSpan={header.colSpan}
                          style={{ width: `${header.getSize()}px` }}
                        >
                          <Show when={!header.isPlaceholder}>
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                          </Show>
                        </TableHead>
                      )}
                    </For>
                  </TableRow>
                )}
              </For>
            </TableHeader>
            <TableBody>
              <Show
                when={table.getRowModel().rows?.length}
                fallback={
                  <TableRow>
                    <TableCell
                      colSpan={props.columns.length}
                      class="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                }
              >
                <For each={table.getRowModel().rows}>
                  {(row) => (
                    <TableRow data-state={row.getIsSelected() && "selected"}>
                      <For each={row.getVisibleCells()}>
                        {(cell) => (
                          <TableCell
                            style={{ width: `${cell.column.getSize()}px` }}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        )}
                      </For>
                    </TableRow>
                  )}
                </For>
              </Show>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls - Only show if pagination props are provided */}
      {pagination && (
        <div class="flex items-center justify-between px-2 py-4">
          <div class="text-sm text-muted-foreground">
            Page{" "}
            <strong>
              {pagination.pageIndex + 1} of {pagination.pageCount || 1}
            </strong>
            .{" "}
            {pagination.total > 0
              ? `${pagination.pageIndex * pagination.pageSize + 1} to ${Math.min(
                  (pagination.pageIndex + 1) * pagination.pageSize,
                  pagination.total,
                )} of ${pagination.total} results`
              : "0 results"}
          </div>

          <Pagination
            count={pagination.pageCount}
            page={pagination.pageIndex + 1}
            onChange={(value: any) => {
              const newPage = typeof value === "number" ? value : value.page;
              pagination.onPageChange(newPage - 1);
            }}
            itemComponent={(props: any) => (
              <PaginationItem
                page={props.page}
                onClick={(e: Event) => {
                  e.preventDefault();
                  pagination.onPageChange(props.page - 1);
                }}
              >
                {props.page}
              </PaginationItem>
            )}
            ellipsisComponent={() => null}
          >
            <PaginationPrevious
              onClick={(e: Event) => {
                e.preventDefault();
                if (pagination.pageIndex > 0) {
                  pagination.onPageChange(pagination.pageIndex - 1);
                }
              }}
            />
            <PaginationItems />
            <PaginationNext
              onClick={(e: Event) => {
                e.preventDefault();
                if (pagination.pageIndex < pagination.pageCount - 1) {
                  pagination.onPageChange(pagination.pageIndex + 1);
                }
              }}
            />
          </Pagination>
        </div>
      )}
    </div>
  );
}
