# TabbedTable Component

A generic, reusable tabbed table component that combines tab navigation, search functionality, and data tables with pagination.

## Overview

The TabbedTable component provides a consistent pattern for displaying different datasets in tabs with search and table functionality. It's perfect for screens like Users/Researchers, SNOMED categories, or any interface that needs to switch between related data views.

**Key Feature**: Each tab can work with different data types through a common base type, allowing maximum flexibility while maintaining type safety.

## Features

- **Tab Navigation**: Switch between different data views using the ButtonGroup component
- **Multi-Type Support**: Each tab can transform base data into its own specific type
- **Search**: Built-in search functionality with customizable filter logic
- **Data Table**: Integrated DataTable component with pagination
- **Flexible Configuration**: Customize columns, filters, and data transformation per tab
- **Responsive**: Mobile-friendly responsive design
- **Accessible**: Proper ARIA labels and keyboard navigation

## Basic Usage

```tsx
import { TabbedTable } from '@/design-system/components/tabbed-table';
import type { TabbedTableTab } from '@/design-system/components/tabbed-table';
import { PlusIcon } from '@heroicons/react/24/outline';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'researcher' | 'viewer';
}

function MyScreen() {
    const users: User[] = [...]; // Your data

    // Define columns
    const userColumns = [
        { id: 'name', label: 'Name', accessor: 'name' },
        { id: 'email', label: 'Email', accessor: 'email' },
        { id: 'role', label: 'Role', accessor: 'role' },
    ];

    // Define tabs
    const tabs: TabbedTableTab<User, User>[] = [
        {
            value: 'all',
            label: 'All Users',
            title: 'All Users',
            columns: userColumns,
            getData: (users) => users, // No filtering
        },
        {
            value: 'researchers',
            label: 'Researchers',
            title: 'Research Users',
            columns: userColumns,
            getData: (users) => users.filter(u => u.role === 'researcher'),
        },
    ];

    return (
        <TabbedTable
            tabs={tabs}
            data={users}
            action={{
                label: 'Add User',
                icon: <PlusIcon />,
                onClick: () => console.log('Add clicked'),
            }}
            search={{
                placeholder: 'Search users...',
                filter: (user, query) =>
                    user.name.toLowerCase().includes(query.toLowerCase()),
            }}
        />
    );
}
```

## Props

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `tabs` | `TabbedTableTab<TBaseData, any>[]` | Array of tab configurations |
| `data` | `TBaseData[]` | Base data array (transformed by each tab) |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultTab` | `string` | First tab value | Initial tab selection (uncontrolled) |
| `selectedTab` | `string` | - | Controlled tab value |
| `onTabChange` | `(tab: string) => void` | - | Tab change handler |
| `title` | `string \| (tab: string) => string` | Tab label | Card title (can use {tab} placeholder) |
| `action` | `TabbedTableAction` | - | Action button configuration |
| `search` | `TabbedTableSearch` | - | Search configuration |
| `pageSize` | `number` | 10 | Initial page size |
| `pageSizeOptions` | `number[]` | `[5, 10, 20, 50]` | Available page sizes |
| `emptyMessage` | `string` | "No data available." | Empty state message |
| `emptySearchMessage` | `string` | "No results found..." | Empty search results message |
| `striped` | `boolean` | `true` | Enable table row striping |
| `hoverable` | `boolean` | `true` | Enable row hover effect |
| `className` | `string` | - | Additional CSS class |

## Tab Configuration

Each tab defines how to transform the base data and what columns to display:

```typescript
interface TabbedTableTab<TBaseData, TTabData> {
    value: string;                      // Unique identifier
    label: string;                      // Display label
    columns: DataTableColumn<TTabData>[]; // Columns for this tab's data type
    title?: string;                     // Custom card title (optional)
    getData: (baseData: TBaseData[]) => TTabData[]; // Transform base data to tab data
}
```

### Type Parameters

- `TBaseData`: The base/source data type that all tabs receive
- `TTabData`: The specific data type this tab works with (after transformation)

## Advanced Examples

### Same Type, Different Filters

When all tabs work with the same data type but filter differently:

```tsx
interface User {
    id: string;
    name: string;
    role: 'admin' | 'researcher' | 'viewer';
}

const columns = [
    { id: 'name', label: 'Name', accessor: 'name' },
    { id: 'role', label: 'Role', accessor: 'role' },
];

const tabs: TabbedTableTab<User, User>[] = [
    {
        value: 'all',
        label: 'All',
        columns,
        getData: (users) => users,
    },
    {
        value: 'admins',
        label: 'Admins',
        columns,
        getData: (users) => users.filter(u => u.role === 'admin'),
    },
];

<TabbedTable tabs={tabs} data={users} />
```

### Different Types Per Tab

When tabs need to transform data into different types:

```tsx
// Base type
interface BaseUser {
    id: string;
    name: string;
    email: string;
    role: string;
    institution?: string;
    department?: string;
}

// Tab-specific types
interface SystemUser {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface ResearchUser {
    id: string;
    name: string;
    institution: string;
    department: string;
}

const tabs: TabbedTableTab<BaseUser, any>[] = [
    {
        value: 'system',
        label: 'System Users',
        columns: [
            { id: 'name', label: 'Name', accessor: 'name' },
            { id: 'email', label: 'Email', accessor: 'email' },
            { id: 'role', label: 'Role', accessor: 'role' },
        ],
        getData: (baseUsers): SystemUser[] =>
            baseUsers
                .filter(u => u.role !== 'researcher')
                .map(u => ({
                    id: u.id,
                    name: u.name,
                    email: u.email,
                    role: u.role,
                })),
    },
    {
        value: 'research',
        label: 'Researchers',
        columns: [
            { id: 'name', label: 'Name', accessor: 'name' },
            { id: 'institution', label: 'Institution', accessor: 'institution' },
            { id: 'department', label: 'Department', accessor: 'department' },
        ],
        getData: (baseUsers): ResearchUser[] =>
            baseUsers
                .filter(u => u.role === 'researcher')
                .map(u => ({
                    id: u.id,
                    name: u.name,
                    institution: u.institution || 'N/A',
                    department: u.department || 'N/A',
                })),
    },
];

<TabbedTable tabs={tabs} data={baseUsers} />
```

### With Action Buttons in Rows

```tsx
const columns = [
    { id: 'name', label: 'Name', accessor: 'name' },
    { id: 'email', label: 'Email', accessor: 'email' },
    {
        id: 'actions',
        label: 'Actions',
        accessor: 'id',
        width: '10%',
        align: 'center',
        render: (_, user) => (
            <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => viewUser(user)}>View</button>
                <button onClick={() => editUser(user)}>Edit</button>
            </div>
        ),
    },
];

const tabs: TabbedTableTab<User, User>[] = [
    {
        value: 'all',
        label: 'All Users',
        columns,
        getData: (users) => users,
    },
];
```

### Controlled Component

```tsx
function ControlledExample() {
    const [selectedTab, setSelectedTab] = useState('users');

    return (
        <TabbedTable
            tabs={tabs}
            data={data}
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
        />
    );
}
```

### Custom Search Filter

```tsx
<TabbedTable
    tabs={tabs}
    data={data}
    search={{
        placeholder: 'Search by name or email...',
        filter: (user, query) => {
            const lowerQuery = query.toLowerCase();
            return (
                user.name.toLowerCase().includes(lowerQuery) ||
                user.email.toLowerCase().includes(lowerQuery)
            );
        },
    }}
/>
```

## Design Tokens

The component uses these design tokens from the IRIS Design System:

- **Colors**:
  - Neutros-50 (#FCFCFC) - Card background
  - Neutros-800 (#2C3131) - Title text
  - Shadow: 2px 4px 4px 0px rgba(0, 0, 0, 0.08)

- **Typography**:
  - Title: Inter Regular 22px, line-height 1.35

- **Spacing**:
  - Card padding: 16px
  - Gap between sections: 24px
  - Border radius: 8px (top-right, bottom-left, bottom-right)

## Accessibility

- Uses semantic HTML elements
- Proper ARIA labels on tab navigation
- Keyboard navigation support through ButtonGroup
- Focus management
- Screen reader friendly

## Related Components

- [ButtonGroup](../button-group/README.md) - Tab navigation
- [DataTable](../data-table/README.md) - Table display
- [SearchBar](../search-bar/README.md) - Search input
- [Button](../button/README.md) - Action button

## Figma Design

Based on IRIS Design System - Figma node `6804:13670`
