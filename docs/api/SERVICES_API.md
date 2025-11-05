# Services API Reference

**IRIS Desktop Application Service Layer**

> Complete API reference for the service layer architecture that provides standardized interaction with the InteroperableResearchNode backend.

**Last Updated**: 2025-01-31
**Status**: Active Development
**Audience**: Developers

---

## Table of Contents

- [Overview](#overview)
- [BaseService Abstract Class](#baseservice-abstract-class)
- [UserService](#userservice)
- [Creating Custom Services](#creating-custom-services)
- [Error Handling](#error-handling)
- [Type Definitions](#type-definitions)
- [Examples](#examples)

---

## Overview

The IRIS service layer provides a standardized pattern for implementing business logic that communicates with the InteroperableResearchNode backend. All services extend `BaseService` which handles:

- **Middleware Integration**: Automatic 4-phase handshake
- **Session Management**: Automatic session establishment
- **Error Handling**: Standardized error conversion
- **Type Safety**: Domain model and DTO conversion
- **Logging**: Debug logging with service identifiers

### Architecture

```
┌─────────────────────────────────────┐
│      Application Components         │
│    (Screens, Contexts, Hooks)       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Service Layer                │
│  (UserService, ResearchService...)   │
│         extends BaseService          │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Middleware Services             │
│  (HttpClient, SessionManager...)     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   InteroperableResearchNode API      │
│      (Backend REST Endpoints)        │
└──────────────────────────────────────┘
```

---

## BaseService Abstract Class

**File**: `apps/desktop/src/services/BaseService.ts`

### Description

Abstract base class that all services must extend. Provides common middleware interaction patterns, error handling, and session management.

### Constructor

```typescript
constructor(
    services: MiddlewareServices,
    options?: BaseServiceOptions
)
```

**Parameters:**
- `services` (`MiddlewareServices`) - Container with all middleware services
- `options` (`BaseServiceOptions`) - Optional configuration
  - `serviceName` (`string`) - Service name for logging (default: class name)
  - `debug` (`boolean`) - Enable debug logging (default: false)

### Protected Methods

#### `handleMiddlewareError<T>(operation: () => Promise<T>): Promise<T>`

Wraps async operations with error handling. Converts middleware errors to domain `AuthError` format.

**Parameters:**
- `operation` - Async function to execute

**Returns:**
- Result of the operation

**Throws:**
- `AuthError` - Standardized error with code and message

**Example:**
```typescript
async myMethod() {
    return this.handleMiddlewareError(async () => {
        // Your logic here
        return result;
    });
}
```

#### `ensureSession(): Promise<void>`

Ensures the middleware has an active session (4-phase handshake complete) before making API calls.

**Example:**
```typescript
await this.ensureSession();
const response = await this.middleware.invoke(...);
```

#### `convertToAuthError(error: unknown): AuthError`

Converts any error to domain `AuthError` format. Override to provide service-specific error mapping.

**Parameters:**
- `error` - Original error from middleware

**Returns:**
- `AuthError` - Converted domain error

**Example:**
```typescript
protected convertToAuthError(error: unknown): AuthError {
    if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (message.includes('user not found')) {
            return this.createAuthError(
                AuthErrorCode.USER_NOT_FOUND,
                'User not found'
            );
        }
    }
    return super.convertToAuthError(error);
}
```

#### `createAuthError(code: AuthErrorCode, message: string, details?: unknown): AuthError`

Helper to create `AuthError` objects.

**Parameters:**
- `code` - Error code from `AuthErrorCode` enum
- `message` - Human-readable error message
- `details` - Optional additional error details

**Returns:**
- `AuthError` object

#### `log(message: string, ...data: unknown[]): void`

Logs debug messages (only if `debug: true`).

**Parameters:**
- `message` - Log message
- `data` - Optional data to log

#### `logError(message: string, error: unknown): void`

Logs error messages (always enabled).

**Parameters:**
- `message` - Error message
- `error` - Error object

### Lifecycle Methods

#### `initialize(): Promise<void>`

Override to perform service-specific initialization. Called after construction.

#### `dispose(): Promise<void>`

Override to perform cleanup when service is destroyed.

### Utility Methods

#### `getMiddlewareStatus(): string`

Returns current middleware status (`'idle'`, `'channel-ready'`, `'session-ready'`).

#### `hasActiveSession(): boolean`

Returns `true` if middleware is in session-ready state.

### Protected Properties

- `middleware` - `ResearchNodeMiddleware` instance
- `httpClient` - `HttpClient` for encrypted communication
- `cryptoDriver` - `CryptoDriver` for cryptographic operations
- `channelManager` - `ChannelManager` for Phase 1
- `sessionManager` - `SessionManager` for Phase 4
- `storage` - `SecureStorage` for persisting data
- `serviceName` - Service name for logging
- `debug` - Debug mode flag

---

## UserService

**File**: `apps/desktop/src/services/UserService.ts`

### Description

Service for managing users in the InteroperableResearchNode. Provides methods for listing users with pagination and creating new users.

### Constructor

```typescript
constructor(services: MiddlewareServices)
```

**Example:**
```typescript
import { getMiddlewareServices } from '@/services/middleware';
import { UserService } from '@/services/UserService';

const services = getMiddlewareServices();
const userService = new UserService(services);
```

### Methods

#### `getUsers(page?: number, pageSize?: number): Promise<PaginatedResponse<User>>`

Get paginated list of users from the backend.

**Parameters:**
- `page` (`number`) - Page number (1-indexed, default: 1)
- `pageSize` (`number`) - Items per page (default: 10, max: 100)

**Returns:**
- `PaginatedResponse<User>` - Object containing:
  - `data` (`User[]`) - Array of user objects
  - `pagination` (`PaginationResponse`) - Pagination metadata
    - `currentRecord` (`number`) - Current page number
    - `pageSize` (`number`) - Items per page
    - `totalRecords` (`number`) - Total number of records

**Throws:**
- `AuthError` - If request fails or session is invalid

**Example:**
```typescript
const { data, pagination } = await userService.getUsers(1, 10);

console.log(`Showing ${data.length} of ${pagination.totalRecords} users`);
console.log(`Page ${pagination.currentRecord} of ${Math.ceil(pagination.totalRecords / pagination.pageSize)}`);

data.forEach(user => {
    console.log(`${user.login} (${user.role})`);
    if (user.researcher) {
        console.log(`  Researcher: ${user.researcher.name}`);
    }
});
```

**Backend Endpoint:**
- `GET /api/user/GetUsers?page=1&pageSize=10`

**Response Format (camelCase):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "login": "researcher@example.com",
      "role": "researcher",
      "createdAt": "2025-01-31T10:00:00Z",
      "updatedAt": "2025-01-31T10:00:00Z",
      "researcher": {
        "name": "Dr. Jane Smith",
        "email": "jane.smith@example.com",
        "role": "chief_researcher",
        "orcid": "0000-0001-2345-6789"
      }
    }
  ],
  "currentPage": 1,
  "pageSize": 10,
  "totalRecords": 42,
  "totalPages": 5
}
```

#### `createUser(userData: NewUserData): Promise<User>`

Create a new user in the backend.

**Parameters:**
- `userData` (`NewUserData`) - User creation data:
  - `login` (`string`) - User login/username (max 100 chars, required)
  - `password` (`string`) - User password (min 8 chars, required)
  - `role` (`UserRole`) - User role enum (required)
  - `researcherId` (`string`) - Associated researcher ID (optional)

**Returns:**
- `User` - Created user object

**Throws:**
- `AuthError` - If validation fails or backend returns error
  - `invalid_request` - Invalid input data
  - `user_already_exists` - User with login already exists
  - `not_found` - Researcher ID not found

**Example:**
```typescript
import { UserRole } from '@iris/domain';

const newUser = await userService.createUser({
    login: 'researcher@example.com',
    password: 'SecurePassword123',
    role: UserRole.RESEARCHER,
    researcherId: 'abc-123-def-456'
});

console.log(`Created user: ${newUser.id}`);
console.log(`Login: ${newUser.login}`);
console.log(`Role: ${newUser.role}`);
```

**Backend Endpoint:**
- `POST /api/user/New`

**Request Format (PascalCase):**
```json
{
  "Login": "researcher@example.com",
  "Password": "SecurePassword123",
  "Role": "researcher",
  "ResearcherId": "abc-123-def-456"
}
```

**Response Format (camelCase):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "login": "researcher@example.com",
  "role": "researcher",
  "createdAt": "2025-01-31T10:00:00Z",
  "updatedAt": "2025-01-31T10:00:00Z",
  "researcher": {
    "name": "Dr. Jane Smith",
    "email": "jane.smith@example.com",
    "role": "chief_researcher",
    "orcid": "0000-0001-2345-6789"
  }
}
```

**Validation Rules:**
- `login`: Required, non-empty, max 100 characters
- `password`: Required, min 8 characters
- `role`: Required, must be valid `UserRole` enum value
- `researcherId`: Optional, must exist if provided

---

## Creating Custom Services

### Step-by-Step Guide

#### 1. Create Service File

Create a new file in `apps/desktop/src/services/`:

```typescript
// apps/desktop/src/services/MyService.ts
import { BaseService, type MiddlewareServices } from './BaseService';
import type { MyDomainModel, PaginatedResponse } from '@iris/domain';

export class MyService extends BaseService {
    constructor(services: MiddlewareServices) {
        super(services, {
            serviceName: 'MyService',
            debug: true // Enable for development
        });
    }

    async initialize(): Promise<void> {
        this.log('MyService initialized');
    }

    async dispose(): Promise<void> {
        this.log('MyService disposed');
    }
}
```

#### 2. Add Service Methods

```typescript
async getItems(page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<MyDomainModel>> {
    return this.handleMiddlewareError(async () => {
        this.log(`Fetching items (page: ${page}, pageSize: ${pageSize})`);

        // Ensure session
        await this.ensureSession();

        // Prepare query parameters
        const queryParams = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString()
        });

        // Call backend
        const response = await this.middleware.invoke<Record<string, unknown>, MiddlewarePaginatedResponse<MiddlewareDTO>>({
            path: `/api/myendpoint?${queryParams.toString()}`,
            method: 'GET',
            payload: {}
        });

        // Convert to domain types
        const items = (response.data || []).map(this.convertToDomain.bind(this));

        return {
            data: items,
            pagination: {
                currentRecord: response.currentPage || 0,
                pageSize: response.pageSize || items.length,
                totalRecords: response.totalRecords || items.length
            }
        };
    });
}
```

#### 3. Define DTOs (Middleware Types)

```typescript
// Internal to service file
interface MiddlewareDTO {
    id: string;
    name: string;
    createdAt: string;
}

interface MiddlewarePaginatedResponse<T> {
    data?: T[];
    currentPage?: number;
    pageSize?: number;
    totalRecords?: number;
    totalPages?: number;
}
```

#### 4. Implement DTO Conversion

```typescript
private convertToDomain(dto: MiddlewareDTO): MyDomainModel {
    return {
        id: dto.id,
        name: dto.name,
        createdAt: new Date(dto.createdAt)
    };
}
```

#### 5. Override Error Handling (Optional)

```typescript
protected convertToAuthError(error: unknown): AuthError {
    if (error instanceof Error) {
        const message = error.message.toLowerCase();

        if (message.includes('item not found')) {
            return this.createAuthError(
                'not_found' as AuthErrorCode,
                'Item not found'
            );
        }

        if (message.includes('invalid payload')) {
            return this.createAuthError(
                'invalid_request' as AuthErrorCode,
                'Invalid item data provided'
            );
        }
    }

    // Fall back to base error conversion
    return super.convertToAuthError(error);
}
```

#### 6. Register Service in Middleware

```typescript
// apps/desktop/src/services/middleware.ts
import { MyService } from './MyService';

let myServiceInstance: MyService | null = null;

export function getMyService(): MyService {
    if (!myServiceInstance) {
        const services = getMiddlewareServices();
        myServiceInstance = new MyService(services);
    }
    return myServiceInstance;
}
```

---

## Error Handling

### Error Flow

```
Service Method
    ↓
handleMiddlewareError()
    ↓
[Operation throws error]
    ↓
convertToAuthError()
    ↓
[Custom error mapping or base mapping]
    ↓
AuthError thrown to caller
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `invalid_credentials` | Invalid username/password | 401 |
| `user_not_found` | User does not exist | 404 |
| `user_already_exists` | User with login already exists | 409 |
| `unauthorized` | No valid session | 401 |
| `token_expired` | Session token expired | 401 |
| `network_error` | Network or fetch error | 0 |
| `invalid_request` | Invalid input data | 400 |
| `not_found` | Resource not found | 404 |
| `server_error` | Unknown server error | 500 |

### Error Handling Example

```typescript
import { UserService } from '@/services/UserService';
import { AuthErrorCode } from '@iris/domain';

const userService = getUserService();

try {
    const users = await userService.getUsers(1, 10);
    console.log('Users:', users);
} catch (error) {
    if (error.code === AuthErrorCode.UNAUTHORIZED) {
        // Redirect to login
        navigate('/login');
    } else if (error.code === AuthErrorCode.NETWORK_ERROR) {
        // Show offline message
        showToast('Network error. Please check your connection.');
    } else {
        // Generic error
        showToast(`Error: ${error.message}`);
    }
}
```

---

## Type Definitions

### MiddlewareServices

Container for all middleware components.

```typescript
interface MiddlewareServices {
    middleware: ResearchNodeMiddleware;
    httpClient: HttpClient;
    cryptoDriver: CryptoDriver;
    channelManager: ChannelManager;
    sessionManager: SessionManager;
    storage: SecureStorage;
}
```

### BaseServiceOptions

Configuration for BaseService.

```typescript
interface BaseServiceOptions {
    serviceName?: string;  // Service name for logging
    debug?: boolean;       // Enable debug logging
}
```

### PaginatedResponse<T>

Generic paginated response wrapper.

```typescript
interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationResponse;
}
```

### PaginationResponse

Pagination metadata.

```typescript
interface PaginationResponse {
    currentRecord: number;  // Current page number
    pageSize: number;       // Items per page
    totalRecords: number;   // Total number of records
}
```

### User

User domain model.

```typescript
interface User {
    id: string;
    login: string;
    role: UserRole;
    researcher?: Researcher;
    createdAt?: Date;
    updatedAt?: Date;
    lastLogin?: Date;
}
```

### UserRole

User role enumeration.

```typescript
enum UserRole {
    ADMIN = 'admin',
    RESEARCHER = 'researcher',
    CLINICIAN = 'clinician',
    VIEWER = 'viewer'
}
```

### NewUserData

User creation payload.

```typescript
interface NewUserData {
    login: string;
    password: string;
    role: UserRole;
    researcherId?: string;
}
```

### Researcher

Researcher domain model.

```typescript
interface Researcher {
    researcherId: string;
    researchNodeId: string;
    name: string;
    email: string;
    institution: string;
    role: ResearcherRole;
    orcid: string;
    researches?: ResearcherResearch[];
}
```

### ResearcherRole

Researcher role enumeration.

```typescript
enum ResearcherRole {
    CHIEF = 'chief_researcher',
    RESEARCHER = 'researcher'
}
```

### AuthError

Standardized error format.

```typescript
interface AuthError {
    code: AuthErrorCode;
    message: string;
    details?: any;
}
```

---

## Examples

### Complete Service Implementation

```typescript
// apps/desktop/src/services/ResearchService.ts
import { BaseService, type MiddlewareServices } from './BaseService';
import type { Research, PaginatedResponse, AuthError, AuthErrorCode } from '@iris/domain';

interface MiddlewareResearchDTO {
    id: string;
    title: string;
    description: string;
    status: string;
    createdAt: string;
}

interface MiddlewarePaginatedResponse<T> {
    data?: T[];
    currentPage?: number;
    pageSize?: number;
    totalRecords?: number;
}

export class ResearchService extends BaseService {
    constructor(services: MiddlewareServices) {
        super(services, { serviceName: 'ResearchService', debug: true });
    }

    async getResearches(page: number = 1, pageSize: number = 10): Promise<PaginatedResponse<Research>> {
        return this.handleMiddlewareError(async () => {
            this.log(`Fetching researches (page: ${page}, pageSize: ${pageSize})`);

            await this.ensureSession();

            const queryParams = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString()
            });

            const response = await this.middleware.invoke<Record<string, unknown>, MiddlewarePaginatedResponse<MiddlewareResearchDTO>>({
                path: `/api/research/GetResearches?${queryParams.toString()}`,
                method: 'GET',
                payload: {}
            });

            const researches = (response.data || []).map(this.convertToResearch.bind(this));

            return {
                data: researches,
                pagination: {
                    currentRecord: response.currentPage || 0,
                    pageSize: response.pageSize || researches.length,
                    totalRecords: response.totalRecords || researches.length
                }
            };
        });
    }

    private convertToResearch(dto: MiddlewareResearchDTO): Research {
        return {
            id: dto.id,
            title: dto.title,
            description: dto.description,
            status: dto.status as any,
            createdAt: new Date(dto.createdAt)
        };
    }

    protected convertToAuthError(error: unknown): AuthError {
        if (error instanceof Error) {
            const message = error.message.toLowerCase();

            if (message.includes('research not found')) {
                return this.createAuthError(
                    'not_found' as AuthErrorCode,
                    'Research project not found'
                );
            }
        }

        return super.convertToAuthError(error);
    }
}
```

### Using Service in React Component

```typescript
// apps/desktop/src/screens/Researches/ResearchesScreen.tsx
import React, { useEffect, useState } from 'react';
import { getResearchService } from '@/services/middleware';
import type { Research, PaginatedResponse } from '@iris/domain';

export function ResearchesScreen() {
    const [researches, setResearches] = useState<Research[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const researchService = getResearchService();

    useEffect(() => {
        loadResearches();
    }, [page]);

    const loadResearches = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await researchService.getResearches(page, 10);

            setResearches(response.data);
            setTotalPages(Math.ceil(response.pagination.totalRecords / response.pagination.pageSize));
        } catch (err) {
            setError(err.message || 'Failed to load researches');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Research Projects</h1>
            <ul>
                {researches.map(research => (
                    <li key={research.id}>
                        <h3>{research.title}</h3>
                        <p>{research.description}</p>
                        <span>Status: {research.status}</span>
                    </li>
                ))}
            </ul>
            <div>
                <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                    Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                    Next
                </button>
            </div>
        </div>
    );
}
```

---

## See Also

- **Implementation Summary**: [docs/implementation/IMPLEMENTATION_SUMMARY.md](../implementation/IMPLEMENTATION_SUMMARY.md#3-service-layer-architecture--user-management)
- **CLAUDE.md Service Section**: [CLAUDE.md#service-layer-architecture-desktop](../../CLAUDE.md#service-layer-architecture-desktop)
- **Middleware API**: [docs/api/MIDDLEWARE_API.md](./MIDDLEWARE_API.md)
- **Domain Models**: `packages/domain/src/models/`
- **BaseService**: `apps/desktop/src/services/BaseService.ts`
- **UserService**: `apps/desktop/src/services/UserService.ts`

---

**Last Updated**: 2025-01-31
**Maintained by**: Claude Code (AI Assistant)
