"use client";

import { useState } from "react";
import {
  useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel,
  getFilteredRowModel, flexRender, createColumnHelper, type SortingState,
} from "@tanstack/react-table";
import { SafeImage } from "@/components/ui/safe-image";
import { BoothRowActions } from "@/app/admin/booth-designs/booth-row-actions";
import { boothTypeLabel, frameTypeLabel } from "@/lib/labels";
import { ArrowUpDown } from "lucide-react";
import type { BoothDesign } from "@/types/domain";

const columnHelper = createColumnHelper<BoothDesign>();

const columns = [
  columnHelper.accessor("thumbnail", {
    header: "",
    enableSorting: false,
    cell: (info) => (
      <div className="relative w-14 h-10 bg-aso-offwhite">
        <SafeImage src={info.getValue()} alt="" fill className="object-cover" />
      </div>
    ),
  }),
  columnHelper.accessor("designCode", { header: "디자인 번호" }),
  columnHelper.accessor("title", {
    header: "제목",
    cell: (info) => <span className="max-w-[220px] truncate block">{info.getValue()}</span>,
  }),
  columnHelper.accessor((row) => `${row.width}×${row.depth}m`, { id: "size", header: "규격" }),
  columnHelper.accessor("area", { header: "면적(㎡)" }),
  columnHelper.accessor("boothType", { header: "유형", cell: (info) => boothTypeLabel[info.getValue()] }),
  columnHelper.accessor("frameType", { header: "프레임", cell: (info) => frameTypeLabel[info.getValue()] }),
  columnHelper.accessor("status", { header: "상태·관리", enableSorting: false, cell: (info) => (
    <BoothRowActions id={info.row.original.id} status={info.getValue()} featured={info.row.original.featured} />
  ) }),
];

export function BoothDesignTable({ items }: { items: BoothDesign[] }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "designCode", desc: false }]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data: items,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  const pageCount = table.getPageCount();
  const pageIndex = table.getState().pagination.pageIndex;

  return (
    <div>
      <input
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder="디자인 번호, 제목으로 검색"
        className="input max-w-sm mb-4"
        aria-label="부스 디자인 검색"
      />

      <div className="bg-white border border-aso-line overflow-x-auto">
        <table className="w-full text-sm min-w-[960px]">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="text-left text-aso-muted border-b border-aso-line">
                {hg.headers.map((header) => (
                  <th key={header.id} className="p-3 font-medium">
                    {header.isPlaceholder ? null : (
                      <button
                        className="inline-flex items-center gap-1 disabled:cursor-default"
                        disabled={!header.column.getCanSort()}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && <ArrowUpDown size={12} />}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b border-aso-line last:border-0">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-3 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-aso-muted">검색 결과가 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm">
        <p className="text-aso-charcoal-2/60">
          {table.getFilteredRowModel().rows.length}개 중 {pageIndex * 20 + 1}–
          {Math.min((pageIndex + 1) * 20, table.getFilteredRowModel().rows.length)}
        </p>
        <div className="flex gap-2">
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="px-3 py-1.5 border border-aso-line disabled:opacity-40 min-h-9">
            이전
          </button>
          <span className="font-num px-2 py-1.5">{pageIndex + 1} / {pageCount || 1}</span>
          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="px-3 py-1.5 border border-aso-line disabled:opacity-40 min-h-9">
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
