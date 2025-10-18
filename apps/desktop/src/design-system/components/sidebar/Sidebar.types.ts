/**
 * Sidebar Component Types
 * Extracted from Figma screens: UsersList (6804-13670), NPIRequests (6804-13591), SNOMED (6804-13176)
 */

import { ReactNode } from 'react';

/**
 * Menu item definition
 */
export interface SidebarMenuItem {
    /**
     * Unique identifier for the menu item
     */
    id: string;

    /**
     * Display label
     */
    label: string;

    /**
     * Navigation path (e.g., "/users", "/npi-requests")
     */
    path: string;

    /**
     * Optional icon element
     */
    icon?: ReactNode;

    /**
     * Badge count (e.g., for notifications)
     */
    badge?: number;

    /**
     * Sub-menu items (for nested navigation)
     */
    children?: SidebarMenuItem[];
}

/**
 * Sidebar component props
 */
export interface SidebarProps {
    /**
     * Menu items to display
     */
    items: SidebarMenuItem[];

    /**
     * Current active path (for highlighting active item)
     */
    activePath: string;

    /**
     * Callback when menu item is clicked
     */
    onNavigate?: (path: string) => void;

    /**
     * Logo text or element
     * @default 'I.R.I.S.'
     */
    logo?: ReactNode;

    /**
     * Collapsed state (for responsive/mobile)
     * @default false
     */
    collapsed?: boolean;

    /**
     * Callback when collapse state changes
     */
    onCollapseChange?: (collapsed: boolean) => void;

    /**
     * Custom CSS class
     */
    className?: string;
}
