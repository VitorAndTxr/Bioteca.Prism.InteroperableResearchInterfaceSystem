# browser_press_key

Press a key on the keyboard.

**Access**: `mcp__playwright__browser_press_key`

## Parameters

- `key` (string, required): Key name or character - "Enter", "Tab", "ArrowLeft", "a", etc.

## Returns

Success status

## Errors

- Invalid key name
- Browser closed

## Example

```typescript
// Press Enter
mcp__playwright__browser_press_key({ key: "Enter" })

// Press arrow key
mcp__playwright__browser_press_key({ key: "ArrowDown" })

// Press character
mcp__playwright__browser_press_key({ key: "a" })

// Press Escape
mcp__playwright__browser_press_key({ key: "Escape" })
```

## Common Keys

- Navigation: "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"
- Special: "Enter", "Tab", "Escape", "Backspace", "Delete"
- Modifiers: "Control", "Alt", "Shift", "Meta"
