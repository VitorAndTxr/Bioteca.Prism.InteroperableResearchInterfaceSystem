/**
 * IRIS Desktop - Main Application Component
 */

import React, { useState, useEffect } from 'react';
import './App.css';

// Import shared domain types
import type { SessionMetadata } from '@iris/domain';

function App() {
    const [version, setVersion] = useState<string>('');

    useEffect(() => {
        // Get app version from Electron
        if (window.electron) {
            window.electron.app.getVersion().then(setVersion);
        }
    }, []);

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

export default App;
