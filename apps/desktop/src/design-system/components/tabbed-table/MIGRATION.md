# TabbedTable Migration Guide: v1.x → v2.0

This guide helps you migrate from TabbedTable v1.x to v2.0, which introduces independent data arrays per tab and tab-specific actions.

## Quick Summary

| Change | v1.x | v2.0 |
|--------|------|------|
| Data location | Global `data` prop | Per-tab `data` property |
| Data transformation | `getData()` function | Pre-filtered arrays |
| Action buttons | Global only | Per-tab with global fallback |

## Breaking Changes

### 1. Data Prop Removed

**Before (v1.x):**
```tsx
<TabbedTable
    tabs={tabs}
    data={allUsers}  // ❌ No longer exists
/>
```

**After (v2.0):**
```tsx
<TabbedTable
    tabs={tabs}  // Data is now inside each tab
/>
```

### 2. getData Function Removed

**Before (v1.x):**
```tsx
const tabs = [
    {
        value: 'users',
        label: 'Users',
        columns: userColumns,
        getData: (data) => data.filter(u => u.type === 'user'),  // ❌ Removed
    },
];
```

**After (v2.0):**
```tsx
// Pre-filter data before passing to tab
const usersData = allUsers.filter(u => u.type === 'user');

const tabs = [
    {
        value: 'users',
        label: 'Users',
        data: usersData,  // ✅ Direct data array
        columns: userColumns,
    },
];
```

## Step-by-Step Migration

### Scenario 1: Simple Filter (Same Type, Different Filters)

**v1.x Code:**
```tsx
function UsersScreen() {
    const allUsers: User[] = useUsers();

    const tabs = [
        {
            value: 'active',
            label: 'Active',
            columns: userColumns,
            getData: (users) => users.filter(u => u.active),
        },
        {
            value: 'inactive',
            label: 'Inactive',
            columns: userColumns,
            getData: (users) => users.filter(u => !u.active),
        },
    ];

    return <TabbedTable tabs={tabs} data={allUsers} />;
}
```

**v2.0 Code:**
```tsx
function UsersScreen() {
    const allUsers: User[] = useUsers();

    // Step 1: Pre-filter data
    const activeUsers = useMemo(
        () => allUsers.filter(u => u.active),
        [allUsers]
    );
    const inactiveUsers = useMemo(
        () => allUsers.filter(u => !u.active),
        [allUsers]
    );

    // Step 2: Pass filtered data to tabs
    const tabs = useMemo(() => [
        {
            value: 'active',
            label: 'Active',
            data: activeUsers,      // ✅ Pre-filtered
            columns: userColumns,
        },
        {
            value: 'inactive',
            label: 'Inactive',
            data: inactiveUsers,    // ✅ Pre-filtered
            columns: userColumns,
        },
    ], [activeUsers, inactiveUsers]);

    return <TabbedTable tabs={tabs} />;  // ✅ No data prop
}
```

### Scenario 2: Different Types Per Tab

**v1.x Code:**
```tsx
function UsersAndResearchersScreen() {
    const allData = useAllData();  // Mixed array

    const tabs = [
        {
            value: 'users',
            label: 'Users',
            columns: userColumns,
            getData: (data) => data
                .filter(item => item.type === 'user')
                .map(item => transformToUser(item)),
        },
        {
            value: 'researchers',
            label: 'Researchers',
            columns: researcherColumns,
            getData: (data) => data
                .filter(item => item.type === 'researcher')
                .map(item => transformToResearcher(item)),
        },
    ];

    return <TabbedTable tabs={tabs} data={allData} />;
}
```

**v2.0 Code:**
```tsx
function UsersAndResearchersScreen() {
    const users: User[] = useUsers();           // Separate queries
    const researchers: Researcher[] = useResearchers();

    const tabs = useMemo(() => [
        {
            value: 'users',
            label: 'Users',
            data: users,              // ✅ Direct User[]
            columns: userColumns,
        },
        {
            value: 'researchers',
            label: 'Researchers',
            data: researchers,        // ✅ Direct Researcher[]
            columns: researcherColumns,
        },
    ], [users, researchers]);

    return <TabbedTable tabs={tabs} />;
}
```

### Scenario 3: Adding Tab-Specific Actions

**v1.x Code (Global Action Only):**
```tsx
<TabbedTable
    tabs={tabs}
    data={data}
    action={{
        label: 'Add',
        onClick: handleAdd,
    }}
/>
```

**v2.0 Code (Tab-Specific Actions):**
```tsx
const tabs = [
    {
        value: 'users',
        data: users,
        columns: userColumns,
        action: {
            label: 'Add User',           // ✅ Tab-specific
            icon: <PlusIcon />,
            onClick: handleAddUser,      // ✅ Different handler
        },
    },
    {
        value: 'researchers',
        data: researchers,
        columns: researcherColumns,
        action: {
            label: 'Add Researcher',     // ✅ Tab-specific
            icon: <PlusIcon />,
            onClick: handleAddResearcher, // ✅ Different handler
        },
    },
];

<TabbedTable tabs={tabs} />  // ✅ No global action needed
```

## Migration Checklist

Use this checklist to ensure complete migration:

- [ ] **Remove `data` prop** from `<TabbedTable>` component
- [ ] **Remove `getData` functions** from all tab configurations
- [ ] **Add `data` property** to each tab with pre-filtered array
- [ ] **Wrap data filtering** in `useMemo` for performance
- [ ] **Wrap tab configuration** in `useMemo` with proper dependencies
- [ ] **Consider adding tab-specific actions** if different behaviors needed
- [ ] **Update TypeScript types** if using custom generic types
- [ ] **Test each tab** to ensure data displays correctly
- [ ] **Test search functionality** with new data structure
- [ ] **Test pagination** across tabs

## Common Patterns

### Pattern 1: Memoizing Filtered Data

```tsx
// ✅ Good: Memoize filtered data
const activeUsers = useMemo(
    () => users.filter(u => u.active),
    [users]
);

const tabs = useMemo(() => [{
    value: 'active',
    data: activeUsers,
    columns: userColumns,
}], [activeUsers]);
```

```tsx
// ❌ Bad: Filter on every render
const tabs = [{
    value: 'active',
    data: users.filter(u => u.active),  // Runs every render!
    columns: userColumns,
}];
```

### Pattern 2: Multiple Filters

```tsx
const allUsers = useUsers();

// Pre-filter all variations
const activeUsers = useMemo(
    () => allUsers.filter(u => u.active),
    [allUsers]
);
const inactiveUsers = useMemo(
    () => allUsers.filter(u => !u.active),
    [allUsers]
);
const adminUsers = useMemo(
    () => allUsers.filter(u => u.role === 'admin'),
    [allUsers]
);

// Use in tabs
const tabs = useMemo(() => [
    { value: 'active', data: activeUsers, columns: userColumns },
    { value: 'inactive', data: inactiveUsers, columns: userColumns },
    { value: 'admins', data: adminUsers, columns: userColumns },
], [activeUsers, inactiveUsers, adminUsers]);
```

### Pattern 3: Conditional Actions

```tsx
const tabs = useMemo(() => [
    {
        value: 'active',
        data: activeUsers,
        columns: userColumns,
        // Most tabs use same action (defined globally)
    },
    {
        value: 'archived',
        data: archivedUsers,
        columns: userColumns,
        action: {
            label: 'Restore',        // Override for this tab
            onClick: handleRestore,
        },
    },
], [activeUsers, archivedUsers]);

<TabbedTable
    tabs={tabs}
    action={{
        label: 'Add User',          // Default action
        onClick: handleAdd,
    }}
/>
```

## Performance Improvements

v2.0 offers better performance:

1. **No redundant transformations**: Data is filtered once, not on every render
2. **Better memoization**: React can properly cache filtered arrays
3. **Clearer dependencies**: `useMemo` dependencies are explicit
4. **Type safety**: TypeScript knows exact types, no `any[]` transformations

## TypeScript Changes

### Before (v1.x)

```typescript
interface TabbedTableTab<TBaseData, TTabData> {
    value: string;
    label: string;
    columns: DataTableColumn<TTabData>[];
    getData: (baseData: TBaseData[]) => TTabData[];
}
```

### After (v2.0)

```typescript
interface TabbedTableTab<T = any> {
    value: string;
    label: string;
    data: T[];                         // ✅ Direct typed array
    columns: DataTableColumn<T>[];
    action?: TabbedTableAction;        // ✅ Optional action
}
```

## Troubleshooting

### Issue: "Property 'data' does not exist on type 'TabbedTableProps'"

**Solution**: Remove the `data` prop from `<TabbedTable>` and add it to each tab.

### Issue: "Property 'getData' does not exist on type 'TabbedTableTab'"

**Solution**: Remove `getData` functions and pass pre-filtered data arrays.

### Issue: Tabs show no data

**Solution**: Ensure each tab has a `data` property with a valid array.

### Issue: Performance degradation (filtering on every render)

**Solution**: Wrap filtered data in `useMemo`:
```tsx
const filteredData = useMemo(() => data.filter(...), [data]);
```

### Issue: TypeScript errors with column accessors

**Solution**: Ensure column `accessor` matches properties in tab's data type:
```tsx
// ✅ Correct: accessor matches User type
interface User { name: string; email: string; }
const columns: DataTableColumn<User>[] = [
    { id: 'name', accessor: 'name', label: 'Name' },
];
```

## Need Help?

- See [README.md](./README.md) for complete usage documentation
- See [CHANGELOG.md](./CHANGELOG.md) for detailed change list
- Check [examples](#examples) in README for practical patterns

## Benefits of Migrating

1. ✅ **Better Type Safety**: TypeScript knows exact types, no transformations
2. ✅ **Clearer Code**: Data flow is explicit and easy to follow
3. ✅ **Better Performance**: No redundant transformations
4. ✅ **More Flexible**: Tab-specific actions for better UX
5. ✅ **Easier Testing**: Test filtered data separately from component
6. ✅ **Better IDE Support**: Autocomplete works better with explicit types

Migration to v2.0 is straightforward and provides significant improvements in code quality and maintainability.
