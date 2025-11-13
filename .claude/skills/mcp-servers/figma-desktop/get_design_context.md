# get_design_context

Generate UI code for a Figma node or currently selected node. Primary tool for design-to-code.

**Access**: `mcp__figma-desktop__get_design_context`

## Parameters

- `nodeId` (string, optional): Node ID in format "123:456" or "123-456" (uses selected node if omitted)
- `artifactType` (string, optional): Type of artifact being created:
  - `WEB_PAGE_OR_APP_SCREEN` - Full page/screen
  - `COMPONENT_WITHIN_A_WEB_PAGE_OR_APP_SCREEN` - Component in page
  - `REUSABLE_COMPONENT` - Standalone component
  - `DESIGN_SYSTEM` - Design system documentation
- `taskType` (string, optional): Task type:
  - `CREATE_ARTIFACT` - Creating new
  - `CHANGE_ARTIFACT` - Modifying existing
  - `DELETE_ARTIFACT` - Removing
- `clientFrameworks` (string, optional): Comma-separated frameworks (e.g., "react,typescript,tailwindcss")
- `clientLanguages` (string, optional): Comma-separated languages (e.g., "javascript,html,css,typescript")
- `dirForAssetWrites` (string, optional): Absolute path for writing image/video assets
- `forceCode` (boolean, optional): Always return code instead of metadata if output is large

## Returns

- Generated UI code (HTML, React, etc.)
- Design specifications
- Asset references
- Implementation notes

## Errors

- Node not found
- Figma Desktop not running
- Invalid node ID format
- Node not accessible

## Example

```typescript
// Generate code for selected node
mcp__figma-desktop__get_design_context({
  artifactType: "REUSABLE_COMPONENT",
  clientFrameworks: "react,typescript",
  clientLanguages: "typescript,jsx"
})

// Generate code for specific node
mcp__figma-desktop__get_design_context({
  nodeId: "123:456",
  artifactType: "WEB_PAGE_OR_APP_SCREEN",
  clientFrameworks: "react-native,expo",
  dirForAssetWrites: "D:/project/assets"
})
```

## Best Practices

- Specify frameworks and languages for better code quality
- Use artifactType to guide code generation
- Provide asset directory for image exports
- Extract node ID from Figma URLs: `?node-id=1-2` → `"1:2"`
