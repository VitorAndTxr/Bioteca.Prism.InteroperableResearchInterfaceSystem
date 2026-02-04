/**
 * EmptyState Component Types
 */

import { ViewProps } from 'react-native';
import { ReactNode } from 'react';

export interface EmptyStateAction {
  label: string;
  onPress: () => void;
}

export interface EmptyStateProps extends ViewProps {
  /**
   * Icon element to display (e.g., from a icon library)
   */
  icon?: ReactNode;

  /**
   * Main title text
   */
  title: string;

  /**
   * Descriptive message text
   */
  message: string;

  /**
   * Optional action button
   */
  action?: EmptyStateAction;
}
