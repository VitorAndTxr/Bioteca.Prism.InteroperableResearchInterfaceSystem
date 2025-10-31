# Testing Guide for IRIS Middleware

## Overview

This guide describes how to test the IRIS middleware components, particularly the `UserAuthService`.

## Setup

To enable testing, you'll need to install Jest and TypeScript support:

```bash
npm install --save-dev jest @types/jest ts-jest
```

Then configure Jest by creating `jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

## Test Structure

Tests should be placed in `src/__tests__/` directory:

```
src/
├── auth/
│   ├── UserAuthService.ts
│   └── UserAuthService.types.ts
└── __tests__/
    └── UserAuthService.test.ts
```

## Example Test Suite

See the test template below for testing `UserAuthService`:

```typescript
/**
 * Unit tests for UserAuthService
 */

import { UserAuthService } from '../auth/UserAuthService';
import type { HttpClient, HttpRequest, HttpResponse } from '../http/HttpClient';
import type { SecureStorage } from '../storage/SecureStorage';
import type { ResearchNodeMiddleware } from '../service/ResearchNodeMiddleware';

// Mock implementations
class MockHttpClient implements HttpClient {
    private responses = new Map<string, unknown>();

    setResponse(url: string, data: unknown): void {
        this.responses.set(url, data);
    }

    async request<TResponse = unknown>(request: HttpRequest): Promise<HttpResponse<TResponse>> {
        const data = this.responses.get(request.url);
        return {
            status: 200,
            headers: {},
            data: data as TResponse
        };
    }
}

class MockSecureStorage implements SecureStorage {
    private storage = new Map<string, unknown>();

    async getItem<T>(key: string): Promise<T | null> {
        return (this.storage.get(key) as T) ?? null;
    }

    async setItem<T>(key: string, value: T): Promise<void> {
        this.storage.set(key, value);
    }

    async removeItem(key: string): Promise<void> {
        this.storage.delete(key);
    }
}

class MockMiddleware implements Partial<ResearchNodeMiddleware> {
    private invokeResponses = new Map<string, unknown>();

    setInvokeResponse(path: string, response: unknown): void {
        this.invokeResponses.set(path, response);
    }

    async ensureSession(): Promise<any> {
        return {};
    }

    async revokeSession(): Promise<void> {
        // Mock implementation
    }

    async invoke(options: any): Promise<any> {
        return this.invokeResponses.get(options.path);
    }
}

describe('UserAuthService', () => {
    let authService: UserAuthService;
    let mockHttpClient: MockHttpClient;
    let mockStorage: MockSecureStorage;
    let mockMiddleware: MockMiddleware;

    beforeEach(() => {
        mockHttpClient = new MockHttpClient();
        mockStorage = new MockSecureStorage();
        mockMiddleware = new MockMiddleware();

        authService = new UserAuthService(
            mockHttpClient,
            mockStorage,
            mockMiddleware as any
        );
    });

    describe('login', () => {
        it('should login successfully with valid credentials', async () => {
            // Arrange
            const mockResponse = {
                token: 'test-token',
                expiresAt: new Date(Date.now() + 3600000).toISOString(),
                user: {
                    id: '1',
                    username: 'testuser',
                    email: 'test@example.com'
                }
            };

            mockMiddleware.setInvokeResponse('/api/userauth/login', mockResponse);

            // Act
            const result = await authService.login({
                username: 'test@example.com',
                password: 'password123'
            });

            // Assert
            expect(result.token).toBe('test-token');
            expect(authService.isAuthenticated()).toBe(true);
        });

        it('should encode password in Base64', async () => {
            let capturedPayload: any = null;

            mockMiddleware.invoke = async (options) => {
                capturedPayload = options.payload;
                return {
                    token: 'test-token',
                    expiresAt: new Date(Date.now() + 3600000).toISOString(),
                    user: { id: '1', username: 'test', email: 'test@example.com' }
                };
            };

            await authService.login({
                username: 'test@example.com',
                password: 'password123'
            });

            expect(capturedPayload.password).toBe(btoa('password123'));
        });
    });

    describe('refreshToken', () => {
        it('should refresh token successfully', async () => {
            // Login first
            mockMiddleware.setInvokeResponse('/api/userauth/login', {
                token: 'old-token',
                expiresAt: new Date(Date.now() + 3600000).toISOString(),
                user: { id: '1', username: 'test', email: 'test@example.com' }
            });

            await authService.login({
                username: 'test@example.com',
                password: 'password123'
            });

            // Setup refresh
            mockMiddleware.setInvokeResponse('/api/userauth/refreshtoken', {
                token: 'new-token',
                expiresAt: new Date(Date.now() + 3600000).toISOString()
            });

            const result = await authService.refreshToken();

            expect(result.token).toBe('new-token');
            expect(authService.getToken()).toBe('new-token');
        });
    });

    describe('logout', () => {
        it('should clear authentication state', async () => {
            // Login first
            mockMiddleware.setInvokeResponse('/api/userauth/login', {
                token: 'test-token',
                expiresAt: new Date(Date.now() + 3600000).toISOString(),
                user: { id: '1', username: 'test', email: 'test@example.com' }
            });

            await authService.login({
                username: 'test@example.com',
                password: 'password123'
            });

            expect(authService.isAuthenticated()).toBe(true);

            await authService.logout();

            expect(authService.isAuthenticated()).toBe(false);
            expect(authService.getToken()).toBeNull();
        });
    });
});
```

## Running Tests

Once Jest is configured, run tests with:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test UserAuthService.test.ts

# Run with coverage
npm test -- --coverage
```

## Test Coverage Goals

Aim for at least 80% coverage for:
- `UserAuthService`
- `EncryptedHttpClient`
- Storage implementations

## Manual Testing

Until automated tests are set up, test manually:

### 1. Test Login Flow

```typescript
import { authService } from './services/middleware';

// Test successful login
const result = await authService.login({
  username: 'test@example.com',
  password: 'password123'
});

console.log('Token:', result.token);
console.log('Authenticated:', authService.isAuthenticated());
```

### 2. Test Token Refresh

```typescript
// Wait for token to be near expiration
// Or manually set a short-lived token in storage

const refreshed = await authService.refreshToken();
console.log('New token:', refreshed.token);
```

### 3. Test Logout

```typescript
await authService.logout();
console.log('Authenticated:', authService.isAuthenticated()); // Should be false
```

### 4. Test Storage Persistence

```typescript
// Login
await authService.login({ username: 'test@example.com', password: 'test' });

// Reload app (or create new service instance)
const newAuthService = new UserAuthService(/* ... */);
await newAuthService.initialize();

console.log('Still authenticated:', newAuthService.isAuthenticated());
```

## Integration Testing

Test with real backend:

```bash
# Start backend
cd InteroperableResearchNode
docker-compose -f docker-compose.persistence.yml up -d
docker-compose -f docker-compose.application.yml up -d
```

Then test from app:

```typescript
// Desktop App
npm run dev

// Mobile App
npm run android
```

## Common Test Scenarios

### Scenario 1: Expired Token

```typescript
it('should handle expired tokens', async () => {
  // Setup expired token
  const expiredState = {
    token: 'expired-token',
    expiresAt: new Date(Date.now() - 1000).toISOString(),
    user: { id: '1', username: 'test', email: 'test@example.com' }
  };

  await mockStorage.setItem('userauth:state', expiredState);
  await authService.initialize();

  expect(authService.isAuthenticated()).toBe(false);
});
```

### Scenario 2: Network Error

```typescript
it('should handle network errors', async () => {
  mockMiddleware.invoke = async () => {
    throw new Error('Network error');
  };

  await expect(
    authService.login({ username: 'test', password: 'test' })
  ).rejects.toThrow('Network error');
});
```

### Scenario 3: Invalid Credentials

```typescript
it('should handle invalid credentials', async () => {
  mockMiddleware.setInvokeResponse('/api/userauth/login', {
    error: 'Invalid credentials'
  });

  await expect(
    authService.login({ username: 'wrong', password: 'wrong' })
  ).rejects.toThrow();
});
```

## Debugging Tests

Add logging to tests:

```typescript
it('should login', async () => {
  console.log('[TEST] Starting login test');

  const result = await authService.login({ username: 'test', password: 'test' });

  console.log('[TEST] Login result:', result);
  console.log('[TEST] Authenticated:', authService.isAuthenticated());
});
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Use `afterEach` to clean up state
3. **Mocking**: Mock external dependencies (HTTP, storage)
4. **Assertions**: Make clear, specific assertions
5. **Coverage**: Test both success and failure paths
6. **Documentation**: Comment complex test setups

## Next Steps

1. Install Jest dependencies
2. Configure Jest
3. Create test files based on templates above
4. Run tests and fix any failures
5. Add integration tests with real backend
6. Set up CI/CD to run tests automatically
