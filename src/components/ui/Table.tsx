import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export interface TableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  actions,
  isLoading = false,
  emptyMessage = 'No data available',
}: TableProps<T>) {
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === bValue) return 0;

      const comparison = aValue > bValue ? 1 : -1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortColumn, sortDirection]);

  if (isLoading) {
    return (
      <div className="bg-[#101010] rounded-lg overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-[#23232B] mb-2" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-[#18181B] mb-1" />
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-[#101010] rounded-lg p-12">
        <p className="text-center text-[#CDCDE0] text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#101010] rounded-lg overflow-hidden shadow-lg">
      {/* Scroll indicator for mobile */}
      <div className="md:hidden bg-[#23232B] px-4 py-2 text-xs text-[#CDCDE0] text-center">
        ← Scroll horizontally to see more →
      </div>
      
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#23232B] scrollbar-track-transparent">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="bg-[#23232B] border-b border-[#2A2A2A]">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-[#CDCDE0] whitespace-nowrap ${
                    column.sortable ? 'cursor-pointer hover:text-white select-none' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronUp
                          className={`w-3 h-3 -mb-1 ${
                            sortColumn === column.key && sortDirection === 'asc'
                              ? 'text-pink-500'
                              : 'text-gray-600'
                          }`}
                        />
                        <ChevronDown
                          className={`w-3 h-3 ${
                            sortColumn === column.key && sortDirection === 'desc'
                              ? 'text-pink-500'
                              : 'text-gray-600'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {actions && (
                <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-[#CDCDE0] whitespace-nowrap">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#23232B]">
            {sortedData.map((item, index) => (
              <tr
                key={index}
                className={`${
                  onRowClick
                    ? 'cursor-pointer hover:bg-pink-600/10 transition-colors'
                    : 'hover:bg-[#18181B] transition-colors'
                }`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-white">
                    {column.render ? column.render(item) : item[column.key]}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm" onClick={(e) => e.stopPropagation()}>
                    {actions(item)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Table;
