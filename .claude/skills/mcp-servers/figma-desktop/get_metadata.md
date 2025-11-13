# get_metadata

Get metadata for a node or page in XML format - structure overview only.

**Access**: `mcp__figma-desktop__get_metadata`

**IMPORTANT**: Always prefer `get_design_context` for implementation. Use this only for structure overview.

## Parameters

- `nodeId` (string, optional): Node ID (can be page ID like "0:1") or uses selected node
- `clientFrameworks` (string, optional): Comma-separated frameworks
- `clientLanguages` (string, optional): Comma-separated languages

## Returns

XML format with:
- Node IDs
- Layer types
- Names
- Positions and sizes

## Errors

- Node not found
- Figma Desktop not running
- Invalid node ID

## Example

```typescript
// Get metadata for selected node
mcp__figma-desktop__get_metadata({})

// Get page structure
mcp__figma-desktop__get_metadata({
  nodeId: "0:1"
})
```

## Common Use Cases

- Understand page/component structure
- Find child node IDs
- Navigate complex designs
- Structure analysis before implementation

## Workflow

1. Use this to discover node IDs
2. Use `get_design_context` on specific node IDs for implementation
