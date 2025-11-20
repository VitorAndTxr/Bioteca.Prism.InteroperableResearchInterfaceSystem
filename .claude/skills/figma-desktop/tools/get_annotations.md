# get_annotations

Get design annotations and developer handoff notes from Figma nodes.

## Parameters

- **nodeId** (required): string - Figma node ID

## Returns

Annotations including:
- Developer handoff notes
- Interaction specifications
- Component states documentation
- Node descriptions
- Layout and component properties

## REST API Script

```bash
node .claude/skills/figma-desktop/scripts/get-annotations.js xFC8eCJcSwB9EyicTmDJ7w 6804:13742
```

## MCP Tool (when Figma Desktop running)

```typescript
mcp__figma-desktop__get_annotations({ nodeId: "6804:13742" })
```

## Use Cases

- Get implementation instructions from designers
- Extract interaction specifications
- Document component variants and states

## Limitations

> [!NOTE]
> The REST API script has limited access to Dev Mode annotations compared to the MCP tool. For full annotation access, use the MCP tool with Figma Desktop running.
