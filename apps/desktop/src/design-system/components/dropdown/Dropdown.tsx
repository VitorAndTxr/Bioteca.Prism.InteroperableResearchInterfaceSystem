/**
 * Dropdown Component
 *
 * A comprehensive dropdown/select component with support for:
 * - Single and multiple selection
 * - Searchable options
 * - Grouped options
 * - Tags display for multiple selection
 * - Keyboard navigation
 * - Full accessibility
 *
 * Based on Figma design: node 2803-2339
 *
 * @example
 * ```tsx
 * <Dropdown
 *   options={[
 *     { value: '1', label: 'Option 1' },
 *     { value: '2', label: 'Option 2' },
 *   ]}
 *   value={selectedValue}
 *   onChange={setSelectedValue}
 *   label="Select an option"
 *   placeholder="Choose value"
 * />
 * ```
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  DropdownProps,
  DropdownOption,
  DropdownGroup,
  isGroupedOptions,
  isMultipleValue,
} from './Dropdown.types';
import './Dropdown.css';

export const Dropdown: React.FC<DropdownProps> = ({
  // Required
  options,

  // Value & Selection
  value,
  defaultValue,
  onChange,
  mode = 'single',

  // Appearance
  size = 'medium',
  label,
  placeholder = 'Choose value',
  helperText,
  errorMessage,
  validation = 'none',
  showChevron = true,

  // Search
  searchable = false,
  searchPlaceholder = 'Search...',
  filterFn,

  // Multiple Selection
  showTags = false,
  maxTagsVisible = 3,
  renderValue,

  // Menu Customization
  renderOption,
  showAddButton = false,
  addButtonText = 'Add new item',
  onAddClick,
  maxMenuHeight = 400,

  // State & Interaction
  disabled = false,
  required = false,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  onFocus,
  onBlur,

  // Advanced
  id,
  name,
  className = '',
  style,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  tabIndex = 0,
  'data-testid': testId,
}) => {
  // ========================================
  // State Management
  // ========================================

  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [internalValue, setInternalValue] = useState<string | string[]>(
    defaultValue || (mode === 'multiple' ? [] : '')
  );

  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Use controlled or internal value
  const currentValue = value !== undefined ? value : internalValue;
  const selectedValues = isMultipleValue(currentValue) ? currentValue : [currentValue].filter(Boolean);

  // Use controlled or internal open state
  const menuIsOpen = controlledOpen !== undefined ? controlledOpen : isOpen;

  // ========================================
  // Flatten Options (handle groups)
  // ========================================

  const flattenedOptions = React.useMemo(() => {
    const flattened: DropdownOption[] = [];

    if (isGroupedOptions(options)) {
      options.forEach(group => {
        flattened.push(...group.options);
      });
    } else {
      flattened.push(...options);
    }

    return flattened;
  }, [options]);

  // ========================================
  // Filtered Options (search)
  // ========================================

  const filteredOptions = React.useMemo(() => {
    if (!searchTerm || !searchable) {
      return flattenedOptions;
    }

    const filter = filterFn || ((option, term) =>
      option.label.toLowerCase().includes(term.toLowerCase())
    );

    return flattenedOptions.filter(option => filter(option, searchTerm));
  }, [flattenedOptions, searchTerm, searchable, filterFn]);

  // ========================================
  // Handlers
  // ========================================

  const handleToggle = useCallback(() => {
    if (disabled) return;

    const newOpenState = !menuIsOpen;

    if (controlledOpen === undefined) {
      setIsOpen(newOpenState);
    }

    onOpenChange?.(newOpenState);

    // Focus search input when opening
    if (newOpenState && searchable) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [disabled, menuIsOpen, controlledOpen, onOpenChange, searchable]);

  const handleSelect = useCallback((optionValue: string) => {
    if (mode === 'single') {
      const newValue = optionValue;

      if (value === undefined) {
        setInternalValue(newValue);
      }

      onChange?.(newValue);

      // Close menu after single selection
      if (controlledOpen === undefined) {
        setIsOpen(false);
      }
      onOpenChange?.(false);
    } else {
      // Multiple selection
      const currentValues = selectedValues;
      const isSelected = currentValues.includes(optionValue);

      const newValue = isSelected
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue];

      if (value === undefined) {
        setInternalValue(newValue);
      }

      onChange?.(newValue);
    }

    // Reset search after selection
    setSearchTerm('');
    setFocusedIndex(-1);
  }, [mode, selectedValues, value, onChange, controlledOpen, onOpenChange]);

  const handleRemoveTag = useCallback((optionValue: string) => {
    if (disabled) return;

    const newValue = selectedValues.filter(v => v !== optionValue);

    if (value === undefined) {
      setInternalValue(newValue);
    }

    onChange?.(newValue);
  }, [selectedValues, disabled, value, onChange]);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
    setFocusedIndex(-1);
  }, []);

  // ========================================
  // Keyboard Navigation
  // ========================================

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        if (!menuIsOpen) {
          event.preventDefault();
          handleToggle();
        } else if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
          event.preventDefault();
          handleSelect(filteredOptions[focusedIndex].value);
        }
        break;

      case 'Escape':
        if (menuIsOpen) {
          event.preventDefault();
          if (controlledOpen === undefined) {
            setIsOpen(false);
          }
          onOpenChange?.(false);
          triggerRef.current?.focus();
        }
        break;

      case 'ArrowDown':
        event.preventDefault();
        if (!menuIsOpen) {
          handleToggle();
        } else {
          setFocusedIndex(prev =>
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (menuIsOpen) {
          setFocusedIndex(prev => prev > 0 ? prev - 1 : -1);
        }
        break;

      case 'Home':
        if (menuIsOpen) {
          event.preventDefault();
          setFocusedIndex(0);
        }
        break;

      case 'End':
        if (menuIsOpen) {
          event.preventDefault();
          setFocusedIndex(filteredOptions.length - 1);
        }
        break;

      case 'Tab':
        if (menuIsOpen) {
          if (controlledOpen === undefined) {
            setIsOpen(false);
          }
          onOpenChange?.(false);
        }
        break;
    }
  }, [disabled, menuIsOpen, focusedIndex, filteredOptions, handleToggle, handleSelect, controlledOpen, onOpenChange]);

  // ========================================
  // Click Outside Handler
  // ========================================

  useEffect(() => {
    if (!menuIsOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        menuRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        !menuRef.current.contains(event.target as Node)
      ) {
        if (controlledOpen === undefined) {
          setIsOpen(false);
        }
        onOpenChange?.(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuIsOpen, controlledOpen, onOpenChange]);

  // ========================================
  // Render Value Display
  // ========================================

  const renderValueDisplay = () => {
    if (renderValue) {
      return renderValue(currentValue, flattenedOptions);
    }

    if (mode === 'multiple' && showTags && selectedValues.length > 0) {
      const visibleTags = selectedValues.slice(0, maxTagsVisible);
      const remainingCount = selectedValues.length - maxTagsVisible;

      return (
        <div className="dropdown-tags">
          {visibleTags.map(val => {
            const option = flattenedOptions.find(o => o.value === val);
            return option ? (
              <div key={val} className="dropdown-tag">
                <span>{option.label}</span>
                <button
                  type="button"
                  className="dropdown-tag-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveTag(val);
                  }}
                  aria-label={`Remove ${option.label}`}
                >
                  <svg className="dropdown-tag-remove-icon" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                  </svg>
                </button>
              </div>
            ) : null;
          })}
          {remainingCount > 0 && (
            <span className="dropdown-tag">+{remainingCount} more</span>
          )}
        </div>
      );
    }

    if (selectedValues.length === 0) {
      return <span className="dropdown-value--placeholder">{placeholder}</span>;
    }

    if (mode === 'multiple') {
      const count = selectedValues.length;
      const firstOption = flattenedOptions.find(o => o.value === selectedValues[0]);
      return <span>{count === 1 && firstOption ? firstOption.label : `${count} items`}</span>;
    }

    const selectedOption = flattenedOptions.find(o => o.value === currentValue);
    return <span>{selectedOption?.label || placeholder}</span>;
  };

  // ========================================
  // Determine validation class
  // ========================================

  const effectiveValidation = errorMessage ? 'error' : validation;

  // ========================================
  // Render
  // ========================================

  return (
    <div
      className={`dropdown-container ${className}`}
      style={style}
      data-testid={testId}
    >
      {label && (
        <label
          className={`dropdown-label ${required ? 'dropdown-label--required' : ''}`}
          htmlFor={id}
        >
          {label}
        </label>
      )}

      <div
        ref={triggerRef}
        id={id}
        role="combobox"
        aria-expanded={menuIsOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel || label}
        aria-describedby={ariaDescribedBy}
        aria-required={required}
        aria-invalid={effectiveValidation === 'error'}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : tabIndex}
        className={`
          dropdown-trigger
          dropdown-trigger--${size}
          ${menuIsOpen ? 'dropdown-trigger--open' : ''}
          ${disabled ? 'dropdown-trigger--disabled' : ''}
          ${effectiveValidation !== 'none' ? `dropdown-trigger--${effectiveValidation}` : ''}
        `.trim()}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        <div className="dropdown-value">
          {renderValueDisplay()}
        </div>

        {showChevron && (
          <div className={`dropdown-chevron ${menuIsOpen ? 'dropdown-chevron--open' : ''}`}>
            <svg className="dropdown-chevron-icon" viewBox="0 0 12 12" fill="currentColor">
              <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
        )}

        <input
          type="hidden"
          name={name}
          value={mode === 'multiple' ? selectedValues.join(',') : (currentValue as string)}
        />
      </div>

      {menuIsOpen && (
        <div
          ref={menuRef}
          className="dropdown-menu"
          role="listbox"
          aria-multiselectable={mode === 'multiple'}
          style={{ maxHeight: maxMenuHeight }}
        >
          {searchable && (
            <input
              ref={searchInputRef}
              type="text"
              className="dropdown-search"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          )}

          <div className="dropdown-menu-list">
            {isGroupedOptions(options) ? (
              options.map((group, groupIdx) => {
                const groupOptions = group.options.filter(option =>
                  !searchTerm || filteredOptions.some(fo => fo.value === option.value)
                );

                if (groupOptions.length === 0) return null;

                return (
                  <div key={groupIdx}>
                    <div className="dropdown-group-label">{group.label}</div>
                    {groupOptions.map((option, idx) => (
                      <DropdownItem
                        key={option.value}
                        option={option}
                        selected={selectedValues.includes(option.value)}
                        focused={filteredOptions.indexOf(option) === focusedIndex}
                        mode={mode}
                        onSelect={() => handleSelect(option.value)}
                        renderOption={renderOption}
                      />
                    ))}
                  </div>
                );
              })
            ) : (
              filteredOptions.map((option, idx) => (
                <DropdownItem
                  key={option.value}
                  option={option}
                  selected={selectedValues.includes(option.value)}
                  focused={idx === focusedIndex}
                  mode={mode}
                  onSelect={() => handleSelect(option.value)}
                  renderOption={renderOption}
                />
              ))
            )}

            {filteredOptions.length === 0 && (
              <div className="dropdown-empty">
                No options found
              </div>
            )}

            {showAddButton && onAddClick && (
              <div
                className="dropdown-add-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddClick();
                }}
                role="button"
                tabIndex={0}
              >
                <svg className="dropdown-add-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor">
                  <path d="M8 3.5V12.5M3.5 8H12.5" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span>{addButtonText}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {helperText && !errorMessage && (
        <div className="dropdown-helper-text">{helperText}</div>
      )}

      {errorMessage && (
        <div className="dropdown-error-message" role="alert">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Dropdown Item Component
// ============================================================================

interface DropdownItemProps {
  option: DropdownOption;
  selected: boolean;
  focused: boolean;
  mode: 'single' | 'multiple';
  onSelect: () => void;
  renderOption?: (option: DropdownOption, selected: boolean) => React.ReactNode;
}

const DropdownItem: React.FC<DropdownItemProps> = ({
  option,
  selected,
  focused,
  mode,
  onSelect,
  renderOption,
}) => {
  if (renderOption) {
    return (
      <div
        className={`
          dropdown-menu-item
          ${selected ? 'dropdown-menu-item--selected' : ''}
          ${focused ? 'dropdown-menu-item--focused' : ''}
          ${option.disabled ? 'dropdown-menu-item--disabled' : ''}
        `.trim()}
        onClick={option.disabled ? undefined : onSelect}
        role="option"
        aria-selected={selected}
        aria-disabled={option.disabled}
      >
        {renderOption(option, selected)}
      </div>
    );
  }

  return (
    <div
      className={`
        dropdown-menu-item
        ${selected ? 'dropdown-menu-item--selected' : ''}
        ${focused ? 'dropdown-menu-item--focused' : ''}
        ${option.disabled ? 'dropdown-menu-item--disabled' : ''}
      `.trim()}
      onClick={option.disabled ? undefined : onSelect}
      role="option"
      aria-selected={selected}
      aria-disabled={option.disabled}
    >
      {mode === 'multiple' && (
        <svg
          className={`dropdown-check-icon ${!selected ? 'dropdown-check-icon--hidden' : ''}`}
          viewBox="0 0 18 18"
          fill="currentColor"
        >
          <path d="M15 5L7 13L3 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      )}
      {option.icon && <span>{option.icon}</span>}
      <span>{option.label}</span>
    </div>
  );
};

export default Dropdown;
