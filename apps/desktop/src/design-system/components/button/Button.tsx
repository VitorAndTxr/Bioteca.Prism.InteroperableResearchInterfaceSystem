/**
 * Button Component
 *
 * A comprehensive button component following the IRIS design system.
 * Based on Figma design node 2803-1366
 *
 * Features:
 * - 3 variants: primary, secondary, outline
 * - 3 sizes: small, medium, big
 * - Icon support: left, right, icon-only
 * - States: default, hover, active, disabled, loading
 * - Full accessibility support
 *
 * @example
 * ```tsx
 * // Basic button
 * <Button variant="primary">Click me</Button>
 *
 * // Button with icon
 * <Button variant="secondary" icon={<PlusIcon />} iconPosition="left">
 *   Add Item
 * </Button>
 *
 * // Icon-only button (requires tooltip)
 * <Button variant="outline" icon={<SaveIcon />} tooltip="Save changes" />
 *
 * // Loading state
 * <Button variant="primary" loading>Saving...</Button>
 * ```
 */

import React, { forwardRef, useMemo } from 'react';
import type { ButtonProps } from './Button.types';
import './Button.css';

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'medium',
            icon,
            iconPosition = 'left',
            children,
            disabled = false,
            loading = false,
            fullWidth = false,
            type = 'button',
            tooltip,
            className = '',
            onClick,
            ...htmlProps
        },
        ref
    ) => {
        // Determine if this is an icon-only button
        const isIconOnly = !children && icon !== undefined;

        // Validate tooltip requirement for icon-only buttons
        if (isIconOnly && !tooltip && process.env.NODE_ENV === 'development') {
            console.warn(
                'Button: Icon-only buttons should have a tooltip for accessibility. ' +
                'Please provide a tooltip prop.'
            );
        }

        // Compute effective icon position
        const effectiveIconPosition = isIconOnly ? 'only' : iconPosition;

        // Construct CSS classes
        const buttonClasses = useMemo(() => {
            const classes = [
                'iris-button',
                `iris-button--${variant}`,
                `iris-button--${size}`,
            ];

            if (isIconOnly) {
                classes.push('iris-button--icon-only');
            } else if (icon) {
                classes.push(`iris-button--icon-${iconPosition}`);
            }

            if (fullWidth) {
                classes.push('iris-button--full-width');
            }

            if (loading) {
                classes.push('iris-button--loading');
            }

            if (disabled) {
                classes.push('iris-button--disabled');
            }

            if (className) {
                classes.push(className);
            }

            return classes.join(' ');
        }, [variant, size, isIconOnly, icon, iconPosition, fullWidth, loading, disabled, className]);

        // Loading spinner component
        const LoadingSpinner = () => (
            <span className="iris-button__spinner" aria-hidden="true">
                <svg
                    className="iris-button__spinner-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="iris-button__spinner-track"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="iris-button__spinner-path"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            </span>
        );

        // Render icon with proper positioning
        const renderIcon = () => {
            if (!icon) return null;

            return (
                <span className="iris-button__icon" aria-hidden="true">
                    {icon}
                </span>
            );
        };

        // Render button content
        const renderContent = () => {
            if (loading) {
                return (
                    <>
                        <LoadingSpinner />
                        {!isIconOnly && <span className="iris-button__text">{children}</span>}
                    </>
                );
            }

            if (isIconOnly) {
                return renderIcon();
            }

            if (icon) {
                return (
                    <>
                        {effectiveIconPosition === 'left' && renderIcon()}
                        <span className="iris-button__text">{children}</span>
                        {effectiveIconPosition === 'right' && renderIcon()}
                    </>
                );
            }

            return <span className="iris-button__text">{children}</span>;
        };

        // Accessibility attributes
        const ariaProps = {
            'aria-disabled': disabled || loading,
            'aria-busy': loading,
            'aria-label': tooltip || (isIconOnly ? 'Icon button' : undefined),
            title: tooltip,
        };

        return (
            <button
                ref={ref}
                type={type}
                className={buttonClasses}
                disabled={disabled || loading}
                onClick={onClick}
                {...ariaProps}
                {...htmlProps}
            >
                {renderContent()}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
