/**
 * AppLayout Component
 *
 * Main application layout combining Sidebar, Header, and Content area.
 *
 * Features:
 * - Sidebar navigation
 * - Page header with actions
 * - Scrollable content area
 * - Responsive design
 *
 * @example
 * ```tsx
 * <AppLayout
 *   sidebar={{
 *     items: menuItems,
 *     activePath: '/users',
 *     onNavigate: (path) => navigate(path),
 *   }}
 *   header={{
 *     title: 'Usuários e Pesquisadores',
 *     tabs: [
 *       { id: '1', label: 'Usuários', value: 'users' },
 *       { id: '2', label: 'Pesquisadores', value: 'researchers' },
 *     ],
 *     activeTab: 'users',
 *     primaryAction: {
 *       label: 'Adicionar',
 *       onClick: () => handleAdd(),
 *     },
 *   }}
 * >
 *   <div>Main content goes here</div>
 * </AppLayout>
 * ```
 */

import React from 'react';
import { Sidebar } from '../sidebar';
import { Header } from '../header';
import type { AppLayoutProps } from './AppLayout.types';
import './AppLayout.css';

const AppLayout: React.FC<AppLayoutProps> = ({ sidebar, header, children, className = '' }) => {
    const containerClasses = ['iris-app-layout', className].filter(Boolean).join(' ');

    return (
        <div className={containerClasses}>
            {/* Sidebar */}
            <Sidebar {...sidebar} />

            {/* Main Content Area */}
            <main className="iris-app-layout__main">
                {/* Header */}
                <Header {...header} />

                {/* Content */}
                <div className="iris-app-layout__content">{children}</div>
            </main>
        </div>
    );
};

export default AppLayout;
