# Avatar Component

A flexible, accessible avatar component that supports images, initials, icons, and placeholders with optional status indicators and notification badges.

## Features

- ✅ **4 Variants**: Image, Initials, Icon, Placeholder
- ✅ **4 Sizes**: Small (32px), Medium (48px), Large (56px), XL (144px)
- ✅ **3 Shapes**: Circle, Rounded, Square
- ✅ **4 Status Indicators**: Online, Offline, Busy, Away
- ✅ **Notification Badges**: Numeric badges with max count
- ✅ **Auto-generated Colors**: Consistent color based on name/initials
- ✅ **Interactive Mode**: Clickable with hover effects
- ✅ **Loading State**: Skeleton loader animation
- ✅ **Full Accessibility**: ARIA labels, keyboard navigation, screen reader support
- ✅ **Responsive**: Adapts to all screen sizes
- ✅ **TypeScript**: Full type safety with comprehensive interfaces

## Installation

The Avatar component is part of the IRIS design system and requires no additional installation.

```tsx
import { Avatar } from '@/design-system/components/avatar';
import type { AvatarProps } from '@/design-system/components/avatar';
```

## Basic Usage

### Image Avatar

```tsx
import { Avatar } from '@/design-system/components/avatar';

function UserProfile() {
  return (
    <Avatar
      src="/users/john-doe.jpg"
      alt="John Doe"
      size="medium"
    />
  );
}
```

### Initials Avatar

```tsx
// With explicit initials
<Avatar initials="JD" name="John Doe" />

// Auto-generated from name
<Avatar name="Jane Smith" />
```

### Icon Avatar

```tsx
import { UserIcon } from '@/components/icons';

<Avatar
  icon={<UserIcon />}
  backgroundColor="#7b6fdb"
  size="large"
/>
```

### Placeholder Avatar

```tsx
// Shows default user silhouette icon
<Avatar size="medium" />
```

## Sizes

The Avatar component supports 4 sizes matching the Figma design:

```tsx
import { Avatar } from '@/design-system/components/avatar';

function AvatarSizes() {
  return (
    <div>
      {/* Small: 32x32px */}
      <Avatar src="/user.jpg" alt="User" size="small" />

      {/* Medium: 48x48px (default) */}
      <Avatar src="/user.jpg" alt="User" size="medium" />

      {/* Large: 56x56px */}
      <Avatar src="/user.jpg" alt="User" size="large" />

      {/* XL: 144x144px */}
      <Avatar src="/user.jpg" alt="User" size="xl" />
    </div>
  );
}
```

## Status Indicators

Show user presence status with a colored dot:

```tsx
// Online (green)
<Avatar src="/user.jpg" alt="User" status="online" />

// Offline (gray)
<Avatar src="/user.jpg" alt="User" status="offline" />

// Busy (red)
<Avatar src="/user.jpg" alt="User" status="busy" />

// Away (amber)
<Avatar src="/user.jpg" alt="User" status="away" />
```

## Notification Badges

Display notification counts with badges:

```tsx
// Simple badge
<Avatar src="/user.jpg" alt="User" badge={5} />

// Badge with max count (shows "99+" for values > 99)
<Avatar src="/user.jpg" alt="User" badge={150} badgeMax={99} />

// Combined with status
<Avatar
  src="/user.jpg"
  alt="User"
  status="online"
  badge={3}
/>
```

## Shapes

Choose from three shape variants:

```tsx
// Circle (default)
<Avatar src="/user.jpg" alt="User" shape="circle" />

// Rounded corners
<Avatar src="/user.jpg" alt="User" shape="rounded" />

// Square
<Avatar src="/user.jpg" alt="User" shape="square" />
```

## Custom Colors

### Explicit Colors

```tsx
<Avatar
  initials="AB"
  name="Alice Brown"
  backgroundColor="#10b981"
  textColor="#ffffff"
/>
```

### Auto-generated Colors

Colors are automatically generated based on name/initials for consistency:

```tsx
// Same name always gets same color
<Avatar name="John Doe" /> {/* Always blue */}
<Avatar name="Jane Smith" /> {/* Always purple */}
```

The component uses 10 predefined colors from the IRIS design system:
- Ciano-500, Purple-500, Amber-500, Emerald-500, Blue-500
- Violet-500, Pink-500, Teal-500, Orange-500, Cyan-500

## Interactive Avatars

Make avatars clickable with hover effects:

```tsx
import { useState } from 'react';

function InteractiveAvatar() {
  const [selected, setSelected] = useState(false);

  return (
    <Avatar
      src="/user.jpg"
      alt="User"
      interactive
      onClick={() => setSelected(!selected)}
      size="large"
    />
  );
}
```

**Keyboard Navigation:**
- `Tab`: Focus the avatar
- `Enter` or `Space`: Trigger click handler

## Loading State

Show a skeleton loader while data is loading:

```tsx
import { Avatar } from '@/design-system/components/avatar';
import { useState, useEffect } from 'react';

function UserAvatar({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser(userId).then((data) => {
      setUser(data);
      setLoading(false);
    });
  }, [userId]);

  return (
    <Avatar
      src={user?.avatar}
      alt={user?.name}
      loading={loading}
      size="large"
    />
  );
}
```

## Advanced Examples

### Avatar Group

Display multiple avatars in an overlapping group:

```tsx
function AvatarGroup({ users }: { users: User[] }) {
  const displayUsers = users.slice(0, 4);
  const extraCount = users.length - 4;

  return (
    <div style={{ display: 'flex', marginLeft: '20px' }}>
      {displayUsers.map((user, index) => (
        <div
          key={user.id}
          style={{ marginLeft: index === 0 ? '0' : '-16px' }}
        >
          <Avatar
            src={user.avatar}
            alt={user.name}
            size="medium"
            style={{ border: '2px solid white' }}
          />
        </div>
      ))}
      {extraCount > 0 && (
        <div style={{ marginLeft: '-16px' }}>
          <Avatar
            initials={`+${extraCount}`}
            size="medium"
            backgroundColor="#727272"
            style={{ border: '2px solid white' }}
          />
        </div>
      )}
    </div>
  );
}
```

### User List Item

Combine avatar with user information:

```tsx
function UserListItem({ user }: { user: User }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      borderRadius: '8px',
      cursor: 'pointer',
    }}>
      <Avatar
        src={user.avatar}
        alt={user.name}
        status={user.status}
        badge={user.unreadCount}
        size="medium"
        interactive
      />
      <div>
        <p style={{ margin: 0, fontWeight: 600 }}>{user.name}</p>
        <p style={{ margin: 0, fontSize: '12px', color: '#727272' }}>
          {user.role}
        </p>
      </div>
    </div>
  );
}
```

### Profile Header

Large avatar for profile pages:

```tsx
function ProfileHeader({ user }: { user: User }) {
  return (
    <div style={{ textAlign: 'center', padding: '32px' }}>
      <Avatar
        src={user.avatar}
        alt={user.name}
        status={user.status}
        size="xl"
        interactive
        onClick={() => console.log('Change avatar')}
      />
      <h1 style={{ marginTop: '16px' }}>{user.name}</h1>
      <p style={{ color: '#727272' }}>{user.email}</p>
    </div>
  );
}
```

### Fallback Behavior

The avatar automatically falls back to initials if image fails:

```tsx
<Avatar
  src="/broken-image.jpg"  // If this fails...
  name="John Doe"          // ...shows "JD" initials
  alt="John Doe"
/>
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'small' \| 'medium' \| 'large' \| 'xl'` | `'medium'` | Avatar size (32px, 48px, 56px, 144px) |
| `src` | `string` | `undefined` | Image source URL |
| `alt` | `string` | `undefined` | Alt text for image (required for accessibility) |
| `initials` | `string` | `undefined` | Initials to display (max 2 characters) |
| `name` | `string` | `undefined` | Full name (generates initials if not provided) |
| `icon` | `ReactNode` | `undefined` | Custom icon element |
| `status` | `'online' \| 'offline' \| 'busy' \| 'away'` | `undefined` | Status indicator |
| `badge` | `string \| number` | `undefined` | Notification badge content |
| `badgeMax` | `number` | `99` | Max number before showing "99+" |
| `shape` | `'circle' \| 'rounded' \| 'square'` | `'circle'` | Avatar shape |
| `backgroundColor` | `string` | Auto-generated | Custom background color |
| `textColor` | `string` | `'#FFFFFF'` | Text color for initials |
| `interactive` | `boolean` | `false` | Whether avatar is clickable |
| `loading` | `boolean` | `false` | Show loading skeleton |
| `onClick` | `() => void` | `undefined` | Click handler |
| `className` | `string` | `''` | Custom CSS class |
| `ariaLabel` | `string` | Auto-generated | ARIA label for accessibility |

## Design Tokens

The Avatar component uses the following design tokens from the IRIS design system:

### Sizes (from Figma: 2803-3248)

- **Small**: 32x32px
- **Medium**: 48x48px (Base)
- **Large**: 56x56px (LG)
- **XL**: 144x144px

### Colors

- **Status Online**: `#22c55e` (Green-500)
- **Status Offline**: `#727272` (Neutral-600)
- **Status Busy**: `#ef4444` (Red-500)
- **Status Away**: `#f59e0b` (Amber-500)
- **Badge Background**: `#ef4444` (Red-500)
- **Placeholder**: `#b0b0b0` (Neutral-400)

### Typography

- **Font Family**: Inter, system fonts
- **Font Weight**: 600 (Semi Bold)
- **Font Sizes**:
  - Small: 14px
  - Medium: 18px
  - Large: 20px
  - XL: 48px

## Accessibility

The Avatar component follows WCAG 2.1 Level AA guidelines:

- ✅ **Alt Text**: Required for image avatars
- ✅ **ARIA Labels**: Automatic labels for screen readers
- ✅ **Keyboard Navigation**: Full support for Tab, Enter, Space
- ✅ **Focus Indicators**: Visible outline on focus
- ✅ **Status Announcements**: Status changes announced to screen readers
- ✅ **Badge Announcements**: Notification counts announced
- ✅ **High Contrast Mode**: Adapts for better visibility
- ✅ **Reduced Motion**: Respects user motion preferences

### Screen Reader Support

```tsx
// Image avatar
<Avatar src="/user.jpg" alt="John Doe profile picture" />
// Announces: "John Doe profile picture"

// Initials avatar
<Avatar name="Jane Smith" />
// Announces: "Jane Smith avatar"

// With status
<Avatar src="/user.jpg" alt="User" status="online" />
// Announces: "User avatar, Status: online"

// With badge
<Avatar src="/user.jpg" alt="User" badge={5} />
// Announces: "User avatar, 5 notifications"
```

## Type Guards

The component exports type guard functions for checking avatar variants:

```tsx
import {
  Avatar,
  isImageAvatar,
  isInitialsAvatar,
  isIconAvatar,
  isPlaceholderAvatar,
} from '@/design-system/components/avatar';

function MyComponent(props: AvatarProps) {
  if (isImageAvatar(props)) {
    // props.src is defined
  } else if (isInitialsAvatar(props)) {
    // props.initials or props.name is defined
  } else if (isIconAvatar(props)) {
    // props.icon is defined
  } else if (isPlaceholderAvatar(props)) {
    // No content, shows placeholder
  }
}
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Testing

### Unit Tests

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Avatar } from './Avatar';

test('renders image avatar', () => {
  render(<Avatar src="/user.jpg" alt="John Doe" />);
  const img = screen.getByAltText('John Doe');
  expect(img).toBeInTheDocument();
  expect(img).toHaveAttribute('src', '/user.jpg');
});

test('renders initials avatar', () => {
  render(<Avatar initials="JD" name="John Doe" />);
  expect(screen.getByText('JD')).toBeInTheDocument();
});

test('calls onClick when clicked', () => {
  const handleClick = jest.fn();
  render(<Avatar name="User" onClick={handleClick} />);

  fireEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});

test('shows loading state', () => {
  const { container } = render(<Avatar loading />);
  expect(container.querySelector('.avatar--loading')).toBeInTheDocument();
});

test('displays status indicator', () => {
  render(<Avatar name="User" status="online" />);
  expect(screen.getByRole('status', { name: /online/i })).toBeInTheDocument();
});

test('displays notification badge', () => {
  render(<Avatar name="User" badge={5} />);
  expect(screen.getByRole('status', { name: /5 notifications/i })).toBeInTheDocument();
});
```

### Accessibility Tests

```tsx
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('has no accessibility violations', async () => {
  const { container } = render(
    <Avatar src="/user.jpg" alt="User" status="online" badge={3} />
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Related Components

- **Button**: Action buttons that may include avatars
- **Dropdown**: User menus with avatar triggers
- **Card**: User cards with avatar headers
- **List**: User lists with avatar items

## Figma Design

This component is based on the IRIS design system Figma file:
- **Node ID**: `2803-3248`
- **Page**: Design System → Components → Avatars
- **Sizes**: SM (32x32), Base (48x48), LG (56x56), XL (144x144)
- **Last Updated**: 2025-10-18

## Changelog

### v1.0.0 (2025-10-18)
- Initial implementation
- 4 variants: image, initials, icon, placeholder
- 4 sizes: small, medium, large, xl
- 3 shapes: circle, rounded, square
- Status indicators: online, offline, busy, away
- Notification badges with max count
- Auto-generated colors based on name/initials
- Interactive mode with click handler
- Loading state with skeleton animation
- Full accessibility support
- TypeScript types and type guards
- 30+ Storybook stories
- Comprehensive documentation

## Support

For issues or questions, please refer to:
- [IRIS Documentation](../../../../docs/README.md)
- [Design System Guidelines](../../../../docs/DESIGN_SYSTEM.md)
- [Component Development Guide](../../../../docs/development/DEVELOPMENT_GUIDE.md)
- [Storybook](http://localhost:6006/?path=/docs/design-system-avatar--docs)
