# browser_resize

Resize the browser window.

**Access**: `mcp__playwright__browser_resize`

## Parameters

- `width` (number, required): Width of browser window in pixels
- `height` (number, required): Height of browser window in pixels

## Returns

Success status

## Errors

- Invalid dimensions
- Browser closed

## Example

```typescript
// Resize to mobile viewport
mcp__playwright__browser_resize({
  width: 375,
  height: 667
})

// Resize to desktop
mcp__playwright__browser_resize({
  width: 1920,
  height: 1080
})
```
