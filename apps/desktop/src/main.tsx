/**
 * Renderer Process Entry Point
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Type declarations for window.electron
declare global {
    interface Window {
        electron?: {
            app: {
                getVersion: () => Promise<string>;
                getPath: (name: string) => Promise<string>;
            };
            secureStorage?: {
                get: (key: string) => Promise<string | null>;
                set: (key: string, value: string) => Promise<void>;
                remove: (key: string) => Promise<void>;
            };
        };
    }
}

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
