# browser_network_requests

Returns all network requests since loading the page.

**Access**: `mcp__playwright__browser_network_requests`

## Parameters

None

## Returns

Array of network requests with:
- URL
- Method (GET, POST, etc.)
- Status code
- Response headers
- Timing information

## Errors

- Browser closed

## Example

```typescript
// Get all network requests
const requests = mcp__playwright__browser_network_requests({})
```

## Common Use Cases

- Debugging API calls
- Monitoring network performance
- Verifying resource loading
- Tracking failed requests
