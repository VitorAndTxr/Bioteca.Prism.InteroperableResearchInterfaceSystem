/**
 * Renderer Process Entry Point
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

export interface SaveExportResult {
    cancelled?: boolean;
    saved?: boolean;
    filePath?: string;
    error?: string;
}

// Type declarations for window.electron — mirrors ElectronAPI from preload
declare global {
    interface Window {
        electron?: {
            app: {
                getVersion: () => Promise<string>;
                getPath: (name: string) => Promise<string>;
            };
            secureStorage: {
                get: (key: string) => Promise<string | null>;
                set: (key: string, value: string) => Promise<boolean>;
                remove: (key: string) => Promise<boolean>;
            };
            saveExport: (buffer: ArrayBuffer, filename: string) => Promise<SaveExportResult>;
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
