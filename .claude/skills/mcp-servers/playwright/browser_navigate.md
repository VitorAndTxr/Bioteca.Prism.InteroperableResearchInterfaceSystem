# browser_navigate

Navigate browser to a specified URL.

**Access**: `mcp__playwright__browser_navigate`

## Parameters

- `url` (string, required): The URL to navigate to

## Returns

Success/failure status of navigation

## Errors

- Invalid URL format
- Network timeout
- DNS resolution failure

## Example

```typescript
// Navigate to a website
mcp__playwright__browser_navigate({
  url: "https://example.com"
})
```

## Common Use Cases

- Start of automated workflows
- Testing page loads
- Navigating between application pages
