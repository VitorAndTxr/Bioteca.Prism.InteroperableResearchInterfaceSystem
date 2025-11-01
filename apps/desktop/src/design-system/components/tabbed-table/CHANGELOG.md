# TabbedTable Component Changelog

All notable changes to the TabbedTable component will be documented in this file.

## [2.0.0] - 2025-11-01

### 🚀 Breaking Changes

#### Multiple Data Arrays Support
- **Changed**: Component now accepts data per tab instead of a single global data array
- **Removed**: `data` prop from `TabbedTableProps`
- **Removed**: `getData` function from `TabbedTableTab` interface
- **Added**: `data: T[]` property to each `TabbedTableTab`

**Migration Required**: See [Migration Guide](#migration-guide) below.

#### Action Per Tab Support
- **Added**: Optional `action` property to `TabbedTableTab` interface
- **Changed**: Tab-specific action overrides global action prop
- **Backward Compatible**: Global `action` prop still works as fallback

### ✨ New Features

1. **Tab-Specific Data Arrays**
   - Each tab can now have its own independent data array
   - No need for transformation functions
   - Better type safety with TypeScript generics

2. **Tab-Specific Actions**
   - Each tab can define its own action button
   - Supports different labels, icons, and handlers per tab
   - Falls back to global action if not specified

### 📝 Type Changes

**Before:**
```typescript
interface TabbedTableTab {
    value: string;
    label: string;
    columns: DataTableColumn<any>[];
    title?: string;
    getData: (baseData: any[]) => any[];
}

interface TabbedTableProps {
    tabs: TabbedTableTab[];
    data: any[];
    // ...
}
```

**After:**
```typescript
interface TabbedTableTab<T = any> {
    value: string;
    label: string;
    data: T[];                      // NEW: Each tab has its own data
    columns: DataTableColumn<T>[];
    title?: string;
    action?: TabbedTableAction;     // NEW: Optional action per tab
}

interface TabbedTableProps {
    tabs: TabbedTableTab[];
    // data prop removed - now in each tab
    // ...
}
```

### 🔄 Migration Guide

#### Migrating Data Arrays

**Old Pattern:**
```typescript
<TabbedTable
    tabs={[
        {
            value: 'users',
            label: 'Users',
            columns: userColumns,
            getData: (data) => data.filter(u => u.type === 'user'),
        },
        {
            value: 'admins',
            label: 'Admins',
            columns: adminColumns,
            getData: (data) => data.filter(u => u.type === 'admin'),
        },
    ]}
    data={allUsers}
/>
```

**New Pattern:**
```typescript
<TabbedTable
    tabs={[
        {
            value: 'users',
            label: 'Users',
            data: usersData,        // Direct data array
            columns: userColumns,
        },
        {
            value: 'admins',
            label: 'Admins',
            data: adminsData,       // Different data array
            columns: adminColumns,
        },
    ]}
    // No global data prop
/>
```

#### Migrating Actions

**Old Pattern (single action for all tabs):**
```typescript
<TabbedTable
    tabs={[...]}
    action={{
        label: 'Add',
        onClick: handleAdd,
    }}
/>
```

**New Pattern (action per tab):**
```typescript
<TabbedTable
    tabs={[
        {
            value: 'users',
            // ...
            action: {
                label: 'Add User',
                onClick: handleAddUser,
            },
        },
        {
            value: 'admins',
            // ...
            action: {
                label: 'Add Admin',
                onClick: handleAddAdmin,
            },
        },
    ]}
/>
```

**Note**: Global `action` prop still works if all tabs should use the same action.

### 🎯 Use Cases

#### Use Case 1: Different Data Types Per Tab

Perfect for scenarios where each tab displays completely different entity types:

```typescript
const tabs = [
    {
        value: 'users',
        label: 'Users',
        data: users,              // User[]
        columns: userColumns,     // DataTableColumn<User>[]
        action: {
            label: 'Add User',
            onClick: () => openUserForm(),
        },
    },
    {
        value: 'researchers',
        label: 'Researchers',
        data: researchers,        // Researcher[]
        columns: researcherColumns, // DataTableColumn<Researcher>[]
        action: {
            label: 'Add Researcher',
            onClick: () => openResearcherForm(),
        },
    },
];
```

#### Use Case 2: Same Type, Different Filters

When tabs show the same entity type with different filters:

```typescript
const activeUsers = users.filter(u => u.active);
const inactiveUsers = users.filter(u => !u.active);

const tabs = [
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
```

#### Use Case 3: Global Action with Tab Override

Most tabs use the same action, but one tab needs different behavior:

```typescript
<TabbedTable
    tabs={[
        {
            value: 'users',
            data: users,
            columns: userColumns,
            // Uses global action
        },
        {
            value: 'archived',
            data: archivedUsers,
            columns: userColumns,
            action: {
                label: 'Restore User',  // Override for this tab
                onClick: handleRestore,
            },
        },
    ]}
    action={{
        label: 'Add User',          // Default action
        onClick: handleAdd,
    }}
/>
```

### 🔍 Benefits

1. **Type Safety**: TypeScript can now properly infer types for each tab's data
2. **Simplicity**: No need for complex `getData` transformation functions
3. **Flexibility**: Each tab is completely independent
4. **Clarity**: Data and columns are colocated in the same object
5. **Performance**: No unnecessary transformations on each render

### 📚 Related Files

- `TabbedTable.types.ts` - Type definitions
- `TabbedTable.tsx` - Component implementation
- `TabbedTable.stories.tsx` - Storybook examples (update needed)
- `README.md` - Component documentation

### 🐛 Bug Fixes

- Fixed issue where all tabs shared the same data source
- Fixed type inference issues with multiple data types

### ⚠️ Known Issues

None at this time.

### 📖 Documentation

See [TabbedTable README](./README.md) for complete usage documentation and examples.

---

## [1.0.0] - Initial Release

- Basic tabbed table functionality
- Single data source with transformation functions
- Global action button
- Search and pagination support
