/**
 * Avatar Component Type Definitions
 *
 * Based on IRIS Design System - Figma Node: 2803-3248
 * Sizes: SM (32x32), Base (48x48), LG (56x56), XL (144x144)
 */

import { ReactNode } from 'react';

/**
 * Avatar size variants
 */
export type AvatarSize = 'small' | 'medium' | 'large' | 'xl';

/**
 * Avatar display variants
 */
export type AvatarVariant = 'image' | 'initials' | 'icon' | 'placeholder';

/**
 * Status indicator for avatar
 */
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

/**
 * Shape of the avatar
 */
export type AvatarShape = 'circle' | 'rounded' | 'square';

/**
 * Props for the Avatar component
 */
export interface AvatarProps {
  /**
   * Size of the avatar
   * - small: 32x32px
   * - medium: 48x48px (default)
   * - large: 56x56px
   * - xl: 144x144px
   */
  size?: AvatarSize;

  /**
   * Source URL for image avatar
   * If provided, displays an image avatar
   */
  src?: string;

  /**
   * Alt text for the image
   * Required for accessibility when using image variant
   */
  alt?: string;

  /**
   * Initials to display (e.g., "JD" for John Doe)
   * If src is not provided and initials are given, displays initials avatar
   * Maximum 2 characters recommended
   */
  initials?: string;

  /**
   * Icon element to display
   * If src and initials are not provided, can display an icon
   */
  icon?: ReactNode;

  /**
   * Name of the user (used for generating initials if not provided)
   * Also used for accessibility labels
   */
  name?: string;

  /**
   * Status indicator position
   * Shows a colored dot indicating user status (online, offline, busy, away)
   */
  status?: AvatarStatus;

  /**
   * Badge content (e.g., notification count)
   * Shows a small badge with text or number
   */
  badge?: string | number;

  /**
   * Maximum number to display in badge before showing "99+"
   * @default 99
   */
  badgeMax?: number;

  /**
   * Shape of the avatar
   * @default 'circle'
   */
  shape?: AvatarShape;

  /**
   * Background color for initials/icon variant
   * If not provided, generates color based on name/initials
   */
  backgroundColor?: string;

  /**
   * Text color for initials
   * @default '#FFFFFF'
   */
  textColor?: string;

  /**
   * Click handler
   */
  onClick?: () => void;

  /**
   * Custom CSS class name
   */
  className?: string;

  /**
   * Whether the avatar is interactive (clickable)
   * @default false
   */
  interactive?: boolean;

  /**
   * Loading state - shows a skeleton loader
   * @default false
   */
  loading?: boolean;

  /**
   * ARIA label for accessibility
   * If not provided, falls back to name or alt
   */
  ariaLabel?: string;
}

/**
 * Type guard to check if avatar is image variant
 */
export function isImageAvatar(props: AvatarProps): boolean {
  return !!props.src;
}

/**
 * Type guard to check if avatar is initials variant
 */
export function isInitialsAvatar(props: AvatarProps): boolean {
  return !props.src && (!!props.initials || !!props.name);
}

/**
 * Type guard to check if avatar is icon variant
 */
export function isIconAvatar(props: AvatarProps): boolean {
  return !props.src && !props.initials && !props.name && !!props.icon;
}

/**
 * Type guard to check if avatar is placeholder variant
 */
export function isPlaceholderAvatar(props: AvatarProps): boolean {
  return !props.src && !props.initials && !props.name && !props.icon;
}
