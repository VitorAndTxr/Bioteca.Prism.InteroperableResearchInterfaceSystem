# @iris/domain

**Shared Domain Models and Types for IRIS Applications**

> TypeScript types and interfaces used across the IRIS ecosystem (mobile and desktop applications). This package provides a single source of truth for domain models, ensuring type consistency across all applications.

**Version**: 0.1.0
**Last Updated**: 2025-01-31

---

## Overview

The `@iris/domain` package contains shared TypeScript types and interfaces that define the core domain models for the IRIS (Interoperable Research Interface System) project. These types are used by both the mobile app (React Native) and desktop app (Electron) to ensure type safety and consistency.

### Package Philosophy

- **Single Source of Truth**: All domain types defined in one place
- **Platform Agnostic**: Types work across React Native and Electron
- **Strict TypeScript**: No `any` types, comprehensive interfaces
- **Minimal Dependencies**: Pure TypeScript, no runtime dependencies
- **Backend Alignment**: Types match InteroperableResearchNode API contracts

---

## Installation

This package is part of the IRIS monorepo and is automatically available to workspace applications:

```json
{
  "dependencies": {
    "@iris/domain": "workspace:*"
  }
}
```

---

## Exported Models

### Authentication & Authorization

**Auth.ts** - Authentication and user session types

```typescript
import {
    LoginCredentials,
    LoginResponse,
    RegistrationData,
    AuthState,
    AuthError,
    AuthErrorCode,
    PasswordResetRequest,
    PasswordResetConfirmation,
    SessionInfo
} from '@iris/domain';
```

**Types:**
- `LoginCredentials` - User login data (email, password, rememberMe)
- `LoginResponse` - Backend login response (user, token, expiresAt)
- `RegistrationData` - User registration payload
- `AuthState` - Authentication state enum (authenticated, unauthenticated, loading, error)
- `AuthError` - Standardized error format (code, message, details)
- `AuthErrorCode` - Error code enumeration
- `PasswordResetRequest` - Password reset request
- `PasswordResetConfirmation` - Password reset confirmation
- `SessionInfo` - Session information (token, expiresAt, issuedAt, rememberMe)

### User Management

**User.ts** - User and role definitions

```typescript
import { User, UserRole } from '@iris/domain';
```

**Types:**
- `User` - User entity
  - `id: string` - Unique identifier
  - `login: string` - Username/email
  - `role: UserRole` - User role
  - `researcher?: Researcher` - Associated researcher (optional)
  - `createdAt?: Date` - Creation timestamp
  - `updatedAt?: Date` - Last update timestamp
  - `lastLogin?: Date` - Last login timestamp
- `UserRole` - User role enum
  - `ADMIN` - System administrator
  - `RESEARCHER` - Research staff
  - `CLINICIAN` - Clinical staff
  - `VIEWER` - Read-only access

**Researcher.ts** - Researcher and research associations

```typescript
import { Researcher, ResearcherRole, ResearcherResearch } from '@iris/domain';
```

**Types:**
- `Researcher` - Researcher entity
  - `researcherId: string` - Unique identifier
  - `researchNodeId: string` - Associated node ID
  - `name: string` - Full name
  - `email: string` - Email address
  - `institution: string` - Institution name
  - `role: ResearcherRole` - Researcher role
  - `orcid: string` - ORCID identifier
  - `researches?: ResearcherResearch[]` - Associated research projects
- `ResearcherRole` - Researcher role enum
  - `CHIEF` - Chief researcher (principal investigator)
  - `RESEARCHER` - Research staff
- `ResearcherResearch` - Research association
  - `researchId: string` - Research project ID
  - `researchTitle: string` - Research project title
  - `isPrincipal: boolean` - Whether researcher is principal investigator

### Pagination

**Pagination.ts** - Pagination request and response types

```typescript
import {
    PaginationRequest,
    PaginationResponse,
    PaginatedResponse
} from '@iris/domain';
```

**Types:**
- `PaginationRequest` - Request pagination parameters
  - `page: number` - Page number (1-indexed)
  - `pageSize: number` - Items per page
- `PaginationResponse` - Response pagination metadata
  - `currentRecord: number` - Current page number
  - `pageSize: number` - Items per page
  - `totalRecords: number` - Total number of records
- `PaginatedResponse<T>` - Generic paginated response wrapper
  - `data: T[]` - Array of items
  - `pagination: PaginationResponse` - Pagination metadata

### Bluetooth Protocol (Mobile)

**Bluetooth.ts** - Bluetooth device protocol types

```typescript
import {
    BluetoothDevice,
    BluetoothConnectionStatus,
    NeuraXBluetoothProtocolFunctionEnum,
    NeuraXBluetoothProtocolMethodEnum,
    NeuraXBluetoothProtocolBodyPropertyEnum,
    NeuraXBluetoothProtocolPayload
} from '@iris/domain';
```

**Types:**
- `BluetoothDevice` - Bluetooth device representation
- `BluetoothConnectionStatus` - Connection status enum
- `NeuraXBluetoothProtocolFunctionEnum` - Message codes (0-14)
- `NeuraXBluetoothProtocolMethodEnum` - Methods (READ, WRITE, EXECUTE, ACK)
- `NeuraXBluetoothProtocolBodyPropertyEnum` - Parameter keys
- `NeuraXBluetoothProtocolPayload` - Message payload structure

### Device & Session Management (Mobile)

**Device.ts** - Device management types

```typescript
import { Device, DeviceStatus } from '@iris/domain';
```

**Session.ts** - Session management types

```typescript
import { Session, SessionStatus, FESParameters } from '@iris/domain';
```

### Streaming Data (Mobile)

**Stream.ts** - Real-time streaming types

```typescript
import {
    StreamConfig,
    StreamType,
    StreamData,
    StreamPacket
} from '@iris/domain';
```

**Types:**
- `StreamConfig` - Streaming configuration (rate, type)
- `StreamType` - Data type enum (raw, filtered, rms)
- `StreamData` - Stream metadata
- `StreamPacket` - Data packet (timestamp, values)

### Medical Terminology

**Snomed.ts** - SNOMED CT medical terminology types

```typescript
import { SnomedConcept, SnomedCode } from '@iris/domain';
```

---

## Usage Examples

### Authentication

```typescript
import { LoginCredentials, LoginResponse, AuthErrorCode } from '@iris/domain';

const credentials: LoginCredentials = {
    email: 'researcher@example.com',
    password: 'SecurePassword123',
    rememberMe: true
};

try {
    const response: LoginResponse = await authService.login(credentials);
    console.log('Logged in:', response.user.login);
    console.log('Token expires:', response.expiresAt);
} catch (error) {
    if (error.code === AuthErrorCode.INVALID_CREDENTIALS) {
        console.error('Invalid credentials');
    }
}
```

### User Management

```typescript
import { User, UserRole, Researcher } from '@iris/domain';

const user: User = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    login: 'researcher@example.com',
    role: UserRole.RESEARCHER,
    researcher: {
        researcherId: 'abc-123',
        researchNodeId: 'node-001',
        name: 'Dr. Jane Smith',
        email: 'jane.smith@example.com',
        institution: 'University Hospital',
        role: ResearcherRole.CHIEF,
        orcid: '0000-0001-2345-6789'
    },
    createdAt: new Date('2025-01-31'),
    updatedAt: new Date('2025-01-31')
};

// Type-safe role checking
if (user.role === UserRole.ADMIN) {
    console.log('User has admin privileges');
}

// Type-safe researcher access
if (user.researcher?.role === ResearcherRole.CHIEF) {
    console.log('User is a chief researcher');
}
```

### Pagination

```typescript
import { PaginatedResponse, PaginationRequest, User } from '@iris/domain';

const request: PaginationRequest = {
    page: 1,
    pageSize: 10
};

const response: PaginatedResponse<User> = await userService.getUsers(
    request.page,
    request.pageSize
);

console.log(`Showing ${response.data.length} users`);
console.log(`Total: ${response.pagination.totalRecords}`);
console.log(`Page ${response.pagination.currentRecord} of ${Math.ceil(response.pagination.totalRecords / response.pagination.pageSize)}`);

response.data.forEach(user => {
    console.log(`- ${user.login} (${user.role})`);
});
```

### Bluetooth Protocol (Mobile)

```typescript
import {
    NeuraXBluetoothProtocolFunctionEnum,
    NeuraXBluetoothProtocolMethodEnum,
    NeuraXBluetoothProtocolPayload
} from '@iris/domain';

// Start session command
const startSession: NeuraXBluetoothProtocolPayload = {
    cd: NeuraXBluetoothProtocolFunctionEnum.StartSession,
    mt: NeuraXBluetoothProtocolMethodEnum.EXECUTE
};

// Configure FES parameters
const configFES: NeuraXBluetoothProtocolPayload = {
    cd: NeuraXBluetoothProtocolFunctionEnum.FesParam,
    mt: NeuraXBluetoothProtocolMethodEnum.WRITE,
    bd: {
        a: 7.0,   // Amplitude (V)
        f: 60,    // Frequency (Hz)
        pw: 300,  // Pulse width (μs)
        df: 5,    // Difficulty (%)
        pd: 2     // Duration (s)
    }
};
```

### Streaming (Mobile)

```typescript
import { StreamConfig, StreamType, StreamPacket } from '@iris/domain';

const config: StreamConfig = {
    rate: 100,               // 100 Hz
    type: StreamType.FILTERED // Filtered sEMG data
};

// Handle incoming stream packet
const packet: StreamPacket = {
    timestamp: 12345,
    values: [23.4, 25.1, 22.8, 24.5, 26.0]
};

console.log(`Received ${packet.values.length} samples at t=${packet.timestamp}ms`);
```

---

## Type Safety Guidelines

### 1. Always Use Domain Types

```typescript
// ✅ GOOD: Using domain types
import { User, UserRole } from '@iris/domain';

function getUserName(user: User): string {
    return user.login;
}

// ❌ BAD: Using any
function getUserName(user: any): any {
    return user.login;
}
```

### 2. Leverage Enums for Type Safety

```typescript
// ✅ GOOD: Enum usage
import { UserRole } from '@iris/domain';

if (user.role === UserRole.ADMIN) {
    // Type-safe comparison
}

// ❌ BAD: String literals
if (user.role === 'admin') {
    // Prone to typos
}
```

### 3. Use Generic Types

```typescript
// ✅ GOOD: Generic pagination
import { PaginatedResponse, User } from '@iris/domain';

const users: PaginatedResponse<User> = await getUsers();
const researches: PaginatedResponse<Research> = await getResearches();

// Type inference works correctly
users.data.forEach(u => console.log(u.login));      // u is User
researches.data.forEach(r => console.log(r.title)); // r is Research
```

### 4. Optional Chaining with Optional Fields

```typescript
import { User } from '@iris/domain';

const user: User = getUser();

// ✅ GOOD: Safe optional access
const researcherName = user.researcher?.name ?? 'N/A';
const orcid = user.researcher?.orcid;

// ❌ BAD: Direct access (may throw)
const researcherName = user.researcher.name; // Error if researcher is undefined
```

---

## Development

### Adding New Domain Models

1. **Create Model File**:
   ```bash
   touch packages/domain/src/models/MyModel.ts
   ```

2. **Define Types**:
   ```typescript
   // packages/domain/src/models/MyModel.ts
   export interface MyModel {
       id: string;
       name: string;
       status: MyModelStatus;
   }

   export enum MyModelStatus {
       ACTIVE = 'active',
       INACTIVE = 'inactive'
   }
   ```

3. **Export from Index**:
   ```typescript
   // packages/domain/src/index.ts
   export * from './models/MyModel';
   ```

4. **Update Documentation**:
   - Add model to this README
   - Document usage examples
   - Update API docs if applicable

### Type Checking

```bash
# Type check domain package
cd packages/domain
npm run type-check

# Type check all workspaces
cd ../..
npm run type-check:all
```

---

## File Structure

```
packages/domain/
├── src/
│   ├── models/
│   │   ├── Auth.ts           # Authentication types
│   │   ├── User.ts           # User and UserRole
│   │   ├── Researcher.ts     # Researcher types
│   │   ├── Pagination.ts     # Pagination types
│   │   ├── Bluetooth.ts      # Bluetooth protocol
│   │   ├── Device.ts         # Device management
│   │   ├── Session.ts        # Session management
│   │   ├── Stream.ts         # Streaming data
│   │   └── Snomed.ts         # Medical terminology
│   └── index.ts              # Barrel exports
├── package.json
├── tsconfig.json
└── README.md                 # This file
```

---

## Dependencies

**Runtime**: None (pure TypeScript types)

**Development**:
- `typescript` ~5.9.2 - Type definitions and compilation

---

## See Also

- **Main Documentation**: [../../docs/README.md](../../docs/README.md)
- **Services API**: [../../docs/api/SERVICES_API.md](../../docs/api/SERVICES_API.md) - How services use domain types
- **Middleware API**: [../../docs/api/MIDDLEWARE_API.md](../../docs/api/MIDDLEWARE_API.md) - Authentication and communication
- **CLAUDE.md**: [../../CLAUDE.md](../../CLAUDE.md) - Project context for AI assistants

---

**Last Updated**: 2025-01-31
**Maintained by**: IRIS Development Team
