# Figma MCP Integration Guide for IRIS Project

## Overview

This guide provides IRIS-specific instructions for integrating Figma MCP (Model Context Protocol) with Claude Code to accelerate desktop app UI development, particularly for the design system components and screens.

**Target**: Desktop app screens and components (React + Typescript + Tailwind CSS)
**Timeline**: Initial setup ~30 minutes, per-component generation ~2-5 minutes
**Benefits**: 3-4x faster UI implementation, improved design consistency

---

## Quick Start (5 minutes)

### Step 1: Add Figma MCP to Claude Code

```bash
claude mcp add --transport http figma https://mcp.figma.com/mcp
```

### Step 2: Authenticate

In Claude Code:
```
/mcp
```

Select `figma` → `Authenticate` → `Allow Access` in browser

### Step 3: Test Connection

```bash
# Verify MCP is working
claude mcp test figma
# Expected output: "Connection successful"
```

### Step 4: Try Your First Generation

In Claude Code:
```
"Convert this login screen to React: [figma-design-link]"
```

**Expected Output**: React component with Tailwind CSS

---

## IRIS Project Structure Mapping

### Current Design System (Apps/Desktop)

```
apps/desktop/src/
├── design-system/
│   ├── components/          ← Auto-generate from Figma
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Dropdown/
│   │   └── [...more]
│   └── tokens/              ← Export from Figma Variables
│       ├── colors.ts
│       ├── spacing.ts
│       └── typography.ts
├── screens/                 ← Generate from Figma flows
│   ├── Dashboard/
│   ├── UserManagement/
│   └── [...more]
└── types/                   ← Design props inference
    └── design-system.types.ts
```

### Recommended Figma File Organization

For IRIS desktop app:

```
Figma File: IRIS Design System
├─ Components
│  ├─ Button (with variants: primary, secondary, danger)
│  ├─ Input (with variants: default, error, disabled)
│  ├─ Dropdown (with states)
│  ├─ DataTable
│  ├─ Modal
│  └─ [...rest of design system]
├─ Screens
│  ├─ Dashboard
│  ├─ UserManagement
│  ├─ ResearcherManagement
│  └─ NodeConnections
└─ Design Tokens
   ├─ Colors (semantic names)
   ├─ Spacing (design variables)
   └─ Typography (design variables)
```

---

## Implementation Workflow for IRIS

### Phase 1: Design System Token Setup (One-time)

#### 1.1 Figma Variables Configuration

In your Figma design file, create these variable collections:

**Colors Collection**:
```
Colors/
├─ Primary: #0066FF
├─ Secondary: #6366F1
├─ Danger: #DC2626
├─ Success: #10B981
├─ Warning: #F59E0B
├─ Gray-50: #F9FAFB
├─ Gray-100: #F3F4F6
└─ [...continue through Gray-900]
```

**Spacing Collection**:
```
Spacing/
├─ xs: 4px
├─ sm: 8px
├─ md: 16px
├─ lg: 24px
└─ xl: 32px
```

**Typography Collection**:
```
Typography/
├─ Body-Regular: (14px, 400)
├─ Body-Medium: (14px, 500)
├─ Heading-L: (32px, 600)
└─ [...continue]
```

#### 1.2 Extract to Code

```bash
# From Figma, export variables
# Save as: docs/figma/design-tokens.json

# Then run in Claude Code:
"Convert this Figma token export to TypeScript:
[design-tokens.json content]
Generate: apps/desktop/src/design-system/tokens/"
```

#### 1.3 Verify Token Import

```bash
npm run type-check:all
# Verify: No type errors in token imports
```

### Phase 2: Component Generation (Per-Component)

#### For Each Component in Design System

**Example: Button Component**

```
Step 1: In Figma, select Button component frame
Step 2: In Claude Code, run:

"Generate React/TypeScript Button component from selected Figma design
using the design tokens I provided earlier.
Target: apps/desktop/src/design-system/components/Button/
Requirements:
- Use Tailwind CSS
- Support variants: primary, secondary, danger
- Support sizes: small, medium, large
- Full TypeScript with strict mode
- Include Button.types.ts
- Export from index.ts"

Step 3: Review generated code
Step 4: Place in apps/desktop/src/design-system/components/Button/
Step 5: Run npm run type-check
Step 6: Commit
```

#### Template for Each Component

Use this for all components (Input, Dropdown, DataTable, Modal, etc.):

```typescript
// Component File Structure
component/
├── ComponentName.tsx        // Main component
├── ComponentName.types.ts   // TypeScript interfaces
├── ComponentName.css        // Component-scoped styles
├── ComponentName.test.tsx   // Unit tests
├── index.ts                 // Barrel export
└── README.md                // Component documentation
```

### Phase 3: Screen Generation (Per-Screen)

#### For Each Application Screen

**Example: User Management Screen**

```
Step 1: In Figma, create frame for "UserManagementScreen"
Step 2: In Claude Code:

"Generate React screen component from Figma design:
[figma-link]

Requirements:
- Use existing design-system components (Button, Input, DataTable, etc.)
- All data from UserService API
- TypeScript strict mode
- Include loading/error states
- Responsive layout
- Target: apps/desktop/src/screens/UserManagement/

Context:
- Available services: UserService with methods like getUsers(page, limit)
- Context: AuthContext for session management
- Design tokens: import from @/design-system/tokens"

Step 3: Review and integrate
Step 4: Test with mock data
Step 5: Connect to actual service
```

---

## Code Connect Setup for IRIS

### Step 1: Initialize Code Connect

```bash
cd apps/desktop
npx @figma/code-connect init
```

### Step 2: Create Mappings for Top Components

For each main component, create mapping:

```typescript
// src/design-system/components/Button/Button.tsx
import { figma } from '@figma/code-connect';

figma.connect(Button,
  'https://www.figma.com/file/YOUR_FILE_ID?node-id=COMPONENT_NODE_ID',
  {
    example: (props) => (
      <Button
        variant={props.variant ?? 'primary'}
        size={props.size ?? 'medium'}
        disabled={props.disabled ?? false}
      >
        {props.children}
      </Button>
    ),
    properties: {
      'Variant/Style': 'variant',
      'Variant/Size': 'size',
      'State': (state) => {
        if (state === 'disabled') return { disabled: true };
        return {};
      },
      'Label': 'children',
    },
  }
);
```

### Step 3: Publish Mappings

```bash
npx @figma/code-connect publish
# Verify in Figma Dev Mode: mappings appear under components
```

---

## IRIS-Specific Prompts

### For New Components

```
"Generate a {ComponentName} component for IRIS desktop app
from the selected Figma frame.

Requirements:
- React + TypeScript (strict mode enabled)
- Tailwind CSS styling
- Heroicons for all icons (@heroicons/react/24/outline)
- Accessible (ARIA labels, semantic HTML)
- Design tokens from @/design-system/tokens
- Full prop interface with JSDoc comments
- No custom SVG files - use Heroicons only
- Target location: apps/desktop/src/design-system/components/{ComponentName}/

File structure:
- {ComponentName}.tsx (component)
- {ComponentName}.types.ts (interfaces)
- {ComponentName}.test.tsx (unit tests)
- index.ts (barrel export)
- README.md (documentation)"
```

### For New Screens

```
"Generate a {ScreenName} screen from the Figma design.

Requirements:
- Use existing design-system components from apps/desktop/src/design-system/components/
- Integrate with services layer (import from @/services/)
- Use AuthContext and other context from @/context/
- TypeScript strict mode
- Tailwind CSS responsive layout
- Error and loading states
- Async data fetching with proper error handling
- Design tokens from @/design-system/tokens

Target: apps/desktop/src/screens/{ScreenName}/"
```

### For Autonomous Testing Loops

```
"Generate {ComponentName} to match this Figma design:
[figma-link]

1. Generate component with full tests
2. Run: npm run type-check:all
3. Run: npm test -- {ComponentName}
4. If tests fail, read error output and fix implementation
5. Repeat until all tests pass

Design system context:
- Available components: Button, Input, Dropdown, DataTable, Modal
- Design tokens: import from @/design-system/tokens
- Icon library: @heroicons/react/24/outline"
```

---

## Best Practices for IRIS

### 1. Component Naming Conventions

✅ **CORRECT**:
```
Figma:  "Button"
Code:   "Button.tsx"
Var:    "variant" → "primary" | "secondary" | "danger"

Figma:  "Button/Primary/Large"
Code:   variant="primary" size="large"
```

❌ **INCORRECT**:
```
Figma:  "Button_Primary"
Code:   "ButtonPrimary.tsx"

Figma:  "BtnPrimLrg"
Code:   "BtnPrimLrg.tsx"
```

### 2. Auto Layout Configuration

Every frame should use auto layout:

```
Button Frame {
  Direction: horizontal
  Gap: 8px          → className="gap-2"
  Padding: 12px 16px → className="px-4 py-3"
  Alignment: center  → className="items-center justify-center"
}
```

### 3. Variant Organization

Figma structure matches React props:

```
Figma Component:
├─ Button
   ├─ Variant Set: Style
   │  ├─ primary
   │  ├─ secondary
   │  └─ danger
   ├─ Variant Set: Size
   │  ├─ small
   │  ├─ medium
   │  └─ large
   └─ Variant Set: State
      ├─ default
      ├─ hover
      ├─ active
      └─ disabled

React Interface:
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  // state (hover/active) handled by CSS
}
```

### 4. Icon Usage (Critical for IRIS)

**REQUIRED**: Use Heroicons only

```typescript
// ✅ CORRECT
import { UserIcon } from '@heroicons/react/24/outline';

export function UserButton() {
  return <button><UserIcon className="w-5 h-5" /></button>;
}

// ❌ INCORRECT (no custom SVG)
import CustomIcon from './icon.svg';
```

Figma guideline: If component needs icon, use icon placeholder and specify "Heroicons: UserIcon" in component notes.

### 5. Design Token Alignment

**Figma Variables**:
```
color.primary = #0066FF
spacing.md = 16px
typography.heading.h1 = 32px, 600
```

**Tailwind Config** (generate from tokens):
```js
colors: { primary: '#0066FF' }
spacing: { md: '16px' }
fontSize: { h1: ['32px', '600'] }
```

**Component Usage**:
```tsx
<button className={`bg-primary px-md text-h1`} />
// or
<button className={`bg-[#0066FF] px-4 text-3xl font-semibold`} />
```

---

## Troubleshooting IRIS Integration

### Issue: Component generates with custom CSS instead of Tailwind

**Solution**:
```
Add to prompt:
"Use ONLY Tailwind CSS classes.
Do not generate custom CSS files.
All styling via className prop.

Available tokens (import from @/design-system/tokens):
- Spacing: space.xs, space.sm, space.md, space.lg
- Colors: primary, secondary, danger, success, gray
- Typography: body, heading"
```

### Issue: Generated code uses wrong service

**Solution**:
```
Check available services:
ls apps/desktop/src/services/

In prompt, specify:
"Use UserService for fetching user data.
Import: import { UserService } from '@/services/UserService'
Method: userService.getUsers(page, limit)"
```

### Issue: Missing types or context

**Solution**:
```bash
# Check available contexts
ls apps/desktop/src/context/

# Check available types
cat packages/domain/src/models/index.ts

# Add to prompt:
"Use these types: User, Researcher (from @iris/domain)
Use AuthContext for session: import { useAuth } from '@/context/AuthContext'"
```

### Issue: Tests failing after generation

**Solution**:
```bash
# Run tests with verbose output
npm test -- --verbose

# Ask Claude:
"Fix test failures:
[paste error output]

Use:
- Mock data from: packages/domain/src/__mocks__/
- Test utilities from: test/setup.ts
- MSW for API mocks if needed"
```

---

## Integration with Existing IRIS Patterns

### Using BaseService Pattern

When generating services integration:

```typescript
// Generated component should use service correctly
import { UserService } from '@/services/UserService';
import { useAuth } from '@/context/AuthContext';

export function UserListScreen() {
  const { session } = useAuth();
  const userService = new UserService(middlewareService);

  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadUsers = async () => {
      const response = await userService.getUsers(1, 20);
      setUsers(response.items);
    };
    loadUsers();
  }, [session]);

  return <DataTable columns={columns} data={users} />;
}
```

**Prompt guidance**:
```
"Services in IRIS use BaseService pattern.
To fetch data:
1. Inject middleware service
2. Call service method (async)
3. Handle errors from result.errors
4. Type response with @iris/domain types"
```

### Context Integration

```typescript
// Always use context for auth state
import { useAuth } from '@/context/AuthContext';

export function ProtectedScreen() {
  const { session, user } = useAuth();

  if (!session) {
    return <LoginPrompt />;
  }

  return <ScreenContent user={user} />;
}
```

---

## Performance Optimization

### Token Usage (MCP is very efficient)

**Comparison**:
```
❌ Share screenshot: ~2000 tokens
   Claude: Must interpret visual pixels

✅ Share Figma link + design tokens: ~200 tokens
   Claude: Reads structured design data

✅ Share URL + Code Connect: ~100 tokens
   Claude: Knows exact component implementation
```

### Setup Once, Use Many Times

```bash
# Week 1: Setup (one-time cost)
- Configure Figma MCP: 5 min
- Set up design tokens: 30 min
- Create Code Connect mappings: 2 hours

# Weeks 2+: Use repeatedly (payoff)
- Generate new component: 2-5 min each
- Screen generation: 5-10 min each
- Auto-generate: 30-50% of desktop UI time saved
```

---

## Monitoring and Feedback

### Track Generation Quality

```bash
# After each generation:
1. npm run type-check:all      # Type safety
2. npm test                      # Functionality
3. npm run lint                  # Code style
4. Visual check against Figma   # Design accuracy
```

### Gather Feedback

```
After each component:
- Is code consistent with existing pattern?
- Does it follow IRIS conventions?
- Would a human developer approve?
- What needs manual adjustment?
```

### Iterate on Prompts

```
If results aren't great:
1. Add more context to prompt
2. Reference similar existing components
3. Include example patterns
4. Add specific requirements (accessibility, performance, etc.)
```

---

## References

- **Figma MCP**: https://developers.figma.com/docs/figma-mcp-server/
- **Code Connect**: https://developers.figma.com/docs/code-connect/
- **IRIS Architecture**: docs/architecture/ARCHITECTURE_OVERVIEW.md
- **IRIS Design System**: docs/development/DESIGN_SYSTEM.md
- **IRIS Services**: docs/api/SERVICES_API.md

---

## Next Steps

1. ✅ Set up Figma MCP (5 min)
2. ✅ Configure design tokens in Figma (30 min)
3. ✅ Generate first Button component (5 min)
4. ✅ Set up Code Connect for Button (10 min)
5. ✅ Generate 2-3 more components (20 min)
6. ✅ Generate first screen (10 min)
7. ✅ Set up automated generation in CI/CD (30 min)

**Estimated total time to production**: ~2 hours

---

**Last Updated**: November 14, 2025
**IRIS Version**: Current
**Status**: Production-Ready
