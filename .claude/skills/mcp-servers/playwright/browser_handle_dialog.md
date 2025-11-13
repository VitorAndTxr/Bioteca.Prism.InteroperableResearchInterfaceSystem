# browser_handle_dialog

Handle a browser dialog (alert, confirm, prompt).

**Access**: `mcp__playwright__browser_handle_dialog`

## Parameters

- `accept` (boolean, required): Whether to accept the dialog
- `promptText` (string, optional): Text to enter in prompt dialog

## Returns

Success status

## Errors

- No dialog present
- Browser closed

## Example

```typescript
// Accept alert/confirm
mcp__playwright__browser_handle_dialog({ accept: true })

// Dismiss dialog
mcp__playwright__browser_handle_dialog({ accept: false })

// Handle prompt with text
mcp__playwright__browser_handle_dialog({
  accept: true,
  promptText: "My response"
})
```
