# IRIS Mobile - UI Components

Reusable UI component library following React Native best practices and IRIS design system.

## Available Components

- **Button** - Primary interactive element with variants, sizes, and loading state
- **Input** - Text input with label, error state, and optional icons
- **Select** - Dropdown picker for selecting from options
- **Card** - Container component with elevated surface styling
- **EmptyState** - Centered message for empty content areas

## Import Pattern

All components are exported from the main barrel file:

```typescript
import { Button, Input, Card, Select, EmptyState } from '@/components/ui';
```

## Components

### Button

Interactive button with multiple variants and states.

**Props:**
- `title` (required): Button text
- `variant`: `'primary'` | `'secondary'` | `'danger'` | `'ghost'` | `'outline'` (default: `'primary'`)
- `size`: `'sm'` | `'md'` | `'lg'` (default: `'md'`)
- `disabled`: boolean (default: `false`)
- `loading`: boolean - shows activity indicator (default: `false`)
- `icon`: ReactNode - optional left icon
- `fullWidth`: boolean (default: `false`)
- `onPress`: callback function

**Example:**

```typescript
import { Button } from '@/components/ui';

<Button
  title="Save Changes"
  variant="primary"
  size="lg"
  onPress={handleSave}
  loading={isSaving}
  fullWidth
/>

<Button
  title="Cancel"
  variant="outline"
  onPress={handleCancel}
/>
```

### Input

Text input field with label and error handling.

**Props:**
- `label`: string - label text above input
- `value`: string
- `onChangeText`: callback
- `placeholder`: string
- `error`: string - error message below input
- `leftIcon`: ReactNode - icon at start of input
- `rightElement`: ReactNode - element at end (e.g., password toggle)
- `disabled`: boolean (default: `false`)
- `multiline`: boolean (default: `false`)
- `secureTextEntry`: boolean - for password fields

**Example:**

```typescript
import { Input } from '@/components/ui';
import { User } from 'react-native-svg'; // or any icon library

<Input
  label="Email Address"
  value={email}
  onChangeText={setEmail}
  placeholder="you@example.com"
  leftIcon={<User size={20} color="#9CA3AF" />}
  error={emailError}
/>

<Input
  label="Password"
  value={password}
  onChangeText={setPassword}
  secureTextEntry={!showPassword}
  rightElement={
    <Pressable onPress={toggleShowPassword}>
      <Eye size={20} color="#9CA3AF" />
    </Pressable>
  }
/>
```

### Select

Dropdown picker component.

**Props:**
- `label`: string - label text above select
- `value`: string | number - currently selected value
- `options`: SelectOption[] - array of `{ label: string, value: string | number }`
- `onValueChange`: (value) => void
- `placeholder`: string
- `error`: string - error message below select
- `disabled`: boolean (default: `false`)

**Example:**

```typescript
import { Select } from '@/components/ui';

const rateOptions = [
  { label: '10 Hz', value: 10 },
  { label: '30 Hz (Recommended)', value: 30 },
  { label: '50 Hz', value: 50 },
];

<Select
  label="Sampling Rate"
  value={selectedRate}
  options={rateOptions}
  onValueChange={setSelectedRate}
  placeholder="Select a rate..."
/>
```

### Card

Container component for grouping related content.

**Props:**
- `children`: ReactNode (required)
- `variant`: `'default'` | `'outlined'` (default: `'default'`)
- `padded`: boolean - apply default padding (default: `true`)
- `style`: ViewStyle - additional styles

**Example:**

```typescript
import { Card } from '@/components/ui';

<Card variant="default" padded>
  <Text style={styles.title}>Device Status</Text>
  <Text style={styles.content}>Connected</Text>
</Card>

<Card variant="outlined" padded={false}>
  <View style={styles.customPadding}>
    {/* Custom content */}
  </View>
</Card>
```

### EmptyState

Displays centered message when content is empty.

**Props:**
- `title`: string (required) - main message
- `message`: string (required) - description
- `icon`: ReactNode - optional icon element
- `action`: EmptyStateAction - optional button `{ label: string, onPress: () => void }`

**Example:**

```typescript
import { EmptyState } from '@/components/ui';
import { Inbox } from 'react-native-svg';

<EmptyState
  icon={<Inbox size={48} color="#9CA3AF" />}
  title="No Data Available"
  message="Connect to a device to start streaming sEMG data"
  action={{
    label: "Connect Device",
    onPress: navigateToConnection,
  }}
/>
```

## Complete Screen Example

```typescript
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Button, Input, Card, Select } from '@/components/ui';
import { theme } from '@/theme';

export const ConfigScreen = () => {
  const [name, setName] = useState('');
  const [rate, setRate] = useState(30);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setSaving(true);
    // Save logic here
    setSaving(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Card variant="default" padded>
        <Text style={styles.sectionTitle}>Configuration</Text>

        <Input
          label="Session Name"
          value={name}
          onChangeText={(value) => {
            setName(value);
            setError('');
          }}
          placeholder="Enter session name"
          error={error}
        />

        <Select
          label="Sampling Rate"
          value={rate}
          options={[
            { label: '10 Hz', value: 10 },
            { label: '30 Hz', value: 30 },
            { label: '50 Hz', value: 50 },
          ]}
          onValueChange={setRate}
        />

        <View style={styles.actions}>
          <Button
            title="Save Configuration"
            variant="primary"
            size="lg"
            onPress={handleSave}
            loading={saving}
            fullWidth
          />
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.title3,
    color: theme.colors.textTitle,
    marginBottom: theme.spacing.lg,
  },
  actions: {
    marginTop: theme.spacing.xl,
  },
});
```

## Design Principles

1. **Composability**: Components work together seamlessly
2. **Type Safety**: Full TypeScript support with strict types
3. **Accessibility**: All components support accessibility props
4. **Consistency**: Uses theme tokens for all styling
5. **Performance**: Optimized with StyleSheet.create
6. **Flexibility**: Extensible via style props

## Component Structure

Each component follows this structure:

```
ComponentName/
├── ComponentName.tsx        # Component implementation
├── ComponentName.types.ts   # TypeScript interfaces
├── index.ts                 # Barrel export
└── README.md                # Component documentation
```

## Type Exports

All component types are exported for reuse:

```typescript
import type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
  InputProps,
  SelectProps,
  SelectOption,
  CardProps,
  EmptyStateProps,
} from '@/components/ui';
```

## Best Practices

1. **Always use theme tokens**: Prefer `theme.colors.primary` over `'#49A2A8'`
2. **Leverage variants**: Use existing variants before creating custom styles
3. **Maintain type safety**: No `any` types, use provided type exports
4. **Test on real devices**: iOS and Android may render differently
5. **Check accessibility**: Ensure components work with screen readers

## References

- Theme System: `apps/mobile/src/theme/README.md`
- MobilePrototype: `D:\Repos\Faculdade\PRISM\MobilePrototype`
- React Native Docs: https://reactnative.dev/
