---
description: Name of the component to implement (e.g., Button, Input, Dropdown)
---

# 🔨 Implement Component: {{componentName}}

I will implement the {{componentName}} component using Figma REST API scripts.

## Process

### Step 1: Load Skills Documentation 📚

```
1. Read: .claude/skills/figma-desktop/SKILL.md
2. Read: .claude/skills/figma-desktop/scripts/README.md
3. Available scripts:
   - get-metadata.js (component structure)
   - get-screenshot.js (visual reference)
   - get-variable-defs.js (design tokens)
```

### Step 2: Extract Figma Design 🎨

**REST API Scripts**:
```bash
# Get component metadata
node .claude/skills/figma-desktop/scripts/get-metadata.js xFC8eCJcSwB9EyicTmDJ7w {{componentNode}}

# Get screenshot
node .claude/skills/figma-desktop/scripts/get-screenshot.js xFC8eCJcSwB9EyicTmDJ7w {{componentNode}}

# Extract design tokens
node .claude/skills/figma-desktop/scripts/get-variable-defs.js xFC8eCJcSwB9EyicTmDJ7w
```

**Extract**:
- All variants (primary, secondary, outline, etc.)
- All states (default, hover, active, disabled)
- Design tokens and spacing
- Required assets

### Step 3: Create File Structure 📁

```
apps/desktop/src/design-system/components/{{componentName}}/
├── {{componentName}}.tsx         # Main component
├── {{componentName}}.types.ts    # TypeScript interfaces
├── {{componentName}}.css         # Component styles
├── {{componentName}}.test.tsx    # Unit tests
├── {{componentName}}.stories.tsx # Storybook
├── README.md                     # Documentation
└── index.ts                      # Barrel export
```

### Step 4: Implement Component ⚛️

**Implementation**:
- TypeScript strict mode (no `any` types)
- All visual variants from Figma
- All interactive states from Figma
- Responsive behavior
- ARIA labels and keyboard navigation
- Focus management
- Cross-platform compatibility (Desktop + Web)

### Step 5: Testing & Documentation 📝

**Create**:
- Unit tests (>80% coverage)
- Storybook stories for all variants/states
- README with usage examples
- Props documentation

## Implementation Checklist

```
✅ Figma design extracted
✅ File structure created
✅ Component implemented (all variants + states)
✅ TypeScript types defined
✅ Unit tests written (>80% coverage)
✅ Storybook documentation
✅ Accessibility verified (ARIA, keyboard nav)
✅ README documentation
```

Starting implementation of {{componentName}}...
