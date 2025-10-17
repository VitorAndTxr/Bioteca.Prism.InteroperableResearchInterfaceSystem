/**
 * Button Component Types
 * Based on Figma design system (node 2803-1366)
 */

import { ReactNode, ButtonHTMLAttributes } from 'react';

/**
 * Button visual variants
 * - primary: Teal background (#49A2A8)
 * - secondary: Purple background (#7B6FDB)
 * - outline: Transparent with border
 */
export type ButtonVariant = 'primary' | 'secondary' | 'outline';

/**
 * Button sizes
 * - small: Compact button for tight spaces
 * - medium: Default size for most use cases
 * - big: Large button for emphasis
 */
export type ButtonSize = 'small' | 'medium' | 'big';

/**
 * Icon position relative to button text
 * - left: Icon before text
 * - right: Icon after text
 * - only: Icon without text (requires tooltip)
 */
export type ButtonIconPosition = 'left' | 'right' | 'only';

/**
 * Button component props
 */
export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
    /**
     * Button visual variant
     * @default 'primary'
     */
    variant?: ButtonVariant;

    /**
     * Button size
     * @default 'medium'
     */
    size?: ButtonSize;

    /**
     * Icon element to display (SVG or icon component)
     */
    icon?: ReactNode;

    /**
     * Icon position (automatically set to 'only' if no children provided)
     * @default 'left'
     */
    iconPosition?: ButtonIconPosition;

    /**
     * Button text/content (omit for icon-only button)
     */
    children?: ReactNode;

    /**
     * Disabled state
     * @default false
     */
    disabled?: boolean;

    /**
     * Loading state (shows spinner, disables interaction)
     * @default false
     */
    loading?: boolean;

    /**
     * Full width button
     * @default false
     */
    fullWidth?: boolean;

    /**
     * Button HTML type
     * @default 'button'
     */
    type?: 'button' | 'submit' | 'reset';

    /**
     * Tooltip text (required for icon-only buttons)
     */
    tooltip?: string;

    /**
     * Custom CSS class
     */
    className?: string;

    /**
     * Click handler
     */
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
