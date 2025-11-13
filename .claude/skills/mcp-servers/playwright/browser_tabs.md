# browser_tabs

List, create, close, or select a browser tab.

**Access**: `mcp__playwright__browser_tabs`

## Parameters

- `action` (string, required): Operation - "list", "new", "close", "select"
- `index` (number, optional): Tab index for close/select (omit for close to close current tab)

## Returns

- "list": Array of tab information
- "new": New tab created
- "close": Tab closed
- "select": Tab selected

## Errors

- Invalid tab index
- No tabs available

## Example

```typescript
// List all tabs
mcp__playwright__browser_tabs({ action: "list" })

// Create new tab
mcp__playwright__browser_tabs({ action: "new" })

// Close current tab
mcp__playwright__browser_tabs({ action: "close" })

// Select specific tab
mcp__playwright__browser_tabs({ action: "select", index: 0 })
```
