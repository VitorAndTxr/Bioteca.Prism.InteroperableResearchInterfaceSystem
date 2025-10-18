/**
 * Password Component Stories
 * Based on Figma design node 2803-2225
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Password } from './index';
import { useState } from 'react';

const meta = {
    title: 'Design System/Password',
    component: Password,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: `
Password input component with strength indicator and show/hide toggle.

## Features
- **Show/Hide Toggle**: Eye icon to reveal/mask password
- **Strength Indicator**: 4-level visual bar (Weak, Medium, Good, Great)
- **Strength Label**: Color-coded text label
- **Strength Tips**: Optional popover with improvement suggestions
- **3 Sizes**: Small (36px), Medium (44px), Big (52px)
- **Validation States**: Error, Success, Warning
- **Accessibility**: Full ARIA support with screen reader announcements

## Figma Reference
[View in Figma](https://www.figma.com/design/...?node-id=2803-2225)

## Strength Calculation
The component uses a built-in strength calculator that checks for:
- Length (>= 8 characters)
- Lowercase letters
- Uppercase letters
- Numbers
- Special characters
- Bonus for longer passwords (12+, 16+ characters)

You can provide a custom \`calculateStrength\` function for different logic.
                `,
            },
        },
    },
    tags: ['autodocs'],
    argTypes: {
        size: {
            control: 'select',
            options: ['small', 'medium', 'big'],
            description: 'Input size',
            table: {
                type: { summary: "'small' | 'medium' | 'big'" },
                defaultValue: { summary: 'medium' },
            },
        },
        label: {
            control: 'text',
            description: 'Label text displayed above input',
        },
        placeholder: {
            control: 'text',
            description: 'Placeholder text',
        },
        helperText: {
            control: 'text',
            description: 'Helper text displayed below input',
        },
        errorMessage: {
            control: 'text',
            description: 'Error message (shown when validationStatus is "error")',
        },
        validationStatus: {
            control: 'select',
            options: ['none', 'error', 'success', 'warning'],
            description: 'Validation state',
            table: {
                type: { summary: "'none' | 'error' | 'success' | 'warning'" },
                defaultValue: { summary: 'none' },
            },
        },
        disabled: {
            control: 'boolean',
            description: 'Disabled state',
        },
        required: {
            control: 'boolean',
            description: 'Required field indicator',
        },
        fullWidth: {
            control: 'boolean',
            description: 'Full width input',
        },
        showStrengthIndicator: {
            control: 'boolean',
            description: 'Show strength bar',
            table: {
                defaultValue: { summary: 'true' },
            },
        },
        showStrengthLabel: {
            control: 'boolean',
            description: 'Show strength label',
            table: {
                defaultValue: { summary: 'true' },
            },
        },
        showStrengthTips: {
            control: 'boolean',
            description: 'Show strength tips popover',
            table: {
                defaultValue: { summary: 'false' },
            },
        },
        initiallyVisible: {
            control: 'boolean',
            description: 'Start with password visible',
            table: {
                defaultValue: { summary: 'false' },
            },
        },
    },
} satisfies Meta<typeof Password>;

export default meta;
type Story = StoryObj<typeof meta>;

// ========================================
// Basic Variants
// ========================================

export const Default: Story = {
    args: {
        placeholder: 'Enter password',
    },
};

export const WithLabel: Story = {
    args: {
        label: 'Password',
        placeholder: 'Enter your password',
    },
};

export const Required: Story = {
    args: {
        label: 'Password',
        placeholder: 'Enter password',
        required: true,
    },
};

export const WithHelperText: Story = {
    args: {
        label: 'Password',
        placeholder: 'Enter password',
        helperText: 'Must be at least 8 characters',
    },
};

// ========================================
// Sizes
// ========================================

export const Small: Story = {
    args: {
        size: 'small',
        label: 'Password',
        placeholder: 'Small size',
    },
};

export const Medium: Story = {
    args: {
        size: 'medium',
        label: 'Password',
        placeholder: 'Medium size (default)',
    },
};

export const Big: Story = {
    args: {
        size: 'big',
        label: 'Password',
        placeholder: 'Big size',
    },
};

// ========================================
// States
// ========================================

export const Empty: Story = {
    args: {
        label: 'Password',
        placeholder: 'Password',
    },
    parameters: {
        docs: {
            description: {
                story: 'Empty state with placeholder text. No strength indicator shown.',
            },
        },
    },
};

export const Filled: Story = {
    args: {
        label: 'Password',
        value: '••••',
        showStrengthIndicator: false,
    },
    parameters: {
        docs: {
            description: {
                story: 'Filled state with masked password. Click eye icon to reveal.',
            },
        },
    },
};

export const Disabled: Story = {
    args: {
        label: 'Password',
        placeholder: 'Disabled',
        disabled: true,
    },
};

export const InitiallyVisible: Story = {
    args: {
        label: 'Password',
        value: 'mypassword',
        initiallyVisible: true,
        showStrengthIndicator: false,
    },
    parameters: {
        docs: {
            description: {
                story: 'Password starts in visible state (unmasked).',
            },
        },
    },
};

// ========================================
// Validation States
// ========================================

export const Error: Story = {
    args: {
        label: 'Password',
        value: '123',
        validationStatus: 'error',
        errorMessage: 'Password must be at least 8 characters',
    },
};

export const Success: Story = {
    args: {
        label: 'Password',
        value: 'MySecureP@ssw0rd!',
        validationStatus: 'success',
    },
};

export const Warning: Story = {
    args: {
        label: 'Password',
        value: 'password123',
        validationStatus: 'warning',
        helperText: 'Consider using a stronger password',
    },
};

// ========================================
// Strength Indicator Levels
// ========================================

export const StrengthWeak: Story = {
    args: {
        label: 'Password',
        value: '1234',
        showStrengthIndicator: true,
        showStrengthLabel: true,
    },
    parameters: {
        docs: {
            description: {
                story: 'Weak password (1/4 bars, red): Too simple, lacks variety.',
            },
        },
    },
};

export const StrengthMedium: Story = {
    args: {
        label: 'Password',
        value: 'password123',
        showStrengthIndicator: true,
        showStrengthLabel: true,
    },
    parameters: {
        docs: {
            description: {
                story: 'Medium password (2/4 bars, amber): Has length and numbers but lacks uppercase/special chars.',
            },
        },
    },
};

export const StrengthGood: Story = {
    args: {
        label: 'Password',
        value: 'Password123',
        showStrengthIndicator: true,
        showStrengthLabel: true,
    },
    parameters: {
        docs: {
            description: {
                story: 'Good password (3/4 bars, teal): Has length, uppercase, lowercase, and numbers.',
            },
        },
    },
};

export const StrengthGreat: Story = {
    args: {
        label: 'Password',
        value: 'MySecureP@ssw0rd!2024',
        showStrengthIndicator: true,
        showStrengthLabel: true,
    },
    parameters: {
        docs: {
            description: {
                story: 'Great password (4/4 bars, teal): Has all character types and is long.',
            },
        },
    },
};

// ========================================
// Strength Tips
// ========================================

export const WithStrengthTips: Story = {
    args: {
        label: 'Password',
        value: '1234',
        showStrengthIndicator: true,
        showStrengthLabel: true,
        showStrengthTips: true,
    },
    parameters: {
        docs: {
            description: {
                story: 'Click the info icon next to the strength label to see tips for improving password strength.',
            },
        },
    },
};

// ========================================
// Interactive Examples
// ========================================

export const InteractiveTyping: Story = {
    render: () => {
        const [password, setPassword] = useState('');

        return (
            <div style={{ width: '300px' }}>
                <Password
                    label="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Type to see strength change"
                    showStrengthIndicator
                    showStrengthLabel
                    showStrengthTips
                    helperText="Try different combinations: lowercase, uppercase, numbers, special chars"
                />
                <div style={{ marginTop: '16px', fontSize: '12px', color: '#727272' }}>
                    <strong>Tips to improve strength:</strong>
                    <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                        <li>Use at least 8 characters (12+ recommended)</li>
                        <li>Mix uppercase and lowercase letters</li>
                        <li>Include numbers</li>
                        <li>Add special characters (!@#$%^&*)</li>
                    </ul>
                </div>
            </div>
        );
    },
    parameters: {
        docs: {
            description: {
                story: 'Type in the input to see the strength indicator update in real-time.',
            },
        },
    },
};

export const WithStrengthCallback: Story = {
    render: () => {
        const [password, setPassword] = useState('');
        const [strengthLog, setStrengthLog] = useState('No password entered yet');

        return (
            <div style={{ width: '300px' }}>
                <Password
                    label="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Type to trigger callback"
                    showStrengthIndicator
                    showStrengthLabel
                    onStrengthChange={(strength) => {
                        setStrengthLog(
                            `Level: ${strength.level}, Bars: ${strength.bars}/4, Label: "${strength.label}"`
                        );
                    }}
                />
                <div
                    style={{
                        marginTop: '16px',
                        padding: '12px',
                        backgroundColor: '#f4f4f4',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                    }}
                >
                    <strong>onStrengthChange callback:</strong>
                    <br />
                    {strengthLog}
                </div>
            </div>
        );
    },
    parameters: {
        docs: {
            description: {
                story: 'Demonstrates the `onStrengthChange` callback that fires when password strength changes.',
            },
        },
    },
};

// ========================================
// Custom Styling
// ========================================

export const FullWidth: Story = {
    args: {
        label: 'Password',
        placeholder: 'Full width password',
        fullWidth: true,
        showStrengthIndicator: true,
        showStrengthLabel: true,
    },
    decorators: [
        (Story) => (
            <div style={{ width: '400px' }}>
                <Story />
            </div>
        ),
    ],
};

export const NoStrengthIndicator: Story = {
    args: {
        label: 'Password',
        value: 'MyPassword123',
        showStrengthIndicator: false,
        showStrengthLabel: false,
    },
    parameters: {
        docs: {
            description: {
                story: 'Password input without strength indicator or label.',
            },
        },
    },
};

// ========================================
// Real-World Scenarios
// ========================================

export const SignUpForm: Story = {
    render: () => {
        const [password, setPassword] = useState('');
        const [confirmPassword, setConfirmPassword] = useState('');

        const passwordsMatch = password === confirmPassword && password.length > 0;
        const confirmValidation = confirmPassword.length > 0 ? (passwordsMatch ? 'success' : 'error') : 'none';
        const confirmError = confirmPassword.length > 0 && !passwordsMatch ? 'Passwords do not match' : undefined;

        return (
            <div style={{ width: '350px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Create Account</h3>

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
                    validationStatus={confirmValidation}
                    errorMessage={confirmError}
                    showStrengthIndicator={false}
                    fullWidth
                />
            </div>
        );
    },
    parameters: {
        docs: {
            description: {
                story: 'Realistic sign-up form with password and confirmation fields.',
            },
        },
    },
};

export const PasswordChangeForm: Story = {
    render: () => {
        const [currentPassword, setCurrentPassword] = useState('');
        const [newPassword, setNewPassword] = useState('');
        const [confirmPassword, setConfirmPassword] = useState('');

        return (
            <div style={{ width: '350px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Change Password</h3>

                <Password
                    label="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                    showStrengthIndicator={false}
                    fullWidth
                />

                <Password
                    label="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    showStrengthIndicator
                    showStrengthLabel
                    showStrengthTips
                    helperText="Must be different from current password"
                    fullWidth
                />

                <Password
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    showStrengthIndicator={false}
                    fullWidth
                />
            </div>
        );
    },
    parameters: {
        docs: {
            description: {
                story: 'Password change form with current password and new password fields.',
            },
        },
    },
};

// ========================================
// Showcase
// ========================================

export const AllSizes: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Password size="small" label="Small" value="password123" showStrengthIndicator showStrengthLabel />
            <Password size="medium" label="Medium" value="password123" showStrengthIndicator showStrengthLabel />
            <Password size="big" label="Big" value="password123" showStrengthIndicator showStrengthLabel />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'All password input sizes side by side.',
            },
        },
    },
};

export const AllStrengthLevels: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '300px' }}>
            <Password label="Weak" value="1234" showStrengthIndicator showStrengthLabel showStrengthTips />
            <Password
                label="Medium"
                value="password123"
                showStrengthIndicator
                showStrengthLabel
                showStrengthTips
            />
            <Password label="Good" value="Password123" showStrengthIndicator showStrengthLabel showStrengthTips />
            <Password
                label="Great"
                value="MySecureP@ssw0rd!2024"
                showStrengthIndicator
                showStrengthLabel
                showStrengthTips
            />
        </div>
    ),
    parameters: {
        docs: {
            description: {
                story: 'All strength levels with tips enabled.',
            },
        },
    },
};

// ========================================
// Playground
// ========================================

export const Playground: Story = {
    args: {
        label: 'Password',
        placeholder: 'Enter password',
        size: 'medium',
        validationStatus: 'none',
        disabled: false,
        required: false,
        fullWidth: false,
        showStrengthIndicator: true,
        showStrengthLabel: true,
        showStrengthTips: true,
        initiallyVisible: false,
    },
    parameters: {
        docs: {
            description: {
                story: 'Interactive playground with all controls enabled. Adjust props in the Controls panel.',
            },
        },
    },
};
