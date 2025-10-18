/**
 * ButtonGroup Component Types
 * Based on Figma design system (nodes 6804:13695 and 6804:18716)
 */

import { ReactNode } from 'react';

/**
 * ButtonGroup option configuration
 */
export interface ButtonGroupOption {
    /**
     * Unique identifier for the option
     */
    value: string;

    /**
     * Display label for the button
     */
    label: string;

    /**
     * Optional icon element to display before label
     */
    icon?: ReactNode;

    /**
     * Disable this specific option
     * @default false
     */
    disabled?: boolean;
}

/**
 * ButtonGroup size variants
 */
export type ButtonGroupSize = 'small' | 'medium' | 'large';

/**
 * ButtonGroup component props
 */
export interface ButtonGroupProps {
    /**
     * Array of options to display as buttons
     */
    options: ButtonGroupOption[];

    /**
     * Currently selected value
     */
    value?: string;

    /**
     * Callback when selection changes
     */
    onChange?: (value: string) => void;

    /**
     * Button group size
     * @default 'medium'
     */
    size?: ButtonGroupSize;

    /**
     * Disable entire button group
     * @default false
     */
    disabled?: boolean;

    /**
     * Full width button group (buttons stretch to fill container)
     * @default false
     */
    fullWidth?: boolean;

    /**
     * Custom CSS class for the container
     */
    className?: string;

    /**
     * ARIA label for accessibility
     */
    ariaLabel?: string;
}
