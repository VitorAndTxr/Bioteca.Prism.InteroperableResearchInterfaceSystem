# get_screenshot

Capture a visual screenshot of a Figma node.

## Parameters

- **nodeId** (required): string - Figma node ID (e.g., "6804:13742")

## Returns

PNG image data of the specified node.

## Example

```typescript
mcp__figma-desktop__get_screenshot({ nodeId: "6804:13742" })
```

## Use Cases

- Visual reference during implementation
- Documentation and design specs
- Comparing implementation with design

## REST API Alternative

```bash
node .claude/skills/figma-desktop/scripts/get-screenshot.js xFC8eCJcSwB9EyicTmDJ7w 6804:13742 token output.png
```
