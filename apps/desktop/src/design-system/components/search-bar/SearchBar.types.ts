/**
 * SearchBar Component Types
 *
 * Type definitions for the SearchBar component.
 * SearchBar is a specialized Input component with search-specific features.
 */

import { InputProps } from '../input/Input.types';

export interface SearchBarOption {
    /**
     * Unique identifier for the option
     */
    id: string;

    /**
     * Display label for the option
     */
    label: string;

    /**
     * Optional category for grouping
     */
    category?: string;

    /**
     * Optional metadata for custom rendering
     */
    metadata?: Record<string, any>;
}

export interface SearchBarProps extends Omit<InputProps, 'type' | 'icon' | 'rightIcon'> {
    /**
     * Callback when search value changes
     */
    onSearch?: (value: string) => void;

    /**
     * Callback when an option is selected from autocomplete
     */
    onSelect?: (option: SearchBarOption) => void;

    /**
     * Array of autocomplete options
     */
    options?: SearchBarOption[];

    /**
     * Whether to show autocomplete dropdown
     * @default true
     */
    showAutocomplete?: boolean;

    /**
     * Maximum number of autocomplete options to display
     * @default 5
     */
    maxOptions?: number;

    /**
     * Custom filter function for options
     * @default Case-insensitive label matching
     */
    filterOptions?: (options: SearchBarOption[], searchValue: string) => SearchBarOption[];

    /**
     * Custom render function for autocomplete options
     */
    renderOption?: (option: SearchBarOption) => React.ReactNode;

    /**
     * Whether to show recent searches
     * @default false
     */
    showRecentSearches?: boolean;

    /**
     * Maximum number of recent searches to store
     * @default 5
     */
    maxRecentSearches?: number;

    /**
     * Local storage key for recent searches
     * @default 'iris-search-recent'
     */
    recentSearchesKey?: string;

    /**
     * Whether to show clear button
     * @default true
     */
    showClearButton?: boolean;

    /**
     * Debounce delay in milliseconds for onSearch callback
     * @default 300
     */
    debounceDelay?: number;

    /**
     * Loading state for async search
     * @default false
     */
    loading?: boolean;

    /**
     * Custom icon for search (defaults to magnifying glass)
     */
    searchIcon?: React.ReactNode;

    /**
     * Custom icon for clear button (defaults to X)
     */
    clearIcon?: React.ReactNode;

    /**
     * Minimum characters required to trigger autocomplete
     * @default 1
     */
    minSearchLength?: number;

    /**
     * Empty state message when no options match
     */
    emptyMessage?: string;

    /**
     * Loading message for async search
     */
    loadingMessage?: string;
}
