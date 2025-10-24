/**
 * TabbedTable Component Stories
 *
 * Demonstrates the TabbedTable component in various configurations.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { TabbedTable } from './TabbedTable';
import { PlusIcon, EyeIcon, PencilIcon } from '@heroicons/react/24/outline';
import type { TabbedTableTab } from './TabbedTable.types';
import type { DataTableColumn } from '../data-table/DataTable.types';

// Mock data types
interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'researcher' | 'clinician' | 'viewer';
    institution?: string;
    lastLogin: Date;
}

// Mock data
const mockUsers: User[] = [
    {
        id: '1',
        name: 'Admin User',
        email: 'admin@iris.com',
        role: 'admin',
        lastLogin: new Date('2025-01-15T14:30:00'),
    },
    {
        id: '2',
        name: 'Dr. Silva',
        email: 'researcher@iris.com',
        role: 'researcher',
        institution: 'University of São Paulo',
        lastLogin: new Date('2025-01-14T09:15:00'),
    },
    {
        id: '3',
        name: 'Dr. Santos',
        email: 'clinician@iris.com',
        role: 'clinician',
        lastLogin: new Date('2025-01-13T16:45:00'),
    },
    {
        id: '4',
        name: 'João Oliveira',
        email: 'viewer@iris.com',
        role: 'viewer',
        lastLogin: new Date('2025-01-10T11:20:00'),
    },
    {
        id: '5',
        name: 'Dr. Maria Costa',
        email: 'maria.costa@iris.com',
        role: 'researcher',
        institution: 'Federal University of Rio de Janeiro',
        lastLogin: new Date('2025-01-12T10:00:00'),
    },
];

const meta: Meta = {
    title: 'Design System/TabbedTable',
    component: TabbedTable as any,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'A generic tabbed table component that combines tab navigation, search functionality, and data tables with pagination. Perfect for displaying different datasets in tabs.',
            },
        },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// Default columns
const defaultColumns: DataTableColumn<User>[] = [
    {
        id: 'name',
        label: 'Name',
        accessor: 'name',
        sortable: true,
    },
    {
        id: 'email',
        label: 'Email',
        accessor: 'email',
        sortable: true,
    },
    {
        id: 'role',
        label: 'Role',
        accessor: 'role',
        sortable: true,
        render: (value) => {
            const roleMap = {
                admin: 'Administrator',
                researcher: 'Researcher',
                clinician: 'Clinician',
                viewer: 'Viewer',
            };
            return roleMap[value as keyof typeof roleMap] || value;
        },
    },
    {
        id: 'lastLogin',
        label: 'Last Access',
        accessor: 'lastLogin',
        sortable: true,
        render: (value) => {
            return new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            }).format(value as Date);
        },
    },
];

// Basic tabs
const basicTabs: TabbedTableTab<User>[] = [
    {
        value: 'all',
        label: 'All Users',
        title: 'All Users',
    },
    {
        value: 'researchers',
        label: 'Researchers',
        title: 'All Researchers',
        filter: (user) => user.role === 'researcher',
    },
];

/**
 * Basic usage with two tabs and search functionality
 */
export const Basic: Story = {
    args: {
        tabs: basicTabs,
        data: mockUsers,
        columns: defaultColumns,
        action: {
            label: 'Add User',
            icon: <PlusIcon />,
            onClick: () => alert('Add user clicked'),
        },
        search: {
            placeholder: 'Search users...',
            filter: (user: User, query: string) => {
                const lowerQuery = query.toLowerCase();
                return (
                    user.name.toLowerCase().includes(lowerQuery) ||
                    user.email.toLowerCase().includes(lowerQuery)
                );
            },
        },
    },
};

/**
 * Multiple tabs with different filters
 */
export const MultipleTabs: Story = {
    args: {
        tabs: [
            {
                value: 'all',
                label: 'All',
                title: 'All Users',
            },
            {
                value: 'admins',
                label: 'Admins',
                title: 'Administrator Users',
                filter: (user: User) => user.role === 'admin',
            },
            {
                value: 'researchers',
                label: 'Researchers',
                title: 'Research Users',
                filter: (user: User) => user.role === 'researcher',
            },
            {
                value: 'clinicians',
                label: 'Clinicians',
                title: 'Clinical Users',
                filter: (user: User) => user.role === 'clinician',
            },
        ],
        data: mockUsers,
        columns: defaultColumns,
        search: {
            placeholder: 'Search...',
        },
    },
};

/**
 * Custom columns per tab
 */
export const CustomColumnsPerTab: Story = {
    args: {
        tabs: [
            {
                value: 'users',
                label: 'Users',
                title: 'System Users',
                filter: (user: User) => user.role !== 'researcher',
                columns: [
                    { id: 'name', label: 'Name', accessor: 'name' },
                    { id: 'email', label: 'Email', accessor: 'email' },
                    { id: 'role', label: 'Role', accessor: 'role' },
                ],
            },
            {
                value: 'researchers',
                label: 'Researchers',
                title: 'Research Personnel',
                filter: (user: User) => user.role === 'researcher',
                columns: [
                    { id: 'name', label: 'Name', accessor: 'name' },
                    { id: 'institution', label: 'Institution', accessor: 'institution' },
                    { id: 'email', label: 'Email', accessor: 'email' },
                ],
            },
        ],
        data: mockUsers,
        columns: defaultColumns, // Fallback columns
        search: {
            placeholder: 'Search...',
        },
    },
};

/**
 * With action buttons in table rows
 */
export const WithActionButtons: Story = {
    args: {
        tabs: basicTabs,
        data: mockUsers,
        columns: [
            ...defaultColumns,
            {
                id: 'actions',
                label: 'Actions',
                accessor: 'id',
                width: '10%',
                align: 'center',
                render: (_: any, user: User) => (
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                            onClick={() => alert(`View ${user.name}`)}
                            style={{
                                padding: '4px',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#727272',
                            }}
                            title="View"
                        >
                            <EyeIcon style={{ width: '18px', height: '18px' }} />
                        </button>
                        <button
                            onClick={() => alert(`Edit ${user.name}`)}
                            style={{
                                padding: '4px',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#727272',
                            }}
                            title="Edit"
                        >
                            <PencilIcon style={{ width: '18px', height: '18px' }} />
                        </button>
                    </div>
                ),
            },
        ],
        action: {
            label: 'Add User',
            icon: <PlusIcon />,
            onClick: () => alert('Add user clicked'),
        },
        search: {
            placeholder: 'Search users...',
        },
    },
};

/**
 * Without search functionality
 */
export const WithoutSearch: Story = {
    args: {
        tabs: basicTabs,
        data: mockUsers,
        columns: defaultColumns,
        action: {
            label: 'Add',
            icon: <PlusIcon />,
            onClick: () => alert('Add clicked'),
        },
    },
};

/**
 * Without action button
 */
export const WithoutAction: Story = {
    args: {
        tabs: basicTabs,
        data: mockUsers,
        columns: defaultColumns,
        search: {
            placeholder: 'Search...',
        },
    },
};

/**
 * Minimal configuration
 */
export const Minimal: Story = {
    args: {
        tabs: basicTabs,
        data: mockUsers,
        columns: defaultColumns,
    },
};

/**
 * Empty state
 */
export const EmptyState: Story = {
    args: {
        tabs: basicTabs,
        data: [],
        columns: defaultColumns,
        action: {
            label: 'Add User',
            icon: <PlusIcon />,
            onClick: () => alert('Add user clicked'),
        },
        search: {
            placeholder: 'Search users...',
        },
        emptyMessage: 'No users available. Click "Add User" to create one.',
    },
};

/**
 * Custom page size
 */
export const CustomPageSize: Story = {
    args: {
        tabs: basicTabs,
        data: mockUsers,
        columns: defaultColumns,
        pageSize: 3,
        pageSizeOptions: [3, 5, 10],
        search: {
            placeholder: 'Search...',
        },
    },
};
