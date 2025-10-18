/**
 * IRIS Desktop - Main Application Component
 */

import React, { useState, useEffect } from 'react';
import './App.css';

// Import shared domain types
import type { SessionMetadata } from '@iris/domain';

// Import context providers
import { AuthProvider, useAuth } from '../context/AuthContext';

// Import layout components
import { AppLayout } from '../design-system/components/app-layout';

// Import menu configuration
import { mainMenuItems } from '../config/menu';

// Import screens
import Login from './screens/Login';

// TEMPORARY: Import demo pages for testing
import ButtonDemo from './screens/ButtonDemo';
import InputDemo from './screens/InputDemo';

type DemoPage = 'home' | 'button' | 'input';

/**
 * Main App Content (requires AuthContext)
 */
function AppContent() {
    const { isAuthenticated, authState, user, logout } = useAuth();
    const [version, setVersion] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<DemoPage>('home');
    const [activePath, setActivePath] = useState<string>('/dashboard');

    useEffect(() => {
        // Get app version from Electron
        if (window.electron) {
            window.electron.app.getVersion().then(setVersion);
        }
    }, []);

    // Show login screen if not authenticated
    if (!isAuthenticated && authState !== 'loading') {
        return <Login />;
    }

    // Show loading state while checking authentication
    if (authState === 'loading') {
        return (
            <div className="app-loading">
                <div className="loading-spinner" />
                <p>Carregando...</p>
            </div>
        );
    }

    const handleNavigation = (path: string) => {
        setActivePath(path);
        // TODO: Add React Router navigation when screens are implemented
        console.log('Navigate to:', path);
    };

    const handleUserMenuClick = () => {
        // TODO: Show user menu dropdown
        console.log('User menu clicked');
    };

    // Render content based on current page
    const renderContent = () => {
        switch (currentPage) {
            case 'button':
                return <ButtonDemo onBack={() => setCurrentPage('home')} />;

            case 'input':
                return <InputDemo onBack={() => setCurrentPage('home')} />;

            case 'home':
            default:
                return (
                    <AppLayout
                        sidebar={{
                            items: mainMenuItems,
                            activePath: activePath,
                            onNavigate: handleNavigation,
                            logo: 'I.R.I.S.',
                        }}
                        header={{
                            title: 'Consultar dados',
                            subtitle: 'Visualize e analise dados de pesquisa',
                            primaryAction: {
                                label: 'Adicionar',
                                onClick: () => console.log('Add clicked'),
                            },
                            showUserMenu: true,
                            onUserMenuClick: handleUserMenuClick,
                        }}
                    >
                        <div className="welcome-card">
                            <h2>Welcome to IRIS Desktop</h2>
                            <p>
                                Application management and data analysis for sEMG/FES research.
                            </p>

                            {/* User Info */}
                            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                                <p style={{ fontSize: '14px', color: '#666' }}>
                                    Logged in as: <strong>{user?.name}</strong> ({user?.role})
                                </p>
                                <button
                                    onClick={logout}
                                    style={{
                                        padding: '8px 16px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        backgroundColor: '#E11D48',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        marginTop: '8px'
                                    }}
                                >
                                    Logout
                                </button>
                            </div>

                            {/* TEMPORARY: Buttons to show demo pages */}
                            <div style={{ marginBottom: '2rem', textAlign: 'center', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <button
                                    onClick={() => setCurrentPage('button')}
                                    style={{
                                        padding: '12px 24px',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        backgroundColor: '#49A2A8',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 8px rgba(73, 162, 168, 0.3)'
                                    }}
                                >
                                    🎨 Button Demo
                                </button>
                                <button
                                    onClick={() => setCurrentPage('input')}
                                    style={{
                                        padding: '12px 24px',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        backgroundColor: '#7B6FDB',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 8px rgba(123, 111, 219, 0.3)'
                                    }}
                                >
                                    📝 Input Demo
                                </button>
                            </div>

                            <div className="features">
                                <div className="feature-card">
                                    <h3>📊 Data Analysis</h3>
                                    <p>Visualize and analyze session data with advanced charts</p>
                                </div>

                                <div className="feature-card">
                                    <h3>👥 User Management</h3>
                                    <p>Manage patients, researchers, and sessions</p>
                                </div>

                                <div className="feature-card">
                                    <h3>📈 Reports</h3>
                                    <p>Generate comprehensive reports and export data</p>
                                </div>

                                <div className="feature-card">
                                    <h3>⚙️ Configuration</h3>
                                    <p>Configure devices, protocols, and system settings</p>
                                </div>
                            </div>
                        </div>

                        <div className="info-card">
                            <h3>Getting Started</h3>
                            <ol>
                                <li>Connect to the IRIS mobile app for real-time device control</li>
                                <li>Import session data for analysis</li>
                                <li>Generate reports and export results</li>
                            </ol>
                            <p style={{ marginTop: '1rem', fontSize: '12px', color: '#999' }}>
                                Version: {version || '1.0.0'}
                            </p>
                        </div>
                    </AppLayout>
                );
        }
    };

    return renderContent();
}

/**
 * App wrapper with AuthProvider
 */
function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
