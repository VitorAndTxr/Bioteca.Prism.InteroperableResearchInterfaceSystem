# get_code_connect_map

Get mapping of Figma nodes to codebase components.

**Access**: `mcp__figma-desktop__get_code_connect_map`

## Parameters

- `nodeId` (string, optional): Node ID in format "123:456" or "123-456" (uses selected node if omitted)
- `clientFrameworks` (string, optional): Comma-separated frameworks
- `clientLanguages` (string, optional): Comma-separated languages

## Returns

Dictionary mapping node IDs to code locations:
```
{
  '1:2': {
    codeConnectSrc: 'https://github.com/foo/components/Button.tsx',
    codeConnectName: 'Button'
  }
}
```

## Errors

- Node not found
- Figma Desktop not running
- No code connections defined

## Example

```typescript
// Get code connections for selected node
mcp__figma-desktop__get_code_connect_map({})

// Get for specific node
mcp__figma-desktop__get_code_connect_map({
  nodeId: "123:456"
})
```

## Common Use Cases

- Find existing component implementations
- Avoid duplicate component creation
- Link designs to code
- Generate component import statements
