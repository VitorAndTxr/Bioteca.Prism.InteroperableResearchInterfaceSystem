# DataTable Component

A comprehensive, feature-rich data table component for displaying tabular data with sorting, filtering, pagination, and row selection.

**Figma Design:** [Users List Screen (node 6804-13670)](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6804-13670)

## Features

- ✅ **Sorting**: Single and multi-column sorting with custom comparators
- ✅ **Filtering**: Column-level and global search filtering
- ✅ **Pagination**: Customizable page sizes with navigation controls
- ✅ **Row Selection**: Single and multiple selection modes
- ✅ **Loading States**: Built-in loading spinner and empty state
- ✅ **Accessibility**: Full ARIA support and keyboard navigation
- ✅ **Customization**: Custom cell renderers, row classes, and column widths
- ✅ **Responsive**: Works on all screen sizes
- ✅ **TypeScript**: Full type safety with comprehensive interfaces

## Installation

```tsx
import { DataTable, DataTableColumn } from '@/design-system/components/data-table';
```

## Basic Usage

```tsx
import { DataTable, DataTableColumn } from '@/design-system/components/data-table';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const columns: DataTableColumn<User>[] = [
  { id: 'name', label: 'Name', accessor: 'name', sortable: true },
  { id: 'email', label: 'Email', accessor: 'email', sortable: true },
  { id: 'role', label: 'Role', accessor: 'role' },
];

const users: User[] = [
  { id: '1', name: 'Ana Silva', email: 'ana@iris.com', role: 'Admin' },
  { id: '2', name: 'João Santos', email: 'joao@iris.com', role: 'Researcher' },
];

function MyComponent() {
  return (
    <DataTable
      columns={columns}
      data={users}
    />
  );
}
```

## Column Configuration

### Basic Column

```tsx
const column: DataTableColumn<User> = {
  id: 'name',           // Unique identifier
  label: 'Name',        // Header text
  accessor: 'name',     // Property key to access data
  sortable: true,       // Enable sorting
  width: 200,           // Column width (px, %, or 'auto')
  align: 'left',        // Text alignment ('left' | 'center' | 'right')
};
```

### Custom Cell Renderer

```tsx
const column: DataTableColumn<User> = {
  id: 'status',
  label: 'Status',
  accessor: 'status',
  render: (value, row, rowIndex) => (
    <span className={`status-badge status-${value.toLowerCase()}`}>
      {value}
    </span>
  ),
};
```

### Custom Sort Function

```tsx
const column: DataTableColumn<User> = {
  id: 'date',
  label: 'Date',
  accessor: 'createdAt',
  sortable: true,
  sortFn: (a, b, direction) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return direction === 'asc' ? dateA - dateB : dateB - dateA;
  },
};
```

### Nested Data Access

Use dot notation to access nested properties:

```tsx
const column: DataTableColumn<User> = {
  id: 'department',
  label: 'Department',
  accessor: 'profile.department.name',  // Access nested data
  sortable: true,
};
```

## Pagination

### Basic Pagination

```tsx
import { useState } from 'react';
import { DataTable, PaginationConfig } from '@/design-system/components/data-table';

function PaginatedTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const pagination: PaginationConfig = {
    currentPage,
    pageSize,
    totalItems: users.length,
  };

  return (
    <DataTable
      columns={columns}
      data={users}
      pagination={pagination}
      onPageChange={setCurrentPage}
    />
  );
}
```

### With Page Size Selector

```tsx
function TableWithPageSize() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const pagination: PaginationConfig = {
    currentPage,
    pageSize,
    totalItems: users.length,
    pageSizeOptions: [10, 20, 50, 100],
    showPageSizeSelector: true,
  };

  return (
    <DataTable
      columns={columns}
      data={users}
      pagination={pagination}
      onPageChange={setCurrentPage}
      onPageSizeChange={(size) => {
        setPageSize(size);
        setCurrentPage(1);  // Reset to first page
      }}
    />
  );
}
```

## Sorting

### Controlled Sorting

```tsx
import { useState } from 'react';
import { DataTable, SortConfig } from '@/design-system/components/data-table';

function SortableTable() {
  const [sort, setSort] = useState<SortConfig | null>({
    columnId: 'name',
    direction: 'asc'
  });

  return (
    <DataTable
      columns={columns}
      data={users}
      sort={sort || undefined}
      onSortChange={setSort}
    />
  );
}
```

### Uncontrolled Sorting

```tsx
function TableWithDefaultSort() {
  return (
    <DataTable
      columns={columns}
      data={users}
      defaultSort={{ columnId: 'name', direction: 'asc' }}
    />
  );
}
```

## Row Selection

### Single Selection

```tsx
import { useState } from 'react';
import { DataTable, SelectionConfig } from '@/design-system/components/data-table';

function SingleSelectionTable() {
  const [selectedKeys, setSelectedKeys] = useState(new Set<string | number>());

  const selection: SelectionConfig<User> = {
    mode: 'single',
    selectedKeys,
    onChange: (keys, rows) => {
      setSelectedKeys(keys);
      console.log('Selected users:', rows);
    },
    getRowKey: (row) => row.id,  // How to get unique key from row
  };

  return (
    <DataTable
      columns={columns}
      data={users}
      selection={selection}
    />
  );
}
```

### Multiple Selection

```tsx
function MultipleSelectionTable() {
  const [selectedKeys, setSelectedKeys] = useState(new Set<string | number>());

  const selection: SelectionConfig<User> = {
    mode: 'multiple',
    selectedKeys,
    onChange: (keys, rows) => {
      setSelectedKeys(keys);
      console.log('Selected users:', rows);
    },
    getRowKey: (row) => row.id,
    showSelectAll: true,  // Show "select all" checkbox in header
  };

  return (
    <DataTable
      columns={columns}
      data={users}
      selection={selection}
    />
  );
}
```

## Filtering & Search

### Global Search

```tsx
function SearchableTable() {
  const [searchValue, setSearchValue] = useState('');

  return (
    <div>
      <input
        type="text"
        placeholder="Search..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />
      <DataTable
        columns={columns}
        data={users}
        searchValue={searchValue}
      />
    </div>
  );
}
```

### Column Filters

```tsx
import { useState } from 'react';
import { DataTable, FilterConfig } from '@/design-system/components/data-table';

function FilterableTable() {
  const [filters, setFilters] = useState<FilterConfig[]>([]);

  const addFilter = (columnId: string, value: string) => {
    setFilters([...filters, { columnId, value }]);
  };

  return (
    <DataTable
      columns={columns}
      data={users}
      filters={filters}
      onFilterChange={setFilters}
    />
  );
}
```

## Loading & Empty States

### Loading State

```tsx
function LoadingTable() {
  const [loading, setLoading] = useState(true);

  return (
    <DataTable
      columns={columns}
      data={users}
      loading={loading}
    />
  );
}
```

### Custom Loading Component

```tsx
function TableWithCustomLoading() {
  return (
    <DataTable
      columns={columns}
      data={users}
      loading={true}
      loadingComponent={
        <div className="custom-loader">
          <Spinner size="large" />
          <p>Loading users...</p>
        </div>
      }
    />
  );
}
```

### Empty State

```tsx
function EmptyTable() {
  return (
    <DataTable
      columns={columns}
      data={[]}
      emptyMessage="No users found. Try adjusting your filters."
    />
  );
}
```

### Custom Empty Component

```tsx
function TableWithCustomEmpty() {
  return (
    <DataTable
      columns={columns}
      data={[]}
      emptyComponent={
        <div className="custom-empty-state">
          <Icon name="users" size={64} />
          <h3>No Users Yet</h3>
          <p>Get started by adding your first user.</p>
          <Button onClick={handleAddUser}>Add User</Button>
        </div>
      }
    />
  );
}
```

## Row Interactions

### Clickable Rows

```tsx
function ClickableTable() {
  return (
    <DataTable
      columns={columns}
      data={users}
      rowClickable
      onRowClick={(row, index, event) => {
        console.log('Clicked row:', row);
        navigate(`/users/${row.id}`);
      }}
      onRowDoubleClick={(row, index, event) => {
        console.log('Double-clicked row:', row);
      }}
    />
  );
}
```

### Conditional Row Styling

```tsx
function StyledTable() {
  return (
    <DataTable
      columns={columns}
      data={users}
      rowClassName={(row, index) => {
        if (row.status === 'Inactive') return 'row-inactive';
        if (row.role === 'Admin') return 'row-admin';
        return '';
      }}
    />
  );
}
```

## Styling Options

### Striped Rows

```tsx
<DataTable
  columns={columns}
  data={users}
  striped
/>
```

### Bordered Table

```tsx
<DataTable
  columns={columns}
  data={users}
  bordered
/>
```

### Sticky Header

```tsx
<DataTable
  columns={columns}
  data={users}
  stickyHeader
  maxHeight={500}  // Enable scrolling
/>
```

### Custom Styling

```tsx
<DataTable
  columns={columns}
  data={users}
  className="my-custom-table"
  style={{ maxWidth: '1200px', margin: '0 auto' }}
/>
```

## Advanced Examples

### Complete CRUD Table

```tsx
import { useState } from 'react';
import { DataTable, DataTableColumn } from '@/design-system/components/data-table';

function UserManagementTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState<SortConfig | null>(null);
  const [selectedKeys, setSelectedKeys] = useState(new Set<string | number>());
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);

  const columns: DataTableColumn<User>[] = [
    { id: 'id', label: 'Login', accessor: 'id', width: 100, sortable: true },
    { id: 'name', label: 'Nome', accessor: 'name', sortable: true },
    { id: 'email', label: 'Email', accessor: 'email', sortable: true },
    { id: 'role', label: 'Tipo', accessor: 'role', sortable: true },
    {
      id: 'status',
      label: 'Status',
      accessor: 'status',
      render: (value) => (
        <StatusBadge status={value} />
      ),
    },
    {
      id: 'actions',
      label: 'Ações',
      accessor: 'id',
      width: 120,
      align: 'center',
      render: (_, row) => (
        <div className="actions-wrapper">
          <button onClick={() => handleView(row)}>👁️</button>
          <button onClick={() => handleEdit(row)}>✏️</button>
          <button onClick={() => handleDelete(row)}>🗑️</button>
        </div>
      ),
    },
  ];

  return (
    <div className="user-management">
      <div className="table-header">
        <h2>Users and Researchers</h2>
        <Button onClick={handleAddUser}>Add User</Button>
      </div>

      <div className="table-controls">
        <SearchBar
          value={searchValue}
          onChange={setSearchValue}
          placeholder="Search users..."
        />
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        pagination={{
          currentPage,
          pageSize,
          totalItems: users.length,
          pageSizeOptions: [10, 20, 50],
          showPageSizeSelector: true,
        }}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        sort={sort || undefined}
        onSortChange={setSort}
        selection={{
          mode: 'multiple',
          selectedKeys,
          onChange: setSelectedKeys,
          getRowKey: (row) => row.id,
        }}
        searchValue={searchValue}
        hoverable
        rowClickable
        onRowClick={handleRowClick}
      />

      {selectedKeys.size > 0 && (
        <div className="bulk-actions">
          <Button onClick={handleBulkDelete}>
            Delete Selected ({selectedKeys.size})
          </Button>
        </div>
      )}
    </div>
  );
}
```

## Props Reference

### DataTableProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `DataTableColumn<T>[]` | **Required** | Column definitions |
| `data` | `T[]` | **Required** | Data rows |
| `caption` | `string` | - | Table caption for accessibility |
| `bordered` | `boolean` | `false` | Show borders between rows |
| `striped` | `boolean` | `false` | Alternating row colors |
| `hoverable` | `boolean` | `true` | Highlight row on hover |
| `stickyHeader` | `boolean` | `false` | Fixed header when scrolling |
| `maxHeight` | `number \| string` | - | Maximum table height |
| `defaultSort` | `SortConfig` | - | Default sort configuration |
| `sort` | `SortConfig` | - | Controlled sort state |
| `onSortChange` | `(sort: SortConfig \| null) => void` | - | Sort change callback |
| `pagination` | `PaginationConfig` | - | Pagination configuration |
| `onPageChange` | `(page: number) => void` | - | Page change callback |
| `onPageSizeChange` | `(size: number) => void` | - | Page size change callback |
| `selection` | `SelectionConfig<T>` | - | Row selection configuration |
| `loading` | `boolean` | `false` | Show loading state |
| `loadingComponent` | `ReactNode` | - | Custom loading component |
| `emptyMessage` | `string` | `"No data available"` | Empty state message |
| `emptyComponent` | `ReactNode` | - | Custom empty component |
| `rowClickable` | `boolean \| ((row: T, index: number) => boolean)` | `false` | Make rows clickable |
| `onRowClick` | `(row: T, index: number, event: MouseEvent) => void` | - | Row click handler |
| `rowClassName` | `(row: T, index: number) => string` | - | Custom row class |

### DataTableColumn

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | **Required** | Unique column identifier |
| `label` | `string` | **Required** | Column header label |
| `accessor` | `keyof T \| string` | **Required** | Data property key |
| `width` | `number \| string` | - | Column width |
| `minWidth` | `number` | - | Minimum column width |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Text alignment |
| `sortable` | `boolean` | `false` | Enable sorting |
| `render` | `(value: any, row: T, index: number) => ReactNode` | - | Custom cell renderer |
| `renderHeader` | `(column: DataTableColumn<T>) => ReactNode` | - | Custom header renderer |
| `sortFn` | `(a: T, b: T, direction: 'asc' \| 'desc') => number` | - | Custom sort function |
| `hidden` | `boolean` | `false` | Hide this column |

## Accessibility

The DataTable component is fully accessible:

- **ARIA attributes**: Proper `role`, `aria-label`, `aria-sort`, `aria-current` attributes
- **Keyboard navigation**: Full keyboard support for interactive elements
- **Screen reader support**: Accessible labels and descriptions
- **Focus management**: Proper focus indicators and tab order

## Performance Tips

1. **Use pagination** for large datasets (>100 rows)
2. **Memoize custom renderers** to avoid unnecessary re-renders
3. **Provide a unique `getRowKey`** function for better React reconciliation
4. **Use controlled state** only when needed (prefer uncontrolled for simple cases)
5. **Virtualization**: Enable for extremely large datasets (>1000 rows)

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Related Components

- [Button](../button/README.md) - For action buttons in cells
- [SearchBar](../search-bar/README.md) - For global search
- [Dropdown](../dropdown/README.md) - For filter dropdowns

## License

MIT
