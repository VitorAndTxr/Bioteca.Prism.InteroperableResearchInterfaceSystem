import React, { useState, useEffect } from 'react';
import './App.css';

// Import context providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { initializeAndHydrate, cleanupMiddleware } from './services/middleware';
import AppRouter from './router/AppRouter';

function App() {
    useEffect(() => {
        initializeAndHydrate();
        return () => {
            cleanupMiddleware();
        };
    }, []);

    return (
        <AuthProvider>
            <AppRouter />
        </AuthProvider>
    );
}

export default App;




