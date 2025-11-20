---
description: Name of the component to implement (e.g., Button, Input, Dropdown)
---

# 🔨 Implement Component: {{componentName}}

I will implement the {{componentName}} component using progressive skill discovery.

## Process

### Step 1: Load Skills Documentation 📚

```
1. Read: .claude/skills/mcp-servers/figma-desktop/INDEX.md
2. Load individual tool docs as needed:
   - get_design_context.md (primary - generates code)
   - get_metadata.md (component structure)
   - get_variable_defs.md (design tokens)
   - get_screenshot.md (visual reference)
```

### Step 2: Extract Figma Design 🎨

**MCP Tools**:
```
mcp__figma-desktop__get_design_context({
  nodeId: "{{componentNode}}",
  artifactType: "REUSABLE_COMPONENT",
  clientFrameworks: "react,typescript",
  clientLanguages: "typescript,jsx"
})
mcp__figma-desktop__get_metadata({ nodeId: "{{componentNode}}" })
mcp__figma-desktop__get_variable_defs()
mcp__figma-desktop__get_screenshot({ nodeId: "{{componentNode}}" })
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