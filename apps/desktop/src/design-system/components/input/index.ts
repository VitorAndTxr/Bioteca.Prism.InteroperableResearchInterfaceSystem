/**
 * Input Component
 *
 * A comprehensive input component with support for icons, validation,
 * character counting, prefix/suffix, and textarea variant.
 *
 * @see Input.tsx for component implementation
 * @see Input.types.ts for TypeScript types
 * @see README.md for usage documentation
 */

export { default as Input } from './Input';
export type {
    InputProps,
    TextareaProps,
    InputComponentProps,
    InputSize,
    InputValidationStatus,
    InputIconPosition,
} from './Input.types';
export { isTextareaProps } from './Input.types';
