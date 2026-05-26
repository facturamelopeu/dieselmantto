// DataTable — tabla genérica tipada, con render por columna y empty state.
import type { ReactNode } from 'react';
import { EmptyState } from './Feedback';
import type { LucideIcon } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  /** render personalizado de la celda */
  render?: (row: T) => ReactNode;
  /** acceso simple a una propiedad */
  accessor?: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyIcon?: LucideIcon;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  emptyTitle,
  emptyMessage,
  emptyIcon,
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} message={emptyMessage} icon={emptyIcon} />;
  }
  return (
    <div className="overflow-x-auto">
      <table className="tbl">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={c.className}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={onRowClick ? 'cursor-pointer' : ''}
            >
              {columns.map((c) => (
                <td key={c.key} className={c.className}>
                  {c.render ? c.render(row) : c.accessor ? c.accessor(row) : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
