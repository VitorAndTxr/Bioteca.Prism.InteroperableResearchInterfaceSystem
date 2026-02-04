/**
 * Button Component Types
 */

import { PressableProps } from 'react-native';
import { ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  /**
   * Button text content
   */
  title: string;

  /**
   * Visual style variant
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * Size of the button
   * @default 'md'
   */
  size?: ButtonSize;

  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Loading state - shows activity indicator
   * @default false
   */
  loading?: boolean;

  /**
   * Optional left icon element
   */
  icon?: ReactNode;

  /**
   * Whether the button should take full width of container
   * @default false
   */
  fullWidth?: boolean;
}
