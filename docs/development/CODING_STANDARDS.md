# IRIS Coding Standards

> **Last Updated**: 2025-10-18
> **Status**: Official Project Guidelines

This document defines coding standards, best practices, and conventions for the IRIS project across all platforms (Mobile and Desktop).

---

## Table of Contents

- [Core Principles](#core-principles)
- [Project Structure](#project-structure)
- [Component Reuse](#component-reuse)
- [Icon Standards (Heroicons)](#icon-standards-heroicons)
- [TypeScript Standards](#typescript-standards)
- [File Organization](#file-organization)
- [Naming Conventions](#naming-conventions)
- [Code Style](#code-style)
- [Component Patterns](#component-patterns)
- [State Management](#state-management)
- [Testing Standards](#testing-standards)
- [Documentation Standards](#documentation-standards)

---

## Core Principles

### 1. DRY (Don't Repeat Yourself)
**Always seek to reuse existing components before creating new ones.**

```typescript
// ✅ GOOD: Reuse existing Button component
import { Button } from '../design-system/components/button';

function MyScreen() {
    return <Button variant="primary">Click me</Button>;
}

// ❌ BAD: Creating duplicate button implementation
function MyScreen() {
    return <button className="my-custom-button">Click me</button>;
}
```

### 2. Single Responsibility Principle
Each component, function, and module should have ONE clear purpose.

```typescript
// ✅ GOOD: Focused, single responsibility
function UserAvatar({ user }: { user: User }) {
    return <Avatar size="medium" src={user.avatarUrl} alt={user.name} />;
}

// ❌ BAD: Too many responsibilities
function UserDisplay({ user }: { user: User }) {
    return (
        <div>
            <Avatar />
            <UserProfile />
            <UserActions />
            <UserSettings />
        </div>
    );
}
```

### 3. Type Safety First
Use TypeScript strictly. No `any` types except when absolutely necessary.

```typescript
// ✅ GOOD: Explicit types
interface UserProps {
    user: User;
    onEdit: (user: User) => void;
}

// ❌ BAD: Using any
interface UserProps {
    user: any;
    onEdit: (user: any) => void;
}
```

### 4. Accessibility by Default
All UI components must be accessible (WCAG 2.1 Level AA minimum).

```typescript
// ✅ GOOD: Accessible button
<button
    aria-label="Close dialog"
    onClick={handleClose}
    disabled={isLoading}
>
    <XMarkIcon className="w-5 h-5" />
</button>

// ❌ BAD: Icon-only button without label
<button onClick={handleClose}>
    <XMarkIcon />
</button>
```

---

## Project Structure

### Monorepo Organization

```
IRIS/
├── apps/
│   ├── mobile/              # React Native (Expo)
│   │   └── src/
│   │       ├── context/     # React Context providers
│   │       ├── screens/     # Application screens
│   │       ├── components/  # Mobile-specific components
│   │       ├── hooks/       # Custom React hooks
│   │       ├── utils/       # Utility functions
│   │       └── types/       # TypeScript type definitions
│   │
│   └── desktop/             # Electron + Vite + React
│       └── src/
│           ├── design-system/
│           │   └── components/  # Reusable UI components
│           ├── context/         # React Context providers
│           ├── screens/         # Application screens
│           ├── services/        # Business logic services
│           ├── config/          # Configuration files
│           ├── App.tsx          # Main app component
│           └── main.tsx         # React entry point
│
├── packages/
│   ├── domain/              # Shared types and models
│   ├── middleware/          # Business logic (future)
│   └── ui-components/       # Shared components (future)
│
└── docs/                    # Documentation
```

### Key Structural Changes (October 2025)

**Desktop App Reorganization:**
- ✅ Moved from `src/renderer/` to flat `src/` structure
- ✅ Main app is now `src/App.tsx` (was `src/renderer/App.tsx`)
- ✅ Entry point is `src/main.tsx`
- ✅ Added `src/config/` for configuration
- ✅ Added `src/services/` for business logic
- ✅ Added `src/context/` for React Context providers
- ✅ Design system components in `src/design-system/components/`

---

## Component Reuse

### When to Create a New Component

**Create a new component ONLY if:**
1. No existing component serves the purpose
2. The component is reusable across multiple screens
3. The component follows design system specifications

**Reuse existing components when:**
1. Similar UI exists in design system
2. Component can be customized via props
3. Behavior is similar with minor variations

### Component Discovery

Before creating a component, check:

```bash
# Desktop components
ls apps/desktop/src/design-system/components/

# Mobile components
ls apps/mobile/src/components/
```

**Available Desktop Components (16):**
- app-layout, avatar, button, button-group
- data-table, datepicker, dropdown, header
- input, modal, password, search-bar
- sidebar, toast, typography

### Component Composition Pattern

```typescript
// ✅ GOOD: Compose existing components
import { Button } from '../design-system/components/button';
import { Input } from '../design-system/components/input';

function LoginForm() {
    return (
        <form>
            <Input
                label="Email"
                type="email"
                required
            />
            <Input
                label="Password"
                type="password"
                required
            />
            <Button variant="primary" type="submit">
                Login
            </Button>
        </form>
    );
}
```

---

## Icon Standards (Heroicons)

### Library: @heroicons/react

**ALL icons must use Heroicons library. No custom SVG files.**

```bash
npm install @heroicons/react
```

### Import Patterns

```typescript
// ✅ GOOD: Import from Heroicons
import {
    UserIcon,           // Outline (24x24, 2px stroke)
    ChevronDownIcon,    // Outline
    XMarkIcon          // Outline
} from '@heroicons/react/24/outline';

import {
    UserIcon as UserIconSolid,  // Solid (24x24, filled)
} from '@heroicons/react/24/solid';

import {
    UserIcon as UserIconMini    // Mini (20x20, solid)
} from '@heroicons/react/20/solid';

// ❌ BAD: Custom SVG imports
import CustomUserIcon from './assets/user-icon.svg';
```

### Icon Sizes

```typescript
// Standard sizes using Tailwind classes
<UserIcon className="w-4 h-4" />   // 16px (small)
<UserIcon className="w-5 h-5" />   // 20px (default)
<UserIcon className="w-6 h-6" />   // 24px (medium)
<UserIcon className="w-8 h-8" />   // 32px (large)
```

### Icon Variants

```typescript
// Outline (default): 24x24 with 2px stroke
import { UserIcon } from '@heroicons/react/24/outline';

// Solid: 24x24 filled
import { UserIcon } from '@heroicons/react/24/solid';

// Mini: 20x20 solid (for tight spaces)
import { UserIcon } from '@heroicons/react/20/solid';
```

### Usage Examples

```typescript
// ✅ Button with icon
import { PlusIcon } from '@heroicons/react/24/outline';

<Button
    variant="primary"
    iconLeft={<PlusIcon className="w-5 h-5" />}
>
    Add User
</Button>

// ✅ Icon-only button
import { TrashIcon } from '@heroicons/react/24/outline';

<button
    aria-label="Delete"
    className="icon-button"
>
    <TrashIcon className="w-5 h-5" />
</button>

// ✅ Navigation with icons
import { HomeIcon, UsersIcon, CogIcon } from '@heroicons/react/24/outline';

<nav>
    <a href="/dashboard">
        <HomeIcon className="w-6 h-6" />
        Dashboard
    </a>
    <a href="/users">
        <UsersIcon className="w-6 h-6" />
        Users
    </a>
</nav>
```

### Icon Accessibility

```typescript
// ✅ GOOD: Icon with proper ARIA
<button aria-label="Close dialog">
    <XMarkIcon className="w-5 h-5" aria-hidden="true" />
</button>

// ✅ GOOD: Icon with visible text
<button>
    <TrashIcon className="w-5 h-5" aria-hidden="true" />
    Delete
</button>

// ❌ BAD: Icon-only without ARIA
<button>
    <XMarkIcon className="w-5 h-5" />
</button>
```

### Common Icons Reference

| Purpose | Icon | Import |
|---------|------|--------|
| User profile | `UserIcon` | `@heroicons/react/24/outline` |
| Navigation (chevron) | `ChevronDownIcon` | `@heroicons/react/24/outline` |
| Close/Exit | `XMarkIcon` | `@heroicons/react/24/outline` |
| Add/Create | `PlusIcon` | `@heroicons/react/24/outline` |
| Edit | `PencilIcon` | `@heroicons/react/24/outline` |
| Delete | `TrashIcon` | `@heroicons/react/24/outline` |
| Search | `MagnifyingGlassIcon` | `@heroicons/react/24/outline` |
| Settings | `Cog6ToothIcon` | `@heroicons/react/24/outline` |
| Home | `HomeIcon` | `@heroicons/react/24/outline` |
| Users | `UsersIcon` | `@heroicons/react/24/outline` |

---

## TypeScript Standards

### Strict Mode

TypeScript strict mode is **REQUIRED** in all projects.

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

### Type Definitions

```typescript
// ✅ GOOD: Explicit interface
interface ButtonProps {
    variant: 'primary' | 'secondary' | 'outline';
    size?: 'small' | 'medium' | 'big';
    disabled?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
}

// ❌ BAD: Inline types, optional everything
function Button(props: {
    variant?: string;
    size?: string;
    onClick?: any;
    children?: any;
}) { }
```

### Shared Types

Use `packages/domain` for shared types across apps.

```typescript
// packages/domain/src/models/User.ts
export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    createdAt: Date;
}

export type UserRole = 'admin' | 'researcher' | 'volunteer';

// apps/desktop/src/screens/UsersList.tsx
import type { User } from '@iris/domain';

function UsersList() {
    const [users, setUsers] = useState<User[]>([]);
    // ...
}
```

### No `any` Types

```typescript
// ✅ GOOD: Proper typing
function handleData(data: StreamDataPacket) {
    console.log(data.timestamp, data.values);
}

// ❌ BAD: Using any
function handleData(data: any) {
    console.log(data.timestamp, data.values);
}

// ✅ ACCEPTABLE: Unknown with type guard
function handleUnknownData(data: unknown) {
    if (isStreamDataPacket(data)) {
        console.log(data.timestamp, data.values);
    }
}
```

---

## File Organization

### Component File Structure

Each component should have its own directory:

```
components/button/
├── Button.tsx          # Component logic
├── Button.types.ts     # TypeScript interfaces
├── Button.css          # Component styles
├── Button.stories.tsx  # Storybook stories
├── Button.test.tsx     # Unit tests
├── README.md           # Component documentation
└── index.ts            # Barrel export
```

### Barrel Exports

```typescript
// components/button/index.ts
export { Button } from './Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button.types';
```

### Import Order

```typescript
// 1. React and framework imports
import React, { useState, useEffect } from 'react';

// 2. Third-party libraries
import { UserIcon } from '@heroicons/react/24/outline';

// 3. Internal components
import { Button } from '../design-system/components/button';
import { Input } from '../design-system/components/input';

// 4. Context and hooks
import { useAuth } from '../context/AuthContext';

// 5. Types
import type { User } from '@iris/domain';

// 6. Styles
import './MyComponent.css';
```

---

## Naming Conventions

### Files

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase.tsx | `Button.tsx` |
| Screens | PascalCase + Screen.tsx | `LoginScreen.tsx` |
| Hooks | camelCase + use prefix | `useStreamData.ts` |
| Utils | camelCase | `formatDate.ts` |
| Types | PascalCase + .types | `Button.types.ts` |
| Styles | Same as component + .css | `Button.css` |
| Tests | Same as component + .test | `Button.test.tsx` |
| Stories | Same as component + .stories | `Button.stories.tsx` |

### Variables and Functions

```typescript
// Variables: camelCase
const userName = 'John Doe';
const isLoading = false;
const streamData = [];

// Constants: UPPERCASE_SNAKE_CASE
const MAX_BUFFER_SIZE = 1000;
const DEFAULT_STREAM_RATE = 215;
const API_BASE_URL = 'https://api.example.com';

// Functions: camelCase
function handleClick() { }
function formatTimestamp(ms: number) { }

// React Components: PascalCase
function UserProfile() { }
function DataTable() { }

// Custom Hooks: camelCase + use prefix
function useStreamData() { }
function useAuth() { }

// Type/Interface: PascalCase
interface User { }
type ButtonVariant = 'primary' | 'secondary';
```

---

## Code Style

### Formatting

- **Indentation**: 4 spaces (configured in Prettier)
- **Line Length**: 100 characters max
- **Quotes**: Single quotes for strings, double for JSX
- **Semicolons**: Required
- **Trailing Commas**: Always (ES6+)

### React Patterns

```typescript
// ✅ GOOD: Destructure props
interface UserCardProps {
    user: User;
    onEdit: () => void;
}

function UserCard({ user, onEdit }: UserCardProps) {
    return (
        <div>
            <h3>{user.name}</h3>
            <Button onClick={onEdit}>Edit</Button>
        </div>
    );
}

// ❌ BAD: Use props object
function UserCard(props: UserCardProps) {
    return (
        <div>
            <h3>{props.user.name}</h3>
            <Button onClick={props.onEdit}>Edit</Button>
        </div>
    );
}
```

### Conditional Rendering

```typescript
// ✅ GOOD: Ternary for simple conditions
{isLoading ? <Spinner /> : <Content />}

// ✅ GOOD: Logical AND for single branch
{error && <ErrorMessage error={error} />}

// ✅ GOOD: Early return for complex logic
if (!user) return <NotFound />;
if (isLoading) return <Loading />;
return <UserProfile user={user} />;
```

---

## Component Patterns

### Desktop Component Template

```typescript
/**
 * ComponentName - Brief description
 */

import React from 'react';
import type { ComponentNameProps } from './ComponentName.types';
import './ComponentName.css';

/**
 * ComponentName component
 *
 * @param variant - Visual variant (default: 'primary')
 * @param size - Component size (default: 'medium')
 * @param disabled - Whether component is disabled
 */
export function ComponentName({
    variant = 'primary',
    size = 'medium',
    disabled = false,
    children,
    ...rest
}: ComponentNameProps) {
    return (
        <div
            className={`component-name component-name--${variant} component-name--${size}`}
            {...rest}
        >
            {children}
        </div>
    );
}
```

### Mobile Screen Template

```typescript
/**
 * ScreenName Screen
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useBluetoothContext } from '../context/BluetoothContext';

export function ScreenNameScreen() {
    const { selectedDevice, isConnected } = useBluetoothContext();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Initialization logic
    }, []);

    if (!isConnected) {
        return <Text>Please connect device</Text>;
    }

    return (
        <View style={styles.container}>
            {/* Screen content */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
});
```

---

## State Management

### Context Pattern

```typescript
// context/FeatureContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface FeatureContextValue {
    state: FeatureState;
    actions: {
        doSomething: () => void;
    };
}

const FeatureContext = createContext<FeatureContextValue | undefined>(undefined);

export function FeatureProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<FeatureState>(initialState);

    const actions = {
        doSomething: () => {
            // Implementation
        },
    };

    return (
        <FeatureContext.Provider value={{ state, actions }}>
            {children}
        </FeatureContext.Provider>
    );
}

export function useFeature() {
    const context = useContext(FeatureContext);
    if (!context) {
        throw new Error('useFeature must be used within FeatureProvider');
    }
    return context;
}
```

---

## Testing Standards

### Unit Tests

```typescript
// Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
    it('renders children correctly', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('calls onClick when clicked', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click me</Button>);

        fireEvent.click(screen.getByText('Click me'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('is disabled when disabled prop is true', () => {
        render(<Button disabled>Click me</Button>);
        expect(screen.getByText('Click me')).toBeDisabled();
    });
});
```

---

## Documentation Standards

### Component Documentation

Every component must have a README.md with:
1. Component purpose
2. Props table
3. Usage examples
4. Accessibility notes
5. Design tokens used

### Code Comments

```typescript
// ✅ GOOD: Explain WHY
// Delay state update to batch multiple packets and reduce re-renders
setTimeout(() => updateStreamData(packets), 100);

// ❌ BAD: Explain WHAT (code already shows this)
// Set loading to true
setLoading(true);
```

---

## Migration Guidelines

### Updating Existing Code

When refactoring code to meet these standards:

1. **Replace custom SVGs with Heroicons**
```bash
# Before
import UserIconSVG from './icons/user.svg';

# After
import { UserIcon } from '@heroicons/react/24/outline';
```

2. **Extract reusable components**
```bash
# If you find duplicate button implementations:
# 1. Check if Button component exists in design-system
# 2. Replace with <Button /> import
# 3. Remove duplicate code
```

3. **Move to correct directory structure**
```bash
# Old: apps/desktop/src/renderer/App.tsx
# New: apps/desktop/src/App.tsx

# Old: apps/desktop/src/components/MyComponent.tsx (if reusable)
# New: apps/desktop/src/design-system/components/my-component/MyComponent.tsx
```

---

## Enforcement

### Pre-commit Hooks

- **ESLint**: Enforces code style
- **TypeScript**: Type checking
- **Prettier**: Auto-formatting

### Code Review Checklist

- [ ] No duplicate components (reuses existing)
- [ ] Uses Heroicons for all icons
- [ ] TypeScript strict mode compliant
- [ ] Proper file structure and naming
- [ ] Component has documentation
- [ ] Accessibility requirements met
- [ ] Tests written for critical paths

---

## Resources

- **Heroicons**: https://heroicons.com/
- **TypeScript**: https://www.typescriptlang.org/docs/
- **React**: https://react.dev/
- **Accessibility**: https://www.w3.org/WAI/WCAG21/quickref/

---

**Last Updated**: 2025-10-18
**Maintained by**: IRIS Development Team
**Version**: 2.0.0
