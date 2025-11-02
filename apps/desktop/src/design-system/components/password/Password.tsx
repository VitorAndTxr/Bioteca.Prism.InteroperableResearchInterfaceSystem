/**
 * Password Component
 *
 * A specialized input component for password entry with strength indicator and show/hide toggle.
 * Based on Figma design node 2803-2225
 *
 * Features:
 * - Show/hide password toggle
 * - Password strength indicator (4-level bar: Weak, Medium, Good, Great)
 * - Strength label with color coding
 * - Optional strength tips in popover
 * - All sizes: small, medium, big
 * - Validation states: error, success, warning
 * - Full accessibility support
 *
 * @example
 * ```tsx
 * // Basic password input
 * <Password placeholder="Enter password" />
 *
 * // Password with label and validation
 * <Password
 *   label="Password"
 *   validationStatus="error"
 *   errorMessage="Password is required"
 * />
 *
 * // Password with strength indicator and tips
 * <Password
 *   label="New Password"
 *   showStrengthIndicator
 *   showStrengthLabel
 *   showStrengthTips
 * />
 *
 * // Password with custom strength calculation
 * <Password
 *   calculateStrength={(password) => ({
 *     level: 'good',
 *     label: 'Good',
 *     tip: 'Custom tip',
 *     bars: 3
 *   })}
 *   onStrengthChange={(strength) => console.log(strength)}
 * />
 * ```
 */

import React, { forwardRef, useMemo, useState, useEffect, useRef } from 'react';
import type { PasswordProps, PasswordStrengthConfig } from './Password.types';
import { calculatePasswordStrength } from './Password.types';
import './Password.css';

const Password = forwardRef<HTMLInputElement, PasswordProps>(
    (props, ref) => {
        const {
            size = 'medium',
            label,
            helperText,
            errorMessage,
            validationStatus = 'none',
            disabled = false,
            required = false,
            fullWidth = false,
            showStrengthIndicator = true,
            showStrengthLabel = true,
            showStrengthTips = false,
            calculateStrength = calculatePasswordStrength,
            onStrengthChange,
            className = '',
            initiallyVisible = false,
            ...restProps
        } = props;

        // State
        const [isVisible, setIsVisible] = useState(initiallyVisible);
        const [internalValue, setInternalValue] = useState('');
        const [showTipsPopover, setShowTipsPopover] = useState(false);
        const popoverRef = useRef<HTMLDivElement>(null);

        // Get current value (controlled or uncontrolled)
        const value = props.value ?? internalValue;
        const passwordValue = String(value);

        // Calculate password strength
        const strength: PasswordStrengthConfig = useMemo(() => {
            return calculateStrength(passwordValue);
        }, [passwordValue, calculateStrength]);

        // Notify strength changes
        useEffect(() => {
            if (onStrengthChange && passwordValue.length > 0) {
                onStrengthChange(strength);
            }
        }, [strength, onStrengthChange, passwordValue]);

        // Generate unique ID for accessibility
        const inputId = useMemo(() => {
            return props.id || `iris-password-${Math.random().toString(36).substr(2, 9)}`;
        }, [props.id]);

        const helperTextId = `${inputId}-helper`;
        const errorId = `${inputId}-error`;

        // Handle click outside to close popover
        useEffect(() => {
            if (!showTipsPopover) return;

            const handleClickOutside = (event: MouseEvent) => {
                if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                    setShowTipsPopover(false);
                }
            };

            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, [showTipsPopover]);

        // Construct container classes
        const containerClasses = useMemo(() => {
            const classes = ['iris-password-container'];

            if (fullWidth) {
                classes.push('iris-password-container--full-width');
                classes.push('add-form__full-width'); // Grid support
            }

            if (className) {
                classes.push(className);
            }

            return classes.join(' ');
        }, [fullWidth, className]);

        // Construct wrapper classes
        const wrapperClasses = useMemo(() => {
            const classes = [
                'iris-password-wrapper',
                `iris-password-wrapper--${size}`,
                `iris-password-wrapper--${validationStatus}`,
            ];

            if (disabled) {
                classes.push('iris-password-wrapper--disabled');
            }

            if (fullWidth) {
                classes.push('iris-password-wrapper--full-width');
            }

            return classes.join(' ');
        }, [size, validationStatus, disabled, fullWidth]);

        // Handle value changes
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setInternalValue(e.target.value);

            if (props.onChange) {
                props.onChange(e);
            }
        };

        // Toggle password visibility
        const toggleVisibility = () => {
            setIsVisible(!isVisible);
        };

        // Toggle tips popover
        const toggleTipsPopover = () => {
            setShowTipsPopover(!showTipsPopover);
        };

        // Accessibility attributes
        const ariaProps = {
            'aria-invalid': validationStatus === 'error',
            'aria-required': required,
            'aria-describedby': (() => {
                const ids = [];
                if (validationStatus === 'error' && errorMessage) ids.push(errorId);
                else if (helperText) ids.push(helperTextId);
                return ids.length > 0 ? ids.join(' ') : undefined;
            })(),
        };

        // Render label
        const renderLabel = () => {
            if (!label) return null;

            return (
                <label htmlFor={inputId} className="iris-password__label">
                    {label}
                    {required && <span className="iris-password__required" aria-label="required">*</span>}
                </label>
            );
        };

        // Render eye icon SVG
        const renderEyeIcon = () => {
            if (isVisible) {
                // Eye icon (password visible)
                return (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.5 10C2.5 10 5 4.16667 10 4.16667C15 4.16667 17.5 10 17.5 10C17.5 10 15 15.8333 10 15.8333C5 15.8333 2.5 10 2.5 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                );
            } else {
                // Eye-off icon (password hidden)
                return (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.16667 5.83333C9.43889 5.77778 9.71667 5.75 10 5.75C14.1667 5.75 16.6667 10 16.6667 10C16.3472 10.5861 15.9472 11.1389 15.4722 11.6528M12.1111 12.1111C11.7716 12.4619 11.3664 12.7387 10.9207 12.9241C10.4749 13.1095 9.99782 13.1995 9.51852 13.1885C9.03922 13.1775 8.56651 13.0658 8.12903 12.8603C7.69155 12.6548 7.29868 12.3596 6.97315 11.9914C6.64762 11.6233 6.39627 11.1898 6.23503 10.7166C6.07379 10.2435 6.00621 9.74067 6.03656 9.23881C6.06691 8.73694 6.19459 8.2478 6.41218 7.79998C6.62978 7.35216 6.93273 6.95479 7.30556 6.63333M14.8333 14.8333L3.33333 3.33333M8.33333 8.33333L11.6667 11.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                );
            }
        };

        // Render information icon SVG
        const renderInfoIcon = () => {
            return (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 12.8333C10.2217 12.8333 12.8333 10.2217 12.8333 7C12.8333 3.77834 10.2217 1.16667 7 1.16667C3.77834 1.16667 1.16667 3.77834 1.16667 7C1.16667 10.2217 3.77834 12.8333 7 12.8333Z" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 9.33333V7" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 4.66667H7.00583" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            );
        };

        // Render strength indicator bar
        const renderStrengthBar = () => {
            if (!showStrengthIndicator || passwordValue.length === 0) return null;

            const segments = [1, 2, 3, 4];

            return (
                <div className="iris-password__strength-bar">
                    {segments.map((segment) => {
                        const isFilled = segment <= strength.bars;
                        const segmentClass = isFilled
                            ? `iris-password__strength-bar-segment iris-password__strength-bar-segment--${strength.level}`
                            : 'iris-password__strength-bar-segment';

                        return <div key={segment} className={segmentClass} />;
                    })}
                </div>
            );
        };

        // Render strength label
        const renderStrengthLabel = () => {
            if (!showStrengthLabel || passwordValue.length === 0 || strength.level === 'none') return null;

            return (
                <div className="iris-password__strength-label-wrapper">
                    <span className={`iris-password__strength-label iris-password__strength-label--${strength.level}`}>
                        {strength.label}
                    </span>
                    {showStrengthTips && strength.tip && (
                        <button
                            type="button"
                            className="iris-password__strength-info-icon"
                            onClick={toggleTipsPopover}
                            aria-label="Show password strength tips"
                        >
                            {renderInfoIcon()}
                        </button>
                    )}
                </div>
            );
        };

        // Render strength tips popover
        const renderTipsPopover = () => {
            if (!showTipsPopover || !strength.tip) return null;

            return (
                <div ref={popoverRef} className="iris-password__tips-popover">
                    <div className="iris-password__tips-arrow" />
                    <div className="iris-password__tips-content">{strength.tip}</div>
                </div>
            );
        };

        // Render strength indicator
        const renderStrengthIndicator = () => {
            if (!showStrengthIndicator && !showStrengthLabel) return null;

            return (
                <div className="iris-password__strength" style={{ position: 'relative' }}>
                    {renderStrengthBar()}
                    {renderStrengthLabel()}
                    {renderTipsPopover()}
                </div>
            );
        };

        // Render helper text or error message
        const renderHelperText = () => {
            const showError = validationStatus === 'error' && errorMessage;
            const showHelper = helperText && !showError;

            if (!showError && !showHelper) return null;

            return (
                <div className="iris-password__footer">
                    {showError && (
                        <span id={errorId} className="iris-password__error" role="alert">
                            {errorMessage}
                        </span>
                    )}
                    {showHelper && (
                        <span id={helperTextId} className="iris-password__helper-text">
                            {helperText}
                        </span>
                    )}
                </div>
            );
        };

        return (
            <div className={containerClasses}>
                {renderLabel()}
                <div className={wrapperClasses}>
                    <input
                        ref={ref}
                        id={inputId}
                        className="iris-password__input"
                        type={isVisible ? 'text' : 'password'}
                        disabled={disabled}
                        {...ariaProps}
                        {...restProps}
                        onChange={handleChange}
                    />
                    <button
                        type="button"
                        className="iris-password__toggle"
                        onClick={toggleVisibility}
                        disabled={disabled}
                        aria-label={isVisible ? 'Hide password' : 'Show password'}
                        tabIndex={-1}
                    >
                        {renderEyeIcon()}
                    </button>
                </div>
                {renderStrengthIndicator()}
                {renderHelperText()}
            </div>
        );
    }
);

Password.displayName = 'Password';

export default Password;
