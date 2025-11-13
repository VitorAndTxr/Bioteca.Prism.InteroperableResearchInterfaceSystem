# browser_type

Type text into editable element.

**Access**: `mcp__playwright__browser_type`

## Parameters

- `element` (string, required): Human-readable element description
- `ref` (string, required): Exact element reference from page snapshot
- `text` (string, required): Text to type
- `slowly` (boolean, optional): Type one character at a time (triggers key handlers)
- `submit` (boolean, optional): Press Enter after typing

## Returns

Success/failure status

## Errors

- Element not found
- Element not editable
- Element disabled

## Example

```typescript
// Type in input field
mcp__playwright__browser_type({
  element: "Username input",
  ref: "input123",
  text: "john.doe@example.com"
})

// Type and submit form
mcp__playwright__browser_type({
  element: "Search box",
  ref: "search456",
  text: "query term",
  submit: true
})
```
