# IRIS Desktop

**Interoperable Research Interface System - Desktop Application**

## Overview

IRIS Desktop is an Electron-based application for managing, analyzing, and visualizing sEMG/FES research data collected from the IRIS mobile app.

## Features

- 📊 **Data Visualization**: Advanced charts and graphs for sEMG signal analysis
- 👥 **User Management**: Manage patients, researchers, and research sessions
- 📈 **Statistical Analysis**: Comprehensive statistical tools for research data
- 📄 **Reports**: Generate PDF and CSV reports
- ⚙️ **Configuration**: Device configuration and protocol management
- 💾 **Data Export**: Export data in multiple formats
- 🔍 **Session Comparison**: Compare multiple therapy sessions

## Technology Stack

- **Electron**: 28.x - Desktop application framework
- **React**: 18.3.1 - UI framework
- **TypeScript**: 5.9.2 - Type-safe development
- **Vite**: 6.x - Fast build tool
- **Recharts**: 2.15.0 - Charting library
- **@iris/domain**: Shared domain models from monorepo

## Development

### Prerequisites

- Node.js ≥ 18.0.0
- npm ≥ 9.0.0

### Install Dependencies

From monorepo root:
```bash
npm install
```

Or from this directory:
```bash
npm install
```

### Run in Development Mode

```bash
# From monorepo root
npm run desktop

# Or from this directory
npm run dev
```

This will:
1. Start Vite dev server (renderer process) on http://localhost:5173
2. Watch and compile TypeScript (main process)
3. Launch Electron with hot-reload

### Build for Production

```bash
# From monorepo root
npm run desktop:build

# Or from this directory
npm run build
```

### Package Application

```bash
# Windows
npm run package:win

# macOS
npm run package:mac

# Linux
npm run package:linux

# All platforms
npm run package
```

## Project Structure

```
apps/desktop/
├── src/
│   ├── main/              # Electron main process
│   │   └── index.ts       # Application entry point
│   ├── preload/           # Preload scripts
│   │   └── preload.ts     # Context bridge API
│   └── renderer/          # React renderer process
│       ├── App.tsx        # Main React component
│       ├── App.css        # Styles
│       └── main.tsx       # Renderer entry point
├── public/                # Static assets
├── dist/                  # Compiled output
│   ├── main/              # Compiled main process
│   └── renderer/          # Compiled renderer
├── dist-electron/         # Packaged application
├── index.html             # HTML template
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript config (base)
├── tsconfig.main.json     # TypeScript config (main process)
├── package.json           # Project dependencies
└── README.md              # This file
```

## Architecture

### Main Process (Electron)
- Manages application lifecycle
- Creates browser windows
- Handles file system operations
- Provides IPC communication with renderer

### Preload Script
- Bridges main and renderer processes securely
- Exposes safe APIs via `contextBridge`
- Maintains context isolation for security

### Renderer Process (React)
- UI rendering and user interactions
- React components and state management
- Communicates with main via IPC
- Uses shared `@iris/domain` types

## Using Shared Domain Models

```typescript
import {
    SessionMetadata,
    FESParameters,
    StreamDataPacket,
    DeviceInfo
} from '@iris/domain';

function MyComponent() {
    const [sessions, setSessions] = useState<SessionMetadata[]>([]);
    // ... rest of component
}
```

## IPC Communication

### Exposed APIs (via Preload)

```typescript
// Renderer process
const version = await window.electron.app.getVersion();
const userDataPath = await window.electron.app.getPath('userData');
```

### Adding New IPC Handlers

1. **Main Process** (`src/main/index.ts`):
```typescript
ipcMain.handle('myHandler', (event, arg) => {
    return someResult;
});
```

2. **Preload** (`src/preload/preload.ts`):
```typescript
const api = {
    myAPI: {
        myMethod: (arg) => ipcRenderer.invoke('myHandler', arg)
    }
};
```

3. **Renderer** (`src/renderer/App.tsx`):
```typescript
const result = await window.electron.myAPI.myMethod(arg);
```

## Future Features

### Phase 1 - Data Management
- [ ] Session database (SQLite)
- [ ] Import session data from mobile app
- [ ] Session history and search

### Phase 2 - Visualization
- [ ] Real-time signal charts (Recharts)
- [ ] Multi-session comparison
- [ ] Statistical analysis tools

### Phase 3 - User Management
- [ ] Patient profiles
- [ ] Researcher accounts
- [ ] Access control

### Phase 4 - Export & Reports
- [ ] PDF report generation
- [ ] CSV data export
- [ ] Batch export tools

### Phase 5 - Advanced Features
- [ ] Machine learning integration
- [ ] Predictive analysis
- [ ] Cloud synchronization

## Scripts

- `npm run dev` - Development mode with hot-reload
- `npm run build` - Build main + renderer for production
- `npm run start` - Run packaged application
- `npm run type-check` - Type checking without compilation
- `npm run package` - Package for current platform
- `npm run package:win` - Package for Windows
- `npm run package:mac` - Package for macOS
- `npm run package:linux` - Package for Linux

## Environment Variables

Create a `.env` file (optional):
```env
NODE_ENV=development
VITE_API_URL=http://localhost:3000
```

## Debugging

### Main Process
- Add breakpoints in `src/main/index.ts`
- Use VS Code debugger or `console.log`

### Renderer Process
- Open DevTools: `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (macOS)
- Use React DevTools extension

## Troubleshooting

### "Cannot find module '@iris/domain'"
```bash
# Rebuild workspace
cd ../..
npm install
npm run build --workspace=@iris/domain
```

### Electron window doesn't open
- Check console for errors
- Verify `dist/main/index.js` exists
- Ensure Vite dev server is running (dev mode)

### Hot reload not working
- Restart Vite dev server
- Clear `dist/` directory

## Contributing

1. Follow TypeScript strict mode
2. Use shared `@iris/domain` types
3. Document new IPC handlers
4. Test on multiple platforms before packaging

## License

MIT - PRISM Project

## Links

- [Electron Documentation](https://www.electronjs.org/docs/latest/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Recharts Documentation](https://recharts.org/)
