# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## PRISM Project - Master Architecture Overview

**PRISM** (Project Research Interoperability and Standardization Model) is a comprehensive federated framework for biomedical research data management, designed to break down data silos and enable secure, standardized collaboration across research institutions.

### Ecosystem Components

The PRISM framework consists of four interconnected components:

1. **InteroperableResearchNode** (Backend): Core backend server implementing federated research data exchange with 4-phase cryptographic handshake protocol, PostgreSQL/Redis persistence, and 28-table clinical data model. See `../InteroperableResearchNode/CLAUDE.md`.

2. **InteroperableResearchsEMGDevice** (Embedded): ESP32-based hardware device for biosignal acquisition and therapeutic stimulation. See `../InteroperableResearchsEMGDevice/CLAUDE.md`.

3. **InteroperableResearchInterfaceSystem** (Interface - **This Project**): React Native application for device control and data collection.

4. **neurax_react_native_app** (Mobile): Alternative mobile implementation (limited development).

### PRISM Model Abstraction

```
┌─────────────────────────────────────────────────────────────┐
│                    Research Institution                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │ Application  │────────▶│   Device     │                  │
│  │ (This App)   │  BT     │  (sEMG/FES)  │  ◄── YOU ARE HERE│
│  └──────┬───────┘         └──────────────┘                  │
│         │ HTTPS                                              │
│  ┌──────▼────────────────────────────────────────┐          │
│  │    Interoperable Research Node (IRN)          │          │
│  └───────────────────────────┬───────────────────┘          │
│                              │ Encrypted Channel              │
└──────────────────────────────┼───────────────────────────────┘
                               │
                ┌──────────────▼──────────────┐
                │   Federated PRISM Network   │
                └─────────────────────────────┘
```

### Key Design Principles

1. **Separation of Concerns**: Application (context) ≠ Device (capture) ≠ Node (storage/federation)
2. **Protocol Standardization**: JSON-based Bluetooth protocol matching ESP32 firmware specification
3. **Real-time Visualization**: React Native for cross-platform biosignal visualization
4. **Future Data Submission**: Will communicate with Research Node for data persistence
5. **User Experience**: Focused on researcher usability and real-time feedback

### Navigation for AI Assistants

When working on this codebase:

1. **Interface/Mobile App** → You are here (`InteroperableResearchInterfaceSystem/CLAUDE.md`)
2. **Device Firmware** → See `../InteroperableResearchsEMGDevice/CLAUDE.md` for Bluetooth protocol details
3. **Backend/Node Development** → See `../InteroperableResearchNode/CLAUDE.md`
4. **Master Overview** → See root `../CLAUDE.md` for cross-component context

---

## Project Overview

**Interoperable Research Interface System (IRIS)** is a **monorepo project** containing both **Mobile** (React Native + Expo) and **Desktop** (Electron + Vite + React) applications that provide a comprehensive interface for managing biomedical research data, controlling the PRISM sEMG/FES device via Bluetooth, and interacting with the InteroperableResearchNode backend.

**Role in PRISM Ecosystem**: Represents the **Application** abstraction - general-purpose software that adds context (volunteer info, session metadata, research projects), controls device hardware via Bluetooth, visualizes real-time biosignals, manages user authentication, and submits data to Research Nodes for persistence and federation.

## Technology Stack Summary

### Mobile App (React Native + Expo)
- **Framework**: React Native 0.76.9 with Expo ~52.0.47
- **Language**: TypeScript ~5.9.2 (strict mode enabled)
- **Platforms**: Android (primary), Web
- **Key Features**: Bluetooth SPP communication, real-time sEMG visualization, CSV data export

### Desktop App (Electron + Vite + React)
- **Framework**: Electron 28.3.3 + Vite 6.0.7 + React 18.3.1
- **Language**: TypeScript ~5.9.2 (strict mode enabled)
- **Platforms**: Windows, macOS, Linux
- **Key Features**: 16 reusable UI components, Storybook documentation, user/researcher management

### Shared Packages
- **@iris/domain** - Shared TypeScript types and models
- **@iris/middleware** - Authentication and secure communication (4-phase handshake)
- **@iris/ui-components** - Shared components (future)

**Detailed Technology Stack**: See `docs/architecture/TECHNOLOGY_STACK.md`

---

## Quick Navigation Guide

### By Role

**New Developer** → Start Here:
1. Setup: `docs/setup/QUICK_START.md`
2. Architecture: `docs/architecture/ARCHITECTURE_OVERVIEW.md`
3. Development: `docs/development/DEVELOPMENT_GUIDE.md`

**Backend Integration** → Focus On:
- Middleware: `docs/api/MIDDLEWARE_API.md`
- Services: `docs/api/SERVICES_API.md`
- Authentication: `docs/features/AUTHENTICATION.md`

**Device Integration** → Focus On:
- Bluetooth Protocol: `docs/api/BLUETOOTH_COMMANDS.md`
- Device Communication: `docs/features/BLUETOOTH_INTEGRATION.md`
- Mobile App: `docs/development/MOBILE_APP_GUIDE.md`

**Desktop UI Development** → Focus On:
- Design System: `docs/development/DESIGN_SYSTEM.md`
- Component Library: `apps/desktop/src/design-system/components/`
- Storybook: `apps/desktop/src/stories/`

**AI Assistant (Claude Code)** → Reference:
- Documentation Standards: `docs/DOCUMENTATION_GUIDELINES.md`
- Code Patterns: `docs/development/CODE_PATTERNS.md`
- Architecture: `docs/architecture/`
- API Reference: `docs/api/`

### By Topic

**Architecture & Design**:
- `docs/architecture/ARCHITECTURE_OVERVIEW.md` - System design and components
- `docs/architecture/MONOREPO_STRUCTURE.md` - Project organization
- `docs/architecture/STATE_MANAGEMENT.md` - Context providers and data flow

**Development Workflows**:
- `docs/development/DEVELOPMENT_GUIDE.md` - Main development workflow
- `docs/development/CODE_PATTERNS.md` - Common patterns and examples
- `docs/development/TYPESCRIPT_PATTERNS.md` - TypeScript best practices

**API Reference**:
- `docs/api/BLUETOOTH_COMMANDS.md` - Complete Bluetooth protocol reference
- `docs/api/SERVICES_API.md` - Service layer API reference
- `docs/api/MIDDLEWARE_API.md` - Middleware API reference
- `docs/api/CONTEXT_API.md` - Context providers reference

**Features**:
- `docs/features/BLUETOOTH_INTEGRATION.md` - Device communication guide
- `docs/features/AUTHENTICATION.md` - Authentication implementation
- `docs/features/USER_MANAGEMENT.md` - User/researcher management
- `docs/features/DATA_VISUALIZATION.md` - Charts and real-time display

**Testing & Troubleshooting**:
- `docs/development/TESTING_GUIDE.md` - Testing strategy
- `docs/troubleshooting/COMMON_ISSUES.md` - Known issues and solutions
- `docs/troubleshooting/DEBUGGING_GUIDE.md` - Debugging tips

---

## Common Development Commands

### Monorepo Operations

```bash
# Install all dependencies (root + all workspaces)
npm install

# Type check all workspaces
npm run type-check:all

# Build all workspaces
npm run build:all
```

### Mobile App

```bash
# Start Expo dev server
npm run mobile

# Platform-specific development
npm run mobile:android    # Android emulator/device
npm run mobile:web        # Web browser
npm run mobile:ios        # iOS simulator (macOS only)
```

### Desktop App

```bash
# Development mode
npm run desktop           # Start Electron app

# Production builds
npm run desktop:build     # Build for current platform
npm run package           # Create installer (auto-detect platform)
npm run package:win       # Windows (NSIS installer)
npm run package:mac       # macOS (DMG)
npm run package:linux     # Linux (AppImage)

# Component documentation
cd apps/desktop && npm run storybook  # http://localhost:6006
```

**Complete Command Reference**: See `docs/development/COMMAND_REFERENCE.md`

---

## Project Directives (CRITICAL)

### 1. TypeScript Strict Mode

**REQUIRED**: TypeScript strict mode is mandatory. No `any` types allowed.

```typescript
// ✅ CORRECT: Explicit types
interface User {
    id: string;
    name: string;
}

function getUser(id: string): User { /* ... */ }

// ❌ INCORRECT: Using any
function getUser(id: any): any { /* ... */ }
```

**Reference**: `docs/development/TYPESCRIPT_PATTERNS.md`

### 2. Icon Usage

**ALL icons MUST use Heroicons library (@heroicons/react). NO custom SVG files.**

```typescript
// ✅ CORRECT: Import from Heroicons
import { UserIcon } from '@heroicons/react/24/outline';

// ❌ INCORRECT: Custom SVG
import CustomIcon from './assets/icon.svg';
```

**Variants**:
- `@heroicons/react/24/outline` - Outlined icons (default)
- `@heroicons/react/24/solid` - Filled icons
- `@heroicons/react/20/solid` - Mini icons (tight spaces)

**Reference**: `docs/development/ICON_USAGE.md`

### 3. Component Reuse

**ALWAYS check for existing components before creating new ones.**

Available Design System Components (Desktop):
- Button, Input, Dropdown, Password, SearchBar, ButtonGroup
- DataTable, Avatar, Sidebar, Header, AppLayout
- Modal, Toast, Typography, DatePicker

```bash
# Check available components
ls apps/desktop/src/design-system/components/
```

**DO**:
- ✅ Reuse existing components with different props
- ✅ Compose multiple components together
- ✅ Extend via composition, not duplication

**DON'T**:
- ❌ Create duplicate implementations
- ❌ Copy-paste component code
- ❌ Create similar components with different names

**Reference**: `docs/development/DESIGN_SYSTEM.md`

### 4. File Organization

**Standard structure for all components**:

```
component-name/
├── ComponentName.tsx        # Component logic
├── ComponentName.types.ts   # TypeScript interfaces
├── ComponentName.css        # Component styles
├── ComponentName.stories.tsx # Storybook stories
├── ComponentName.test.tsx   # Unit tests
├── README.md                # Component documentation
└── index.ts                 # Barrel export
```

**Naming Conventions**:
- Components: `PascalCase.tsx` (Button.tsx)
- Screens: `PascalCase + Screen.tsx` (LoginScreen.tsx)
- Hooks: `camelCase + use prefix` (useStreamData.ts)
- Types: `PascalCase + .types.ts` (Button.types.ts)

**Reference**: `docs/development/FILE_ORGANIZATION.md`

### 5. Documentation Standards

**All documentation MUST be written in English** and follow these standards:

- **Language**: English only (no Portuguese)
- **Location**: `/docs` directory in appropriate subdirectory
- **File Names**: `UPPERCASE_SNAKE_CASE.md`
- **Format**: Markdown with consistent styling
- **Quality**: Accurate, current, with code examples
- **Links**: Relative paths, prefer internal references

**Reference**: `docs/DOCUMENTATION_GUIDELINES.md`

### 6. Import Path Aliases

**Use `@/` alias for all imports within each app**:

```typescript
// ✅ CORRECT: Using path alias
import { Button } from '@/design-system/components/button';
import { useAuth } from '@/context/AuthContext';
import { User } from '@/types';

// ❌ INCORRECT: Relative paths
import { Button } from '../../../design-system/components/button';
```

**Configuration**: See `tsconfig.json` in each app

---

## Monorepo Structure

```
IRIS/
├── apps/
│   ├── mobile/              # React Native + Expo (Device control)
│   │   └── src/
│   │       ├── context/     # BluetoothContext
│   │       ├── screens/     # App screens
│   │       ├── components/  # UI components
│   │       └── hooks/       # Custom hooks
│   │
│   └── desktop/             # Electron + Vite + React (Data management)
│       └── src/
│           ├── design-system/    # 16 reusable UI components
│           ├── context/          # AuthContext
│           ├── screens/          # App screens
│           ├── services/         # API services (BaseService pattern)
│           ├── storage/          # Secure storage
│           └── stories/          # Storybook documentation
│
├── packages/
│   ├── domain/              # Shared TypeScript types
│   ├── middleware/          # Authentication & secure communication
│   └── ui-components/       # Shared UI components (future)
│
└── docs/                    # Comprehensive documentation
    ├── architecture/        # System design
    ├── development/         # Development guides
    ├── api/                 # API reference
    ├── features/            # Feature documentation
    ├── setup/               # Setup guides
    ├── troubleshooting/     # Problem-solving
    └── deployment/          # Build and deployment
```

**Detailed Structure**: See `docs/architecture/MONOREPO_STRUCTURE.md`

---

## Key Architectural Patterns

### Service Layer (Desktop App)

All services extend `BaseService` which provides:
- Dependency injection for middleware services
- Automatic session management (`ensureSession()`)
- Standardized error handling
- Debug logging

**Available Services**:
- `UserService` - User management with pagination
- `AuthService` - Authentication (RealAuthService adapter)

**Reference**: `docs/api/SERVICES_API.md`

### Bluetooth Protocol (Mobile App)

JSON-based protocol with 14 message codes for ESP32 communication:
- Connection management (handshake, status)
- FES control (parameters, session start/stop/pause/resume)
- sEMG streaming (configure, start/stop, receive data)

**Reference**: `docs/api/BLUETOOTH_COMMANDS.md`

### Authentication System

4-phase cryptographic handshake:
1. **Channel**: ECDH P-384 key exchange → AES-256-GCM encryption
2. **Identification**: X.509 certificates + SHA-256 fingerprints
3. **Authentication**: RSA-2048 challenge-response
4. **Session**: Bearer token (1-hour TTL with auto-refresh)

**Status**: ✅ Complete and tested (October 31, 2025)

**Reference**: `docs/features/AUTHENTICATION.md`

---

## Integration with PRISM Ecosystem

This application is part of the larger PRISM federated research framework:

- **Device**: Communicates with `InteroperableResearchsEMGDevice` (ESP32 firmware)
- **Backend**: Sends session data to `InteroperableResearchNode` API
- **Protocol Alignment**: Bluetooth message codes match ESP32 firmware specification

**Cross-Component Context**: See root `../CLAUDE.md` for complete ecosystem overview

---

## Documentation Index

### Essential Documentation

| Document | Purpose |
|----------|---------|
| `docs/README.md` | Main documentation hub with full navigation |
| `docs/architecture/ARCHITECTURE_OVERVIEW.md` | System design and components |
| `docs/development/DEVELOPMENT_GUIDE.md` | Main development workflow |
| `docs/api/BLUETOOTH_COMMANDS.md` | Complete Bluetooth protocol reference |
| `docs/api/SERVICES_API.md` | Service layer API reference |
| `docs/api/MIDDLEWARE_API.md` | Middleware API reference |

### Quick Links by Category

**Setup & Getting Started**:
- `docs/setup/QUICK_START.md` - Get up and running fast
- `docs/setup/ENVIRONMENT_SETUP.md` - Environment configuration
- `docs/setup/BLUETOOTH_SETUP.md` - Bluetooth development setup

**Development**:
- `docs/development/CODE_PATTERNS.md` - Common patterns and examples
- `docs/development/DESIGN_SYSTEM.md` - UI component library guide
- `docs/development/MOBILE_APP_GUIDE.md` - Mobile-specific development
- `docs/development/TESTING_GUIDE.md` - Testing strategy and tools

**Features**:
- `docs/features/BLUETOOTH_INTEGRATION.md` - Device communication guide
- `docs/features/USER_MANAGEMENT.md` - User/researcher management
- `docs/features/DATA_VISUALIZATION.md` - Charts and real-time display

**Troubleshooting**:
- `docs/troubleshooting/COMMON_ISSUES.md` - Known issues and solutions
- `docs/troubleshooting/DEBUGGING_GUIDE.md` - Debugging techniques
- `docs/troubleshooting/WINDOWS_LONG_PATH_FIX.md` - Windows path issues

**Implementation Status**:
- `docs/implementation/IMPLEMENTATION_SUMMARY.md` - Feature status and progress
- `IMPLEMENTATION_VERIFICATION_REPORT.md` - Authentication verification
- `AUTHENTICATION_FIXES.md` - Recent authentication fixes

---

## Current Development Status (November 2025)

**✅ Production-Ready**:
- Desktop App: Authentication, user management, 16 UI components
- Mobile App: Bluetooth protocol (14 message codes), real-time streaming, CSV export
- Middleware: 4-phase handshake, secure token storage, automatic refresh

**🚧 In Progress**:
- Backend integration for data submission
- Additional data management features
- Mobile app authentication integration

**📋 Planned**:
- Automated testing suite
- Performance monitoring
- Production certificate management

**Detailed Status**: See `docs/implementation/IMPLEMENTATION_SUMMARY.md`

---

## Getting Help

### Documentation Hub
Start at `docs/README.md` for complete documentation navigation.

### Common Issues
See `docs/troubleshooting/COMMON_ISSUES.md` for troubleshooting guide.

### Project Context
- This project: Current file (`IRIS/CLAUDE.md`)
- Backend: `../InteroperableResearchNode/CLAUDE.md`
- Device: `../InteroperableResearchsEMGDevice/CLAUDE.md`
- Master overview: `../CLAUDE.md`
