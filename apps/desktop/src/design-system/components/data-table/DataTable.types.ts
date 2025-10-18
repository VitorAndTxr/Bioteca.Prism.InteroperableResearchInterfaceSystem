/**
 * DataTable Component Type Definitions
 *
 * Based on Figma design: node 6804-13670 (Users List Screen)
 * Design system component for IRIS desktop application
 */

// ============================================================================
// Column Types
// ============================================================================

/**
 * Column alignment options
 */
export type ColumnAlign = 'left' | 'center' | 'right';

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc' | null;

/**
 * Column definition
 */
export interface DataTableColumn<T = any> {
  /** Unique identifier for the column */
  id: string;

  /** Column header label */
  label: string;

  /** Key in the data object to access value (can use dot notation like 'user.name') */
  accessor: keyof T | string;

  /** Column width (px, %, or 'auto') */
  width?: number | string;

  /** Minimum column width */
  minWidth?: number;

  /** Text alignment */
  align?: ColumnAlign;

  /** Whether this column is sortable */
  sortable?: boolean;

  /** Whether this column is filterable */
  filterable?: boolean;

  /** Custom render function for cell content */
  render?: (value: any, row: T, rowIndex: number) => React.ReactNode;

  /** Custom render function for header */
  renderHeader?: (column: DataTableColumn<T>) => React.ReactNode;

  /** Custom sort comparator */
  sortFn?: (a: T, b: T, direction: 'asc' | 'desc') => number;

  /** Custom filter function */
  filterFn?: (row: T, filterValue: string) => boolean;

  /** Whether to hide this column */
  hidden?: boolean;

  /** Column CSS class */
  className?: string;

  /** Header CSS class */
  headerClassName?: string;
}

// ============================================================================
// Data & Pagination Types
// ============================================================================

/**
 * Pagination configuration
 */
export interface PaginationConfig {
  /** Current page (1-indexed) */
  currentPage: number;

  /** Number of items per page */
  pageSize: number;

  /** Total number of items */
  totalItems: number;

  /** Available page size options */
  pageSizeOptions?: number[];

  /** Whether to show page size selector */
  showPageSizeSelector?: boolean;
}

/**
 * Sort configuration
 */
export interface SortConfig {
  /** Column ID to sort by */
  columnId: string;

  /** Sort direction */
  direction: 'asc' | 'desc';
}

/**
 * Filter configuration
 */
export interface FilterConfig {
  /** Column ID to filter */
  columnId: string;

  /** Filter value */
  value: string;
}

// ============================================================================
// Selection Types
// ============================================================================

/**
 * Row selection mode
 */
export type SelectionMode = 'none' | 'single' | 'multiple';

/**
 * Selection configuration
 */
export interface SelectionConfig<T = any> {
  /** Selection mode */
  mode: SelectionMode;

  /** Selected row keys */
  selectedKeys: Set<string | number>;

  /** Callback when selection changes */
  onChange?: (selectedKeys: Set<string | number>, selectedRows: T[]) => void;

  /** Function to get unique key from row */
  getRowKey?: (row: T, index: number) => string | number;

  /** Whether to show select all checkbox (multiple mode only) */
  showSelectAll?: boolean;
}

// ============================================================================
// Component Props
// ============================================================================

/**
 * DataTable component props
 */
export interface DataTableProps<T = any> {
  // ========================================
  // Required Props
  // ========================================

  /** Column definitions */
  columns: DataTableColumn<T>[];

  /** Data rows */
  data: T[];

  // ========================================
  // Appearance
  // ========================================

  /** Table caption for accessibility */
  caption?: string;

  /** Whether to show borders between rows */
  bordered?: boolean;

  /** Whether to show striped rows */
  striped?: boolean;

  /** Whether to highlight row on hover */
  hoverable?: boolean;

  /** Fixed header when scrolling */
  stickyHeader?: boolean;

  /** Maximum table height (enables vertical scrolling) */
  maxHeight?: number | string;

  /** Whether to make columns resizable */
  resizable?: boolean;

  // ========================================
  // Sorting
  // ========================================

  /** Default sort configuration */
  defaultSort?: SortConfig;

  /** Controlled sort configuration */
  sort?: SortConfig;

  /** Callback when sort changes */
  onSortChange?: (sort: SortConfig | null) => void;

  /** Whether to enable multi-column sorting */
  multiSort?: boolean;

  // ========================================
  // Filtering
  // ========================================

  /** Active filters */
  filters?: FilterConfig[];

  /** Callback when filters change */
  onFilterChange?: (filters: FilterConfig[]) => void;

  /** Global search value */
  searchValue?: string;

  /** Callback when global search changes */
  onSearchChange?: (value: string) => void;

  // ========================================
  // Pagination
  // ========================================

  /** Pagination configuration */
  pagination?: PaginationConfig;

  /** Callback when page changes */
  onPageChange?: (page: number) => void;

  /** Callback when page size changes */
  onPageSizeChange?: (pageSize: number) => void;

  // ========================================
  // Selection
  // ========================================

  /** Row selection configuration */
  selection?: SelectionConfig<T>;

  // ========================================
  // Loading & Empty States
  // ========================================

  /** Whether data is loading */
  loading?: boolean;

  /** Custom loading component */
  loadingComponent?: React.ReactNode;

  /** Message to show when table is empty */
  emptyMessage?: string;

  /** Custom empty state component */
  emptyComponent?: React.ReactNode;

  // ========================================
  // Row Interaction
  // ========================================

  /** Callback when row is clicked */
  onRowClick?: (row: T, rowIndex: number, event: React.MouseEvent) => void;

  /** Callback when row is double-clicked */
  onRowDoubleClick?: (row: T, rowIndex: number, event: React.MouseEvent) => void;

  /** Function to determine if row is clickable */
  rowClickable?: boolean | ((row: T, rowIndex: number) => boolean);

  /** Custom row CSS class function */
  rowClassName?: (row: T, rowIndex: number) => string;

  // ========================================
  // Advanced
  // ========================================

  /** Additional CSS class names */
  className?: string;

  /** Custom styles for the container */
  style?: React.CSSProperties;

  /** ARIA label for accessibility */
  'aria-label'?: string;

  /** Test ID for automated testing */
  'data-testid'?: string;

  /** Virtualization (for large datasets) */
  virtualized?: boolean;

  /** Row height for virtualization */
  rowHeight?: number;
}

// ============================================================================
// Internal Component Props
// ============================================================================

/**
 * Props for DataTableHeader component
 */
export interface DataTableHeaderProps<T = any> {
  columns: DataTableColumn<T>[];
  sort?: SortConfig;
  onSortChange?: (columnId: string) => void;
  selection?: SelectionConfig<T>;
  allSelected?: boolean;
  someSelected?: boolean;
  onSelectAll?: () => void;
}

/**
 * Props for DataTableBody component
 */
export interface DataTableBodyProps<T = any> {
  columns: DataTableColumn<T>[];
  data: T[];
  selection?: SelectionConfig<T>;
  selectedKeys: Set<string | number>;
  onRowSelect?: (rowKey: string | number) => void;
  onRowClick?: (row: T, rowIndex: number, event: React.MouseEvent) => void;
  onRowDoubleClick?: (row: T, rowIndex: number, event: React.MouseEvent) => void;
  rowClickable?: boolean | ((row: T, rowIndex: number) => boolean);
  rowClassName?: (row: T, rowIndex: number) => string;
  loading?: boolean;
  emptyMessage?: string;
  emptyComponent?: React.ReactNode;
}

/**
 * Props for DataTableRow component
 */
export interface DataTableRowProps<T = any> {
  row: T;
  rowIndex: number;
  columns: DataTableColumn<T>[];
  selected?: boolean;
  selectable?: boolean;
  clickable?: boolean;
  onSelect?: () => void;
  onClick?: (event: React.MouseEvent) => void;
  onDoubleClick?: (event: React.MouseEvent) => void;
  className?: string;
}

/**
 * Props for DataTablePagination component
 */
export interface DataTablePaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get nested property value from object using dot notation
 */
export function getNestedValue<T>(obj: T, path: string): any {
  return path.split('.').reduce((current: any, key: string) => current?.[key], obj);
}

/**
 * Default row key getter (uses 'id' property or index)
 */
export function defaultGetRowKey<T extends { id?: string | number }>(
  row: T,
  index: number
): string | number {
  return row.id ?? index;
}

/**
 * Default sort comparator
 */
export function defaultSortComparator<T>(
  a: T,
  b: T,
  accessor: string,
  direction: 'asc' | 'desc'
): number {
  const aValue = getNestedValue(a, accessor);
  const bValue = getNestedValue(b, accessor);

  if (aValue == null && bValue == null) return 0;
  if (aValue == null) return direction === 'asc' ? 1 : -1;
  if (bValue == null) return direction === 'asc' ? -1 : 1;

  if (typeof aValue === 'string' && typeof bValue === 'string') {
    return direction === 'asc'
      ? aValue.localeCompare(bValue)
      : bValue.localeCompare(aValue);
  }

  if (aValue < bValue) return direction === 'asc' ? -1 : 1;
  if (aValue > bValue) return direction === 'asc' ? 1 : -1;
  return 0;
}

/**
 * Default filter function
 */
export function defaultFilterFn<T>(
  row: T,
  accessor: string,
  filterValue: string
): boolean {
  const value = getNestedValue(row, accessor);
  if (value == null) return false;

  return String(value).toLowerCase().includes(filterValue.toLowerCase());
}
