# get_figjam

Extract content from FigJam boards.

## Parameters

- **nodeId** (required): string - FigJam node ID

## Returns

FigJam content including:
- Sticky notes text
- Shapes and connectors
- Comments and annotations

## Example

```typescript
mcp__figma-desktop__get_figjam({ nodeId: "123:456" })
```

## Use Cases

- Extract requirements from FigJam boards
- Document brainstorming sessions
- Parse workflow diagrams
