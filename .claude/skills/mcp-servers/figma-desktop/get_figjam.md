# get_figjam

Generate UI code for FigJam node or currently selected FigJam node.

**Access**: `mcp__figma-desktop__get_figjam`

**IMPORTANT**: This tool only works for FigJam files, not regular Figma design files.

## Parameters

- `nodeId` (string, optional): Node ID in format "123:456" or "123-456" (uses selected node if omitted)
- `clientFrameworks` (string, optional): Comma-separated frameworks
- `clientLanguages` (string, optional): Comma-separated languages
- `includeImagesOfNodes` (boolean, optional): Include images of nodes (default: true)

## Returns

- FigJam content (text, stickies, shapes)
- Node images (if enabled)
- Structure and relationships

## Errors

- Node not found
- Figma Desktop not running
- File is not a FigJam file
- Invalid node ID

## Example

```typescript
// Extract selected FigJam content
mcp__figma-desktop__get_figjam({})

// Extract specific FigJam node with images
mcp__figma-desktop__get_figjam({
  nodeId: "123:456",
  includeImagesOfNodes: true
})

// From FigJam URL: https://figma.com/board/:fileKey/:fileName?node-id=1-2
mcp__figma-desktop__get_figjam({
  nodeId: "1:2"
})
```

## Common Use Cases

- Extract brainstorming content
- Document user flows
- Convert wireframes to implementation
- Process workshop outputs

## URL Format

Extract node ID from FigJam URL:
- URL: `https://figma.com/board/:fileKey/:fileName?node-id=1-2`
- Node ID: `"1:2"`
