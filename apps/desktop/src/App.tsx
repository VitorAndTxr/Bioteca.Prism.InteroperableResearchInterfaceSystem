/**
 * IRIS Desktop - Main Application Component
 */

import React, { useState, useEffect } from 'react';
import './App.css';

// Import shared domain types
import type { SessionMetadata } from '@iris/domain';

// Import context providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { initializeAndHydrate, cleanupMiddleware } from './services/middleware';
import Login from './screens/Login/Login';
import UsersAndResearchesersScreen from './screens/UsersAndResearchesers/UsersAndResearchesersScreen';
import HomeScreen from './screens/Home/HomeScreen';
import SNOMEDScreen from './screens/SNOMED/SnomedScreen';


type DemoPage = 'home' | 'users' | 'snomed';

/**
 * Main App Content (requires AuthContext)
 */
function AppContent() {
    const { isAuthenticated, authState} = useAuth();
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
            case '/snomed':
                setCurrentPage('snomed');
                break;  
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
            case 'snomed':
                return (
                    <SNOMEDScreen
                        handleNavigation={handleNavigation}
                    />
                );
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
    // Initialize middleware on mount
    useEffect(() => {
        console.log('[App] Initializing middleware...');
        initializeAndHydrate();

        // Cleanup on unmount
        return () => {
            console.log('[App] Cleaning up middleware...');
            cleanupMiddleware();
        };
    }, []);

    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;




