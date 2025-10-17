import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './index';

// Simple SVG icons for stories
const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
);

const ArrowRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="5" y1="12" x2="19" y2="12"/>
        <polyline points="12 5 19 12 12 19"/>
    </svg>
);

const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17 21 17 13 7 13 7 21"/>
        <polyline points="7 3 7 8 15 8"/>
    </svg>
);

const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
);

// ===== META CONFIGURATION =====
const meta = {
    title: 'Design System/Button',
    component: Button,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: `
A comprehensive button component for the IRIS design system.

## Features
- 3 variants: primary, secondary, outline
- 3 sizes: small, medium, big
- Icon support: left, right, icon-only
- States: default, hover, active, disabled, loading
- Full ARIA accessibility
- Responsive design

**Figma:** [Design Node 2803-1366](figma://2803-1366)
                `,
            },
        },
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['primary', 'secondary', 'outline'],
            description: 'Visual variant of the button',
            table: {
                defaultValue: { summary: 'primary' },
                type: { summary: 'primary | secondary | outline' },
            },
        },
        size: {
            control: 'select',
            options: ['small', 'medium', 'big'],
            description: 'Button size',
            table: {
                defaultValue: { summary: 'medium' },
                type: { summary: 'small | medium | big' },
            },
        },
        disabled: {
            control: 'boolean',
            description: 'Disabled state',
            table: {
                defaultValue: { summary: 'false' },
            },
        },
        loading: {
            control: 'boolean',
            description: 'Loading state (shows spinner)',
            table: {
                defaultValue: { summary: 'false' },
            },
        },
        fullWidth: {
            control: 'boolean',
            description: 'Full width button',
            table: {
                defaultValue: { summary: 'false' },
            },
        },
        children: {
            control: 'text',
            description: 'Button text/content',
        },
        iconPosition: {
            control: 'select',
            options: ['left', 'right'],
            description: 'Icon position relative to text',
            table: {
                defaultValue: { summary: 'left' },
            },
        },
        onClick: { action: 'clicked' },
    },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// ===== BASIC VARIANTS =====
export const Primary: Story = {
    args: {
        variant: 'primary',
        children: 'Primary Button',
    },
};

export const Secondary: Story = {
    args: {
        variant: 'secondary',
        children: 'Secondary Button',
    },
};

export const Outline: Story = {
    args: {
        variant: 'outline',
        children: 'Outline Button',
    },
};

// ===== SIZES =====
export const Small: Story = {
    args: {
        size: 'small',
        children: 'Small Button',
    },
};

export const Medium: Story = {
    args: {
        size: 'medium',
        children: 'Medium Button',
    },
};

export const Big: Story = {
    args: {
        size: 'big',
        children: 'Big Button',
    },
};

// ===== WITH ICONS =====
export const IconLeft: Story = {
    args: {
        icon: <PlusIcon />,
        iconPosition: 'left',
        children: 'Add Item',
    },
};

export const IconRight: Story = {
    args: {
        icon: <ArrowRightIcon />,
        iconPosition: 'right',
        variant: 'secondary',
        children: 'Next Step',
    },
};

export const IconOnly: Story = {
    args: {
        icon: <SaveIcon />,
        tooltip: 'Save changes',
        variant: 'primary',
    },
};

// ===== STATES =====
export const Disabled: Story = {
    args: {
        disabled: true,
        children: 'Disabled Button',
    },
};

export const Loading: Story = {
    args: {
        loading: true,
        children: 'Saving...',
    },
};

export const LoadingWithIcon: Story = {
    args: {
        loading: true,
        icon: <SaveIcon />,
        children: 'Uploading...',
    },
};

// ===== FULL WIDTH =====
export const FullWidth: Story = {
    args: {
        fullWidth: true,
        variant: 'primary',
        children: 'Full Width Button',
    },
    parameters: {
        layout: 'padded',
    },
};

// ===== ALL VARIANTS × ALL SIZES (Showcase) =====
export const AllVariantsAndSizes: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px' }}>
            <section>
                <h3 style={{ marginBottom: '1rem', color: '#333' }}>Small Buttons</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <Button variant="primary" size="small">Primary</Button>
                    <Button variant="secondary" size="small">Secondary</Button>
                    <Button variant="outline" size="small">Outline</Button>
                </div>
            </section>

            <section>
                <h3 style={{ marginBottom: '1rem', color: '#333' }}>Medium Buttons (Default)</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <Button variant="primary" size="medium">Primary</Button>
                    <Button variant="secondary" size="medium">Secondary</Button>
                    <Button variant="outline" size="medium">Outline</Button>
                </div>
            </section>

            <section>
                <h3 style={{ marginBottom: '1rem', color: '#333' }}>Big Buttons</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <Button variant="primary" size="big">Primary</Button>
                    <Button variant="secondary" size="big">Secondary</Button>
                    <Button variant="outline" size="big">Outline</Button>
                </div>
            </section>
        </div>
    ),
    parameters: {
        layout: 'padded',
    },
};

// ===== INTERACTIVE EXAMPLES =====
export const FormActions: Story = {
    render: () => (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Button variant="primary" icon={<SaveIcon />}>
                Save Changes
            </Button>
            <Button variant="outline">Cancel</Button>
        </div>
    ),
};

export const ToolbarActions: Story = {
    render: () => (
        <div style={{ display: 'flex', gap: '8px' }}>
            <Button size="small" icon={<PlusIcon />} tooltip="Add new" />
            <Button size="small" icon={<SaveIcon />} tooltip="Save" />
            <Button size="small" icon={<DeleteIcon />} tooltip="Delete" variant="outline" />
        </div>
    ),
};

export const LoadingStates: Story = {
    render: () => {
        const [loading, setLoading] = React.useState(false);

        const handleClick = () => {
            setLoading(true);
            setTimeout(() => setLoading(false), 2000);
        };

        return (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Button
                    variant="primary"
                    loading={loading}
                    onClick={handleClick}
                >
                    {loading ? 'Saving...' : 'Click to Load'}
                </Button>
                <Button
                    variant="secondary"
                    loading={loading}
                    onClick={handleClick}
                >
                    {loading ? 'Processing...' : 'Process'}
                </Button>
            </div>
        );
    },
};

// Import React for LoadingStates story
import React from 'react';

// ===== PLAYGROUND (Interactive Testing) =====
export const Playground: Story = {
    args: {
        variant: 'primary',
        size: 'medium',
        children: 'Playground Button',
        disabled: false,
        loading: false,
        fullWidth: false,
    },
};
