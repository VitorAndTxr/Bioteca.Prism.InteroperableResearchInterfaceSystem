/**
 * ButtonGroup Component
 *
 * A radio-style button group component following the IRIS design system.
 * Based on Figma design nodes 6804:13695 and 6804:18716
 *
 * Features:
 * - Radio-style single selection
 * - Connected button appearance with proper borders
 * - 3 sizes: small, medium, large
 * - Icon support
 * - Keyboard navigation (arrow keys)
 * - Full accessibility support
 *
 * @example
 * ```tsx
 * // Basic usage
 * <ButtonGroup
 *   options={[
 *     { value: 'users', label: 'Usuários' },
 *     { value: 'researchers', label: 'Pesquisadores' }
 *   ]}
 *   value={selectedValue}
 *   onChange={setSelectedValue}
 * />
 *
 * // With icons
 * <ButtonGroup
 *   options={[
 *     { value: 'edit', label: 'Edit', icon: <EditIcon /> },
 *     { value: 'delete', label: 'Delete', icon: <DeleteIcon /> }
 *   ]}
 *   value={action}
 *   onChange={setAction}
 * />
 * ```
 */

import React, { forwardRef, useCallback, useRef, useEffect } from 'react';
import type { ButtonGroupProps } from './ButtonGroup.types';
import './ButtonGroup.css';

const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(
    (
        {
            options,
            value,
            onChange,
            size = 'medium',
            disabled = false,
            fullWidth = false,
            className = '',
            ariaLabel,
        },
        ref
    ) => {
        const containerRef = useRef<HTMLDivElement>(null);

        // Compute container classes
        const containerClasses = [
            'iris-button-group',
            `iris-button-group--${size}`,
            fullWidth && 'iris-button-group--full-width',
            disabled && 'iris-button-group--disabled',
            className,
        ]
            .filter(Boolean)
            .join(' ');

        // Handle button click
        const handleClick = useCallback(
            (optionValue: string, optionDisabled?: boolean) => {
                if (disabled || optionDisabled) return;
                onChange?.(optionValue);
            },
            [disabled, onChange]
        );

        // Keyboard navigation (arrow keys)
        const handleKeyDown = useCallback(
            (event: React.KeyboardEvent<HTMLDivElement>) => {
                if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
                    return;
                }

                event.preventDefault();

                const currentIndex = options.findIndex((opt) => opt.value === value);
                let nextIndex = currentIndex;

                switch (event.key) {
                    case 'ArrowLeft':
                        nextIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
                        break;
                    case 'ArrowRight':
                        nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
                        break;
                    case 'Home':
                        nextIndex = 0;
                        break;
                    case 'End':
                        nextIndex = options.length - 1;
                        break;
                }

                // Skip disabled options
                while (options[nextIndex]?.disabled && nextIndex !== currentIndex) {
                    if (event.key === 'ArrowRight' || event.key === 'End') {
                        nextIndex = nextIndex < options.length - 1 ? nextIndex + 1 : 0;
                    } else {
                        nextIndex = nextIndex > 0 ? nextIndex - 1 : options.length - 1;
                    }
                }

                if (!options[nextIndex]?.disabled) {
                    onChange?.(options[nextIndex].value);
                }
            },
            [options, value, onChange]
        );

        // Merge refs
        useEffect(() => {
            if (ref) {
                if (typeof ref === 'function') {
                    ref(containerRef.current);
                } else {
                    ref.current = containerRef.current;
                }
            }
        }, [ref]);

        return (
            <div
                ref={containerRef}
                className={containerClasses}
                role="radiogroup"
                aria-label={ariaLabel}
                onKeyDown={handleKeyDown}
            >
                {options.map((option, index) => {
                    const isSelected = option.value === value;
                    const isFirst = index === 0;
                    const isLast = index === options.length - 1;
                    const isDisabled = disabled || option.disabled;

                    const buttonClasses = [
                        'iris-button-group__button',
                        isSelected && 'iris-button-group__button--selected',
                        isFirst && 'iris-button-group__button--first',
                        isLast && 'iris-button-group__button--last',
                        isDisabled && 'iris-button-group__button--disabled',
                    ]
                        .filter(Boolean)
                        .join(' ');

                    return (
                        <button
                            key={option.value}
                            type="button"
                            className={buttonClasses}
                            role="radio"
                            aria-checked={isSelected}
                            aria-disabled={isDisabled}
                            disabled={isDisabled}
                            tabIndex={isSelected ? 0 : -1}
                            onClick={() => handleClick(option.value, option.disabled)}
                        >
                            {option.icon && (
                                <span className="iris-button-group__icon" aria-hidden="true">
                                    {option.icon}
                                </span>
                            )}
                            <span className="iris-button-group__label">{option.label}</span>
                        </button>
                    );
                })}
            </div>
        );
    }
);

ButtonGroup.displayName = 'ButtonGroup';

export default ButtonGroup;
