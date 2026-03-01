/**
 * Electron Preload Script
 *
 * Exposes safe APIs to the renderer process via contextBridge.
 */

import { contextBridge, ipcRenderer } from 'electron';

export interface SaveExportResult {
    cancelled?: boolean;
    saved?: boolean;
    filePath?: string;
    error?: string;
}

/**
 * Exposed API for renderer process
 */
const api = {
    // App information
    app: {
        getVersion: () => ipcRenderer.invoke('app:getVersion'),
        getPath: (name: string) => ipcRenderer.invoke('app:getPath', name)
    },

    // Secure storage bridge
    secureStorage: {
        get: (key: string) => ipcRenderer.invoke('secureStorage:get', key),
        set: (key: string, value: string) => ipcRenderer.invoke('secureStorage:set', key, value),
        remove: (key: string) => ipcRenderer.invoke('secureStorage:remove', key)
    },

    // Research export: save ZIP file via native OS dialog
    saveExport: (buffer: ArrayBuffer, filename: string): Promise<SaveExportResult> =>
        ipcRenderer.invoke('research:export-save', buffer, filename)
};

// Expose API to renderer
contextBridge.exposeInMainWorld('electron', api);

// TypeScript type definitions for renderer
export type ElectronAPI = typeof api;
