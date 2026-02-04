/**
 * Input Component Types
 */

import { TextInputProps } from 'react-native';
import { ReactNode } from 'react';

export interface InputProps extends TextInputProps {
  /**
   * Label text displayed above the input
   */
  label?: string;

  /**
   * Error message displayed below the input
   */
  error?: string;

  /**
   * Left icon element (displayed at the start of input)
   */
  leftIcon?: ReactNode;

  /**
   * Right element (displayed at the end of input, e.g., password toggle)
   */
  rightElement?: ReactNode;

  /**
   * Whether the input is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether to render as a multiline textarea
   * @default false
   */
  multiline?: boolean;
}
