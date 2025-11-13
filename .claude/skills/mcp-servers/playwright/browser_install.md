# browser_install

Install the browser specified in the config.

**Access**: `mcp__playwright__browser_install`

## Parameters

None

## Returns

Installation status

## Errors

- Browser already installed
- Download failed
- Insufficient permissions

## Example

```typescript
// Install browser
mcp__playwright__browser_install({})
```

## Usage

Call this if you get an error about the browser not being installed. This will download and install the required browser binaries.
