# get_code_connect_map

Get mapping between Figma components and codebase.

## Parameters

None (uses currently open file)

## Returns

Map of Figma component IDs to:
- Code file paths
- Component names
- Import statements

## Example

```typescript
mcp__figma-desktop__get_code_connect_map({})
```

## Use Cases

- Find existing component implementations
- Maintain design-code sync
- Update component mappings

## Notes

Requires Code Connect setup in Figma file.
