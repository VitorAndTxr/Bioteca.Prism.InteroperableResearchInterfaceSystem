/**
 * Header Component Types
 * Extracted from Figma screens: UsersList (6804-13670), NPIRequests (6804-13591), SNOMED (6804-13176)
 */

import { ReactNode } from 'react';

/**
 * Tab item for header navigation
 */
export interface HeaderTab {
    /**
     * Unique identifier
     */
    id: string;

    /**
     * Display label
     */
    label: string;

    /**
     * Tab value/path
     */
    value: string;

    /**
     * Badge count
     */
    badge?: number;
}

/**
 * Header component props
 */
export interface HeaderProps {
    /**
     * Page title (main heading)
     */
    title: string;

    /**
     * Optional subtitle
     */
    subtitle?: string;

    /**
     * Tabs for secondary navigation
     */
    tabs?: HeaderTab[];

    /**
     * Active tab value
     */
    activeTab?: string;

    /**
     * Callback when tab changes
     */
    onTabChange?: (tabValue: string) => void;

    /**
     * Primary action button configuration
     */
    primaryAction?: {
        label: string;
        icon?: ReactNode;
        onClick: () => void;
    };

    /**
     * Show user menu icon
     * @default true
     */
    showUserMenu?: boolean;

    /**
     * Callback when user menu is clicked
     */
    onUserMenuClick?: () => void;

    /**
     * Breadcrumbs (optional)
     */
    breadcrumbs?: Array<{
        label: string;
        path?: string;
    }>;

    /**
     * Custom CSS class
     */
    className?: string;
}
