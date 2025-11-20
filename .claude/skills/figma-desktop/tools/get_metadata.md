# get_metadata

Get structure and hierarchy of a Figma node.

## Parameters

- **nodeId** (required): string - Figma node ID (e.g., "6804:13742")

## Returns

XML-like structure showing:
- Node type, ID, name
- Position and dimensions
- Child nodes hierarchy

## REST API Script

```bash
node .claude/skills/figma-desktop/scripts/get-metadata.js xFC8eCJcSwB9EyicTmDJ7w 6804:13742
```

## MCP Tool (when Figma Desktop running)

```typescript
mcp__figma-desktop__get_metadata({ nodeId: "6804:13742" })
```

## Use Cases

- Understand component structure before code generation
- Identify child elements and their IDs
- Get exact dimensions for layout

## Notes

Both REST API script and MCP tool provide equivalent functionality.
