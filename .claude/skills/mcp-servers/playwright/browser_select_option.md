# browser_select_option

Select an option in a dropdown.

**Access**: `mcp__playwright__browser_select_option`

## Parameters

- `element` (string, required): Human-readable element description
- `ref` (string, required): Exact element reference from snapshot
- `values` (array, required): Array of values to select (single or multiple)

## Returns

Success status

## Errors

- Element not found
- Element not a select
- Value not available

## Example

```typescript
// Select single option
mcp__playwright__browser_select_option({
  element: "Country dropdown",
  ref: "select123",
  values: ["United States"]
})

// Select multiple options
mcp__playwright__browser_select_option({
  element: "Tags selector",
  ref: "multi456",
  values: ["tag1", "tag2", "tag3"]
})
```
