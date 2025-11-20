# get_annotations

Get design annotations and developer notes.

## Parameters

- **nodeId** (required): string - Figma node ID

## Returns

Annotations including:
- Developer handoff notes
- Interaction specifications
- Component states documentation

## Example

```typescript
mcp__figma-desktop__get_annotations({ nodeId: "6804:13742" })
```

## Use Cases

- Get implementation instructions from designers
- Extract interaction specifications
- Document component variants and states
