# get_design_context

Generate AI-powered code from Figma designs.

## Parameters

- **nodeId** (required): string - Figma node ID (e.g., "6804:13742")
- **artifactType** (required): string - "REUSABLE_COMPONENT" | "SCREEN" | "ICON"
- **clientFrameworks** (required): string - Comma-separated frameworks (e.g., "react,typescript")
- **clientLanguages** (required): string - Comma-separated languages (e.g., "typescript,jsx")

## Returns

Generated code with:
- Component implementation (React/TypeScript)
- Props interface
- Styles (CSS/Tailwind)
- Usage examples

## MCP Tool ONLY (requires Figma Desktop running)

```typescript
mcp__figma-desktop__get_design_context({
  nodeId: "6804:13742",
  artifactType: "REUSABLE_COMPONENT",
  clientFrameworks: "react,typescript",
  clientLanguages: "typescript,jsx"
})
```

## Use Cases

- Primary tool for design-to-code
- Generate React components from Figma designs
- Extract component props and styling

## Important

> [!IMPORTANT]
> **MCP-ONLY FEATURE**: This tool uses AI-powered code generation that is **not available** via the Figma REST API. You must use the MCP server with Figma Desktop running to access this functionality.

## Notes

- Requires Figma Desktop running with file open
- Output quality depends on Figma layer naming
- No REST API alternative available
