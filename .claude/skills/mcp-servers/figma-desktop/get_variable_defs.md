# get_variable_defs

Get variable definitions (design tokens) for a Figma node - colors, fonts, spacing, etc.

**Access**: `mcp__figma-desktop__get_variable_defs`

## Parameters

- `nodeId` (string, optional): Node ID in format "123:456" or "123-456" (uses selected node if omitted)
- `clientFrameworks` (string, optional): Comma-separated frameworks
- `clientLanguages` (string, optional): Comma-separated languages

## Returns

Dictionary of variable definitions:
```
{
  'icon/default/secondary': '#949494',
  'spacing/base': '8px',
  'font/heading': 'Inter Bold 24px'
}
```

## Errors

- Node not found
- Figma Desktop not running
- No variables defined

## Example

```typescript
// Get variables for selected node
mcp__figma-desktop__get_variable_defs({})

// Get variables for specific node
mcp__figma-desktop__get_variable_defs({
  nodeId: "123:456",
  clientFrameworks: "react",
  clientLanguages: "typescript"
})
```

## Common Use Cases

- Extract design tokens for implementation
- Generate CSS variables
- Create design system documentation
- Sync design tokens to codebase
