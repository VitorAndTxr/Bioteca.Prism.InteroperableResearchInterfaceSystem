# browser_snapshot

Capture accessibility snapshot of the current page - better than screenshot for automation.

**Access**: `mcp__playwright__browser_snapshot`

## Parameters

None

## Returns

- Structured accessibility tree with `ref` attributes for element targeting
- Text content and interactive elements
- Element hierarchy and roles

## Errors

- Page not loaded
- Browser closed

## Example

```typescript
// Capture page structure for element selection
const snapshot = mcp__playwright__browser_snapshot({})
// Use ref attributes from snapshot for precise element targeting
```

## Common Use Cases

- Element discovery before interaction
- Extracting structured page data
- Verifying page structure
- Finding elements for clicking/typing

## Best Practice

**Always prefer this over `browser_take_screenshot` for automation** - provides actionable element references.
