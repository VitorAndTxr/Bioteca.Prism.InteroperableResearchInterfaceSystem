/**
 * Avatar Component
 *
 * A flexible avatar component that supports images, initials, icons, and placeholders
 * with optional status indicators and notification badges.
 *
 * Based on IRIS Design System - Figma Node: 2803-3248
 *
 * @example
 * ```tsx
 * // Image avatar
 * <Avatar src="/user.jpg" alt="John Doe" size="medium" />
 *
 * // Initials avatar
 * <Avatar initials="JD" name="John Doe" size="large" />
 *
 * // With status indicator
 * <Avatar src="/user.jpg" alt="John Doe" status="online" />
 *
 * // With notification badge
 * <Avatar src="/user.jpg" alt="John Doe" badge={5} />
 * ```
 */

import React, { useState, useMemo } from 'react';
import type {
  AvatarProps,
  AvatarSize,
  AvatarStatus,
} from './Avatar.types';
import './Avatar.css';

/**
 * Generate initials from name
 * Takes first letter of first and last name
 */
function generateInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Generate a consistent color index based on string
 * Uses simple hash function for color selection
 */
function generateColorIndex(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 10; // 10 predefined colors
}

/**
 * Default placeholder icon (user silhouette)
 */
function PlaceholderIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function Avatar({
  size = 'medium',
  src,
  alt,
  initials,
  icon,
  name,
  status,
  badge,
  badgeMax = 99,
  shape = 'circle',
  backgroundColor,
  textColor = '#FFFFFF',
  onClick,
  className = '',
  interactive = false,
  loading = false,
  ariaLabel,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Determine what to display
  const displayInitials = useMemo(() => {
    if (initials) return initials.slice(0, 2).toUpperCase();
    if (name) return generateInitials(name);
    return null;
  }, [initials, name]);

  const shouldShowImage = src && !imageError;
  const shouldShowInitials = !shouldShowImage && displayInitials;
  const shouldShowIcon = !shouldShowImage && !shouldShowInitials && icon;
  const shouldShowPlaceholder = !shouldShowImage && !shouldShowInitials && !shouldShowIcon;

  // Generate background color for initials/icon variant
  const computedBackgroundColor = useMemo(() => {
    if (backgroundColor) return backgroundColor;
    if (shouldShowInitials || shouldShowIcon) {
      const seed = displayInitials || name || 'default';
      const colorIndex = generateColorIndex(seed);
      return `var(--avatar-color-${colorIndex}, #b0b0b0)`;
    }
    return '#b0b0b0'; // Default neutral color
  }, [backgroundColor, shouldShowInitials, shouldShowIcon, displayInitials, name]);

  // Format badge content
  const badgeContent = useMemo(() => {
    if (typeof badge === 'number') {
      return badge > badgeMax ? `${badgeMax}+` : badge.toString();
    }
    return badge;
  }, [badge, badgeMax]);

  // Build class names
  const avatarClasses = [
    'avatar',
    `avatar--${size}`,
    `avatar--${shape}`,
    interactive || onClick ? 'avatar--interactive' : '',
    loading ? 'avatar--loading' : '',
    !backgroundColor && (shouldShowInitials || shouldShowIcon)
      ? `avatar--color-${generateColorIndex(displayInitials || name || 'default')}`
      : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Accessibility label
  const computedAriaLabel = ariaLabel || name || alt || 'User avatar';

  // Handle image error
  const handleImageError = () => {
    setImageError(true);
  };

  // Handle click
  const handleClick = () => {
    if (onClick && !loading) {
      onClick();
    }
  };

  // Handle keyboard interaction
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick && !loading) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={avatarClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : 'img'}
      aria-label={computedAriaLabel}
      tabIndex={onClick && !loading ? 0 : undefined}
      style={
        backgroundColor || (shouldShowInitials || shouldShowIcon)
          ? {
              backgroundColor: computedBackgroundColor,
              color: textColor,
            }
          : undefined
      }
    >
      {/* Image variant */}
      {shouldShowImage && (
        <img
          src={src}
          alt={alt || name || 'User avatar'}
          className="avatar__image"
          onError={handleImageError}
          loading="lazy"
        />
      )}

      {/* Initials variant */}
      {shouldShowInitials && (
        <span className="avatar__initials" aria-hidden="true">
          {displayInitials}
        </span>
      )}

      {/* Icon variant */}
      {shouldShowIcon && (
        <span className="avatar__icon" aria-hidden="true">
          {icon}
        </span>
      )}

      {/* Placeholder variant */}
      {shouldShowPlaceholder && !loading && (
        <span className="avatar__icon" aria-hidden="true">
          <PlaceholderIcon />
        </span>
      )}

      {/* Status indicator */}
      {status && !loading && (
        <span
          className={`avatar__status avatar__status--${status}`}
          role="status"
          aria-label={`Status: ${status}`}
        />
      )}

      {/* Notification badge */}
      {badge !== undefined && badge !== null && !loading && (
        <span
          className="avatar__badge"
          role="status"
          aria-label={`${badgeContent} notifications`}
        >
          {badgeContent}
        </span>
      )}
    </div>
  );
}

Avatar.displayName = 'Avatar';

export default Avatar;
