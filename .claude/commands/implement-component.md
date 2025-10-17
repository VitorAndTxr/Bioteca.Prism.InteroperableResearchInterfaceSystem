---
description: Implement a specific component from the design system
parameters:
  - name: componentName
    description: Name of the component to implement (e.g., Button, Input, Dropdown)
---

# 🔨 Implement Component: {{componentName}}

I will implement the {{componentName}} component following the design system specifications.

## Implementation Steps:

### 1. Extract Figma Design
- Get component design from Figma
- Extract all variants (primary, secondary, etc.)
- Identify all states (default, hover, active, disabled)
- Download any required assets

### 2. Create File Structure
```
packages/ui-components/atoms/{{componentName}}/
├── {{componentName}}.tsx         # Main component
├── {{componentName}}.types.ts    # TypeScript interfaces
├── {{componentName}}.styles.ts   # Styled components
├── {{componentName}}.test.tsx     # Unit tests
├── {{componentName}}.stories.tsx # Storybook
└── index.ts                      # Exports
```

### 3. Component Implementation
- Base component structure
- Props interface with TypeScript
- All visual variants
- All interactive states
- Responsive behavior
- Cross-platform compatibility (Mobile + Web)

### 4. Accessibility
- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support

### 5. Testing
- Unit tests for logic
- Render tests
- Interaction tests
- Accessibility tests

### 6. Documentation
- Props documentation
- Usage examples
- Storybook stories
- Update component status in tracking

## Component Checklist:
- [ ] Figma design extracted
- [ ] File structure created
- [ ] Basic implementation
- [ ] All variants
- [ ] All states
- [ ] TypeScript types
- [ ] Unit tests (>80% coverage)
- [ ] Storybook documentation
- [ ] Cross-platform tested
- [ ] Accessibility verified
- [ ] Documentation updated

## Example Usage:
```bash
# Implement Button component
claude /implement-component Button

# Implement Input component
claude /implement-component Input
```

Starting implementation of {{componentName}}...