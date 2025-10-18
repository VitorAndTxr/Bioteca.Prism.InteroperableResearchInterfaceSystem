/**
 * Password Component Types
 * Based on Figma design system (node 2803-2225)
 */

import { InputHTMLAttributes } from 'react';
import type { InputSize, InputValidationStatus } from '../input/Input.types';

/**
 * Password strength levels
 * - none: No strength calculation (empty password)
 * - weak: 1/4 bars (red)
 * - medium: 2/4 bars (amber)
 * - good: 3/4 bars (teal)
 * - great: 4/4 bars (teal)
 */
export type PasswordStrength = 'none' | 'weak' | 'medium' | 'good' | 'great';

/**
 * Password strength configuration
 */
export interface PasswordStrengthConfig {
    /**
     * Current strength level
     */
    level: PasswordStrength;

    /**
     * Strength label text
     */
    label: string;

    /**
     * Strength tip/feedback message
     */
    tip?: string;

    /**
     * Number of filled bars (1-4)
     */
    bars: number;
}

/**
 * Password component props
 */
export interface PasswordProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
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
     * Show password strength indicator
     * @default true
     */
    showStrengthIndicator?: boolean;

    /**
     * Show strength label (Weak, Medium, Good, Great)
     * @default true
     */
    showStrengthLabel?: boolean;

    /**
     * Show strength tips in popover
     * @default false
     */
    showStrengthTips?: boolean;

    /**
     * Custom strength calculation function
     * If not provided, uses built-in strength calculator
     */
    calculateStrength?: (password: string) => PasswordStrengthConfig;

    /**
     * Callback when password strength changes
     */
    onStrengthChange?: (strength: PasswordStrengthConfig) => void;

    /**
     * Custom CSS class
     */
    className?: string;

    /**
     * Initially show password (unmasked)
     * @default false
     */
    initiallyVisible?: boolean;
}

/**
 * Default strength calculator
 * Returns strength configuration based on password characteristics
 */
export function calculatePasswordStrength(password: string): PasswordStrengthConfig {
    if (!password || password.length === 0) {
        return {
            level: 'none',
            label: '',
            bars: 0,
        };
    }

    let score = 0;
    const checks = {
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        numbers: /\d/.test(password),
        special: /[^a-zA-Z0-9]/.test(password),
    };

    // Calculate score based on characteristics
    if (checks.length) score += 2;
    if (checks.lowercase) score += 1;
    if (checks.uppercase) score += 1;
    if (checks.numbers) score += 1;
    if (checks.special) score += 2;

    // Bonus for longer passwords
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;

    // Determine strength level
    if (score <= 2) {
        return {
            level: 'weak',
            label: 'Weak',
            tip: 'Your password is too easy to guess. Try to add more different characters.',
            bars: 1,
        };
    } else if (score <= 4) {
        return {
            level: 'medium',
            label: 'Medium',
            tip: 'Your password is easy to guess. Try to add more different characters.',
            bars: 2,
        };
    } else if (score <= 6) {
        return {
            level: 'good',
            label: 'Good',
            tip: 'Your password is strong enough for most purposes.',
            bars: 3,
        };
    } else {
        return {
            level: 'great',
            label: 'Great!',
            tip: 'Excellent password strength!',
            bars: 4,
        };
    }
}
