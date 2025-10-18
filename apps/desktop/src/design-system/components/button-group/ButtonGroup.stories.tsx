import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ButtonGroup } from './index';
import type { ButtonGroupOption } from './ButtonGroup.types';

// Simple SVG icons for stories
const UserIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
    >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const SearchIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
    >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
    </svg>
);

const BodyIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
    >
        <circle cx="12" cy="5" r="3" />
        <path d="M12 8v13" />
        <path d="M8 14h8" />
    </svg>
);

// ===== META CONFIGURATION =====
const meta = {
    title: 'Design System/ButtonGroup',
    component: ButtonGroup,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: `
A radio-style button group component for the IRIS design system.

## Features
- Radio-style single selection
- Connected button appearance
- 3 sizes: small, medium, large
- Icon support
- Keyboard navigation (arrow keys)
- Full ARIA accessibility
- Responsive design

**Figma:**
- [Users List Design (6804:13695)](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6804-13695&m=dev)
- [SNOMED Categories (6804:18716)](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6804-18716&m=dev)
                `,
            },
        },
    },
    tags: ['autodocs'],
    argTypes: {
        size: {
            control: 'select',
            options: ['small', 'medium', 'large'],
            description: 'Button group size',
            table: {
                defaultValue: { summary: 'medium' },
                type: { summary: 'small | medium | large' },
            },
        },
        disabled: {
            control: 'boolean',
            description: 'Disabled state',
            table: {
                defaultValue: { summary: 'false' },
            },
        },
        fullWidth: {
            control: 'boolean',
            description: 'Full width button group',
            table: {
                defaultValue: { summary: 'false' },
            },
        },
        onChange: { action: 'changed' },
    },
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

// ===== BASIC EXAMPLES =====

export const UsersListExample: Story = {
    name: 'Users List (Figma 6804:13695)',
    render: () => {
        const [selected, setSelected] = React.useState('users');

        const options: ButtonGroupOption[] = [
            { value: 'users', label: 'Usuários' },
            { value: 'researchers', label: 'Pesquisadores' },
        ];

        return (
            <ButtonGroup
                options={options}
                value={selected}
                onChange={setSelected}
                ariaLabel="Select user type"
            />
        );
    },
};

export const SnomedCategoriesExample: Story = {
    name: 'SNOMED Categories (Figma 6804:18716)',
    render: () => {
        const [selected, setSelected] = React.useState('body-region');

        const options: ButtonGroupOption[] = [
            { value: 'body-region', label: 'Região do Corpo' },
            { value: 'body-structure', label: 'Estrutura do corpo' },
            { value: 'topographic-modifier', label: 'Modificador topográfico' },
            { value: 'clinical-condition', label: 'Condição clínica' },
            { value: 'clinical-event', label: 'Evento clínico' },
            { value: 'medication', label: 'Medicação' },
            { value: 'allergy', label: 'Alergia/Intolerância' },
        ];

        return (
            <div style={{ maxWidth: '100%', overflow: 'auto' }}>
                <ButtonGroup
                    options={options}
                    value={selected}
                    onChange={setSelected}
                    ariaLabel="Select SNOMED category"
                />
            </div>
        );
    },
    parameters: {
        layout: 'padded',
    },
};

// ===== SIZES =====

export const Small: Story = {
    render: () => {
        const [selected, setSelected] = React.useState('option1');

        const options: ButtonGroupOption[] = [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
        ];

        return (
            <ButtonGroup
                options={options}
                value={selected}
                onChange={setSelected}
                size="small"
            />
        );
    },
};

export const Medium: Story = {
    render: () => {
        const [selected, setSelected] = React.useState('option1');

        const options: ButtonGroupOption[] = [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
        ];

        return (
            <ButtonGroup
                options={options}
                value={selected}
                onChange={setSelected}
                size="medium"
            />
        );
    },
};

export const Large: Story = {
    render: () => {
        const [selected, setSelected] = React.useState('option1');

        const options: ButtonGroupOption[] = [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
        ];

        return (
            <ButtonGroup
                options={options}
                value={selected}
                onChange={setSelected}
                size="large"
            />
        );
    },
};

// ===== WITH ICONS =====

export const WithIcons: Story = {
    render: () => {
        const [selected, setSelected] = React.useState('users');

        const options: ButtonGroupOption[] = [
            { value: 'users', label: 'Users', icon: <UserIcon /> },
            { value: 'search', label: 'Search', icon: <SearchIcon /> },
            { value: 'body', label: 'Body', icon: <BodyIcon /> },
        ];

        return (
            <ButtonGroup options={options} value={selected} onChange={setSelected} />
        );
    },
};

// ===== STATES =====

export const Disabled: Story = {
    render: () => {
        const [selected, setSelected] = React.useState('option1');

        const options: ButtonGroupOption[] = [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
        ];

        return (
            <ButtonGroup
                options={options}
                value={selected}
                onChange={setSelected}
                disabled
            />
        );
    },
};

export const IndividualDisabled: Story = {
    render: () => {
        const [selected, setSelected] = React.useState('option1');

        const options: ButtonGroupOption[] = [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2 (Disabled)', disabled: true },
            { value: 'option3', label: 'Option 3' },
        ];

        return (
            <ButtonGroup options={options} value={selected} onChange={setSelected} />
        );
    },
};

// ===== FULL WIDTH =====

export const FullWidth: Story = {
    render: () => {
        const [selected, setSelected] = React.useState('option1');

        const options: ButtonGroupOption[] = [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
        ];

        return (
            <div style={{ width: '600px' }}>
                <ButtonGroup
                    options={options}
                    value={selected}
                    onChange={setSelected}
                    fullWidth
                />
            </div>
        );
    },
    parameters: {
        layout: 'padded',
    },
};

// ===== ALL SIZES SHOWCASE =====

export const AllSizesShowcase: Story = {
    render: () => {
        const [selectedSmall, setSelectedSmall] = React.useState('option1');
        const [selectedMedium, setSelectedMedium] = React.useState('option2');
        const [selectedLarge, setSelectedLarge] = React.useState('option3');

        const options: ButtonGroupOption[] = [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
        ];

        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2rem',
                    maxWidth: '800px',
                }}
            >
                <section>
                    <h3 style={{ marginBottom: '1rem', color: '#333' }}>Small</h3>
                    <ButtonGroup
                        options={options}
                        value={selectedSmall}
                        onChange={setSelectedSmall}
                        size="small"
                    />
                </section>

                <section>
                    <h3 style={{ marginBottom: '1rem', color: '#333' }}>
                        Medium (Default)
                    </h3>
                    <ButtonGroup
                        options={options}
                        value={selectedMedium}
                        onChange={setSelectedMedium}
                        size="medium"
                    />
                </section>

                <section>
                    <h3 style={{ marginBottom: '1rem', color: '#333' }}>Large</h3>
                    <ButtonGroup
                        options={options}
                        value={selectedLarge}
                        onChange={setSelectedLarge}
                        size="large"
                    />
                </section>
            </div>
        );
    },
    parameters: {
        layout: 'padded',
    },
};

// ===== INTERACTIVE EXAMPLES =====

export const KeyboardNavigation: Story = {
    render: () => {
        const [selected, setSelected] = React.useState('option2');

        const options: ButtonGroupOption[] = [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
            { value: 'option4', label: 'Option 4' },
        ];

        return (
            <div style={{ maxWidth: '600px' }}>
                <p style={{ marginBottom: '1rem', color: '#666', fontSize: '14px' }}>
                    Try using keyboard arrow keys (← →) to navigate, or Home/End to jump
                    to first/last option.
                </p>
                <ButtonGroup options={options} value={selected} onChange={setSelected} />
                <p style={{ marginTop: '1rem', color: '#333', fontSize: '14px' }}>
                    Selected: <strong>{selected}</strong>
                </p>
            </div>
        );
    },
    parameters: {
        layout: 'padded',
    },
};

export const DynamicContent: Story = {
    render: () => {
        const [selected, setSelected] = React.useState('view');
        const [count, setCount] = React.useState(0);

        const options: ButtonGroupOption[] = [
            { value: 'view', label: `View (${count})` },
            { value: 'edit', label: 'Edit' },
            { value: 'delete', label: 'Delete' },
        ];

        return (
            <div style={{ maxWidth: '600px' }}>
                <div style={{ marginBottom: '1rem' }}>
                    <button
                        onClick={() => setCount(count + 1)}
                        style={{
                            padding: '8px 16px',
                            background: '#49A2A8',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        Increment Count
                    </button>
                </div>
                <ButtonGroup options={options} value={selected} onChange={setSelected} />
            </div>
        );
    },
    parameters: {
        layout: 'padded',
    },
};

// ===== PLAYGROUND (Interactive Testing) =====

export const Playground: Story = {
    render: (args) => {
        const [selected, setSelected] = React.useState('option1');

        const options: ButtonGroupOption[] = [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
        ];

        return (
            <ButtonGroup
                {...args}
                options={options}
                value={selected}
                onChange={setSelected}
            />
        );
    },
    args: {
        size: 'medium',
        disabled: false,
        fullWidth: false,
    },
};
