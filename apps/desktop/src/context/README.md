# IRIS Desktop - Context Providers

This directory contains React Context providers for global state management in IRIS Desktop.

## Available Contexts

### AuthContext

Authentication and authorization context with session management.

**Location**: `context/AuthContext.tsx`

#### Features

- User authentication (login/logout/register)
- Session persistence with localStorage
- Remember me functionality
- Role-based access control (Admin, Researcher, Clinician, Viewer)
- Permission checking with role hierarchy
- Password reset flow
- Profile updates
- Session refresh and validation
- Automatic session restoration on app reload
- Token-based authentication (mock JWT for development)
- Error handling with typed AuthError

#### Mock Users (Development)

For development, the following test accounts are available:

| Email | Password | Role | Description |
|-------|----------|------|-------------|
| `admin@iris.dev` | `password123` | Admin | Full system access |
| `researcher@iris.dev` | `password123` | Researcher | Research operations |
| `clinician@iris.dev` | `password123` | Clinician | Clinical operations |
| `viewer@iris.dev` | `password123` | Viewer | Read-only access |

#### Usage

```typescript
import { useAuth } from '@/context';

function MyComponent() {
    const {
        // State
        user,
        authState,
        error,
        sessionInfo,
        isAuthenticated,

        // Actions
        login,
        logout,
        register,
        requestPasswordReset,
        confirmPasswordReset,
        updateProfile,
        refreshSession,
        clearError,

        // Utilities
        hasPermission
    } = useAuth();

    // Example: Login
    const handleLogin = async () => {
        try {
            await login({
                email: 'admin@iris.dev',
                password: 'password123',
                rememberMe: true
            });
            // User is now authenticated
        } catch (err) {
            console.error('Login failed:', err);
        }
    };

    // Example: Check permissions
    if (hasPermission('admin')) {
        // Show admin-only features
    }

    return (
        <div>
            {isAuthenticated ? (
                <div>
                    <h1>Welcome, {user?.name}</h1>
                    <p>Role: {user?.role}</p>
                    <button onClick={logout}>Logout</button>
                </div>
            ) : (
                <button onClick={handleLogin}>Login</button>
            )}
        </div>
    );
}
```

#### Auth States

```typescript
export enum AuthState {
    AUTHENTICATED = 'authenticated',    // User is logged in
    UNAUTHENTICATED = 'unauthenticated', // User is not logged in
    LOADING = 'loading',                 // Authentication in progress
    ERROR = 'error'                      // Authentication error occurred
}
```

#### User Roles

```typescript
export enum UserRole {
    ADMIN = 'admin',           // Full system access
    RESEARCHER = 'researcher', // Research operations
    CLINICIAN = 'clinician',   // Clinical operations
    VIEWER = 'viewer'          // Read-only access
}
```

#### Role Hierarchy

Roles are hierarchical for permission checking:

```
Admin (4) > Researcher (3) > Clinician (2) > Viewer (1)
```

When checking permissions, a user with a higher role level automatically has all permissions of lower roles.

#### Error Codes

```typescript
export enum AuthErrorCode {
    INVALID_CREDENTIALS = 'invalid_credentials',
    USER_NOT_FOUND = 'user_not_found',
    USER_ALREADY_EXISTS = 'user_already_exists',
    UNAUTHORIZED = 'unauthorized',
    TOKEN_EXPIRED = 'token_expired',
    NETWORK_ERROR = 'network_error',
    UNKNOWN_ERROR = 'unknown_error'
}
```

#### Session Management

Sessions are automatically persisted to localStorage:
- **Key**: `iris_session_info`
- **Content**: `{ token, expiresAt, issuedAt, rememberMe }`
- **Duration**: 24 hours (standard) or 30 days (remember me)
- **Auto-restore**: Session restored on app reload if not expired

#### Protected Routes Example

```typescript
import { useAuth } from '@/context';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, requiredRole }) {
    const { isAuthenticated, hasPermission } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (requiredRole && !hasPermission(requiredRole)) {
        return <Navigate to="/unauthorized" />;
    }

    return children;
}

// Usage
<ProtectedRoute requiredRole="admin">
    <AdminDashboard />
</ProtectedRoute>
```

## Future Contexts

### BluetoothContext (Planned)

Device connection and communication management.

### DataContext (Planned)

Session data, volunteers, and research data management.

### SettingsContext (Planned)

Application settings and preferences.

## Architecture

All contexts follow this pattern:

1. **Type Definitions**: TypeScript interfaces in `@iris/domain` package
2. **Service Layer**: Business logic in `services/` directory
3. **Context Provider**: React Context in `context/` directory
4. **Hook**: Custom hook for consuming context (e.g., `useAuth()`)
5. **App Integration**: Provider wrapped in `App.tsx`

## Testing

Contexts use mock services for development:
- Mock data and delays simulate real API behavior
- Easy to test without backend dependency
- Replace with real API calls in production

## Best Practices

1. **Always use hooks**: Use `useAuth()` instead of consuming context directly
2. **Error handling**: Always wrap context actions in try-catch
3. **Loading states**: Check `authState` before showing UI
4. **Type safety**: Use TypeScript types from `@iris/domain`
5. **Cleanup**: Clear errors with `clearError()` after handling
