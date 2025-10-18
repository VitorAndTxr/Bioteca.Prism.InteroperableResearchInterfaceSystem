/**
 * Header Component
 *
 * Page header with title, tabs, and actions.
 * Extracted from Figma screens: UsersList, NPIRequests, ClinicalCondition
 *
 * Features:
 * - Page title and subtitle
 * - Tab navigation
 * - Primary action button
 * - User menu icon
 * - Breadcrumbs (optional)
 * - Responsive design
 *
 * @example
 * ```tsx
 * <Header
 *   title="Usuários e Pesquisadores"
 *   tabs={[
 *     { id: '1', label: 'Usuários', value: 'users' },
 *     { id: '2', label: 'Pesquisadores', value: 'researchers' },
 *   ]}
 *   activeTab="users"
 *   onTabChange={(tab) => setActiveTab(tab)}
 *   primaryAction={{
 *     label: 'Adicionar',
 *     icon: <PlusIcon />,
 *     onClick: () => handleAdd(),
 *   }}
 * />
 * ```
 */

import React from 'react';
import type { HeaderProps } from './Header.types';
import './Header.css';

const Header: React.FC<HeaderProps> = ({
    title,
    subtitle,
    tabs,
    activeTab,
    onTabChange,
    primaryAction,
    showUserMenu = true,
    onUserMenuClick,
    breadcrumbs,
    className = '',
    secondaryAction,
}) => {
    const handleTabClick = (tabValue: string) => {
        if (onTabChange) {
            onTabChange(tabValue);
        }
    };

    const renderBreadcrumbs = () => {
        if (!breadcrumbs || breadcrumbs.length === 0) return null;

        return (
            <nav className="iris-header__breadcrumbs" aria-label="Breadcrumb">
                {breadcrumbs.map((crumb, index) => (
                    <div key={index} className="iris-header__breadcrumb-item">
                        {crumb.path ? (
                            <a href={crumb.path} className="iris-header__breadcrumb-link">
                                {crumb.label}
                            </a>
                        ) : (
                            <span>{crumb.label}</span>
                        )}
                        {index < breadcrumbs.length - 1 && (
                            <span className="iris-header__breadcrumb-separator" aria-hidden="true">
                                /
                            </span>
                        )}
                    </div>
                ))}
            </nav>
        );
    };

    const renderTabs = () => {
        if (!tabs || tabs.length === 0) return null;

        return (
            <div className="iris-header__tabs" role="tablist">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.value;

                    return (
                        <button
                            key={tab.id}
                            role="tab"
                            aria-selected={isActive}
                            aria-controls={`panel-${tab.value}`}
                            className={`iris-header__tab ${isActive ? 'iris-header__tab--active' : ''}`}
                            onClick={() => handleTabClick(tab.value)}
                        >
                            {tab.label}
                            {tab.badge !== undefined && tab.badge > 0 && (
                                <span className="iris-header__tab-badge">{tab.badge > 99 ? '99+' : tab.badge}</span>
                            )}
                        </button>
                    );
                })}
            </div>
        );
    };

    const renderUserMenuIcon = () => {
        return (
            <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M10 10C12.2091 10 14 8.20914 14 6C14 3.79086 12.2091 2 10 2C7.79086 2 6 3.79086 6 6C6 8.20914 7.79086 10 10 10Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M3.5 18C3.5 15.2386 6.13401 13 9.5 13H10.5C13.866 13 16.5 15.2386 16.5 18"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        );
    };

    const renderPlusIcon = () => {
        return (
            <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="iris-header__primary-action-icon"
            >
                <path
                    d="M8 3.5V12.5M3.5 8H12.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        );
    };

    const containerClasses = ['iris-header', className].filter(Boolean).join(' ');

    return (
        <header className={containerClasses}>
            {/* Breadcrumbs */}
            {renderBreadcrumbs()}

            {/* Top Row: Title + Actions */}
            <div className="iris-header__top">
                <div className="iris-header__title-section">
                    <h1 className="iris-header__title">{title}</h1>
                    {subtitle && <p className="iris-header__subtitle">{subtitle}</p>}
                </div>

                <div className="iris-header__actions">
                    {/* Primary Action Button */}
                    {primaryAction && (
                        <button className="iris-header__primary-action" onClick={primaryAction.onClick}>
                            {primaryAction.icon || renderPlusIcon()}
                            {primaryAction.label}
                        </button>
                    )}

                    {/* Secondary Action Button (e.g., Logout) */}
                    {secondaryAction && (
                        <button
                            className="iris-header__secondary-action"
                            onClick={secondaryAction.onClick}
                            aria-label={secondaryAction.ariaLabel || 'Secondary action'}
                            title={secondaryAction.title}
                        >
                            {secondaryAction.icon}
                        </button>
                    )}

                    {/* User Menu */}
                    {showUserMenu && (
                        <button
                            className="iris-header__user-menu"
                            onClick={onUserMenuClick}
                            aria-label="User menu"
                        >
                            {renderUserMenuIcon()}
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            {renderTabs()}
        </header>
    );
};

export default Header;
