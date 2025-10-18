/**
 * DataTable Component Storybook Stories
 *
 * Comprehensive stories demonstrating all DataTable features and use cases.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DataTable } from './DataTable';
import { DataTableColumn, SortConfig, PaginationConfig, SelectionConfig } from './DataTable.types';

// ============================================================================
// Mock Data
// ============================================================================

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Researcher' | 'Clinician' | 'Viewer';
  status: 'Active' | 'Inactive' | 'Pending';
  lastLogin: string;
  department: string;
}

const mockUsers: User[] = [
  {
    id: 'USR-001',
    name: 'Dr. Ana Silva',
    email: 'ana.silva@iris.com',
    role: 'Admin',
    status: 'Active',
    lastLogin: '2025-10-18 09:30',
    department: 'Neuroscience',
  },
  {
    id: 'USR-002',
    name: 'Dr. João Santos',
    email: 'joao.santos@iris.com',
    role: 'Researcher',
    status: 'Active',
    lastLogin: '2025-10-18 08:15',
    department: 'Cardiology',
  },
  {
    id: 'USR-003',
    name: 'Maria Oliveira',
    email: 'maria.oliveira@iris.com',
    role: 'Clinician',
    status: 'Active',
    lastLogin: '2025-10-17 16:45',
    department: 'Neuroscience',
  },
  {
    id: 'USR-004',
    name: 'Pedro Costa',
    email: 'pedro.costa@iris.com',
    role: 'Researcher',
    status: 'Inactive',
    lastLogin: '2025-10-15 11:20',
    department: 'Oncology',
  },
  {
    id: 'USR-005',
    name: 'Carla Pereira',
    email: 'carla.pereira@iris.com',
    role: 'Viewer',
    status: 'Pending',
    lastLogin: 'Never',
    department: 'Administration',
  },
  {
    id: 'USR-006',
    name: 'Dr. Ricardo Lima',
    email: 'ricardo.lima@iris.com',
    role: 'Researcher',
    status: 'Active',
    lastLogin: '2025-10-18 10:00',
    department: 'Neuroscience',
  },
  {
    id: 'USR-007',
    name: 'Fernanda Alves',
    email: 'fernanda.alves@iris.com',
    role: 'Clinician',
    status: 'Active',
    lastLogin: '2025-10-18 07:30',
    department: 'Cardiology',
  },
  {
    id: 'USR-008',
    name: 'Marcos Rodrigues',
    email: 'marcos.rodrigues@iris.com',
    role: 'Researcher',
    status: 'Active',
    lastLogin: '2025-10-17 14:00',
    department: 'Oncology',
  },
];

// Generate more data for pagination tests
const generateUsers = (count: number): User[] => {
  const roles: User['role'][] = ['Admin', 'Researcher', 'Clinician', 'Viewer'];
  const statuses: User['status'][] = ['Active', 'Inactive', 'Pending'];
  const departments = ['Neuroscience', 'Cardiology', 'Oncology', 'Administration'];

  return Array.from({ length: count }, (_, i) => ({
    id: `USR-${String(i + 1).padStart(3, '0')}`,
    name: `User ${i + 1}`,
    email: `user${i + 1}@iris.com`,
    role: roles[i % roles.length],
    status: statuses[i % statuses.length],
    lastLogin: `2025-10-${String((i % 28) + 1).padStart(2, '0')} ${String(i % 24).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}`,
    department: departments[i % departments.length],
  }));
};

// ============================================================================
// Meta Configuration
// ============================================================================

const meta = {
  title: 'Design System/DataTable',
  component: DataTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
A comprehensive, feature-rich data table component for displaying tabular data with sorting, filtering, pagination, and row selection.

Based on Figma design: node 6804-13670 (Users List Screen)

## Features

- ✅ **Sorting**: Single and multi-column sorting with custom comparators
- ✅ **Filtering**: Column-level and global search filtering
- ✅ **Pagination**: Customizable page sizes with navigation controls
- ✅ **Row Selection**: Single and multiple selection modes
- ✅ **Loading States**: Built-in loading spinner and empty state
- ✅ **Accessibility**: Full ARIA support and keyboard navigation
- ✅ **Customization**: Custom cell renderers, row classes, and column widths
- ✅ **Responsive**: Works on all screen sizes

## Usage

\`\`\`tsx
import { DataTable, DataTableColumn } from '@/design-system/components/data-table';

const columns: DataTableColumn<User>[] = [
  { id: 'name', label: 'Name', accessor: 'name', sortable: true },
  { id: 'email', label: 'Email', accessor: 'email', sortable: true },
  { id: 'role', label: 'Role', accessor: 'role' },
];

<DataTable
  columns={columns}
  data={users}
  pagination={{ currentPage: 1, pageSize: 10, totalItems: users.length }}
  onPageChange={setPage}
/>
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    columns: {
      description: 'Column definitions for the table',
      control: false,
    },
    data: {
      description: 'Array of data objects to display',
      control: false,
    },
    hoverable: {
      description: 'Whether rows should highlight on hover',
      control: 'boolean',
    },
    striped: {
      description: 'Whether to show alternating row colors',
      control: 'boolean',
    },
    bordered: {
      description: 'Whether to show borders around cells',
      control: 'boolean',
    },
    stickyHeader: {
      description: 'Whether header should remain visible when scrolling',
      control: 'boolean',
    },
    loading: {
      description: 'Show loading state',
      control: 'boolean',
    },
    emptyMessage: {
      description: 'Message to show when no data is available',
      control: 'text',
    },
  },
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================================================
// Basic Stories
// ============================================================================

const baseColumns: DataTableColumn<User>[] = [
  { id: 'id', label: 'Login', accessor: 'id', width: 100, sortable: true },
  { id: 'name', label: 'Nome', accessor: 'name', sortable: true },
  { id: 'email', label: 'Email', accessor: 'email', sortable: true },
  { id: 'role', label: 'Tipo', accessor: 'role', sortable: true },
  { id: 'department', label: 'Departamento', accessor: 'department', sortable: true },
  { id: 'lastLogin', label: 'Último acesso', accessor: 'lastLogin', sortable: true },
];

export const Default: Story = {
  args: {
    columns: baseColumns,
    data: mockUsers,
  },
};

export const WithPagination: Story = {
  args: {
    columns: baseColumns,
    data: mockUsers,
  },
  render: (args) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const allUsers = generateUsers(50);

    const pagination: PaginationConfig = {
      currentPage,
      pageSize,
      totalItems: allUsers.length,
      pageSizeOptions: [5, 10, 20, 50],
      showPageSizeSelector: true,
    };

    return (
      <DataTable
        {...args}
        columns={baseColumns}
        data={allUsers}
        pagination={pagination}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />
    );
  },
};

export const WithSorting: Story = {
  args: {
    columns: baseColumns,
    data: mockUsers,
  },
  render: (args) => {
    const [sort, setSort] = useState<SortConfig | null>(null);

    return (
      <DataTable
        {...args}
        columns={baseColumns}
        data={mockUsers}
        sort={sort || undefined}
        onSortChange={(newSort) => setSort(newSort)}
      />
    );
  },
};

// ============================================================================
// Selection Stories
// ============================================================================

export const SingleSelection: Story = {
  args: {
    columns: baseColumns,
    data: mockUsers,
  },
  render: (args) => {
    const [selectedKeys, setSelectedKeys] = useState(new Set<string | number>());

    const selection: SelectionConfig<User> = {
      mode: 'single',
      selectedKeys,
      onChange: (keys) => setSelectedKeys(keys),
      getRowKey: (row) => row.id,
    };

    return (
      <div>
        <p style={{ marginBottom: '16px', color: '#2c3131' }}>
          Selected: {selectedKeys.size > 0 ? Array.from(selectedKeys).join(', ') : 'None'}
        </p>
        <DataTable
          columns={baseColumns}
          data={mockUsers}
          selection={selection}
        />
      </div>
    );
  },
};

export const MultipleSelection: Story = {
  args: {
    columns: baseColumns,
    data: mockUsers,
  },
  render: (args) => {
    const [selectedKeys, setSelectedKeys] = useState(new Set<string | number>());

    const selection: SelectionConfig<User> = {
      mode: 'multiple',
      selectedKeys,
      onChange: (keys) => setSelectedKeys(keys),
      getRowKey: (row) => row.id,
      showSelectAll: true,
    };

    return (
      <div>
        <p style={{ marginBottom: '16px', color: '#2c3131' }}>
          Selected {selectedKeys.size} of {mockUsers.length}: {Array.from(selectedKeys).join(', ')}
        </p>
        <DataTable
          columns={baseColumns}
          data={mockUsers}
          selection={selection}
        />
      </div>
    );
  },
};

// ============================================================================
// Custom Rendering Stories
// ============================================================================

export const WithCustomCells: Story = {
  args: {
    columns: baseColumns,
    data: mockUsers,
  },
  render: (args) => {
    const columnsWithCustomRender: DataTableColumn<User>[] = [
      { id: 'id', label: 'Login', accessor: 'id', width: 100 },
      { id: 'name', label: 'Nome', accessor: 'name', sortable: true },
      {
        id: 'status',
        label: 'Status',
        accessor: 'status',
        sortable: true,
        render: (value: User['status']) => (
          <span
            style={{
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor:
                value === 'Active'
                  ? '#dcfce7'
                  : value === 'Inactive'
                  ? '#fee2e2'
                  : '#fef3c7',
              color:
                value === 'Active'
                  ? '#166534'
                  : value === 'Inactive'
                  ? '#991b1b'
                  : '#854d0e',
            }}
          >
            {value}
          </span>
        ),
      },
      {
        id: 'role',
        label: 'Tipo',
        accessor: 'role',
        render: (value: User['role']) => (
          <span style={{ fontWeight: value === 'Admin' ? 600 : 400 }}>
            {value}
          </span>
        ),
      },
      {
        id: 'actions',
        label: 'Ações',
        accessor: 'id',
        width: 120,
        align: 'center',
        render: (_, row) => (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button
              className="action-button"
              onClick={(e) => {
                e.stopPropagation();
                alert(`View ${row.name}`);
              }}
              title="View"
            >
              👁️
            </button>
            <button
              className="action-button"
              onClick={(e) => {
                e.stopPropagation();
                alert(`Edit ${row.name}`);
              }}
              title="Edit"
            >
              ✏️
            </button>
            <button
              className="action-button"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete ${row.name}?`)) {
                  alert(`Deleted ${row.name}`);
                }
              }}
              title="Delete"
            >
              🗑️
            </button>
          </div>
        ),
      },
    ];

    return (
      <DataTable
        columns={columnsWithCustomRender}
        data={mockUsers}
      />
    );
  },
};

// ============================================================================
// State Stories
// ============================================================================

export const LoadingState: Story = {
  args: {
    columns: baseColumns,
    data: mockUsers,
    loading: true,
  },
};

export const EmptyState: Story = {
  args: {
    columns: baseColumns,
    data: [],
    emptyMessage: 'No users found. Try adjusting your filters.',
  },
};

export const CustomEmptyState: Story = {
  args: {
    columns: baseColumns,
    data: [],
    emptyComponent: (
      <div style={{ textAlign: 'center', padding: '48px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
        <h3 style={{ color: '#2c3131', marginBottom: '8px' }}>No Data Available</h3>
        <p style={{ color: '#727272', marginBottom: '16px' }}>
          Start by adding some users to the system.
        </p>
        <button
          style={{
            padding: '8px 16px',
            background: '#49a2a8',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          Add User
        </button>
      </div>
    ),
  },
};

// ============================================================================
// Styling Stories
// ============================================================================

export const Striped: Story = {
  args: {
    columns: baseColumns,
    data: mockUsers,
    striped: true,
  },
};

export const Bordered: Story = {
  args: {
    columns: baseColumns,
    data: mockUsers,
    bordered: true,
  },
};

export const StickyHeader: Story = {
  args: {
    columns: baseColumns,
    data: mockUsers,
  },
  render: (args) => {
    const longData = generateUsers(30);

    return (
      <DataTable
        columns={baseColumns}
        data={longData}
        stickyHeader
        maxHeight={400}
      />
    );
  },
};

// ============================================================================
// Interaction Stories
// ============================================================================

export const ClickableRows: Story = {
  args: {
    columns: baseColumns,
    data: mockUsers,
  },
  render: (args) => {
    return (
      <DataTable
        {...args}
        columns={baseColumns}
        data={mockUsers}
        rowClickable
        onRowClick={(row: User) => alert(`Clicked on ${row.name}`)}
        onRowDoubleClick={(row: User) => alert(`Double-clicked on ${row.name}`)}
      />
    );
  },
};

export const ConditionalRowStyling: Story = {
  args: {
    columns: baseColumns,
    data: mockUsers,
  },
  render: (args) => {
    return (
      <DataTable
        {...args}
        columns={baseColumns}
        data={mockUsers}
        rowClassName={(row: User) => {
          if (row.status === 'Inactive') return 'text-muted';
          if (row.role === 'Admin') return 'text-success';
          return '';
        }}
      />
    );
  },
};

// ============================================================================
// Complete Example
// ============================================================================

export const CompleteExample: Story = {
  args: {
    columns: baseColumns,
    data: mockUsers,
  },
  render: (args) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sort, setSort] = useState<SortConfig | null>({ columnId: 'name', direction: 'asc' });
    const [selectedKeys, setSelectedKeys] = useState(new Set<string | number>());
    const [searchValue, setSearchValue] = useState('');

    const allUsers = generateUsers(100);

    const selection: SelectionConfig<User> = {
      mode: 'multiple',
      selectedKeys,
      onChange: (keys) => setSelectedKeys(keys),
      getRowKey: (row) => row.id,
      showSelectAll: true,
    };

    const pagination: PaginationConfig = {
      currentPage,
      pageSize,
      totalItems: allUsers.length,
      pageSizeOptions: [10, 20, 50, 100],
      showPageSizeSelector: true,
    };

    const columnsWithActions: DataTableColumn<User>[] = [
      ...baseColumns,
      {
        id: 'actions',
        label: 'Ações',
        accessor: 'id',
        width: 100,
        align: 'center',
        render: (_, row) => (
          <div className="actions-wrapper">
            <button className="action-button" title="View">
              👁️
            </button>
            <button className="action-button" title="Edit">
              ✏️
            </button>
          </div>
        ),
      },
    ];

    return (
      <div>
        <div style={{ marginBottom: '16px', padding: '16px', background: '#fcfcfc', borderRadius: '8px' }}>
          <input
            type="text"
            placeholder="Search users..."
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d1d1',
              borderRadius: '8px',
              fontSize: '14px',
            }}
          />
        </div>

        <DataTable
          columns={columnsWithActions}
          data={allUsers}
          pagination={pagination}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
          sort={sort || undefined}
          onSortChange={setSort}
          selection={selection}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          hoverable
          rowClickable
          onRowClick={(row) => console.log('Clicked:', row)}
        />

        <div style={{ marginTop: '16px', padding: '16px', background: '#fcfcfc', borderRadius: '8px' }}>
          <strong>Selected Users ({selectedKeys.size}):</strong>
          <div style={{ marginTop: '8px', color: '#727272' }}>
            {selectedKeys.size > 0 ? Array.from(selectedKeys).join(', ') : 'None'}
          </div>
        </div>
      </div>
    );
  },
};
