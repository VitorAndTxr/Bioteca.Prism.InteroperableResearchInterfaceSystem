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
