/**
 * Input Component Types
 * Based on Figma design system (node 2803-2414)
 */

import { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

/**
 * Input sizes
 * - small: Compact input for tight spaces (36px height)
 * - medium: Default size for most use cases (44px height)
 * - big: Large input for emphasis (52px height)
 */
export type InputSize = 'small' | 'medium' | 'big';

/**
 * Input validation status
 * - none: No validation state
 * - error: Invalid input
 * - success: Valid input
 * - warning: Warning state
 */
export type InputValidationStatus = 'none' | 'error' | 'success' | 'warning';

/**
 * Input icon position
 * - left: Icon before input text
 * - right: Icon after input text
 * - both: Icons on both sides
 */
export type InputIconPosition = 'left' | 'right' | 'both';

/**
 * Base props shared between Input and Textarea
 */
interface BaseInputProps {
    /**
     * Input size
     * @default 'medium'
     */
    size?: InputSize;

    /**
     * Label text (displayed above input)
     */
    label?: string;

    /**
     * Helper text (displayed below input)
     */
    helperText?: string;

    /**
     * Error message (displayed below input when validation status is 'error')
     */
    errorMessage?: string;

    /**
     * Validation status
     * @default 'none'
     */
    validationStatus?: InputValidationStatus;

    /**
     * Disabled state
     * @default false
     */
    disabled?: boolean;

    /**
     * Required field indicator
     * @default false
     */
    required?: boolean;

    /**
     * Full width input
     * @default false
     */
    fullWidth?: boolean;

    /**
     * Custom CSS class
     */
    className?: string;
}

/**
 * Props specific to text input (not textarea)
 */
export interface InputProps extends BaseInputProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    /**
     * Icon element to display (SVG or icon component)
     */
    icon?: ReactNode;

    /**
     * Right icon element (used when iconPosition is 'both')
     */
    rightIcon?: ReactNode;

    /**
     * Icon position
     * @default 'left'
     */
    iconPosition?: InputIconPosition;

    /**
     * Prefix text (displayed before input value, e.g., "$", "https://")
     */
    prefix?: string;

    /**
     * Suffix text (displayed after input value, e.g., "kg", "%")
     */
    suffix?: string;

    /**
     * Maximum character count (shows character counter)
     */
    maxLength?: number;

    /**
     * Show character counter
     * @default false (true if maxLength is set)
     */
    showCharacterCount?: boolean;

    /**
     * Input is a textarea (multiline)
     * @default false
     */
    multiline?: false;
}

/**
 * Props for textarea variant
 */
export interface TextareaProps extends BaseInputProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
    /**
     * Input is a textarea (multiline)
     */
    multiline: true;

    /**
     * Number of visible text rows
     * @default 4
     */
    rows?: number;

    /**
     * Maximum character count (shows character counter)
     */
    maxLength?: number;

    /**
     * Show character counter
     * @default false (true if maxLength is set)
     */
    showCharacterCount?: boolean;

    /**
     * Resize behavior
     * @default 'vertical'
     */
    resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

/**
 * Combined Input/Textarea props
 */
export type InputComponentProps = InputProps | TextareaProps;

/**
 * Type guard to check if props are for textarea
 */
export function isTextareaProps(props: InputComponentProps): props is TextareaProps {
    return props.multiline === true;
}
