# Password Component

A specialized input component for password entry with strength indicator and show/hide toggle functionality.

**Figma Design:** [View in Figma](https://www.figma.com/design/...?node-id=2803-2225)

## Features

- ✅ **Show/Hide Toggle**: Eye icon button to reveal or mask password
- ✅ **Password Strength Indicator**: Visual 4-level bar (Weak, Medium, Good, Great)
- ✅ **Strength Label**: Color-coded text label with strength level
- ✅ **Strength Tips**: Optional popover with improvement suggestions
- ✅ **3 Sizes**: Small (36px), Medium (44px), Big (52px)
- ✅ **Validation States**: Error, Success, Warning, None
- ✅ **Custom Strength Calculation**: Provide your own strength algorithm
- ✅ **Strength Callback**: Get notified when strength changes
- ✅ **Full Accessibility**: ARIA labels, keyboard navigation, screen reader support
- ✅ **Responsive Design**: Adapts to mobile and tablet screens

## Installation

```tsx
import { Password } from '@/design-system/components/password';
```

## Basic Usage

```tsx
// Simple password input
<Password placeholder="Enter password" />

// With label and validation
<Password
  label="Password"
  validationStatus="error"
  errorMessage="Password is required"
/>

// With strength indicator
<Password
  label="New Password"
  showStrengthIndicator
  showStrengthLabel
  showStrengthTips
/>
```

## Props

### Core Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'small' \| 'medium' \| 'big'` | `'medium'` | Input size (36px, 44px, 52px) |
| `label` | `string` | - | Label text above input |
| `placeholder` | `string` | - | Placeholder text |
| `helperText` | `string` | - | Helper text below input |
| `errorMessage` | `string` | - | Error message (shown when validationStatus is 'error') |
| `validationStatus` | `'none' \| 'error' \| 'success' \| 'warning'` | `'none'` | Validation state |
| `disabled` | `boolean` | `false` | Disabled state |
| `required` | `boolean` | `false` | Required field indicator |
| `fullWidth` | `boolean` | `false` | Full width input |
| `className` | `string` | - | Custom CSS class |

### Password-Specific Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showStrengthIndicator` | `boolean` | `true` | Show strength bar |
| `showStrengthLabel` | `boolean` | `true` | Show strength label (Weak, Medium, Good, Great) |
| `showStrengthTips` | `boolean` | `false` | Show strength tips popover (click info icon) |
| `initiallyVisible` | `boolean` | `false` | Start with password visible (unmasked) |
| `calculateStrength` | `(password: string) => PasswordStrengthConfig` | Built-in | Custom strength calculation function |
| `onStrengthChange` | `(strength: PasswordStrengthConfig) => void` | - | Callback when strength changes |

### Inherited HTML Attributes

The component accepts all standard `<input type="password">` attributes:
- `value` / `onChange` (controlled component)
- `defaultValue` (uncontrolled component)
- `autoComplete`
- `autoFocus`
- `maxLength`
- `minLength`
- `name`
- `id`
- `onBlur`, `onFocus`, `onKeyDown`, etc.

## Examples

### Sizes

```tsx
<Password size="small" label="Small" />
<Password size="medium" label="Medium" />
<Password size="big" label="Big" />
```

### With Strength Indicator

```tsx
<Password
  label="New Password"
  showStrengthIndicator
  showStrengthLabel
  helperText="Must be at least 8 characters"
/>
```

### With Strength Tips

```tsx
<Password
  label="Password"
  showStrengthIndicator
  showStrengthLabel
  showStrengthTips  // Shows info icon, click to see tips
/>
```

### Validation States

```tsx
// Error
<Password
  label="Password"
  validationStatus="error"
  errorMessage="Password must be at least 8 characters"
/>

// Success
<Password
  label="Password"
  validationStatus="success"
/>

// Warning
<Password
  label="Password"
  validationStatus="warning"
  helperText="Consider using a stronger password"
/>
```

### Full Width

```tsx
<Password
  label="Password"
  fullWidth
  showStrengthIndicator
/>
```

### Custom Strength Calculation

```tsx
const customCalculator = (password: string): PasswordStrengthConfig => {
  // Your custom logic
  const hasSpecialChars = /[!@#$%^&*]/.test(password);
  const isLongEnough = password.length >= 12;

  if (hasSpecialChars && isLongEnough) {
    return {
      level: 'great',
      label: 'Great!',
      tip: 'Excellent password!',
      bars: 4,
    };
  }

  return {
    level: 'weak',
    label: 'Weak',
    tip: 'Use at least 12 characters with special chars',
    bars: 1,
  };
};

<Password
  label="Password"
  calculateStrength={customCalculator}
  showStrengthIndicator
  showStrengthLabel
/>
```

### With Strength Callback

```tsx
const [strengthInfo, setStrengthInfo] = useState('');

<Password
  label="Password"
  onStrengthChange={(strength) => {
    setStrengthInfo(`Strength: ${strength.level}`);
  }}
/>
```

### Sign-Up Form Example

```tsx
const [password, setPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');

const passwordsMatch = password === confirmPassword && password.length > 0;

<div>
  <Password
    label="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="Create a strong password"
    required
    showStrengthIndicator
    showStrengthLabel
    showStrengthTips
    fullWidth
  />

  <Password
    label="Confirm Password"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    placeholder="Re-enter your password"
    required
    validationStatus={passwordsMatch ? 'success' : 'error'}
    errorMessage={!passwordsMatch ? 'Passwords do not match' : undefined}
    showStrengthIndicator={false}
    fullWidth
  />
</div>
```

## Password Strength Levels

The built-in strength calculator evaluates passwords based on:

- **Length**: >= 8 characters (bonus for 12+, 16+)
- **Lowercase letters**: a-z
- **Uppercase letters**: A-Z
- **Numbers**: 0-9
- **Special characters**: !@#$%^&*()_+-=[]{}|;:,.<>?

### Strength Levels

| Level | Bars | Color | Criteria |
|-------|------|-------|----------|
| **Weak** | 1/4 | Red (#E11D48) | Score 0-2: Too simple, lacks variety |
| **Medium** | 2/4 | Amber (#D97706) | Score 3-4: Has some variety but could be better |
| **Good** | 3/4 | Teal (#0D9488) | Score 5-6: Strong enough for most purposes |
| **Great** | 4/4 | Teal (#0D9488) | Score 7+: Excellent strength, all character types |

## Types

### PasswordStrength

```typescript
type PasswordStrength = 'none' | 'weak' | 'medium' | 'good' | 'great';
```

### PasswordStrengthConfig

```typescript
interface PasswordStrengthConfig {
  level: PasswordStrength;   // Strength level
  label: string;              // Display label (e.g., "Weak", "Great!")
  tip?: string;               // Improvement tip for popover
  bars: number;               // Number of filled bars (0-4)
}
```

## Accessibility

The Password component follows accessibility best practices:

- **ARIA Labels**: `aria-label` for show/hide button
- **ARIA Invalid**: `aria-invalid` set when validation status is 'error'
- **ARIA Required**: `aria-required` when required prop is true
- **ARIA Described By**: Links input to helper text and error messages
- **Keyboard Navigation**:
  - Tab to focus input
  - Tab to show/hide button
  - Space/Enter to toggle visibility
  - Click info icon or use keyboard to open tips popover
- **Screen Reader Announcements**: Validation errors announced via `role="alert"`
- **Focus Management**: Clear focus indicators on all interactive elements

## Styling

The component uses CSS custom properties that can be overridden:

```css
/* Override colors */
.iris-password-wrapper {
  --password-border-color: #b0b0b0;
  --password-border-focus: #49a2a8;
  --password-outline-focus: #6be6ef;
}

/* Override strength colors */
.iris-password__strength-bar-segment--weak {
  background-color: var(--strength-weak-color, #e11d48);
}

.iris-password__strength-bar-segment--medium {
  background-color: var(--strength-medium-color, #d97706);
}

.iris-password__strength-bar-segment--good,
.iris-password__strength-bar-segment--great {
  background-color: var(--strength-good-color, #0d9488);
}
```

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Storybook

View all examples and interact with the component in Storybook:

```bash
npm run storybook
```

Navigate to **Design System > Password** to see:
- All sizes and states
- Strength indicator levels
- Interactive examples
- Real-world form scenarios
- Playground with all controls

## Related Components

- [Input](../input/README.md) - Base input component
- [Button](../button/README.md) - For submit buttons in forms

## Credits

- **Design**: IRIS Design System (Figma node 2803-2225)
- **Implementation**: Based on Input component patterns
- **Icons**: Custom SVG eye and eye-off icons
