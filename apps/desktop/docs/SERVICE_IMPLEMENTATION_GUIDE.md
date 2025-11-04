# Service Implementation Guide

**Guide for implementing new services that consume the InteroperableResearchNode middleware**

---

## Overview

This guide explains how to create new services that communicate with the InteroperableResearchNode backend using the established middleware pattern. All services that need to interact with the backend should extend the `BaseService` class, which provides:

- Access to middleware components (HttpClient, CryptoDriver, Middleware, etc.)
- Common error handling patterns
- Lifecycle management (initialize/dispose)
- Type conversion utilities
- Consistent logging

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Creating a New Service](#creating-a-new-service)
3. [Service Lifecycle](#service-lifecycle)
4. [Error Handling](#error-handling)
5. [Using Middleware Components](#using-middleware-components)
6. [Complete Example: ResearchProjectService](#complete-example-researchprojectservice)
7. [Integration with Application](#integration-with-application)
8. [Best Practices](#best-practices)

---

## Architecture Overview

### Middleware Stack

```
┌─────────────────────────────────────────┐
│        Application Layer                 │
│  (React Components, Screens, Contexts)   │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│        Your Service                      │
│  (extends BaseService)                   │
│  - Domain-specific logic                 │
│  - Type conversion                       │
│  - Business rules                        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│        BaseService                       │
│  - Middleware access                     │
│  - Error handling                        │
│  - Lifecycle management                  │
└──────┬───────┬──────┬──────┬────────────┘
       │       │      │      │
    ┌──▼───┐ ┌▼────┐ ┌▼────┐ ┌▼─────────┐
    │HTTP  │ │Crypto│ │Chan.│ │Session   │
    │Client│ │Driver│ │Mgr. │ │Manager   │
    └──────┘ └──────┘ └─────┘ └──────────┘
       │       │      │      │
       └───────┼──────┴──────┘
               │
┌──────────────▼──────────────────────────┐
│    InteroperableResearchNode             │
│    (Backend API)                         │
└──────────────────────────────────────────┘
```

### Key Components

1. **BaseService** (`apps/desktop/src/services/BaseService.ts`)
   - Abstract base class for all services
   - Provides middleware component access
   - Common error handling and logging

2. **MiddlewareServices** (Type definition)
   - Container for all middleware components
   - Injected into services via constructor

3. **middleware.ts** (`apps/desktop/src/services/middleware.ts`)
   - Initializes all middleware components
   - Creates and exports the `middlewareServices` container
   - Manages singleton instances

---

## Creating a New Service

### Step 1: Create Service File

Create a new file in `apps/desktop/src/services/` for your service:

```typescript
// apps/desktop/src/services/ResearchProjectService.ts

import { BaseService, type MiddlewareServices } from './BaseService';
import type { AuthError, AuthErrorCode } from '@iris/domain';

/**
 * Research Project Service
 *
 * Handles all operations related to research projects in the PRISM system.
 */
export class ResearchProjectService extends BaseService {
    /**
     * Constructor
     *
     * @param services - Middleware services container
     */
    constructor(services: MiddlewareServices) {
        super(services, {
            serviceName: 'ResearchProjectService',
            debug: false // Set to true for development
        });
    }

    /**
     * Initialize service
     */
    async initialize(): Promise<void> {
        this.log('Initializing ResearchProjectService');
        // Perform any service-specific initialization here
        // e.g., load cached data, verify permissions, etc.
    }

    /**
     * Cleanup service resources
     */
    async dispose(): Promise<void> {
        this.log('Disposing ResearchProjectService');
        // Cleanup any resources (subscriptions, timers, etc.)
    }

    // Your service methods go here...
}
```

### Step 2: Implement Service Methods

Add your domain-specific methods:

```typescript
/**
 * Get all research projects
 */
async getAllProjects(): Promise<ResearchProject[]> {
    return this.handleMiddlewareError(async () => {
        // Ensure we have an authenticated session
        await this.ensureSession();

        // Call backend API via middleware
        const response = await this.middleware.invoke<{ projects: unknown[] }>({
            endpoint: '/api/research-projects',
            method: 'GET'
        });

        // Convert middleware response to domain types
        return response.projects.map(this.convertToResearchProject);
    });
}

/**
 * Create new research project
 */
async createProject(data: CreateProjectData): Promise<ResearchProject> {
    return this.handleMiddlewareError(async () => {
        await this.ensureSession();

        const response = await this.middleware.invoke<{ project: unknown }>({
            endpoint: '/api/research-projects',
            method: 'POST',
            data
        });

        return this.convertToResearchProject(response.project);
    });
}

/**
 * Convert middleware response to domain type
 */
private convertToResearchProject(data: unknown): ResearchProject {
    // Type conversion logic
    // ...
    return {
        id: data.id,
        name: data.name,
        // ... other fields
    };
}
```

### Step 3: Register Service in middleware.ts

Add your service to the middleware initialization:

```typescript
// apps/desktop/src/services/middleware.ts

import { ResearchProjectService } from './ResearchProjectService';

function initializeMiddleware() {
    // ... existing initialization code ...

    // Create middleware services container
    const middlewareServices = {
        middleware,
        httpClient,
        cryptoDriver,
        channelManager,
        sessionManager,
        storage
    };

    // Create auth service
    const authService = new RealAuthService(middlewareServices, userAuthService);

    // Create research project service
    const researchProjectService = new ResearchProjectService(middlewareServices);

    return {
        // ... existing exports ...
        authService,
        researchProjectService, // Export your new service
        middlewareServices
    };
}

// Export your service
export const {
    middleware,
    authService,
    userAuthService,
    researchProjectService // Export for use in components
} = getMiddlewareServices();
```

---

## Service Lifecycle

### Initialization

Services should be initialized during application startup:

```typescript
// In your App.tsx or main initialization
import { initializeAndHydrate } from './services/middleware';
import { getMiddlewareServices } from './services/middleware';

useEffect(() => {
    async function init() {
        // Initialize middleware and auth
        await initializeAndHydrate();

        // Initialize your custom services
        const { researchProjectService } = getMiddlewareServices();
        await researchProjectService.initialize();
    }

    init();
}, []);
```

### Cleanup

Clean up services when the application closes:

```typescript
// In Electron main process or app cleanup
import { cleanupMiddleware, getMiddlewareServices } from './services/middleware';

async function cleanup() {
    const { researchProjectService } = getMiddlewareServices();

    // Dispose custom services
    await researchProjectService.dispose();

    // Cleanup middleware
    await cleanupMiddleware();
}

// Call on window close or app quit
window.addEventListener('beforeunload', cleanup);
```

---

## Error Handling

### Using handleMiddlewareError

Wrap all middleware operations with `handleMiddlewareError`:

```typescript
async myOperation(): Promise<Result> {
    return this.handleMiddlewareError(async () => {
        // Your middleware operations here
        // Errors will be automatically caught and converted
    });
}
```

### Custom Error Mapping

Override `convertToAuthError` for service-specific error handling:

```typescript
protected convertToAuthError(error: unknown): AuthError {
    // Check for service-specific errors
    if (error instanceof ProjectNotFoundError) {
        return this.createAuthError(
            'not_found' as AuthErrorCode,
            'Research project not found'
        );
    }

    // Fall back to base implementation
    return super.convertToAuthError(error);
}
```

### Creating Custom Errors

Use `createAuthError` helper:

```typescript
if (!projectId) {
    throw this.createAuthError(
        'invalid_request' as AuthErrorCode,
        'Project ID is required',
        { field: 'projectId' }
    );
}
```

---

## Using Middleware Components

### Available Components

BaseService provides access to these components:

```typescript
// HTTP Client for encrypted communication
this.httpClient

// Crypto driver for cryptographic operations
this.cryptoDriver

// Channel manager (Phase 1: encrypted channel)
this.channelManager

// Session manager (Phase 4: session management)
this.sessionManager

// Secure storage for persisting data
this.storage

// Main middleware instance (4-phase handshake)
this.middleware
```

### Direct HTTP Calls

For endpoints that don't require the full 4-phase handshake:

```typescript
async getPublicData(): Promise<PublicData> {
    const response = await this.httpClient.get('/api/public/data');
    return response.data;
}
```

### Encrypted Middleware Calls

For authenticated endpoints (requires 4-phase handshake):

```typescript
async getProtectedData(): Promise<ProtectedData> {
    // Ensure session is established
    await this.ensureSession();

    // Use middleware.invoke for encrypted communication
    const response = await this.middleware.invoke<{ data: ProtectedData }>({
        endpoint: '/api/protected/data',
        method: 'GET'
    });

    return response.data;
}
```

### Storing Sensitive Data

Use secure storage for sensitive information:

```typescript
async saveToken(token: string): Promise<void> {
    await this.storage.setItem('my-service-token', token);
}

async getToken(): Promise<string | null> {
    return await this.storage.getItem('my-service-token');
}

async clearToken(): Promise<void> {
    await this.storage.removeItem('my-service-token');
}
```

---

## Complete Example: ResearchProjectService

Here's a complete, production-ready service implementation:

```typescript
/**
 * Research Project Service
 *
 * Manages research projects in the PRISM system, including:
 * - Creating and updating projects
 * - Managing project membership
 * - Retrieving project data with proper authorization
 */

import { BaseService, type MiddlewareServices } from './BaseService';
import type { AuthError, AuthErrorCode } from '@iris/domain';

// Domain types
export interface ResearchProject {
    id: string;
    name: string;
    description: string;
    institutionId: string;
    leadResearcherId: string;
    status: ProjectStatus;
    createdAt: Date;
    updatedAt: Date;
}

export type ProjectStatus = 'active' | 'completed' | 'archived';

export interface CreateProjectData {
    name: string;
    description: string;
    institutionId: string;
    leadResearcherId: string;
}

export interface UpdateProjectData {
    name?: string;
    description?: string;
    status?: ProjectStatus;
}

// Middleware response types
interface MiddlewareProject {
    Id: string;
    Name: string;
    Description: string;
    InstitutionId: string;
    LeadResearcherId: string;
    Status: string;
    CreatedAt: string;
    UpdatedAt: string;
}

/**
 * Research Project Service Implementation
 */
export class ResearchProjectService extends BaseService {
    constructor(services: MiddlewareServices) {
        super(services, {
            serviceName: 'ResearchProjectService',
            debug: true // Enable for development
        });
    }

    /**
     * Initialize service
     */
    async initialize(): Promise<void> {
        this.log('Service initialized');
    }

    /**
     * Dispose service
     */
    async dispose(): Promise<void> {
        this.log('Service disposed');
    }

    /**
     * Get all research projects accessible to current user
     */
    async getAllProjects(): Promise<ResearchProject[]> {
        return this.handleMiddlewareError(async () => {
            this.log('Fetching all projects');

            await this.ensureSession();

            const response = await this.middleware.invoke<{
                projects: MiddlewareProject[]
            }>({
                endpoint: '/api/research-projects',
                method: 'GET'
            });

            this.log(`Retrieved ${response.projects.length} projects`);

            return response.projects.map(this.convertToProject);
        });
    }

    /**
     * Get project by ID
     */
    async getProjectById(id: string): Promise<ResearchProject> {
        return this.handleMiddlewareError(async () => {
            this.log(`Fetching project ${id}`);

            await this.ensureSession();

            const response = await this.middleware.invoke<{
                project: MiddlewareProject
            }>({
                endpoint: `/api/research-projects/${id}`,
                method: 'GET'
            });

            return this.convertToProject(response.project);
        });
    }

    /**
     * Create new research project
     */
    async createProject(data: CreateProjectData): Promise<ResearchProject> {
        return this.handleMiddlewareError(async () => {
            this.log('Creating new project:', data.name);

            // Validate input
            this.validateCreateProjectData(data);

            await this.ensureSession();

            const response = await this.middleware.invoke<{
                project: MiddlewareProject
            }>({
                endpoint: '/api/research-projects',
                method: 'POST',
                data: {
                    Name: data.name,
                    Description: data.description,
                    InstitutionId: data.institutionId,
                    LeadResearcherId: data.leadResearcherId
                }
            });

            this.log('✅ Project created:', response.project.Id);

            return this.convertToProject(response.project);
        });
    }

    /**
     * Update existing project
     */
    async updateProject(
        id: string,
        data: UpdateProjectData
    ): Promise<ResearchProject> {
        return this.handleMiddlewareError(async () => {
            this.log(`Updating project ${id}`);

            await this.ensureSession();

            const updateData: Record<string, unknown> = {};
            if (data.name) updateData.Name = data.name;
            if (data.description) updateData.Description = data.description;
            if (data.status) updateData.Status = data.status;

            const response = await this.middleware.invoke<{
                project: MiddlewareProject
            }>({
                endpoint: `/api/research-projects/${id}`,
                method: 'PATCH',
                data: updateData
            });

            this.log('✅ Project updated:', id);

            return this.convertToProject(response.project);
        });
    }

    /**
     * Delete project
     */
    async deleteProject(id: string): Promise<void> {
        return this.handleMiddlewareError(async () => {
            this.log(`Deleting project ${id}`);

            await this.ensureSession();

            await this.middleware.invoke({
                endpoint: `/api/research-projects/${id}`,
                method: 'DELETE'
            });

            this.log('✅ Project deleted:', id);
        });
    }

    // ==================== Private Helpers ====================

    /**
     * Convert middleware project to domain type
     */
    private convertToProject(data: MiddlewareProject): ResearchProject {
        return {
            id: data.Id,
            name: data.Name,
            description: data.Description,
            institutionId: data.InstitutionId,
            leadResearcherId: data.LeadResearcherId,
            status: data.Status as ProjectStatus,
            createdAt: new Date(data.CreatedAt),
            updatedAt: new Date(data.UpdatedAt)
        };
    }

    /**
     * Validate create project data
     */
    private validateCreateProjectData(data: CreateProjectData): void {
        if (!data.name || data.name.trim().length === 0) {
            throw this.createAuthError(
                'invalid_request' as AuthErrorCode,
                'Project name is required',
                { field: 'name' }
            );
        }

        if (data.name.length > 200) {
            throw this.createAuthError(
                'invalid_request' as AuthErrorCode,
                'Project name must be less than 200 characters',
                { field: 'name', maxLength: 200 }
            );
        }

        if (!data.institutionId) {
            throw this.createAuthError(
                'invalid_request' as AuthErrorCode,
                'Institution ID is required',
                { field: 'institutionId' }
            );
        }

        if (!data.leadResearcherId) {
            throw this.createAuthError(
                'invalid_request' as AuthErrorCode,
                'Lead researcher ID is required',
                { field: 'leadResearcherId' }
            );
        }
    }

    /**
     * Override error conversion for service-specific errors
     */
    protected convertToAuthError(error: unknown): AuthError {
        if (error instanceof Error) {
            const message = error.message.toLowerCase();

            // Map specific backend errors
            if (message.includes('project not found')) {
                return this.createAuthError(
                    'not_found' as AuthErrorCode,
                    'Research project not found'
                );
            }

            if (message.includes('permission denied')) {
                return this.createAuthError(
                    'permission_denied' as AuthErrorCode,
                    'You do not have permission to access this project'
                );
            }

            if (message.includes('duplicate')) {
                return this.createAuthError(
                    'already_exists' as AuthErrorCode,
                    'A project with this name already exists'
                );
            }
        }

        // Fall back to base error conversion
        return super.convertToAuthError(error);
    }
}
```

---

## Integration with Application

### Using Service in React Components

```typescript
import { useEffect, useState } from 'react';
import { getMiddlewareServices } from '../services/middleware';
import type { ResearchProject } from '../services/ResearchProjectService';

export function ProjectListScreen() {
    const [projects, setProjects] = useState<ResearchProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadProjects();
    }, []);

    async function loadProjects() {
        try {
            setLoading(true);
            setError(null);

            const { researchProjectService } = getMiddlewareServices();
            const data = await researchProjectService.getAllProjects();

            setProjects(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Research Projects</h1>
            <ul>
                {projects.map(project => (
                    <li key={project.id}>{project.name}</li>
                ))}
            </ul>
        </div>
    );
}
```

### Using Service in React Context

```typescript
import React, { createContext, useContext, useState, useCallback } from 'react';
import { getMiddlewareServices } from '../services/middleware';
import type { ResearchProject } from '../services/ResearchProjectService';

interface ProjectContextValue {
    projects: ResearchProject[];
    loading: boolean;
    error: string | null;
    loadProjects: () => Promise<void>;
    createProject: (data: CreateProjectData) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextValue | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
    const [projects, setProjects] = useState<ResearchProject[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadProjects = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { researchProjectService } = getMiddlewareServices();
            const data = await researchProjectService.getAllProjects();

            setProjects(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }, []);

    const createProject = useCallback(async (data: CreateProjectData) => {
        const { researchProjectService } = getMiddlewareServices();
        const newProject = await researchProjectService.createProject(data);
        setProjects(prev => [...prev, newProject]);
    }, []);

    return (
        <ProjectContext.Provider value={{
            projects,
            loading,
            error,
            loadProjects,
            createProject
        }}>
            {children}
        </ProjectContext.Provider>
    );
}

export function useProjects() {
    const context = useContext(ProjectContext);
    if (!context) {
        throw new Error('useProjects must be used within ProjectProvider');
    }
    return context;
}
```

---

## Best Practices

### 1. Type Safety

- Always define explicit TypeScript types for domain models
- Create separate types for middleware responses (usually PascalCase)
- Use type guards for runtime validation

```typescript
// Domain type (camelCase)
interface DomainUser {
    id: string;
    email: string;
}

// Middleware type (PascalCase - matches backend)
interface MiddlewareUser {
    Id: string;
    Email: string;
}

// Conversion function
function convertUser(data: MiddlewareUser): DomainUser {
    return {
        id: data.Id,
        email: data.Email
    };
}
```

### 2. Error Handling

- Always wrap middleware calls with `handleMiddlewareError`
- Provide meaningful error messages
- Include context in error details

```typescript
async getProject(id: string): Promise<Project> {
    return this.handleMiddlewareError(async () => {
        if (!id) {
            throw this.createAuthError(
                'invalid_request' as AuthErrorCode,
                'Project ID is required',
                { providedId: id }
            );
        }

        // ... rest of implementation
    });
}
```

### 3. Logging

- Use `this.log()` for development debugging
- Enable debug mode during development
- Disable debug mode in production

```typescript
constructor(services: MiddlewareServices) {
    super(services, {
        serviceName: 'MyService',
        debug: process.env.NODE_ENV === 'development'
    });
}
```

### 4. Session Management

- Always call `ensureSession()` before authenticated operations
- Check session status with `hasActiveSession()`
- Use `getMiddlewareStatus()` for debugging

```typescript
async secureOperation(): Promise<void> {
    // Ensure we have active session
    await this.ensureSession();

    // Check status if needed
    if (!this.hasActiveSession()) {
        throw new Error('No active session');
    }

    // Perform operation
    await this.middleware.invoke({ /* ... */ });
}
```

### 5. Data Validation

- Validate input data before sending to backend
- Throw descriptive errors for validation failures
- Use the `createAuthError` helper

```typescript
private validateData(data: CreateData): void {
    if (!data.name) {
        throw this.createAuthError(
            'invalid_request' as AuthErrorCode,
            'Name is required',
            { field: 'name' }
        );
    }

    if (data.name.length > 100) {
        throw this.createAuthError(
            'invalid_request' as AuthErrorCode,
            'Name must be less than 100 characters',
            { field: 'name', maxLength: 100 }
        );
    }
}
```

### 6. Service Initialization

- Keep initialization lightweight
- Load heavy resources on-demand
- Handle initialization errors gracefully

```typescript
async initialize(): Promise<void> {
    try {
        this.log('Initializing service');

        // Load minimal required data
        await this.loadConfiguration();

        this.log('✅ Service initialized');
    } catch (error) {
        this.logError('Failed to initialize', error);
        // Don't throw - allow service to function with limited capabilities
    }
}
```

### 7. Resource Cleanup

- Clean up all resources in `dispose()`
- Clear timers, subscriptions, and caches
- Handle cleanup errors gracefully

```typescript
async dispose(): Promise<void> {
    try {
        this.log('Disposing service');

        // Clear any timers
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }

        // Clear caches
        this.cache.clear();

        this.log('✅ Service disposed');
    } catch (error) {
        this.logError('Error during disposal', error);
    }
}
```

---

## Checklist for New Service

Before deploying a new service, verify:

- [ ] Service extends `BaseService`
- [ ] Constructor accepts `MiddlewareServices`
- [ ] `initialize()` and `dispose()` are implemented
- [ ] All middleware calls wrapped with `handleMiddlewareError()`
- [ ] `ensureSession()` called before authenticated operations
- [ ] Domain types defined with TypeScript interfaces
- [ ] Middleware response types defined (PascalCase)
- [ ] Conversion functions implemented for type mapping
- [ ] Input validation implemented
- [ ] Custom error mapping provided (if needed)
- [ ] Service registered in `middleware.ts`
- [ ] Service exported from `middleware.ts`
- [ ] Service initialized in application startup
- [ ] Service cleaned up on application shutdown
- [ ] Documentation comments on public methods
- [ ] TypeScript strict mode passes
- [ ] Integration tested with backend

---

## Troubleshooting

### "Session not established" Error

**Problem**: Middleware operations fail with session errors.

**Solution**: Always call `ensureSession()` before authenticated operations:

```typescript
async myOperation() {
    await this.ensureSession(); // Add this
    await this.middleware.invoke({ /* ... */ });
}
```

### "Cannot read property of undefined" Error

**Problem**: Middleware services not available.

**Solution**: Verify service is registered in `middleware.ts` and exported properly.

### Type Conversion Errors

**Problem**: Backend returns data in different format than expected.

**Solution**: Log middleware responses during development:

```typescript
const response = await this.middleware.invoke({ /* ... */ });
console.log('Middleware response:', response);
```

Then update your conversion functions to match the actual response format.

---

## Additional Resources

- **BaseService Source**: `apps/desktop/src/services/BaseService.ts`
- **RealAuthService Example**: `apps/desktop/src/services/auth/RealAuthService.ts`
- **Middleware Configuration**: `apps/desktop/src/services/middleware.ts`
- **Backend API Documentation**: See InteroperableResearchNode docs
- **Middleware Package**: `packages/middleware/`

---

**Questions or Issues?**

If you encounter issues implementing a new service:

1. Review the `RealAuthService` implementation as a reference
2. Check the BaseService source code for available utilities
3. Verify middleware is properly initialized
4. Enable debug logging (`debug: true` in constructor)
5. Check the middleware package documentation

---

**Last Updated**: October 2025
