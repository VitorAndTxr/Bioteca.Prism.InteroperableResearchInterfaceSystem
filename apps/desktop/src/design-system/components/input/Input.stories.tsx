import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Input } from './index';

// Simple SVG icons for stories
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
    </svg>
);

const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
    </svg>
);

const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
);

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
    </svg>
);

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);

// ===== META CONFIGURATION =====
const meta = {
    title: 'Design System/Input',
    component: Input,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: `
A comprehensive input component for the IRIS design system.

## Features
- 3 sizes: small, medium, big
- Icon support: left, right, both sides
- Prefix/suffix text (currency, units, etc.)
- Character counter with limits
- Validation states: error, success, warning
- Label and helper text
- Textarea variant (multiline)
- Full ARIA accessibility
- Responsive design

**Figma:** [Design Node 2803-2414](figma://2803-2414)
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
                defaultValue: { summary: 'medium' },
                type: { summary: 'small | medium | big' },
            },
        },
        validationStatus: {
            control: 'select',
            options: ['none', 'error', 'success', 'warning'],
            description: 'Validation state',
            table: {
                defaultValue: { summary: 'none' },
                type: { summary: 'none | error | success | warning' },
            },
        },
        disabled: {
            control: 'boolean',
            description: 'Disabled state',
            table: {
                defaultValue: { summary: 'false' },
            },
        },
        required: {
            control: 'boolean',
            description: 'Required field indicator',
            table: {
                defaultValue: { summary: 'false' },
            },
        },
        fullWidth: {
            control: 'boolean',
            description: 'Full width input',
            table: {
                defaultValue: { summary: 'false' },
            },
        },
        label: {
            control: 'text',
            description: 'Label text (displayed above input)',
        },
        helperText: {
            control: 'text',
            description: 'Helper text (displayed below input)',
        },
        errorMessage: {
            control: 'text',
            description: 'Error message (shown when validationStatus is error)',
        },
        placeholder: {
            control: 'text',
            description: 'Placeholder text',
        },
        maxLength: {
            control: 'number',
            description: 'Maximum character count',
        },
        showCharacterCount: {
            control: 'boolean',
            description: 'Show character counter',
        },
    },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// ===== BASIC INPUT =====
export const Default: Story = {
    args: {
        placeholder: 'Enter text...',
    },
};

export const WithLabel: Story = {
    args: {
        label: 'Email Address',
        placeholder: 'you@example.com',
    },
};

export const Required: Story = {
    args: {
        label: 'Full Name',
        placeholder: 'John Doe',
        required: true,
    },
};

export const WithHelperText: Story = {
    args: {
        label: 'Username',
        placeholder: 'johndoe123',
        helperText: 'Choose a unique username',
    },
};

// ===== SIZES =====
export const Small: Story = {
    args: {
        size: 'small',
        placeholder: 'Small input (36px)',
    },
};

export const Medium: Story = {
    args: {
        size: 'medium',
        placeholder: 'Medium input (44px)',
    },
};

export const Big: Story = {
    args: {
        size: 'big',
        placeholder: 'Big input (52px)',
    },
};

// ===== WITH ICONS =====
export const IconLeft: Story = {
    args: {
        icon: <SearchIcon />,
        iconPosition: 'left',
        placeholder: 'Search...',
    },
};

export const IconRight: Story = {
    args: {
        icon: <CalendarIcon />,
        iconPosition: 'right',
        placeholder: 'Select date',
    },
};

export const IconBoth: Story = {
    args: {
        icon: <UserIcon />,
        rightIcon: <XIcon />,
        placeholder: 'Username',
    },
};

// ===== VALIDATION STATES =====
export const ErrorState: Story = {
    args: {
        label: 'Email',
        validationStatus: 'error',
        errorMessage: 'Please enter a valid email address',
        placeholder: 'you@example.com',
    },
};

export const SuccessState: Story = {
    args: {
        label: 'Username',
        validationStatus: 'success',
        value: 'johndoe123',
        helperText: 'Username is available!',
    },
};

export const WarningState: Story = {
    args: {
        label: 'Password',
        validationStatus: 'warning',
        type: 'password',
        value: 'weak',
        helperText: 'Password strength: weak',
    },
};

// ===== PREFIX & SUFFIX =====
export const WithPrefix: Story = {
    args: {
        label: 'Amount',
        prefix: '$',
        placeholder: '0.00',
        type: 'number',
    },
};

export const WithSuffix: Story = {
    args: {
        label: 'Weight',
        suffix: 'kg',
        placeholder: '0',
        type: 'number',
    },
};

export const PrefixAndSuffix: Story = {
    args: {
        label: 'Price',
        prefix: '$',
        suffix: 'USD',
        placeholder: '0.00',
        type: 'number',
    },
};

// ===== CHARACTER LIMIT =====
export const WithCharacterCounter: Story = {
    args: {
        label: 'Bio',
        placeholder: 'Tell us about yourself...',
        showCharacterCount: true,
    },
};

export const WithMaxLength: Story = {
    args: {
        label: 'Short Description',
        placeholder: 'Maximum 50 characters',
        maxLength: 50,
    },
};

// ===== TEXTAREA =====
export const Textarea: Story = {
    args: {
        multiline: true,
        rows: 4,
        label: 'Comments',
        placeholder: 'Enter your comments...',
    },
};

export const TextareaWithLimit: Story = {
    args: {
        multiline: true,
        rows: 6,
        label: 'Description (500 chars max)',
        placeholder: 'Provide a detailed description...',
        maxLength: 500,
        helperText: 'Be as detailed as possible',
    },
};

// ===== DISABLED =====
export const Disabled: Story = {
    args: {
        label: 'Disabled Input',
        placeholder: 'Cannot type here',
        disabled: true,
    },
};

export const DisabledWithValue: Story = {
    args: {
        label: 'Read-only Field',
        value: 'This value cannot be changed',
        disabled: true,
    },
};

// ===== FULL WIDTH =====
export const FullWidth: Story = {
    args: {
        label: 'Full Width Input',
        placeholder: 'Spans full container width',
        fullWidth: true,
    },
    parameters: {
        layout: 'padded',
    },
};

// ===== INTERACTIVE EXAMPLES =====
export const SearchWithClear: Story = {
    render: () => {
        const [value, setValue] = useState('');

        return (
            <Input
                icon={<SearchIcon />}
                rightIcon={
                    value ? (
                        <button
                            onClick={() => setValue('')}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0,
                                display: 'flex',
                            }}
                        >
                            <XIcon />
                        </button>
                    ) : null
                }
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Search..."
            />
        );
    },
};

export const PasswordToggle: Story = {
    render: () => {
        const [visible, setVisible] = useState(false);

        return (
            <Input
                label="Password"
                type={visible ? 'text' : 'password'}
                rightIcon={
                    <button
                        onClick={() => setVisible(!visible)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'flex',
                        }}
                    >
                        <EyeIcon />
                    </button>
                }
                placeholder="Enter password"
            />
        );
    },
};

export const EmailValidation: Story = {
    render: () => {
        const [email, setEmail] = useState('');
        const [error, setError] = useState('');

        const validate = (value: string) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!value) {
                setError('');
            } else if (!emailRegex.test(value)) {
                setError('Please enter a valid email address');
            } else {
                setError('');
            }
        };

        return (
            <Input
                label="Email"
                type="email"
                icon={<MailIcon />}
                value={email}
                onChange={(e) => {
                    setEmail(e.target.value);
                    validate(e.target.value);
                }}
                validationStatus={error ? 'error' : email ? 'success' : 'none'}
                errorMessage={error}
                placeholder="you@example.com"
            />
        );
    },
};

// ===== COMPLETE FORM EXAMPLE =====
export const CompleteForm: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: '400px' }}>
            <Input
                label="Full Name"
                icon={<UserIcon />}
                placeholder="John Doe"
                required
            />
            <Input
                label="Email"
                icon={<MailIcon />}
                type="email"
                placeholder="you@example.com"
                required
            />
            <Input
                label="Amount"
                prefix="$"
                suffix="USD"
                type="number"
                placeholder="0.00"
                helperText="Enter the payment amount"
            />
            <Input
                multiline
                rows={5}
                label="Additional Notes"
                placeholder="Any additional information..."
                maxLength={200}
            />
        </div>
    ),
    parameters: {
        layout: 'padded',
    },
};

// ===== ALL SIZES SHOWCASE =====
export const AllSizes: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: '400px' }}>
            <section>
                <h3 style={{ marginBottom: '0.5rem', color: '#333' }}>Small (36px)</h3>
                <Input size="small" placeholder="Small input" />
            </section>
            <section>
                <h3 style={{ marginBottom: '0.5rem', color: '#333' }}>Medium (44px) - Default</h3>
                <Input size="medium" placeholder="Medium input" />
            </section>
            <section>
                <h3 style={{ marginBottom: '0.5rem', color: '#333' }}>Big (52px)</h3>
                <Input size="big" placeholder="Big input" />
            </section>
        </div>
    ),
    parameters: {
        layout: 'padded',
    },
};

// ===== ALL VALIDATION STATES =====
export const AllValidationStates: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: '400px' }}>
            <Input
                label="Default State"
                placeholder="No validation"
                validationStatus="none"
            />
            <Input
                label="Error State"
                value="invalid@"
                validationStatus="error"
                errorMessage="Invalid email format"
            />
            <Input
                label="Success State"
                value="valid@example.com"
                validationStatus="success"
                helperText="Email is valid!"
            />
            <Input
                label="Warning State"
                value="test"
                validationStatus="warning"
                helperText="This might not be correct"
            />
        </div>
    ),
    parameters: {
        layout: 'padded',
    },
};

// ===== PLAYGROUND (Interactive Testing) =====
export const Playground: Story = {
    args: {
        label: 'Playground Input',
        placeholder: 'Type something...',
        size: 'medium',
        validationStatus: 'none',
        disabled: false,
        required: false,
        fullWidth: false,
    },
};
