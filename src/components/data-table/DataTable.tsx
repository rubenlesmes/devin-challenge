import type { ReactNode } from "react";
import { EmptyState } from "@/components/console/EmptyState";

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = "No records match the current filters.",
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
}) {
  if (rows.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }
  return (
    <div className="overflow-x-auto rounded-md border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.header}
                scope="col"
                className="px-3 py-2 text-left text-xs font-semibold tracking-wide text-gray-600 uppercase"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <tr key={rowKey(row)} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.header} className="px-3 py-2 align-top text-gray-800">
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
