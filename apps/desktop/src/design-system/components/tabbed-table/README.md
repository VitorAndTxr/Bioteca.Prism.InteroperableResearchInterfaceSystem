# TabbedTable Component

A generic, reusable tabbed table component that combines tab navigation, search functionality, and data tables with pagination.

## Overview

The TabbedTable component provides a consistent pattern for displaying different datasets in tabs with search and table functionality. It's perfect for screens like Users/Researchers, SNOMED categories, or any interface that needs to switch between related data views.

**Key Feature**: Each tab has its own independent data array and action button, providing maximum flexibility and type safety.

## ⚠️ Version 2.0 Breaking Changes

**If you're upgrading from v1.x**, see the [CHANGELOG](./CHANGELOG.md) for migration instructions. Key changes:
- ✅ Each tab now contains its own `data` array
- ✅ Each tab can have its own `action` button
- ❌ Global `data` prop removed
- ❌ `getData` transformation function removed

## Features

- **Tab Navigation**: Switch between different data views using the ButtonGroup component
- **Independent Data Arrays**: Each tab has its own data array with proper TypeScript typing
- **Tab-Specific Actions**: Each tab can define its own action button with custom label and handler
- **Multi-Type Support**: Different tabs can work with completely different data types
- **Search**: Built-in search functionality with customizable filter logic
- **Data Table**: Integrated DataTable component with pagination
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
    role: 'admin' | 'researcher';
}

function MyScreen() {
    // Prepare data arrays
    const users: User[] = [...];       // All users
    const admins: User[] = [...];      // Admin users only

    // Define columns
    const userColumns = [
        { id: 'name', label: 'Name', accessor: 'name' },
        { id: 'email', label: 'Email', accessor: 'email' },
        { id: 'role', label: 'Role', accessor: 'role' },
    ];

    // Define tabs with independent data arrays
    const tabs: TabbedTableTab[] = [
        {
            value: 'all',
            label: 'All Users',
            title: 'All Users',
            data: users,              // Independent data array
            columns: userColumns,
        },
        {
            value: 'admins',
            label: 'Admins',
            title: 'Admin Users',
            data: admins,             // Different data array
            columns: userColumns,
        },
    ];

    return (
        <TabbedTable
            tabs={tabs}
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
| `tabs` | `TabbedTableTab[]` | Array of tab configurations (each with its own data) |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultTab` | `string` | First tab value | Initial tab selection (uncontrolled) |
| `selectedTab` | `string` | - | Controlled tab value |
| `onTabChange` | `(tab: string) => void` | - | Tab change handler |
| `title` | `string \| (tab: string) => string` | Tab title | Card title (can use {tab} placeholder) |
| `action` | `TabbedTableAction` | - | Global action button (tab actions override this) |
| `search` | `TabbedTableSearch` | - | Search configuration |
| `pageSize` | `number` | 10 | Initial page size |
| `pageSizeOptions` | `number[]` | `[5, 10, 20, 50]` | Available page sizes |
| `emptyMessage` | `string` | "No data available." | Empty state message |
| `emptySearchMessage` | `string` | "No results found..." | Empty search results message |
| `striped` | `boolean` | `true` | Enable table row striping |
| `hoverable` | `boolean` | `true` | Enable row hover effect |
| `className` | `string` | - | Additional CSS class |

## Tab Configuration

Each tab is completely self-contained with its own data, columns, and optional action:

```typescript
interface TabbedTableTab<T = any> {
    value: string;                        // Unique identifier
    label: string;                        // Display label
    data: T[];                            // Data array for this tab
    columns: DataTableColumn<T>[];        // Columns for this tab's data type
    title?: string;                       // Custom card title (optional)
    action?: TabbedTableAction;           // Optional action button (overrides global)
}
```

### Action Configuration

```typescript
interface TabbedTableAction {
    label: string;                        // Button label
    icon?: ReactNode;                     // Icon component (usually from Heroicons)
    onClick: () => void;                  // Click handler
    variant?: 'primary' | 'secondary' | 'outline'; // Button style
}
```

## Examples

### Example 1: Different Data Types Per Tab

Perfect for completely different entities like Users and Researchers:

```tsx
interface User {
    id: string;
    login: string;
    role: UserRole;
}

interface Researcher {
    researcherId: string;
    name: string;
    email: string;
    institution: string;
}

function UsersAndResearchersScreen() {
    const users: User[] = [...];
    const researchers: Researcher[] = [...];

    const tabs: TabbedTableTab[] = [
        {
            value: 'users',
            label: 'Users',
            title: 'All Users',
            data: users,
            columns: [
                { id: 'login', label: 'Login', accessor: 'login' },
                { id: 'role', label: 'Role', accessor: 'role' },
            ],
            action: {
                label: 'Add User',
                icon: <PlusIcon />,
                onClick: () => openUserForm(),
                variant: 'primary',
            },
        },
        {
            value: 'researchers',
            label: 'Researchers',
            title: 'All Researchers',
            data: researchers,
            columns: [
                { id: 'name', label: 'Name', accessor: 'name' },
                { id: 'email', label: 'Email', accessor: 'email' },
                { id: 'institution', label: 'Institution', accessor: 'institution' },
            ],
            action: {
                label: 'Add Researcher',
                icon: <PlusIcon />,
                onClick: () => openResearcherForm(),
                variant: 'primary',
            },
        },
    ];

    return <TabbedTable tabs={tabs} />;
}
```

### Example 2: Same Type, Different Filters

When tabs show the same entity with different filters:

```tsx
interface User {
    id: string;
    name: string;
    active: boolean;
}

function UserManagementScreen() {
    const allUsers: User[] = [...];

    // Pre-filter data for each tab
    const activeUsers = allUsers.filter(u => u.active);
    const inactiveUsers = allUsers.filter(u => !u.active);

    const userColumns = [
        { id: 'name', label: 'Name', accessor: 'name' },
        { id: 'active', label: 'Status', accessor: 'active' },
    ];

    const tabs: TabbedTableTab[] = [
        {
            value: 'active',
            label: 'Active',
            data: activeUsers,
            columns: userColumns,
        },
        {
            value: 'inactive',
            label: 'Inactive',
            data: inactiveUsers,
            columns: userColumns,
        },
    ];

    return (
        <TabbedTable
            tabs={tabs}
            action={{
                label: 'Add User',
                onClick: handleAddUser,
            }}
        />
    );
}
```

### Example 3: With Row Actions

Add action buttons in each row:

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
                <button onClick={() => viewUser(user)}>
                    <EyeIcon className="w-5 h-5" />
                </button>
                <button onClick={() => editUser(user)}>
                    <PencilIcon className="w-5 h-5" />
                </button>
            </div>
        ),
    },
];

const tabs: TabbedTableTab[] = [
    {
        value: 'users',
        label: 'Users',
        data: users,
        columns,
    },
];
```

### Example 4: Tab-Specific vs Global Action

Most tabs use the same action, but one needs different behavior:

```tsx
<TabbedTable
    tabs={[
        {
            value: 'active',
            label: 'Active Users',
            data: activeUsers,
            columns: userColumns,
            // Uses global action
        },
        {
            value: 'archived',
            label: 'Archived',
            data: archivedUsers,
            columns: userColumns,
            action: {
                label: 'Restore User',       // Override for this tab
                icon: <ArrowPathIcon />,
                onClick: handleRestoreUser,
            },
        },
    ]}
    action={{
        label: 'Add User',                   // Default for other tabs
        icon: <PlusIcon />,
        onClick: handleAddUser,
    }}
/>
```

### Example 5: Controlled Component

Control the active tab from parent component:

```tsx
function ControlledExample() {
    const [selectedTab, setSelectedTab] = useState('users');

    const handleTabChange = (tab: string) => {
        console.log('Tab changed to:', tab);
        setSelectedTab(tab);
    };

    return (
        <TabbedTable
            tabs={tabs}
            selectedTab={selectedTab}
            onTabChange={handleTabChange}
        />
    );
}
```

### Example 6: Custom Search Filter

Implement complex search logic:

```tsx
<TabbedTable
    tabs={tabs}
    search={{
        placeholder: 'Search by name, email, or ID...',
        filter: (user, query) => {
            const lowerQuery = query.toLowerCase();
            return (
                user.name.toLowerCase().includes(lowerQuery) ||
                user.email.toLowerCase().includes(lowerQuery) ||
                user.id.includes(query)
            );
        },
    }}
/>
```

### Example 7: Dynamic Tab Title

Generate title dynamically based on selected tab:

```tsx
<TabbedTable
    tabs={tabs}
    title={(selectedTab) => {
        const tab = tabs.find(t => t.value === selectedTab);
        const count = tab?.data.length || 0;
        return `${tab?.label || 'Items'} (${count})`;
    }}
/>
```

## Best Practices

### ✅ DO

- **Pre-filter data** before passing to tabs for better performance
- **Use useMemo** to prevent unnecessary re-renders of tab configurations
- **Use TypeScript generics** for type-safe column definitions
- **Provide meaningful action labels** ("Add User" instead of just "Add")
- **Include dependencies** in useMemo arrays when using callbacks

```tsx
// ✅ Good: Pre-filter and memoize
const tabs = useMemo(() => [
    {
        value: 'users',
        data: users.filter(u => u.active),
        columns: userColumns,
        action: {
            label: 'Add User',
            onClick: handleAddUser,
        },
    },
], [users, userColumns, handleAddUser]);
```

### ❌ DON'T

- **Don't transform data on every render** - pre-filter instead
- **Don't use inline arrow functions** in tabs without memoization
- **Don't forget to handle empty states** - provide good empty messages
- **Don't use generic action labels** like "Add" when more specific labels are better

```tsx
// ❌ Bad: Recreating tabs on every render
const tabs = [
    {
        value: 'users',
        data: users.filter(u => u.active), // Filters on every render!
        columns: userColumns,
        action: {
            onClick: () => handleAdd(),    // New function every render!
        },
    },
];
```

## Performance Tips

1. **Memoize tab configurations**:
```tsx
const tabs = useMemo(() => [...], [dependencies]);
```

2. **Pre-filter data outside component**:
```tsx
const activeUsers = useMemo(() => users.filter(u => u.active), [users]);
```

3. **Use stable column arrays**:
```tsx
const columns = useMemo(() => [...], []);
```

4. **Avoid inline render functions when possible**:
```tsx
// Instead of inline:
render: (value) => <span>{value}</span>

// Extract to stable function:
const renderValue = useCallback((value) => <span>{value}</span>, []);
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

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history and migration guides.

## Figma Design

Based on IRIS Design System - Figma node `6804:13670`

## TypeScript

Full TypeScript support with proper generic typing:

```typescript
import type { TabbedTableTab, TabbedTableProps, TabbedTableAction } from './TabbedTable.types';
```

The component automatically infers types from your data arrays, providing excellent IDE autocomplete and type checking.
