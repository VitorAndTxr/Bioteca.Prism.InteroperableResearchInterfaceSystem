/**
 * Sidebar Component
 *
 * Navigation sidebar with menu items, logo, and collapse functionality.
 * Extracted from Figma screens: UsersList, NPIRequests, ClinicalCondition
 *
 * Features:
 * - Hierarchical menu structure
 * - Active state highlighting
 * - Collapsible (responsive)
 * - Badge support for notifications
 * - Icon support
 * - Sticky positioning
 *
 * @example
 * ```tsx
 * const menuItems = [
 *   { id: '1', label: 'Consultar dados', path: '/dashboard' },
 *   { id: '2', label: 'NPIs e aplicações', path: '/nodeConnections' },
 *   { id: '3', label: 'Pesquisas', path: '/research' },
 * ];
 *
 * <Sidebar
 *   items={menuItems}
 *   activePath="/nodeConnections"
 *   onNavigate={(path) => navigate(path)}
 * />
 * ```
 */

import React, { useState } from 'react';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import type { SidebarProps, SidebarMenuItem } from './Sidebar.types';
import './Sidebar.css';

const Sidebar: React.FC<SidebarProps> = ({
    items,
    activePath,
    onNavigate,
    logo = 'I.R.I.S.',
    collapsed = false,
    onCollapseChange,
    className = '',
}) => {
    const [isCollapsed, setIsCollapsed] = useState(collapsed);

    const handleToggleCollapse = () => {
        const newCollapsed = !isCollapsed;
        setIsCollapsed(newCollapsed);
        if (onCollapseChange) {
            onCollapseChange(newCollapsed);
        }
    };

    const handleItemClick = (item: SidebarMenuItem) => {
        if (onNavigate) {
            onNavigate(item.path);
        }
    };

    const isActive = (item: SidebarMenuItem): boolean => {
        return activePath === item.path || activePath.startsWith(item.path + '/');
    };

    const renderMenuItem = (item: SidebarMenuItem) => {
        const active = isActive(item);

        return (
            <li key={item.id} className="iris-sidebar__menu-item">
                <button
                    className={`iris-sidebar__menu-link ${active ? 'iris-sidebar__menu-link--active' : ''}`}
                    onClick={() => handleItemClick(item)}
                    aria-current={active ? 'page' : undefined}
                >
                    {item.icon && (
                        <span className="iris-sidebar__menu-icon" aria-hidden="true">
                            {item.icon}
                        </span>
                    )}
                    <span className="iris-sidebar__menu-label">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                        <span className="iris-sidebar__menu-badge" aria-label={`${item.badge} notifications`}>
                            {item.badge > 99 ? '99+' : item.badge}
                        </span>
                    )}
                </button>

                {/* Render children if exists */}
                {item.children && item.children.length > 0 && (
                    <ul className="iris-sidebar__menu iris-sidebar__submenu">
                        {item.children.map((child) => renderMenuItem(child))}
                    </ul>
                )}
            </li>
        );
    };

    const containerClasses = [
        'iris-sidebar',
        isCollapsed && 'iris-sidebar--collapsed',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <aside className={containerClasses} role="navigation" aria-label="Main navigation">
            {/* Logo */}
            <div className="iris-sidebar__logo">
                <img
                    src="/assets/logo.svg"
                    alt="IRIS Logo"
                    className="iris-sidebar__logo-icon"
                />
                {typeof logo === 'string' ? (
                    <span className="iris-sidebar__logo-text">{logo}</span>
                ) : (
                    logo
                )}
            </div>

            {/* Navigation Menu */}
            <nav className="iris-sidebar__nav">
                <ul className="iris-sidebar__menu">{items.map((item) => renderMenuItem(item))}</ul>
            </nav>

            {/* Collapse Toggle */}
            <button
                className="iris-sidebar__toggle"
                onClick={handleToggleCollapse}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-expanded={!isCollapsed}
            >
                <ChevronLeftIcon className="w-3 h-3" />
            </button>
        </aside>
    );
};

export default Sidebar;
