/**
 * Electron Main Process
 *
 * Manages the application lifecycle, creates windows, and handles system-level operations.
 */

import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import * as fs from 'fs';
import keytar from 'keytar';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;

const SECURE_STORAGE_SERVICE = 'IRIS Desktop Secure Storage';

/**
 * Create the main application window
 */
function createWindow(): void {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        title: 'IRIS Desktop',
        webPreferences: {
            preload: path.join(__dirname, '../preload/preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false
        },
        show: false // Don't show until ready
    });

    // Load the app
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
    });

    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

/**
 * App lifecycle: Ready
 */
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        // On macOS, re-create window when dock icon is clicked
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

/**
 * App lifecycle: All windows closed
 */
app.on('window-all-closed', () => {
    // On macOS, keep app running until Cmd+Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

/**
 * IPC Handlers
 */

// Example: Get app version
ipcMain.handle('app:getVersion', () => {
    return app.getVersion();
});

// Example: Get app path
ipcMain.handle('app:getPath', (_event, name: string) => {
    return app.getPath(name as any);
});

// Secure storage handlers
ipcMain.handle('secureStorage:get', async (_event, key: string) => {
    return keytar.getPassword(SECURE_STORAGE_SERVICE, key);
});

ipcMain.handle('secureStorage:set', async (_event, key: string, value: string) => {
    await keytar.setPassword(SECURE_STORAGE_SERVICE, key, value);
    return true;
});

ipcMain.handle('secureStorage:remove', async (_event, key: string) => {
    await keytar.deletePassword(SECURE_STORAGE_SERVICE, key);
    return true;
});

// Research export: save ZIP via native save dialog
ipcMain.handle('research:export-save', async (_event, buffer: ArrayBuffer, filename: string) => {
    const result = await dialog.showSaveDialog(mainWindow!, {
        defaultPath: filename,
        filters: [{ name: 'ZIP Archive', extensions: ['zip'] }]
    });

    if (result.canceled || !result.filePath) {
        return { cancelled: true };
    }

    try {
        await fs.promises.writeFile(result.filePath, Buffer.from(buffer));
        return { saved: true, filePath: result.filePath };
    } catch (error) {
        return { saved: false, error: error instanceof Error ? error.message : String(error) };
    }
});
