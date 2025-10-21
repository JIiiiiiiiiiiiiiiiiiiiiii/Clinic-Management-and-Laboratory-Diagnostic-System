import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

interface SortableTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface SortableTableProps {
  data: any[];
  columns: SortableTableColumn[];
  defaultSort?: {
    key: string;
    direction: 'asc' | 'desc';
  };
  className?: string;
  emptyMessage?: string;
  emptyIcon?: React.ComponentType<any>;
}

type SortDirection = 'asc' | 'desc' | null;

export default function SortableTable({
  data,
  columns,
  defaultSort,
  className = '',
  emptyMessage = 'No data available',
  emptyIcon: EmptyIcon
}: SortableTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: SortDirection;
  }>({
    key: defaultSort?.key || '',
    direction: defaultSort?.direction || null
  });

  const handleSort = (key: string) => {
    const column = columns.find(col => col.key === key);
    if (!column?.sortable) return;

    setSortConfig(prevConfig => {
      if (prevConfig.key === key) {
        // Cycle through: asc -> desc -> asc
        if (prevConfig.direction === 'asc') {
          return { key, direction: 'desc' };
        } else {
          return { key, direction: 'asc' };
        }
      } else {
        return { key, direction: 'asc' };
      }
    });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortConfig.direction === 'asc' ? -1 : 1;
      if (bValue == null) return sortConfig.direction === 'asc' ? 1 : -1;

      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue, undefined, { numeric: true });
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const comparison = aValue - bValue;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        const comparison = aValue.getTime() - bValue.getTime();
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }

      // Fallback to string comparison
      const aStr = String(aValue);
      const bStr = String(bValue);
      const comparison = aStr.localeCompare(bStr, undefined, { numeric: true });
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, sortConfig]);

  const getSortIcon = (key: string) => {
    if (sortConfig.key !== key) {
      return <ChevronsUpDown className="h-4 w-4 text-gray-400" />;
    }

    if (sortConfig.direction === 'asc') {
      return <ChevronUp className="h-4 w-4 text-blue-600" />;
    } else {
      return <ChevronDown className="h-4 w-4 text-blue-600" />;
    }
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        {EmptyIcon && <EmptyIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />}
        <h3 className="text-lg font-semibold text-gray-600 mb-2">{emptyMessage}</h3>
      </div>
    );
  }

  return (
    <div className={`rounded-md border ${className}`}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={`font-semibold text-gray-700 ${column.className || ''} ${
                  column.sortable ? 'cursor-pointer hover:bg-gray-50 select-none' : ''
                }`}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center gap-2">
                  {column.label}
                  {column.sortable && getSortIcon(column.key)}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((row, index) => (
            <TableRow key={row.id || index} className="hover:bg-gray-50">
              {columns.map((column) => (
                <TableCell key={column.key} className={column.className}>
                  {column.render 
                    ? column.render(row[column.key], row)
                    : row[column.key]
                  }
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
