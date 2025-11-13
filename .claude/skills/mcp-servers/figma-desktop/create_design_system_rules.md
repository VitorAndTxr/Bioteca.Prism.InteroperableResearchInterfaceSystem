# create_design_system_rules

Provides a prompt to generate design system rules for the repository.

**Access**: `mcp__figma-desktop__create_design_system_rules`

## Parameters

- `clientFrameworks` (string, optional): Comma-separated frameworks
- `clientLanguages` (string, optional): Comma-separated languages

## Returns

Prompt/guidance for creating design system documentation including:
- Color palettes
- Typography scale
- Spacing system
- Component patterns
- Usage guidelines

## Errors

- Figma Desktop not running

## Example

```typescript
// Generate design system rules
mcp__figma-desktop__create_design_system_rules({
  clientFrameworks: "react,tailwindcss",
  clientLanguages: "typescript"
})
```

## Common Use Cases

- Creating initial design system documentation
- Standardizing design patterns
- Generating style guides
- Documenting component usage
