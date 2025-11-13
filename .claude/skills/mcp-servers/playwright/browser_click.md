# browser_click

Perform click on a web page element.

**Access**: `mcp__playwright__browser_click`

## Parameters

- `element` (string, required): Human-readable element description
- `ref` (string, required): Exact element reference from page snapshot
- `button` (string, optional): Click button - "left" (default), "right", "middle"
- `doubleClick` (boolean, optional): Perform double click instead of single
- `modifiers` (array, optional): Modifier keys - "Alt", "Control", "ControlOrMeta", "Meta", "Shift"

## Returns

Success/failure status of click action

## Errors

- Element not found
- Element not clickable
- Element obscured by another element

## Example

```typescript
// Get ref from browser_snapshot first
mcp__playwright__browser_click({
  element: "Submit button",
  ref: "xyz123"
})

// Right-click with modifier
mcp__playwright__browser_click({
  element: "Context menu trigger",
  ref: "abc456",
  button: "right",
  modifiers: ["Control"]
})
```
