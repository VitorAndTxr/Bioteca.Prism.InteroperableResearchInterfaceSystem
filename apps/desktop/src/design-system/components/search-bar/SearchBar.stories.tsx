/**
 * SearchBar Component Stories
 *
 * Storybook stories demonstrating all features and use cases of the SearchBar component.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import SearchBar from './SearchBar';
import type { SearchBarOption } from './SearchBar.types';

const meta = {
    title: 'Design System/SearchBar',
    component: SearchBar,
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component:
                    'A comprehensive search input component with autocomplete, filtering, recent searches, and keyboard navigation. Built on the Input component with search-specific enhancements.',
            },
        },
    },
    tags: ['autodocs'],
    argTypes: {
        size: {
            control: 'select',
            options: ['small', 'medium', 'big'],
            description: 'Size variant of the search bar',
        },
        placeholder: {
            control: 'text',
            description: 'Placeholder text',
        },
        disabled: {
            control: 'boolean',
            description: 'Disabled state',
        },
        fullWidth: {
            control: 'boolean',
            description: 'Full width layout',
        },
        showAutocomplete: {
            control: 'boolean',
            description: 'Show autocomplete dropdown',
        },
        showClearButton: {
            control: 'boolean',
            description: 'Show clear button when value exists',
        },
        showRecentSearches: {
            control: 'boolean',
            description: 'Show recent searches when focused and empty',
        },
        loading: {
            control: 'boolean',
            description: 'Loading state for async searches',
        },
        maxOptions: {
            control: 'number',
            description: 'Maximum number of options to display',
        },
        minSearchLength: {
            control: 'number',
            description: 'Minimum characters to trigger autocomplete',
        },
        debounceDelay: {
            control: 'number',
            description: 'Debounce delay in milliseconds',
        },
        emptyMessage: {
            control: 'text',
            description: 'Message when no results found',
        },
        loadingMessage: {
            control: 'text',
            description: 'Message during loading',
        },
    },
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data
const users: SearchBarOption[] = [
    { id: '1', label: 'Dr. John Doe', category: 'Researchers' },
    { id: '2', label: 'Dr. Jane Smith', category: 'Researchers' },
    { id: '3', label: 'Dr. Robert Johnson', category: 'Researchers' },
    { id: '4', label: 'Dr. Emily Brown', category: 'Researchers' },
    { id: '5', label: 'Alice Williams', category: 'Clinicians' },
    { id: '6', label: 'Bob Davis', category: 'Clinicians' },
    { id: '7', label: 'Carol Martinez', category: 'Administrators' },
    { id: '8', label: 'David Wilson', category: 'Administrators' },
];

const conditions: SearchBarOption[] = [
    { id: 'c1', label: 'Diabetes Mellitus Type 2', category: 'Endocrine' },
    { id: 'c2', label: 'Hypertension', category: 'Cardiovascular' },
    { id: 'c3', label: 'Asthma', category: 'Respiratory' },
    { id: 'c4', label: 'Chronic Obstructive Pulmonary Disease', category: 'Respiratory' },
    { id: 'c5', label: 'Coronary Artery Disease', category: 'Cardiovascular' },
    { id: 'c6', label: 'Depression', category: 'Mental Health' },
    { id: 'c7', label: 'Anxiety Disorder', category: 'Mental Health' },
    { id: 'c8', label: 'Rheumatoid Arthritis', category: 'Musculoskeletal' },
];

// =============================================================================
// Basic Examples
// =============================================================================

export const Default: Story = {
    args: {
        placeholder: 'Search...',
    },
};

export const WithPlaceholder: Story = {
    args: {
        placeholder: 'Search users, conditions, or studies...',
    },
};

export const Small: Story = {
    args: {
        size: 'small',
        placeholder: 'Search...',
    },
};

export const Medium: Story = {
    args: {
        size: 'medium',
        placeholder: 'Search...',
    },
};

export const Big: Story = {
    args: {
        size: 'big',
        placeholder: 'Search...',
    },
};

export const FullWidth: Story = {
    args: {
        placeholder: 'Search...',
        fullWidth: true,
    },
    parameters: {
        layout: 'padded',
    },
};

export const Disabled: Story = {
    args: {
        placeholder: 'Search...',
        disabled: true,
        value: 'Disabled search',
    },
};

// =============================================================================
// Autocomplete Examples
// =============================================================================

export const WithAutocomplete: Story = {
    args: {
        placeholder: 'Search users...',
        options: users,
    },
    render: (args) => {
        const [value, setValue] = useState('');

        return (
            <SearchBar
                {...args}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onSelect={(option) => {
                    console.log('Selected:', option);
                    alert(`Selected: ${option.label}`);
                }}
            />
        );
    },
};

export const GroupedOptions: Story = {
    args: {
        placeholder: 'Search clinical conditions...',
        options: conditions,
    },
    render: (args) => {
        const [value, setValue] = useState('');

        return (
            <SearchBar
                {...args}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onSelect={(option) => console.log('Selected:', option)}
            />
        );
    },
};

export const WithMaxOptions: Story = {
    args: {
        placeholder: 'Search (max 3 results)...',
        options: users,
        maxOptions: 3,
    },
    render: (args) => {
        const [value, setValue] = useState('');

        return (
            <SearchBar
                {...args}
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
        );
    },
};

export const MinSearchLength: Story = {
    args: {
        placeholder: 'Type at least 2 characters...',
        options: users,
        minSearchLength: 2,
        emptyMessage: 'Please type at least 2 characters',
    },
    render: (args) => {
        const [value, setValue] = useState('');

        return (
            <SearchBar
                {...args}
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
        );
    },
};

// =============================================================================
// Loading & Async Examples
// =============================================================================

export const LoadingState: Story = {
    args: {
        placeholder: 'Search...',
        loading: true,
        loadingMessage: 'Searching database...',
    },
};

export const AsyncSearch: Story = {
    args: {
        placeholder: 'Search users (simulated API call)...',
        debounceDelay: 500,
    },
    render: (args) => {
        const [value, setValue] = useState('');
        const [loading, setLoading] = useState(false);
        const [results, setResults] = useState<SearchBarOption[]>([]);

        const handleSearch = async (searchValue: string) => {
            if (searchValue.length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);

            // Simulate API call
            setTimeout(() => {
                const filtered = users.filter((user) =>
                    user.label.toLowerCase().includes(searchValue.toLowerCase())
                );
                setResults(filtered);
                setLoading(false);
            }, 800);
        };

        return (
            <SearchBar
                {...args}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onSearch={handleSearch}
                loading={loading}
                options={results}
                minSearchLength={2}
            />
        );
    },
};

// =============================================================================
// Recent Searches Examples
// =============================================================================

export const WithRecentSearches: Story = {
    args: {
        placeholder: 'Search... (recent searches enabled)',
        showRecentSearches: true,
        maxRecentSearches: 5,
        recentSearchesKey: 'storybook-search-recent',
    },
    render: (args) => {
        const [value, setValue] = useState('');

        return (
            <div>
                <p style={{ marginBottom: 16, color: '#727272', fontSize: 14 }}>
                    Type something and press Enter. Recent searches will appear when you focus the input again.
                </p>
                <SearchBar
                    {...args}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onSearch={(val) => console.log('Searched:', val)}
                />
            </div>
        );
    },
};

// =============================================================================
// Custom Rendering Examples
// =============================================================================

export const CustomOptionRendering: Story = {
    args: {
        placeholder: 'Search users with metadata...',
    },
    render: (args) => {
        const [value, setValue] = useState('');

        const usersWithMetadata: SearchBarOption[] = [
            {
                id: '1',
                label: 'Dr. John Doe',
                category: 'Researchers',
                metadata: { email: 'john.doe@university.edu', institution: 'MIT' },
            },
            {
                id: '2',
                label: 'Dr. Jane Smith',
                category: 'Researchers',
                metadata: { email: 'jane.smith@university.edu', institution: 'Stanford' },
            },
            {
                id: '3',
                label: 'Alice Williams',
                category: 'Clinicians',
                metadata: { email: 'alice.w@hospital.org', institution: 'General Hospital' },
            },
        ];

        const renderOption = (option: SearchBarOption) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ fontWeight: 500 }}>{option.label}</div>
                <div style={{ fontSize: 12, color: '#727272' }}>
                    {option.metadata?.email} • {option.metadata?.institution}
                </div>
            </div>
        );

        return (
            <SearchBar
                {...args}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                options={usersWithMetadata}
                renderOption={renderOption}
            />
        );
    },
};

// =============================================================================
// Clear Button Examples
// =============================================================================

export const WithClearButton: Story = {
    args: {
        placeholder: 'Search... (clear button enabled)',
        showClearButton: true,
    },
    render: (args) => {
        const [value, setValue] = useState('Sample text to clear');

        return (
            <SearchBar
                {...args}
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
        );
    },
};

export const WithoutClearButton: Story = {
    args: {
        placeholder: 'Search... (no clear button)',
        showClearButton: false,
    },
    render: (args) => {
        const [value, setValue] = useState('Sample text');

        return (
            <SearchBar
                {...args}
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
        );
    },
};

// =============================================================================
// Empty State Examples
// =============================================================================

export const CustomEmptyMessage: Story = {
    args: {
        placeholder: 'Search users...',
        options: [],
        emptyMessage: '🔍 No users found. Try a different search term.',
    },
    render: (args) => {
        const [value, setValue] = useState('test');

        return (
            <SearchBar
                {...args}
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
        );
    },
};

// =============================================================================
// Custom Filter Examples
// =============================================================================

export const CustomFilterFunction: Story = {
    args: {
        placeholder: 'Search (custom fuzzy filter)...',
    },
    render: (args) => {
        const [value, setValue] = useState('');

        const customFilter = (options: SearchBarOption[], searchValue: string) => {
            const search = searchValue.toLowerCase();

            return options.filter((option) => {
                const label = option.label.toLowerCase();
                const words = label.split(' ');

                // Match if search is at start of any word
                return words.some((word) => word.startsWith(search));
            });
        };

        return (
            <div>
                <p style={{ marginBottom: 16, color: '#727272', fontSize: 14 }}>
                    This filter matches the beginning of any word. Try typing "do" or "sm".
                </p>
                <SearchBar
                    {...args}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    options={users}
                    filterOptions={customFilter}
                />
            </div>
        );
    },
};

// =============================================================================
// Real-World Examples
// =============================================================================

export const UserSearch: Story = {
    name: '📱 User Search (Real-World)',
    render: () => {
        const [value, setValue] = useState('');
        const [loading, setLoading] = useState(false);
        const [results, setResults] = useState<SearchBarOption[]>([]);

        const handleSearch = async (searchValue: string) => {
            if (searchValue.length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);
            setTimeout(() => {
                const filtered = users.filter((user) =>
                    user.label.toLowerCase().includes(searchValue.toLowerCase())
                );
                setResults(filtered);
                setLoading(false);
            }, 500);
        };

        const renderOption = (option: SearchBarOption) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                    style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: '#49A2A8',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: 14,
                    }}
                >
                    {option.label.charAt(0)}
                </div>
                <div>
                    <div style={{ fontWeight: 500 }}>{option.label}</div>
                    <div style={{ fontSize: 12, color: '#727272' }}>{option.category}</div>
                </div>
            </div>
        );

        return (
            <div style={{ maxWidth: 600 }}>
                <h3 style={{ marginBottom: 16 }}>Search Users</h3>
                <SearchBar
                    size="medium"
                    placeholder="Search by name or role..."
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onSearch={handleSearch}
                    loading={loading}
                    options={results}
                    renderOption={renderOption}
                    showRecentSearches
                    recentSearchesKey="user-search-recent"
                    minSearchLength={2}
                    debounceDelay={300}
                    emptyMessage="No users found"
                    fullWidth
                />
            </div>
        );
    },
};

export const ClinicalConditionSearch: Story = {
    name: '🏥 Clinical Condition Search (Real-World)',
    render: () => {
        const [value, setValue] = useState('');

        const renderOption = (option: SearchBarOption) => (
            <div>
                <div style={{ fontWeight: 500, marginBottom: 2 }}>{option.label}</div>
                <div style={{ fontSize: 12, color: '#727272' }}>
                    Category: {option.category}
                </div>
            </div>
        );

        return (
            <div style={{ maxWidth: 600 }}>
                <h3 style={{ marginBottom: 16 }}>SNOMED CT - Clinical Conditions</h3>
                <SearchBar
                    size="medium"
                    placeholder="Search clinical conditions..."
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    options={conditions}
                    renderOption={renderOption}
                    onSelect={(option) => {
                        console.log('Selected condition:', option);
                        alert(`Selected: ${option.label}\nCategory: ${option.category}`);
                    }}
                    showClearButton
                    maxOptions={8}
                    emptyMessage="No matching conditions found"
                    fullWidth
                />
            </div>
        );
    },
};

// =============================================================================
// Interactive Playground
// =============================================================================

export const Playground: Story = {
    args: {
        size: 'medium',
        placeholder: 'Try typing something...',
        options: users,
        showAutocomplete: true,
        showClearButton: true,
        showRecentSearches: false,
        maxOptions: 5,
        minSearchLength: 1,
        debounceDelay: 300,
        emptyMessage: 'No results found',
        loadingMessage: 'Searching...',
        loading: false,
        disabled: false,
        fullWidth: false,
    },
    render: (args) => {
        const [value, setValue] = useState('');

        return (
            <div>
                <p style={{ marginBottom: 16, color: '#727272', fontSize: 14 }}>
                    Use the controls panel to customize all SearchBar properties.
                </p>
                <SearchBar
                    {...args}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onSearch={(val) => console.log('Search:', val)}
                    onSelect={(option) => {
                        console.log('Selected:', option);
                        alert(`Selected: ${option.label}`);
                    }}
                />
            </div>
        );
    },
};
