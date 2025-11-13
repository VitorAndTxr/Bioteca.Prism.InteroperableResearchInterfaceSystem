# browser_drag

Perform drag and drop between two elements.

**Access**: `mcp__playwright__browser_drag`

## Parameters

- `startElement` (string, required): Human-readable source element description
- `startRef` (string, required): Source element reference from snapshot
- `endElement` (string, required): Human-readable target element description
- `endRef` (string, required): Target element reference from snapshot

## Returns

Success status

## Errors

- Element not found
- Element not draggable
- Drop target invalid

## Example

```typescript
// Drag file to upload zone
mcp__playwright__browser_drag({
  startElement: "File item",
  startRef: "file123",
  endElement: "Drop zone",
  endRef: "zone456"
})
```
