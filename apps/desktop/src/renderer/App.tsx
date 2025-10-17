/**
 * IRIS Desktop - Main Application Component
 */

import React, { useState, useEffect } from 'react';
import './App.css';

// Import shared domain types
import type { SessionMetadata } from '@iris/domain';

// Import context providers
import { AuthProvider } from '../context/AuthContext';

// TEMPORARY: Import demo pages for testing
import ButtonDemo from './screens/ButtonDemo';
import InputDemo from './screens/InputDemo';

type DemoPage = 'home' | 'button' | 'input';

function App() {
    const [version, setVersion] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<DemoPage>('home');

    useEffect(() => {
        // Get app version from Electron
        if (window.electron) {
            window.electron.app.getVersion().then(setVersion);
        }
    }, []);

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
                    <div className="app">
                        <header className="app-header">
                            <h1>IRIS Desktop</h1>
                            <p>Interoperable Research Interface System</p>
                            <span className="version">v{version}</span>
                        </header>

                        <main className="app-main">
                            <div className="welcome-card">
                                <h2>Welcome to IRIS Desktop</h2>
                                <p>
                                    Application management and data analysis for sEMG/FES research.
                                </p>

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
                            </div>
                        </main>

                        <footer className="app-footer">
                            <p>PRISM Project - 2025</p>
                        </footer>
                    </div>
                );
        }
    };

    return (
        <AuthProvider>
            {renderContent()}
        </AuthProvider>
    );
}

export default App;
