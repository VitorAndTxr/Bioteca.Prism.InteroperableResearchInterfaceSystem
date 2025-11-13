# browser_wait_for

Wait for text to appear/disappear or time to pass.

**Access**: `mcp__playwright__browser_wait_for`

## Parameters

- `text` (string, optional): Text to wait for appearance
- `textGone` (string, optional): Text to wait for disappearance
- `time` (number, optional): Time to wait in seconds

## Returns

Success when condition met or timeout

## Errors

- Timeout waiting for condition
- Browser closed

## Example

```typescript
// Wait for text to appear
mcp__playwright__browser_wait_for({
  text: "Loading complete"
})

// Wait for text to disappear
mcp__playwright__browser_wait_for({
  textGone: "Loading..."
})

// Wait for time
mcp__playwright__browser_wait_for({
  time: 3
})
```
