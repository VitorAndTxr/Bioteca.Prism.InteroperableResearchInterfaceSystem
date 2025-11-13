# browser_take_screenshot

Take screenshot of current page or specific element.

**Access**: `mcp__playwright__browser_take_screenshot`

## Parameters

- `element` (string, optional): Human-readable element description (requires `ref` too)
- `ref` (string, optional): Element reference from snapshot (requires `element` too)
- `filename` (string, optional): File name to save (defaults to `page-{timestamp}.{png|jpeg}`)
- `fullPage` (boolean, optional): Capture full scrollable page (cannot use with element)
- `type` (string, optional): Image format - "png" (default), "jpeg"

## Returns

Screenshot saved to specified file

## Errors

- Browser closed
- Element not found
- Invalid file path

## Example

```typescript
// Screenshot current viewport
mcp__playwright__browser_take_screenshot({})

// Full page screenshot
mcp__playwright__browser_take_screenshot({
  fullPage: true,
  filename: "full-page.png"
})

// Element screenshot
mcp__playwright__browser_take_screenshot({
  element: "Login form",
  ref: "form123",
  filename: "login-form.png"
})
```
