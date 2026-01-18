import { useState, useEffect } from 'react';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import { initializeAndHydrate, cleanupMiddleware } from './services/middleware';
import AppRouter from './router/AppRouter';

function App() {
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        initializeAndHydrate()
            .then(() => setIsInitialized(true))
            .catch((error) => {
                console.error('[App] Middleware initialization failed:', error);
                setIsInitialized(true);
            });

        return () => {
            cleanupMiddleware();
        };
    }, []);

    // Show loading state while middleware initializes
    if (!isInitialized) {
        return (
            <div className="app-loading">
                <div className="loading-spinner" />
                <p>Initializing...</p>
            </div>
        );
    }

    return (
        <AuthProvider>
            <AppRouter />
        </AuthProvider>
    );
}

export default App;
