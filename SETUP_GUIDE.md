# IRIS Monorepo - Setup Guide

## Overview

This guide will help you set up and run the IRIS monorepo with both mobile and desktop applications.

## Prerequisites

- **Node.js**: ≥ 18.0.0 (check with `node --version`)
- **npm**: ≥ 9.0.0 (check with `npm --version`)
- **Git**: Latest version
- **Android Studio**: For mobile Android development (optional)
- **Xcode**: For mobile iOS development (macOS only, optional)

## Initial Setup

### 1. Install Dependencies

From the root directory:

```bash
cd D:\Repos\Faculdade\PRISM\IRIS
npm install
```

This will install dependencies for:
- Root workspace
- `packages/domain`
- `apps/desktop`
- `apps/mobile` (after migration)

### 2. Build Shared Packages

```bash
npm run build --workspace=@iris/domain
```

This compiles the TypeScript in `packages/domain` to JavaScript.

## Running Applications

### Desktop App

**Development mode (with hot-reload):**

```bash
# From root
npm run desktop

# Or from apps/desktop
cd apps/desktop
npm run dev
```

This will:
1. Start Vite dev server on http://localhost:5173
2. Compile main process TypeScript
3. Launch Electron window
4. Enable hot-reload for renderer

**Production build:**

```bash
npm run desktop:build
```

**Package for distribution:**

```bash
# Windows
npm run package:win

# macOS
npm run package:mac

# Linux
npm run package:linux
```

### Mobile App (After Migration)

**Start Expo server:**

```bash
npm run mobile
```

**Run on Android:**

```bash
npm run mobile:android
```

**Run on iOS:**

```bash
npm run mobile:ios
```

**Web version:**

```bash
npm run mobile:web
```

## Project Structure

```
IRIS/
├── apps/
│   ├── desktop/           # Electron desktop app ✅ READY
│   │   ├── src/
│   │   │   ├── main/      # Electron main process
│   │   │   ├── preload/   # Preload scripts
│   │   │   └── renderer/  # React UI
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── mobile/            # React Native mobile app ⏳ TODO
│       └── (to be migrated)
│
├── packages/
│   └── domain/            # Shared types/models ✅ READY
│       ├── src/
│       │   └── models/
│       │       ├── Bluetooth.ts
│       │       ├── Stream.ts
│       │       ├── Session.ts
│       │       └── Device.ts
│       └── package.json
│
├── package.json           # Root workspace config ✅
├── tsconfig.json          # Base TypeScript config
└── README.md
```

## Development Workflow

### 1. Working on Shared Domain Models

```bash
cd packages/domain

# Make changes to src/models/*.ts

# Build
npm run build

# Type check
npm run type-check
```

### 2. Working on Desktop App

```bash
cd apps/desktop

# Development mode
npm run dev

# Type check
npm run type-check

# Build
npm run build
```

### 3. Using Shared Types in Apps

```typescript
// In apps/desktop/src/renderer/App.tsx
import {
    SessionMetadata,
    FESParameters,
    BluetoothProtocolPayload
} from '@iris/domain';

function MyComponent() {
    const [session, setSession] = useState<SessionMetadata | null>(null);
    // ...
}
```

## Common Commands

### Type Checking All Workspaces

```bash
npm run type-check:all
```

### Building All Packages

```bash
npm run build:all
```

### Cleaning Everything

```bash
npm run clean
```

### Installing New Dependencies

**For a specific workspace:**

```bash
npm install <package> --workspace=@iris/desktop
npm install <package> --workspace=@iris/domain
```

**For root:**

```bash
npm install <package> -w root
```

## Troubleshooting

### Issue: "Cannot find module '@iris/domain'"

**Solution:**
```bash
# From root
npm run build --workspace=@iris/domain
```

### Issue: Electron window doesn't open

**Solution:**
1. Check that Vite dev server is running
2. Check console for errors
3. Try clean install:
```bash
cd apps/desktop
rm -rf node_modules dist
npm install
npm run dev
```

### Issue: Type errors in imports

**Solution:**
```bash
# Rebuild domain package
npm run build --workspace=@iris/domain

# Restart TypeScript server in your IDE
```

### Issue: npm workspaces not working

**Solution:**
Ensure you're using npm ≥ 9.0.0:
```bash
npm --version
npm install -g npm@latest
```

## Next Steps

### Phase 1: Mobile App Migration (TODO)

1. Move current mobile app files to `apps/mobile/`
2. Create `apps/mobile/package.json` with workspace dependencies
3. Update imports to use `@iris/domain`
4. Test mobile app still works

### Phase 2: Extract Middleware (TODO)

1. Create `packages/middleware/`
2. Extract Bluetooth protocol logic
3. Extract streaming data processing
4. Update both apps to use middleware

### Phase 3: Shared UI Components (TODO)

1. Create `packages/ui-components/`
2. Extract SEMGChart component
3. Make platform-agnostic where possible
4. Share between mobile and desktop

## Testing

### Desktop App

```bash
cd apps/desktop

# Type check
npm run type-check

# Manual testing
npm run dev
# - Check main window opens
# - Check version displays
# - Check navigation works
```

### Shared Domain Package

```bash
cd packages/domain

# Type check
npm run type-check

# Build
npm run build

# Verify types are exported
node -e "console.log(require('./dist/index.js'))"
```

## IDE Configuration

### VS Code

Create `.vscode/settings.json` in root:

```json
{
    "typescript.tsdk": "node_modules/typescript/lib",
    "typescript.enablePromptUseWorkspaceTsdk": true,
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    }
}
```

### Recommended Extensions

- ES Lint
- Prettier
- TypeScript and JavaScript Language Features

## Environment Variables

### Desktop App

Create `apps/desktop/.env`:

```env
NODE_ENV=development
VITE_API_URL=http://localhost:3000
```

### Mobile App

Create `apps/mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

## Documentation

- **Architecture**: See `MONOREPO_ARCHITECTURE.md`
- **Desktop App**: See `apps/desktop/README.md`
- **Domain Models**: See `packages/domain/src/models/`
- **Original Mobile App**: See `CLAUDE.md` (root)

## Support

For issues or questions:
1. Check this guide
2. Check individual package README files
3. Review `MONOREPO_ARCHITECTURE.md`
4. Check console/terminal output for errors

## Summary

✅ **Ready to Use:**
- Monorepo structure with npm workspaces
- Shared domain models (`@iris/domain`)
- Desktop app scaffold (Electron + React)
- Build scripts and tooling

⏳ **Next Steps:**
- Migrate mobile app to `apps/mobile/`
- Extract middleware logic to `packages/middleware/`
- Create shared UI components package
- Implement desktop app features

Happy coding! 🚀
