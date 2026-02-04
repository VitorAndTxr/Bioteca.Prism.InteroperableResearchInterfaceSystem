/**
 * Card Component Types
 */

import { ViewProps, ViewStyle } from 'react-native';
import { ReactNode } from 'react';

export type CardVariant = 'default' | 'outlined';

export interface CardProps extends ViewProps {
  /**
   * Content to render inside the card
   */
  children: ReactNode;

  /**
   * Visual style variant
   * @default 'default'
   */
  variant?: CardVariant;

  /**
   * Whether to apply default padding
   * @default true
   */
  padded?: boolean;

  /**
   * Additional style overrides
   */
  style?: ViewStyle;
}
