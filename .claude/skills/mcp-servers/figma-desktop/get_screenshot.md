# get_screenshot

Generate screenshot for a Figma node or currently selected node.

**Access**: `mcp__figma-desktop__get_screenshot`

## Parameters

- `nodeId` (string, optional): Node ID in format "123:456" or "123-456" (uses selected node if omitted)
- `clientFrameworks` (string, optional): Comma-separated frameworks
- `clientLanguages` (string, optional): Comma-separated languages

## Returns

Screenshot image of the Figma node

## Errors

- Node not found
- Figma Desktop not running
- Node not renderable

## Example

```typescript
// Screenshot selected node
mcp__figma-desktop__get_screenshot({})

// Screenshot specific node
mcp__figma-desktop__get_screenshot({
  nodeId: "123:456"
})
```

## Common Use Cases

- Visual reference during implementation
- Documentation generation
- Design review
- Before/after comparisons

## Note

For implementation purposes, prefer `get_design_context` which provides structured data.
