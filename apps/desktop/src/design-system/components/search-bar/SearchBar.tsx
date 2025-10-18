/**
 * SearchBar Component
 *
 * A search input component with autocomplete, filtering, and recent searches.
 * Extends the Input component with search-specific features.
 *
 * Features:
 * - Autocomplete dropdown with keyboard navigation
 * - Recent searches storage (localStorage)
 * - Custom filtering and rendering
 * - Debounced search callback
 * - Loading state for async searches
 * - Clear button
 * - Grouped options by category
 * - Full accessibility support
 *
 * @example
 * ```tsx
 * // Basic search bar
 * <SearchBar
 *   placeholder="Search..."
 *   onSearch={(value) => console.log(value)}
 * />
 *
 * // With autocomplete
 * <SearchBar
 *   placeholder="Search users..."
 *   options={userOptions}
 *   onSelect={(option) => console.log(option)}
 * />
 *
 * // With recent searches
 * <SearchBar
 *   placeholder="Search..."
 *   showRecentSearches
 *   maxRecentSearches={5}
 * />
 *
 * // With async loading
 * <SearchBar
 *   placeholder="Search..."
 *   loading={isLoading}
 *   options={searchResults}
 *   onSearch={handleSearch}
 * />
 * ```
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Input from '../input/Input';
import type { SearchBarProps, SearchBarOption } from './SearchBar.types';
import './SearchBar.css';

const SearchBar: React.FC<SearchBarProps> = ({
    onSearch,
    onSelect,
    options = [],
    showAutocomplete = true,
    maxOptions = 5,
    filterOptions,
    renderOption,
    showRecentSearches = false,
    maxRecentSearches = 5,
    recentSearchesKey = 'iris-search-recent',
    showClearButton = true,
    debounceDelay = 300,
    loading = false,
    searchIcon,
    clearIcon,
    minSearchLength = 1,
    emptyMessage = 'No results found',
    loadingMessage = 'Searching...',
    size = 'medium',
    placeholder = 'Search...',
    value: controlledValue,
    onChange: controlledOnChange,
    ...inputProps
}) => {
    // State
    const [internalValue, setInternalValue] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout>();

    // Determine value (controlled or uncontrolled)
    const value = controlledValue !== undefined ? controlledValue : internalValue;

    // Load recent searches from localStorage
    useEffect(() => {
        if (showRecentSearches) {
            try {
                const stored = localStorage.getItem(recentSearchesKey);
                if (stored) {
                    setRecentSearches(JSON.parse(stored));
                }
            } catch (error) {
                console.error('Failed to load recent searches:', error);
            }
        }
    }, [showRecentSearches, recentSearchesKey]);

    // Default filter function
    const defaultFilterOptions = useCallback(
        (opts: SearchBarOption[], searchValue: string): SearchBarOption[] => {
            const lowerSearch = searchValue.toLowerCase().trim();
            return opts.filter((option) =>
                option.label.toLowerCase().includes(lowerSearch)
            );
        },
        []
    );

    // Filter options based on search value
    const filteredOptions = useMemo(() => {
        if (value.length < minSearchLength) {
            return [];
        }

        const filterFn = filterOptions || defaultFilterOptions;
        const filtered = filterFn(options, value);
        return filtered.slice(0, maxOptions);
    }, [options, value, minSearchLength, maxOptions, filterOptions, defaultFilterOptions]);

    // Group options by category
    const groupedOptions = useMemo(() => {
        const groups: Record<string, SearchBarOption[]> = {};

        filteredOptions.forEach((option) => {
            const category = option.category || 'Results';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(option);
        });

        return groups;
    }, [filteredOptions]);

    // Handle value change
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;

            // Update state
            if (controlledOnChange) {
                controlledOnChange(e);
            } else {
                setInternalValue(newValue);
            }

            // Open dropdown if there's content
            if (showAutocomplete && newValue.length >= minSearchLength) {
                setIsDropdownOpen(true);
                setFocusedIndex(-1);
            } else {
                setIsDropdownOpen(false);
            }

            // Debounced search callback
            if (onSearch) {
                if (debounceTimerRef.current) {
                    clearTimeout(debounceTimerRef.current);
                }

                debounceTimerRef.current = setTimeout(() => {
                    onSearch(newValue);
                }, debounceDelay);
            }
        },
        [
            controlledOnChange,
            onSearch,
            debounceDelay,
            showAutocomplete,
            minSearchLength,
        ]
    );

    // Handle option selection
    const handleSelectOption = useCallback(
        (option: SearchBarOption) => {
            // Update value
            const newValue = option.label;
            if (controlledValue === undefined) {
                setInternalValue(newValue);
            }

            // Save to recent searches
            if (showRecentSearches) {
                const updated = [
                    newValue,
                    ...recentSearches.filter((s) => s !== newValue),
                ].slice(0, maxRecentSearches);

                setRecentSearches(updated);
                try {
                    localStorage.setItem(recentSearchesKey, JSON.stringify(updated));
                } catch (error) {
                    console.error('Failed to save recent searches:', error);
                }
            }

            // Close dropdown
            setIsDropdownOpen(false);
            setFocusedIndex(-1);

            // Call onSelect callback
            if (onSelect) {
                onSelect(option);
            }

            // Call onSearch callback immediately
            if (onSearch) {
                onSearch(newValue);
            }
        },
        [
            controlledValue,
            showRecentSearches,
            recentSearches,
            maxRecentSearches,
            recentSearchesKey,
            onSelect,
            onSearch,
        ]
    );

    // Handle clear button
    const handleClear = useCallback(() => {
        const emptyValue = '';

        if (controlledValue === undefined) {
            setInternalValue(emptyValue);
        }

        setIsDropdownOpen(false);
        setFocusedIndex(-1);

        if (onSearch) {
            onSearch(emptyValue);
        }

        // Trigger synthetic change event
        if (controlledOnChange) {
            const syntheticEvent = {
                target: { value: emptyValue },
            } as React.ChangeEvent<HTMLInputElement>;
            controlledOnChange(syntheticEvent);
        }
    }, [controlledValue, controlledOnChange, onSearch]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (!isDropdownOpen) {
                // Open dropdown on ArrowDown
                if (e.key === 'ArrowDown' && showAutocomplete) {
                    setIsDropdownOpen(true);
                    setFocusedIndex(0);
                    e.preventDefault();
                }
                return;
            }

            const optionsCount = filteredOptions.length;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setFocusedIndex((prev) => (prev < optionsCount - 1 ? prev + 1 : prev));
                    break;

                case 'ArrowUp':
                    e.preventDefault();
                    setFocusedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                    break;

                case 'Enter':
                    e.preventDefault();
                    if (focusedIndex >= 0 && filteredOptions[focusedIndex]) {
                        handleSelectOption(filteredOptions[focusedIndex]);
                    }
                    break;

                case 'Escape':
                    e.preventDefault();
                    setIsDropdownOpen(false);
                    setFocusedIndex(-1);
                    break;

                case 'Tab':
                    setIsDropdownOpen(false);
                    setFocusedIndex(-1);
                    break;
            }
        },
        [isDropdownOpen, filteredOptions, focusedIndex, handleSelectOption, showAutocomplete]
    );

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
                setFocusedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Scroll focused option into view
    useEffect(() => {
        if (focusedIndex >= 0 && dropdownRef.current) {
            const focusedElement = dropdownRef.current.children[focusedIndex] as HTMLElement;
            if (focusedElement) {
                focusedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }, [focusedIndex]);

    // Handle focus to show recent searches
    const handleFocus = useCallback(() => {
        if (showRecentSearches && recentSearches.length > 0 && value.length === 0) {
            setIsDropdownOpen(true);
        }
    }, [showRecentSearches, recentSearches, value]);

    // Clear recent searches
    const handleClearRecentSearches = useCallback(() => {
        setRecentSearches([]);
        try {
            localStorage.removeItem(recentSearchesKey);
        } catch (error) {
            console.error('Failed to clear recent searches:', error);
        }
    }, [recentSearchesKey]);

    // Default search icon (magnifying glass)
    const defaultSearchIcon = (
        <svg
            className="iris-search-bar__search-icon"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );

    // Default clear icon (X)
    const defaultClearIcon = (
        <svg
            className="iris-search-bar__clear-icon"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M12 4L4 12M4 4l8 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );

    // Render dropdown content
    const renderDropdownContent = () => {
        // Loading state
        if (loading) {
            return (
                <div className="iris-search-bar__loading">
                    <span className="iris-search-bar__spinner" />
                    {loadingMessage}
                </div>
            );
        }

        // Recent searches (when input is empty)
        if (showRecentSearches && value.length === 0 && recentSearches.length > 0) {
            return (
                <>
                    <div className="iris-search-bar__recent-header">
                        <span className="iris-search-bar__recent-title">Recent Searches</span>
                        <button
                            type="button"
                            className="iris-search-bar__recent-clear"
                            onClick={handleClearRecentSearches}
                            aria-label="Clear recent searches"
                        >
                            Clear
                        </button>
                    </div>
                    {recentSearches.map((search, index) => (
                        <div
                            key={`recent-${index}`}
                            className={`iris-search-bar__option ${focusedIndex === index ? 'iris-search-bar__option--focused' : ''
                                }`}
                            onClick={() => {
                                const syntheticEvent = {
                                    target: { value: search },
                                } as React.ChangeEvent<HTMLInputElement>;
                                handleChange(syntheticEvent);
                            }}
                            role="option"
                            aria-selected={focusedIndex === index}
                        >
                            {search}
                        </div>
                    ))}
                </>
            );
        }

        // Empty state
        if (filteredOptions.length === 0 && value.length >= minSearchLength) {
            return <div className="iris-search-bar__empty">{emptyMessage}</div>;
        }

        // Render grouped options
        return Object.entries(groupedOptions).map(([category, categoryOptions]) => (
            <div key={category}>
                {Object.keys(groupedOptions).length > 1 && (
                    <div className="iris-search-bar__category">{category}</div>
                )}
                {categoryOptions.map((option, index) => {
                    const globalIndex = filteredOptions.indexOf(option);
                    return (
                        <div
                            key={option.id}
                            className={`iris-search-bar__option ${focusedIndex === globalIndex ? 'iris-search-bar__option--focused' : ''
                                }`}
                            onClick={() => handleSelectOption(option)}
                            role="option"
                            aria-selected={focusedIndex === globalIndex}
                        >
                            {renderOption ? renderOption(option) : option.label}
                        </div>
                    );
                })}
            </div>
        ));
    };

    // Container classes
    const containerClasses = [
        'iris-search-bar',
        `iris-search-bar--${size}`,
        inputProps.fullWidth && 'iris-search-bar--full-width',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div ref={containerRef} className={containerClasses}>
            <Input
                {...inputProps}
                type="text"
                size={size}
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                icon={searchIcon || defaultSearchIcon}
                iconPosition="left"
                autoComplete="off"
                role="combobox"
                aria-expanded={isDropdownOpen}
                aria-autocomplete="list"
                aria-controls="search-bar-dropdown"
            />

            {showClearButton && value.length > 0 && (
                <button
                    type="button"
                    className="iris-search-bar__clear"
                    onClick={handleClear}
                    aria-label="Clear search"
                    tabIndex={-1}
                >
                    {clearIcon || defaultClearIcon}
                </button>
            )}

            {isDropdownOpen && showAutocomplete && (
                <div
                    ref={dropdownRef}
                    className="iris-search-bar__dropdown"
                    id="search-bar-dropdown"
                    role="listbox"
                >
                    {renderDropdownContent()}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
