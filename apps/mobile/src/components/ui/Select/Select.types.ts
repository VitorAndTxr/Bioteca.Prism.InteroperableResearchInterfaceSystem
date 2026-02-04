/**
 * Select Component Types
 */

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface SelectProps {
  /**
   * Label text displayed above the select
   */
  label?: string;

  /**
   * Currently selected value
   */
  value: string | number;

  /**
   * Array of options to display
   */
  options: SelectOption[];

  /**
   * Callback fired when value changes
   */
  onValueChange: (value: string | number) => void;

  /**
   * Placeholder text when no value is selected
   */
  placeholder?: string;

  /**
   * Error message displayed below the select
   */
  error?: string;

  /**
   * Whether the select is disabled
   * @default false
   */
  disabled?: boolean;
}
