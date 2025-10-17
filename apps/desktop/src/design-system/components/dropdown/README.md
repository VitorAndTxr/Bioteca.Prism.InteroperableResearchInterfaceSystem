# Dropdown Component

A comprehensive dropdown/select component with support for single selection, multiple selection, search, grouped options, and full keyboard navigation.

## Design Reference

- **Figma Node**: 2803-2339
- **Design System**: IRIS Desktop Application
- **Component Type**: Form Input / Selection

## Features

### Core Functionality
- ✅ Single selection mode
- ✅ Multiple selection mode with checkmarks
- ✅ Searchable options with custom filter function
- ✅ Grouped options with section headers
- ✅ Tags display for multiple selection
- ✅ Custom "Add new item" button
- ✅ Keyboard navigation (Arrow keys, Enter, Escape, Home, End)
- ✅ Click-outside-to-close behavior

### Sizes
- **Small**: 36px height
- **Medium**: 44px height (default)
- **Big**: 52px height

### States
- Default (empty/filled)
- Hover
- Active/Open
- Focused
- Disabled
- Validation (error, success, warning)

### Accessibility
- Full ARIA support
- Keyboard navigation
- Screen reader friendly
- Focus management
- Required field indication

## Usage

### Basic Single Selection

```tsx
import { Dropdown } from '@/design-system/components/dropdown';

const options = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
  { value: '3', label: 'Option 3' },
];

function MyComponent() {
  const [value, setValue] = useState('');

  return (
    <Dropdown
      options={options}
      value={value}
      onChange={setValue}
      label="Select an option"
      placeholder="Choose value"
    />
  );
}
```

### Multiple Selection with Tags

```tsx
<Dropdown
  mode="multiple"
  options={options}
  value={selectedValues}
  onChange={setSelectedValues}
  showTags={true}
  maxTagsVisible={3}
  label="Fruit preferences"
  placeholder="Choose fruits"
/>
```

### Searchable Dropdown

```tsx
<Dropdown
  options={options}
  value={value}
  onChange={setValue}
  searchable={true}
  searchPlaceholder="Search options..."
  label="Search fruits"
/>
```

### Grouped Options

```tsx
const groupedOptions = [
  {
    label: 'Popular',
    options: [
      { value: 'apple', label: 'Apples' },
      { value: 'banana', label: 'Bananas' },
      { value: 'orange', label: 'Oranges' },
    ],
  },
  {
    label: 'Other',
    options: [
      { value: 'apricot', label: 'Apricot' },
      { value: 'kiwi', label: 'Kiwis' },
      { value: 'mango', label: 'Mangos' },
    ],
  },
];

<Dropdown
  options={groupedOptions}
  mode="multiple"
  showTags={false}
  label="Fruit preferences"
/>
```

### With Add Button

```tsx
<Dropdown
  options={options}
  value={value}
  onChange={setValue}
  showAddButton={true}
  addButtonText="Add new fruit"
  onAddClick={() => console.log('Add clicked')}
/>
```

### Size Variants

```tsx
{/* Small */}
<Dropdown size="small" options={options} />

{/* Medium (default) */}
<Dropdown size="medium" options={options} />

{/* Big */}
<Dropdown size="big" options={options} />
```

### Validation States

```tsx
{/* Error state */}
<Dropdown
  options={options}
  validation="error"
  errorMessage="Please select a valid option"
/>

{/* Success state */}
<Dropdown
  options={options}
  validation="success"
/>

{/* Warning state */}
<Dropdown
  options={options}
  validation="warning"
/>
```

### Custom Rendering

```tsx
<Dropdown
  options={options}
  renderOption={(option, selected) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {option.icon}
      <span>{option.label}</span>
      {selected && <span>✓</span>}
    </div>
  )}
  renderValue={(value, options) => {
    const selected = options.find(o => o.value === value);
    return selected ? `Selected: ${selected.label}` : 'Choose...';
  }}
/>
```

### Disabled State

```tsx
<Dropdown
  options={options}
  value={value}
  onChange={setValue}
  disabled={true}
  label="Disabled dropdown"
/>
```

### Required Field

```tsx
<Dropdown
  options={options}
  value={value}
  onChange={setValue}
  label="Required field"
  required={true}
/>
```

## Props API

### Core Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `DropdownOption[]` \| `DropdownGroup[]` | *required* | Available options or grouped options |
| `value` | `string` \| `string[]` | - | Controlled value |
| `defaultValue` | `string` \| `string[]` | - | Default value for uncontrolled mode |
| `onChange` | `(value: string \| string[]) => void` | - | Change callback |
| `mode` | `'single'` \| `'multiple'` | `'single'` | Selection mode |

### Appearance Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'small'` \| `'medium'` \| `'big'` | `'medium'` | Size variant |
| `label` | `string` | - | Label text |
| `placeholder` | `string` | `'Choose value'` | Placeholder text |
| `helperText` | `string` | - | Helper text below dropdown |
| `errorMessage` | `string` | - | Error message (sets validation to 'error') |
| `validation` | `'none'` \| `'error'` \| `'success'` \| `'warning'` | `'none'` | Validation state |
| `showChevron` | `boolean` | `true` | Show chevron icon |

### Search Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `searchable` | `boolean` | `false` | Enable search functionality |
| `searchPlaceholder` | `string` | `'Search...'` | Search input placeholder |
| `filterFn` | `(option, term) => boolean` | - | Custom filter function |

### Multiple Selection Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showTags` | `boolean` | `false` | Show selected items as tags |
| `maxTagsVisible` | `number` | `3` | Max tags before "+X more" |
| `renderValue` | `(value, options) => ReactNode` | - | Custom value display |

### Menu Customization Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `renderOption` | `(option, selected) => ReactNode` | - | Custom option rendering |
| `showAddButton` | `boolean` | `false` | Show "Add" button |
| `addButtonText` | `string` | `'Add new item'` | Add button text |
| `onAddClick` | `() => void` | - | Add button callback |
| `maxMenuHeight` | `number` \| `string` | `400` | Maximum menu height |

### State Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `disabled` | `boolean` | `false` | Disabled state |
| `required` | `boolean` | `false` | Required field |
| `defaultOpen` | `boolean` | `false` | Initially open |
| `open` | `boolean` | - | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | - | Open state callback |

## Types

### DropdownOption

```typescript
interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode | string;
  disabled?: boolean;
  group?: string;
}
```

### DropdownGroup

```typescript
interface DropdownGroup {
  label: string;
  options: DropdownOption[];
}
```

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `Enter` / `Space` | Open menu / Select focused option |
| `Escape` | Close menu |
| `ArrowDown` | Move focus to next option |
| `ArrowUp` | Move focus to previous option |
| `Home` | Focus first option |
| `End` | Focus last option |
| `Tab` | Close menu and move to next element |

## Accessibility

The Dropdown component follows WAI-ARIA best practices:

- ✅ Proper ARIA roles (`combobox`, `listbox`, `option`)
- ✅ ARIA states (`aria-expanded`, `aria-selected`, `aria-disabled`)
- ✅ Keyboard navigation support
- ✅ Focus management
- ✅ Screen reader announcements
- ✅ Required field indication

## Styling

The component uses CSS modules with design tokens:

```css
/* Override styles with custom class */
.my-dropdown {
  max-width: 400px;
}

.my-dropdown .dropdown-trigger {
  border-color: custom-color;
}
```

## Best Practices

1. **Use controlled mode for forms**: Always provide `value` and `onChange` for form inputs
2. **Provide clear labels**: Use `label` prop for better accessibility
3. **Show validation feedback**: Use `errorMessage` for form validation
4. **Limit options for searchable**: Enable `searchable` for lists with >10 options
5. **Use groups for categorization**: Group related options with `DropdownGroup[]`
6. **Keep placeholder short**: Use concise placeholder text like "Choose value"

## Examples

See `Dropdown.stories.tsx` for comprehensive examples including:
- All size variants
- Single and multiple selection
- Searchable dropdowns
- Grouped options
- Tag display modes
- Validation states
- Custom rendering
- Add button functionality

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support

## Related Components

- **Input**: For text input fields
- **Button**: For form actions
- **SearchBar**: For standalone search functionality
