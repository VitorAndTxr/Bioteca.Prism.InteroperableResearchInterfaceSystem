# browser_hover

Hover over element on page.

**Access**: `mcp__playwright__browser_hover`

## Parameters

- `element` (string, required): Human-readable element description
- `ref` (string, required): Exact element reference from page snapshot

## Returns

Success status

## Errors

- Element not found
- Element not visible

## Example

```typescript
// Hover over menu item to reveal submenu
mcp__playwright__browser_hover({
  element: "Products menu",
  ref: "nav123"
})
```
