# browser_console_messages

Returns all console messages from the page.

**Access**: `mcp__playwright__browser_console_messages`

## Parameters

- `onlyErrors` (boolean, optional): Only return error messages

## Returns

Array of console messages with type and text

## Errors

- Browser closed

## Example

```typescript
// Get all console messages
mcp__playwright__browser_console_messages({})

// Get only errors
mcp__playwright__browser_console_messages({
  onlyErrors: true
})
```

## Common Use Cases

- Debugging JavaScript errors
- Monitoring application logs
- Verifying console output in tests
