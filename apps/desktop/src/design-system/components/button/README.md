# Button Component

A comprehensive, accessible button component following the IRIS design system specifications from Figma (node 2803-1366).

## Features

- ✅ **3 Visual Variants**: Primary (teal), Secondary (purple), Outline
- ✅ **3 Sizes**: Small, Medium, Big
- ✅ **Icon Support**: Left, Right, Icon-only
- ✅ **5 States**: Default, Hover, Active, Disabled, Loading
- ✅ **Full Accessibility**: ARIA labels, keyboard navigation, screen reader support
- ✅ **Responsive**: Adapts to mobile and tablet screens
- ✅ **Loading State**: Built-in spinner animation
- ✅ **TypeScript**: Full type safety with comprehensive interfaces

## Installation

The Button component is part of the IRIS design system and requires no additional installation.

```tsx
import { Button } from '@/design-system/components/button';
import type { ButtonProps } from '@/design-system/components/button';
```

## Basic Usage

```tsx
import { Button } from '@/design-system/components/button';

function MyComponent() {
    return (
        <div>
            {/* Primary button (default) */}
            <Button>Click me</Button>

            {/* Secondary variant */}
            <Button variant="secondary">Secondary Action</Button>

            {/* Outline variant */}
            <Button variant="outline">Cancel</Button>

            {/* Different sizes */}
            <Button size="small">Small</Button>
            <Button size="medium">Medium</Button>
            <Button size="big">Big</Button>
        </div>
    );
}
```

## Icon Usage

### Icon with Text

```tsx
import { Button } from '@/design-system/components/button';
import { PlusIcon, ArrowRightIcon } from '@/components/icons';

function IconButtons() {
    return (
        <div>
            {/* Icon on the left (default) */}
            <Button icon={<PlusIcon />}>Add Item</Button>

            {/* Icon on the right */}
            <Button icon={<ArrowRightIcon />} iconPosition="right">
                Next
            </Button>
        </div>
    );
}
```

### Icon-Only Button

Icon-only buttons **require** a `tooltip` prop for accessibility:

```tsx
import { Button } from '@/design-system/components/button';
import { SaveIcon, DeleteIcon, EditIcon } from '@/components/icons';

function IconOnlyButtons() {
    return (
        <div>
            <Button
                icon={<SaveIcon />}
                tooltip="Save changes"
                variant="primary"
            />

            <Button
                icon={<EditIcon />}
                tooltip="Edit item"
                variant="secondary"
            />

            <Button
                icon={<DeleteIcon />}
                tooltip="Delete item"
                variant="outline"
            />
        </div>
    );
}
```

## States

### Loading State

```tsx
import { Button } from '@/design-system/components/button';
import { useState } from 'react';

function LoadingButton() {
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        await saveData();
        setLoading(false);
    };

    return (
        <Button loading={loading} onClick={handleSave}>
            {loading ? 'Saving...' : 'Save'}
        </Button>
    );
}
```

### Disabled State

```tsx
<Button disabled>Cannot Click</Button>
<Button disabled loading>Processing...</Button>
```

## Advanced Examples

### Full Width Button

```tsx
<Button fullWidth variant="primary">
    Submit Form
</Button>
```

### Submit Button in Form

```tsx
<form onSubmit={handleSubmit}>
    <Button type="submit" variant="primary">
        Create Account
    </Button>
</form>
```

### Custom Click Handler

```tsx
<Button
    variant="secondary"
    onClick={(e) => {
        e.preventDefault();
        console.log('Button clicked!');
    }}
>
    Custom Action
</Button>
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'outline'` | `'primary'` | Visual variant of the button |
| `size` | `'small' \| 'medium' \| 'big'` | `'medium'` | Button size |
| `icon` | `ReactNode` | `undefined` | Icon element (SVG or icon component) |
| `iconPosition` | `'left' \| 'right' \| 'only'` | `'left'` | Icon position relative to text |
| `children` | `ReactNode` | `undefined` | Button text/content (omit for icon-only) |
| `disabled` | `boolean` | `false` | Disabled state |
| `loading` | `boolean` | `false` | Loading state (shows spinner) |
| `fullWidth` | `boolean` | `false` | Makes button full width |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type |
| `tooltip` | `string` | `undefined` | Tooltip text (required for icon-only) |
| `className` | `string` | `''` | Custom CSS class |
| `onClick` | `(e: MouseEvent) => void` | `undefined` | Click handler |

All standard HTML button attributes are also supported via spread props.

## Design Tokens

The Button component uses the following design tokens from the IRIS design system:

### Colors

- **Primary Variant**:
  - Default: `#49A2A8` (Brand/Primary/500)
  - Hover: `#387F84` (Brand/Primary/600)
  - Active: `#53B7BE` (Brand/Primary/400)
  - Disabled: `#ADF4FA` (Brand/Primary/100)

- **Secondary Variant**:
  - Default: `#7B6FDB` (Brand/Secondary/500)
  - Hover: `#9C8DF5` (Brand/Secondary/400)
  - Active: `#5244AB` (Brand/Secondary/700)
  - Disabled: `#D4CEFB` (Brand/Secondary/200)

- **Outline Variant**:
  - Default: `#555555` (Neutral/700)
  - Hover: `#727272` (Neutral/600)
  - Disabled: `#CCCCCC`

### Typography

- **Font Family**: Inter, system fonts
- **Font Weight**: 600 (Semi Bold)
- **Font Sizes**:
  - Small: 14px
  - Medium: 16px
  - Big: 18px

### Spacing

- **Border Radius**: 8px
- **Border Width**: 2px
- **Padding**:
  - Small: 6px 12px
  - Medium: 10px 20px
  - Big: 14px 28px

## Accessibility

The Button component follows WCAG 2.1 Level AA guidelines:

- ✅ **Keyboard Navigation**: Full support for Tab, Enter, and Space
- ✅ **Screen Readers**: Proper ARIA labels and states
- ✅ **Focus Indicators**: Visible focus outline
- ✅ **Color Contrast**: Meets 4.5:1 ratio for normal text
- ✅ **Loading States**: `aria-busy` attribute during loading
- ✅ **Disabled States**: `aria-disabled` attribute
- ✅ **Icon-only Buttons**: Required tooltip for context

### Keyboard Shortcuts

- `Tab`: Navigate to button
- `Enter` or `Space`: Activate button
- `Shift + Tab`: Navigate to previous element

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Testing

### Unit Tests

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

test('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
});

test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
});

test('does not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>Click</Button>);

    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).not.toHaveBeenCalled();
});
```

## Related Components

- **Input**: Text input fields
- **Dropdown**: Select dropdowns
- **Modal**: Modal dialogs with buttons
- **Toast**: Toast notifications with action buttons

## Figma Design

This component is based on the IRIS design system Figma file:
- **Node ID**: `2803-1366`
- **Page**: Design System → Components → Buttons
- **Last Updated**: 2025-01-17

## Changelog

### v1.0.0 (2025-01-17)
- Initial implementation
- 3 variants: primary, secondary, outline
- 3 sizes: small, medium, big
- Icon support (left, right, only)
- Loading state with spinner
- Full accessibility support
- TypeScript types
- Comprehensive documentation

## Support

For issues or questions, please refer to:
- [IRIS Documentation](../../docs/README.md)
- [Design System Guidelines](../../docs/DESIGN_SYSTEM.md)
- [Component Development Guide](../../docs/development/DEVELOPMENT_GUIDE.md)
