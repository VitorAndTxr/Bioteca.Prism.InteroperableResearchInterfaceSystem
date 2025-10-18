/**
 * IRIS Desktop - Main Application Component
 */

import React, { useState, useEffect } from 'react';
import './App.css';

// Import shared domain types
import type { SessionMetadata } from '@iris/domain';

// Import context providers
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './screens/Login/Login';
import UsersAndResearchesersScreen from './screens/UsersAndResearchesers/UsersAndResearchesersScreen';
import HomeScreen from './screens/Home/HomeScreen';


type DemoPage = 'home' | 'users';

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

        // Navigate to appropriate page based on path
        switch (path) {
            case '/users':
                setCurrentPage('users');
                break;
            case '/dashboard':
            default:
                setCurrentPage('home');
                break;
        }
    };

    const handleUserMenuClick = () => {
        // TODO: Show user menu dropdown
        console.log('User menu clicked');
    };

    // Render content based on current page
    const renderContent = () => {
        switch (currentPage) {
            case 'users':
                return (
                    <UsersAndResearchesersScreen
                        handleNavigation={handleNavigation}
                    />
                );

            case 'home':
            default:
                return (
                    <HomeScreen
                        activePath={activePath}
                        handleNavigation={handleNavigation}
                        handleUserMenuClick={handleUserMenuClick}
                    />
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




