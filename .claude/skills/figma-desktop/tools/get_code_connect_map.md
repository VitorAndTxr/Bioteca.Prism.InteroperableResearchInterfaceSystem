# get_code_connect_map

Get mapping between Figma components and codebase.

## Parameters

None (uses file key)

## Returns

Map of Figma component IDs to:
- Component names and keys
- Component descriptions
- Code file paths (requires Code Connect setup)
- Component names in code
- Import statements

## REST API Script

```bash
node .claude/skills/figma-desktop/scripts/get-code-connect-map.js xFC8eCJcSwB9EyicTmDJ7w
```

## MCP Tool (when Figma Desktop running)

```typescript
mcp__figma-desktop__get_code_connect_map({})
```

## Use Cases

- Find existing component implementations
- Maintain design-code sync
- Update component mappings

## Limitations

> [!WARNING]
> The REST API script extracts Figma component metadata only. Actual code mappings require Code Connect setup in Figma or Plugin API access. The MCP tool may have fuller access to Code Connect data.

## Notes

Requires Code Connect setup in Figma file for complete mapping.
