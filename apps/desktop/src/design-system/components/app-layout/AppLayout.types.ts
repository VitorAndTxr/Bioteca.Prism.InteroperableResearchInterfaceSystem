/**
 * AppLayout Component Types
 * Main application layout combining Sidebar + Header + Content
 */

import { ReactNode } from 'react';
import type { SidebarProps } from '../sidebar/Sidebar.types';
import type { HeaderProps } from '../header/Header.types';

/**
 * AppLayout component props
 */
export interface AppLayoutProps {
    /**
     * Sidebar configuration
     */
    sidebar: Omit<SidebarProps, 'className'>;

    /**
     * Header configuration
     */
    header: Omit<HeaderProps, 'className'>;

    /**
     * Main content
     */
    children: ReactNode;

    /**
     * Custom CSS class
     */
    className?: string;
}
