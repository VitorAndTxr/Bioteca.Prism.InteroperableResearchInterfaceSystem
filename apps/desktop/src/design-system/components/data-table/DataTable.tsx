/**
 * DataTable Component
 *
 * A comprehensive data table component with sorting, filtering, pagination, and row selection.
 * Based on Figma design: node 6804-13670 (Users List Screen)
 *
 * @example
 * ```tsx
 * <DataTable
 *   columns={[
 *     { id: 'name', label: 'Name', accessor: 'name', sortable: true },
 *     { id: 'email', label: 'Email', accessor: 'email', sortable: true },
 *   ]}
 *   data={users}
 *   pagination={{ currentPage: 1, pageSize: 10, totalItems: 100 }}
 *   onPageChange={(page) => setPage(page)}
 * />
 * ```
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  DataTableProps,
  DataTableColumn,
  SortConfig,
  FilterConfig,
  SelectionConfig,
  defaultGetRowKey,
  defaultSortComparator,
  defaultFilterFn,
  getNestedValue,
} from './DataTable.types';
import './DataTable.css';

export function DataTable<T = any>({
  // Required props
  columns,
  data,

  // Appearance
  caption,
  bordered = false,
  striped = false,
  hoverable = true,
  stickyHeader = false,
  maxHeight,
  resizable = false,

  // Sorting
  defaultSort,
  sort: controlledSort,
  onSortChange,
  multiSort = false,

  // Filtering
  filters: controlledFilters,
  onFilterChange,
  searchValue,
  onSearchChange,

  // Pagination
  pagination,
  onPageChange,
  onPageSizeChange,

  // Selection
  selection,

  // Loading & Empty States
  loading = false,
  loadingComponent,
  emptyMessage = 'No data available',
  emptyComponent,

  // Row Interaction
  onRowClick,
  onRowDoubleClick,
  rowClickable = false,
  rowClassName,

  // Advanced
  className = '',
  style,
  'aria-label': ariaLabel,
  'data-testid': dataTestId,
  virtualized = false,
  rowHeight = 45,
}: DataTableProps<T>) {
  // ============================================================================
  // State Management
  // ============================================================================

  const [internalSort, setInternalSort] = useState<SortConfig | null>(defaultSort || null);
  const [internalFilters, setInternalFilters] = useState<FilterConfig[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(
    selection?.selectedKeys || new Set()
  );

  const sort = controlledSort !== undefined ? controlledSort : internalSort;
  const filters = controlledFilters !== undefined ? controlledFilters : internalFilters;

  // ============================================================================
  // Data Processing
  // ============================================================================

  // Apply filters and search
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply column filters
    if (filters.length > 0) {
      result = result.filter((row) => {
        return filters.every((filter) => {
          const column = columns.find((col) => col.id === filter.columnId);
          if (!column) return true;

          if (column.filterFn) {
            return column.filterFn(row, filter.value);
          }

          return defaultFilterFn(row, column.accessor as string, filter.value);
        });
      });
    }

    // Apply global search
    if (searchValue) {
      result = result.filter((row) => {
        return columns.some((column) => {
          const value = getNestedValue(row, column.accessor as string);
          if (value == null) return false;
          return String(value).toLowerCase().includes(searchValue.toLowerCase());
        });
      });
    }

    return result;
  }, [data, filters, searchValue, columns]);

  // Apply sorting
  const sortedData = useMemo(() => {
    if (!sort) return filteredData;

    const column = columns.find((col) => col.id === sort.columnId);
    if (!column || !column.sortable) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      if (column.sortFn) {
        return column.sortFn(a, b, sort.direction);
      }

      return defaultSortComparator(a, b, column.accessor as string, sort.direction);
    });

    return sorted;
  }, [filteredData, sort, columns]);

  // Apply pagination
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;

    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, pagination]);

  const displayData = paginatedData;

  // ============================================================================
  // Event Handlers
  // ============================================================================

  const handleSort = useCallback((columnId: string) => {
    const column = columns.find((col) => col.id === columnId);
    if (!column || !column.sortable) return;

    const newSort: SortConfig = {
      columnId,
      direction:
        sort?.columnId === columnId && sort?.direction === 'asc' ? 'desc' : 'asc',
    };

    if (controlledSort === undefined) {
      setInternalSort(newSort);
    }

    onSortChange?.(newSort);
  }, [sort, columns, controlledSort, onSortChange]);

  const handleRowSelect = useCallback((rowKey: string | number) => {
    if (!selection) return;

    const newSelectedKeys = new Set(selectedKeys);

    if (selection.mode === 'single') {
      newSelectedKeys.clear();
      if (!selectedKeys.has(rowKey)) {
        newSelectedKeys.add(rowKey);
      }
    } else if (selection.mode === 'multiple') {
      if (newSelectedKeys.has(rowKey)) {
        newSelectedKeys.delete(rowKey);
      } else {
        newSelectedKeys.add(rowKey);
      }
    }

    setSelectedKeys(newSelectedKeys);

    const selectedRows = displayData.filter((row, index) => {
      const key = selection.getRowKey?.(row, index) || defaultGetRowKey(row, index);
      return newSelectedKeys.has(key);
    });

    selection.onChange?.(newSelectedKeys, selectedRows);
  }, [selection, selectedKeys, displayData]);

  const handleSelectAll = useCallback(() => {
    if (!selection || selection.mode !== 'multiple') return;

    const newSelectedKeys = new Set<string | number>();

    if (selectedKeys.size !== displayData.length) {
      displayData.forEach((row, index) => {
        const key = selection.getRowKey?.(row, index) || defaultGetRowKey(row, index);
        newSelectedKeys.add(key);
      });
    }

    setSelectedKeys(newSelectedKeys);

    const selectedRows = displayData.filter((row, index) => {
      const key = selection.getRowKey?.(row, index) || defaultGetRowKey(row, index);
      return newSelectedKeys.has(key);
    });

    selection.onChange?.(newSelectedKeys, selectedRows);
  }, [selection, selectedKeys, displayData]);

  // ============================================================================
  // Render Helpers
  // ============================================================================

  const renderHeader = () => {
    const visibleColumns = columns.filter((col) => !col.hidden);
    const allSelected = selectedKeys.size === displayData.length && displayData.length > 0;
    const someSelected = selectedKeys.size > 0 && selectedKeys.size < displayData.length;

    return (
      <thead>
        <tr>
          {selection && selection.mode !== 'none' && (
            <th className="cell-checkbox">
              {selection.mode === 'multiple' && selection.showSelectAll !== false && (
                <div className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={handleSelectAll}
                    aria-label="Select all rows"
                  />
                </div>
              )}
            </th>
          )}
          {visibleColumns.map((column) => {
            const isSorted = sort?.columnId === column.id;
            const sortDirection = isSorted ? sort?.direction : null;

            return (
              <th
                key={column.id}
                className={`
                  ${column.sortable ? 'sortable' : ''}
                  ${isSorted ? 'sorted' : ''}
                  ${column.align ? `align-${column.align}` : ''}
                  ${column.headerClassName || ''}
                `}
                style={{
                  width: column.width,
                  minWidth: column.minWidth,
                }}
                onClick={() => column.sortable && handleSort(column.id)}
                aria-sort={
                  isSorted
                    ? sortDirection === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : undefined
                }
              >
                {column.renderHeader ? (
                  column.renderHeader(column)
                ) : (
                  <div className="header-content">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <span className="sort-icon" aria-hidden="true">
                        {sortDirection === 'asc' ? '↑' : sortDirection === 'desc' ? '↓' : '↕'}
                      </span>
                    )}
                  </div>
                )}
              </th>
            );
          })}
        </tr>
      </thead>
    );
  };

  const renderBody = () => {
    if (loading) {
      return (
        <tbody>
          <tr>
            <td colSpan={columns.length + (selection ? 1 : 0)}>
              {loadingComponent || (
                <div className="data-table-loading">
                  <div className="spinner" aria-label="Loading" />
                  <span className="loading-text">Loading...</span>
                </div>
              )}
            </td>
          </tr>
        </tbody>
      );
    }

    if (displayData.length === 0) {
      return (
        <tbody>
          <tr>
            <td colSpan={columns.length + (selection ? 1 : 0)}>
              {emptyComponent || (
                <div className="data-table-empty">
                  <span className="empty-text">{emptyMessage}</span>
                </div>
              )}
            </td>
          </tr>
        </tbody>
      );
    }

    const visibleColumns = columns.filter((col) => !col.hidden);

    return (
      <tbody>
        {displayData.map((row, rowIndex) => {
          const rowKey = selection?.getRowKey?.(row, rowIndex) || defaultGetRowKey(row, rowIndex);
          const isSelected = selectedKeys.has(rowKey);
          const isClickable = typeof rowClickable === 'function'
            ? rowClickable(row, rowIndex)
            : rowClickable;

          const rowClass = [
            hoverable ? 'hoverable' : '',
            isClickable ? 'clickable' : '',
            isSelected ? 'selected' : '',
            striped ? 'striped' : '',
            rowClassName?.(row, rowIndex) || '',
          ].filter(Boolean).join(' ');

          return (
            <tr
              key={rowKey}
              className={rowClass}
              onClick={(e) => {
                if (isClickable) {
                  onRowClick?.(row, rowIndex, e);
                }
              }}
              onDoubleClick={(e) => onRowDoubleClick?.(row, rowIndex, e)}
            >
              {selection && selection.mode !== 'none' && (
                <td className="cell-checkbox">
                  <div className="checkbox-wrapper">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleRowSelect(rowKey)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select row ${rowIndex + 1}`}
                    />
                  </div>
                </td>
              )}
              {visibleColumns.map((column) => {
                const value = getNestedValue(row, column.accessor as string);

                return (
                  <td
                    key={column.id}
                    className={`
                      ${column.align ? `align-${column.align}` : ''}
                      ${column.className || ''}
                    `}
                  >
                    {column.render ? column.render(value, row, rowIndex) : value}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    );
  };

  const renderPagination = () => {
    if (!pagination) return null;

    const totalPages = Math.ceil(pagination.totalItems / pagination.pageSize);
    const startItem = (pagination.currentPage - 1) * pagination.pageSize + 1;
    const endItem = Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems);

    return (
      <div className="data-table-pagination">
        <div className="pagination-info">
          Showing {startItem} to {endItem} of {pagination.totalItems} entries
        </div>

        <div className="pagination-controls">
          <button
            className="pagination-button"
            onClick={() => onPageChange?.(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            aria-label="Previous page"
          >
            ←
          </button>

          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNumber: number;

            if (totalPages <= 5) {
              pageNumber = i + 1;
            } else if (pagination.currentPage <= 3) {
              pageNumber = i + 1;
            } else if (pagination.currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + i;
            } else {
              pageNumber = pagination.currentPage - 2 + i;
            }

            return (
              <button
                key={pageNumber}
                className={`pagination-button ${pagination.currentPage === pageNumber ? 'active' : ''}`}
                onClick={() => onPageChange?.(pageNumber)}
                aria-label={`Page ${pageNumber}`}
                aria-current={pagination.currentPage === pageNumber ? 'page' : undefined}
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            className="pagination-button"
            onClick={() => onPageChange?.(pagination.currentPage + 1)}
            disabled={pagination.currentPage === totalPages}
            aria-label="Next page"
          >
            →
          </button>
        </div>

        {pagination.showPageSizeSelector !== false && pagination.pageSizeOptions && (
          <div className="pagination-page-size">
            <label htmlFor="page-size-select">Rows per page:</label>
            <select
              id="page-size-select"
              value={pagination.pageSize}
              onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
              aria-label="Rows per page"
            >
              {pagination.pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div
      className={`data-table-container ${className}`}
      style={style}
      data-testid={dataTestId}
    >
      <div
        className={`data-table-wrapper ${stickyHeader ? 'sticky-header' : ''}`}
        style={maxHeight ? { '--table-max-height': typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight } as React.CSSProperties : undefined}
      >
        <table
          className={`data-table ${bordered ? 'bordered' : ''}`}
          aria-label={ariaLabel || caption}
        >
          {caption && <caption>{caption}</caption>}
          {renderHeader()}
          {renderBody()}
        </table>
      </div>
      {renderPagination()}
    </div>
  );
}

export default DataTable;
