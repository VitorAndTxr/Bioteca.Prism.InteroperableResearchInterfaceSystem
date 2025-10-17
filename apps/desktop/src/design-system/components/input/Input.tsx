/**
 * Input Component
 *
 * A comprehensive input component following the IRIS design system.
 * Based on Figma design node 2803-2414
 *
 * Features:
 * - 3 sizes: small, medium, big
 * - Icon support: left, right, both sides
 * - Prefix/suffix text support
 * - Character counter
 * - Validation states: error, success, warning
 * - Label and helper text
 * - Textarea variant (multiline)
 * - Full accessibility support
 *
 * @example
 * ```tsx
 * // Basic input
 * <Input placeholder="Enter your name" />
 *
 * // Input with label and validation
 * <Input
 *   label="Email"
 *   type="email"
 *   validationStatus="error"
 *   errorMessage="Invalid email address"
 * />
 *
 * // Input with icon
 * <Input
 *   icon={<SearchIcon />}
 *   iconPosition="left"
 *   placeholder="Search..."
 * />
 *
 * // Input with prefix/suffix
 * <Input prefix="$" placeholder="0.00" />
 * <Input suffix="kg" placeholder="Weight" />
 *
 * // Input with character limit
 * <Input maxLength={100} showCharacterCount />
 *
 * // Textarea
 * <Input
 *   multiline
 *   rows={6}
 *   maxLength={500}
 *   showCharacterCount
 * />
 * ```
 */

import React, { forwardRef, useMemo, useState } from 'react';
import type { InputProps, TextareaProps, InputComponentProps } from './Input.types';
import { isTextareaProps } from './Input.types';
import './Input.css';

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputComponentProps>(
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
            className = '',
            maxLength,
            showCharacterCount,
            ...restProps
        } = props;

        // Track character count for controlled/uncontrolled inputs
        const [internalValue, setInternalValue] = useState('');
        const value = (props as any).value ?? internalValue;
        const currentLength = String(value).length;

        // Determine if character counter should be shown
        const shouldShowCharacterCount = showCharacterCount || (maxLength !== undefined && maxLength > 0);

        // Generate unique ID for accessibility
        const inputId = useMemo(() => {
            return (props as any).id || `iris-input-${Math.random().toString(36).substr(2, 9)}`;
        }, [(props as any).id]);

        const helperTextId = `${inputId}-helper`;
        const errorId = `${inputId}-error`;

        // Construct container classes
        const containerClasses = useMemo(() => {
            const classes = ['iris-input-container'];

            if (fullWidth) {
                classes.push('iris-input-container--full-width');
            }

            if (className) {
                classes.push(className);
            }

            return classes.join(' ');
        }, [fullWidth, className]);

        // Construct wrapper classes
        const wrapperClasses = useMemo(() => {
            const classes = [
                'iris-input-wrapper',
                `iris-input-wrapper--${size}`,
                `iris-input-wrapper--${validationStatus}`,
            ];

            if (disabled) {
                classes.push('iris-input-wrapper--disabled');
            }

            if (!isTextareaProps(props)) {
                const { icon, rightIcon, iconPosition = 'left', prefix, suffix } = props as InputProps;

                if (icon && rightIcon) {
                    classes.push('iris-input-wrapper--icon-both');
                } else if (icon) {
                    classes.push(`iris-input-wrapper--icon-${iconPosition}`);
                } else if (rightIcon) {
                    classes.push('iris-input-wrapper--icon-right');
                }

                if (prefix) {
                    classes.push('iris-input-wrapper--prefix');
                }

                if (suffix) {
                    classes.push('iris-input-wrapper--suffix');
                }
            }

            return classes.join(' ');
        }, [props, size, validationStatus, disabled]);

        // Construct input classes
        const inputClasses = useMemo(() => {
            const classes = [
                'iris-input',
                `iris-input--${size}`,
            ];

            if (isTextareaProps(props)) {
                classes.push('iris-input--textarea');
            }

            return classes.join(' ');
        }, [props, size]);

        // Handle value changes for character counter
        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setInternalValue(e.target.value);

            if ((props as any).onChange) {
                (props as any).onChange(e);
            }
        };

        // Render icon
        const renderIcon = (icon: React.ReactNode, position: 'left' | 'right') => {
            if (!icon) return null;

            return (
                <span className={`iris-input__icon iris-input__icon--${position}`} aria-hidden="true">
                    {icon}
                </span>
            );
        };

        // Render prefix
        const renderPrefix = (prefix: string) => {
            if (!prefix) return null;

            return (
                <span className="iris-input__prefix" aria-hidden="true">
                    {prefix}
                </span>
            );
        };

        // Render suffix
        const renderSuffix = (suffix: string) => {
            if (!suffix) return null;

            return (
                <span className="iris-input__suffix" aria-hidden="true">
                    {suffix}
                </span>
            );
        };

        // Render character counter
        const renderCharacterCounter = () => {
            if (!shouldShowCharacterCount) return null;

            return (
                <span className="iris-input__character-count" aria-live="polite">
                    {maxLength ? `${currentLength}/${maxLength}` : currentLength}
                </span>
            );
        };

        // Render label
        const renderLabel = () => {
            if (!label) return null;

            return (
                <label htmlFor={inputId} className="iris-input__label">
                    {label}
                    {required && <span className="iris-input__required" aria-label="required">*</span>}
                </label>
            );
        };

        // Render helper text or error message
        const renderHelperText = () => {
            const showError = validationStatus === 'error' && errorMessage;
            const showHelper = helperText && !showError;

            if (!showError && !showHelper) return null;

            return (
                <div className="iris-input__footer">
                    {showError && (
                        <span id={errorId} className="iris-input__error" role="alert">
                            {errorMessage}
                        </span>
                    )}
                    {showHelper && (
                        <span id={helperTextId} className="iris-input__helper-text">
                            {helperText}
                        </span>
                    )}
                    {renderCharacterCounter()}
                </div>
            );
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

        // Render textarea
        if (isTextareaProps(props)) {
            const { multiline, rows = 4, resize = 'vertical', ...textareaProps } = props;

            return (
                <div className={containerClasses}>
                    {renderLabel()}
                    <div className={wrapperClasses}>
                        <textarea
                            ref={ref as React.Ref<HTMLTextAreaElement>}
                            id={inputId}
                            className={inputClasses}
                            disabled={disabled}
                            rows={rows}
                            maxLength={maxLength}
                            style={{ resize }}
                            {...ariaProps}
                            {...textareaProps}
                            onChange={handleChange}
                        />
                    </div>
                    {renderHelperText()}
                </div>
            );
        }

        // Render input
        const {
            icon,
            rightIcon,
            iconPosition = 'left',
            prefix,
            suffix,
            multiline,
            ...inputProps
        } = props as InputProps;

        return (
            <div className={containerClasses}>
                {renderLabel()}
                <div className={wrapperClasses}>
                    {icon && iconPosition === 'left' && renderIcon(icon, 'left')}
                    {icon && rightIcon && renderIcon(icon, 'left')}
                    {prefix && renderPrefix(prefix)}
                    <input
                        ref={ref as React.Ref<HTMLInputElement>}
                        id={inputId}
                        className={inputClasses}
                        disabled={disabled}
                        maxLength={maxLength}
                        {...ariaProps}
                        {...inputProps}
                        onChange={handleChange}
                    />
                    {suffix && renderSuffix(suffix)}
                    {rightIcon && renderIcon(rightIcon, 'right')}
                    {icon && iconPosition === 'right' && renderIcon(icon, 'right')}
                </div>
                {renderHelperText()}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
