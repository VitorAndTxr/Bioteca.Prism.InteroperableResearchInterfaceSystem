# get_figjam

Extract content from FigJam boards.

## Parameters

- **nodeId** (required): string - FigJam node ID

## Returns

FigJam content including:
- Sticky notes text and positions
- Shapes and connectors
- Text nodes
- Comments and annotations
- Node hierarchy

## REST API Script

```bash
node .claude/skills/figma-desktop/scripts/get-figjam.js xFC8eCJcSwB9EyicTmDJ7w 123:456
```

## MCP Tool (when Figma Desktop running)

```typescript
mcp__figma-desktop__get_figjam({ nodeId: "123:456" })
```

## Use Cases

- Extract requirements from FigJam boards
- Document brainstorming sessions
- Parse workflow diagrams
- Extract sticky note content for documentation

## Limitations

> [!NOTE]
> The REST API script extracts basic FigJam content. Advanced widgets and interactive elements may require Plugin API or MCP tool access.
