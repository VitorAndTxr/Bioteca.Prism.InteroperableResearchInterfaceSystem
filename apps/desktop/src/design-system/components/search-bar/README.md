# SearchBar Component

A comprehensive search input component with autocomplete, filtering, and recent searches functionality. Built on top of the Input component with search-specific enhancements.

## Features

- ✅ **Autocomplete Dropdown** - Show suggestions as the user types
- ✅ **Recent Searches** - Store and display recent search queries (localStorage)
- ✅ **Custom Filtering** - Provide your own filter function
- ✅ **Keyboard Navigation** - Full arrow key and Enter/Escape support
- ✅ **Debounced Search** - Configurable delay for search callbacks
- ✅ **Loading State** - Show loading indicator for async searches
- ✅ **Clear Button** - Quick clear with X button
- ✅ **Grouped Options** - Organize results by category
- ✅ **Empty State** - Customizable "no results" message
- ✅ **Accessibility** - ARIA attributes and keyboard navigation
- ✅ **Responsive Design** - Works on all screen sizes

## Installation

```tsx
import { SearchBar } from '@/design-system/components/search-bar';
import type { SearchBarOption } from '@/design-system/components/search-bar';
```

## Basic Usage

### Simple Search Bar

```tsx
<SearchBar
  placeholder="Search..."
  onSearch={(value) => console.log('Searching for:', value)}
/>
```

### With Autocomplete

```tsx
const options: SearchBarOption[] = [
  { id: '1', label: 'John Doe' },
  { id: '2', label: 'Jane Smith' },
  { id: '3', label: 'Bob Johnson' },
];

<SearchBar
  placeholder="Search users..."
  options={options}
  onSelect={(option) => console.log('Selected:', option)}
/>
```

### With Grouped Options

```tsx
const groupedOptions: SearchBarOption[] = [
  { id: '1', label: 'Admin User', category: 'Administrators' },
  { id: '2', label: 'Regular User', category: 'Users' },
  { id: '3', label: 'Guest User', category: 'Users' },
  { id: '4', label: 'Super Admin', category: 'Administrators' },
];

<SearchBar
  placeholder="Search users..."
  options={groupedOptions}
/>
```

### With Recent Searches

```tsx
<SearchBar
  placeholder="Search..."
  showRecentSearches
  maxRecentSearches={5}
  recentSearchesKey="my-app-recent-searches"
/>
```

### With Async Loading

```tsx
const [loading, setLoading] = useState(false);
const [results, setResults] = useState<SearchBarOption[]>([]);

const handleSearch = async (value: string) => {
  setLoading(true);
  const data = await fetchResults(value);
  setResults(data);
  setLoading(false);
};

<SearchBar
  placeholder="Search..."
  loading={loading}
  options={results}
  onSearch={handleSearch}
  debounceDelay={500}
/>
```

### Custom Filtering

```tsx
const customFilter = (options: SearchBarOption[], searchValue: string) => {
  // Custom fuzzy search or complex filtering logic
  return options.filter(option =>
    option.label.toLowerCase().includes(searchValue.toLowerCase()) ||
    option.metadata?.email?.includes(searchValue)
  );
};

<SearchBar
  placeholder="Search..."
  options={allOptions}
  filterOptions={customFilter}
/>
```

### Custom Option Rendering

```tsx
const renderOption = (option: SearchBarOption) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <img src={option.metadata?.avatar} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} />
    <div>
      <div>{option.label}</div>
      <div style={{ fontSize: 12, color: '#727272' }}>{option.metadata?.email}</div>
    </div>
  </div>
);

<SearchBar
  placeholder="Search users..."
  options={userOptions}
  renderOption={renderOption}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSearch` | `(value: string) => void` | - | Callback when search value changes (debounced) |
| `onSelect` | `(option: SearchBarOption) => void` | - | Callback when an option is selected |
| `options` | `SearchBarOption[]` | `[]` | Array of autocomplete options |
| `showAutocomplete` | `boolean` | `true` | Whether to show autocomplete dropdown |
| `maxOptions` | `number` | `5` | Maximum number of options to display |
| `filterOptions` | `(options, value) => SearchBarOption[]` | - | Custom filter function |
| `renderOption` | `(option) => ReactNode` | - | Custom render function for options |
| `showRecentSearches` | `boolean` | `false` | Whether to show recent searches |
| `maxRecentSearches` | `number` | `5` | Maximum recent searches to store |
| `recentSearchesKey` | `string` | `'iris-search-recent'` | localStorage key for recent searches |
| `showClearButton` | `boolean` | `true` | Whether to show clear button |
| `debounceDelay` | `number` | `300` | Debounce delay in ms for onSearch |
| `loading` | `boolean` | `false` | Loading state for async search |
| `searchIcon` | `ReactNode` | - | Custom search icon |
| `clearIcon` | `ReactNode` | - | Custom clear icon |
| `minSearchLength` | `number` | `1` | Minimum characters to trigger autocomplete |
| `emptyMessage` | `string` | `'No results found'` | Message when no options match |
| `loadingMessage` | `string` | `'Searching...'` | Message during loading |

Plus all props from the Input component (size, placeholder, disabled, etc.)

## SearchBarOption Interface

```typescript
interface SearchBarOption {
  id: string;                      // Unique identifier
  label: string;                   // Display text
  category?: string;               // Optional category for grouping
  metadata?: Record<string, any>;  // Optional metadata for custom rendering
}
```

## Keyboard Navigation

- **Arrow Down** - Move to next option or open dropdown
- **Arrow Up** - Move to previous option
- **Enter** - Select focused option
- **Escape** - Close dropdown
- **Tab** - Close dropdown and move focus

## Accessibility

The SearchBar component is fully accessible:

- **ARIA Attributes**: `role="combobox"`, `aria-expanded`, `aria-autocomplete`, `aria-controls`
- **Keyboard Navigation**: Full support for arrow keys, Enter, and Escape
- **Screen Reader Support**: Proper labeling and announcements
- **Focus Management**: Clear focus indicators

## Examples

### Search Users with Avatars

```tsx
const users: SearchBarOption[] = [
  {
    id: '1',
    label: 'Dr. John Doe',
    category: 'Researchers',
    metadata: {
      email: 'john@example.com',
      avatar: '/avatars/john.jpg',
    },
  },
  // ...
];

<SearchBar
  size="medium"
  placeholder="Search researchers..."
  options={users}
  onSelect={(user) => navigateToProfile(user.id)}
  renderOption={(user) => (
    <div className="user-option">
      <img src={user.metadata.avatar} alt="" />
      <div>
        <div>{user.label}</div>
        <div className="email">{user.metadata.email}</div>
      </div>
    </div>
  )}
/>
```

### Search with Filters

```tsx
const [searchValue, setSearchValue] = useState('');
const [filters, setFilters] = useState({ type: 'all' });

const filteredOptions = useMemo(() => {
  return allOptions.filter(option => {
    if (filters.type !== 'all' && option.metadata?.type !== filters.type) {
      return false;
    }
    return true;
  });
}, [allOptions, filters]);

<SearchBar
  value={searchValue}
  onChange={(e) => setSearchValue(e.target.value)}
  options={filteredOptions}
  placeholder="Search with filters..."
/>
```

### Controlled Search Bar

```tsx
const [value, setValue] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [results, setResults] = useState<SearchBarOption[]>([]);

const handleSearch = async (searchValue: string) => {
  setValue(searchValue);

  if (searchValue.length < 2) {
    setResults([]);
    return;
  }

  setIsLoading(true);
  try {
    const data = await api.search(searchValue);
    setResults(data);
  } finally {
    setIsLoading(false);
  }
};

<SearchBar
  value={value}
  onChange={(e) => setValue(e.target.value)}
  onSearch={handleSearch}
  loading={isLoading}
  options={results}
  placeholder="Type at least 2 characters..."
  minSearchLength={2}
  debounceDelay={500}
/>
```

## Design Tokens

```css
/* Colors */
--search-bar-background: #FFFFFF;
--search-bar-border: #E5E5E5;
--search-bar-text: #393939;
--search-bar-placeholder: #727272;
--search-bar-hover: #F5F5F5;
--search-bar-focused: #F0F9FA;
--search-bar-selected: #E6F7F8;
--search-bar-primary: #49A2A8;

/* Spacing */
--search-bar-option-padding: 12px 16px;
--search-bar-dropdown-max-height: 320px;

/* Typography */
--search-bar-font-family: 'Inter', sans-serif;
--search-bar-font-size: 14px;
--search-bar-category-font-size: 12px;
```

## Best Practices

1. **Use debouncing** for expensive search operations (API calls)
2. **Limit maxOptions** to avoid overwhelming the user (5-10 recommended)
3. **Provide meaningful empty states** with helpful messages
4. **Use categories** for large option sets to improve scannability
5. **Consider minSearchLength** to reduce noise for short queries
6. **Implement loading states** for async searches to provide feedback
7. **Store recent searches** to improve user experience
8. **Use custom rendering** to show rich information (avatars, metadata)

## Related Components

- [Input](../input/README.md) - Base input component
- [Dropdown](../dropdown/README.md) - Dropdown selection component
- [Button](../button/README.md) - Button component

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Notes

- Recent searches are stored in localStorage
- Debouncing is applied to the `onSearch` callback
- The component is uncontrolled by default but supports controlled mode
- Keyboard navigation follows WAI-ARIA best practices
