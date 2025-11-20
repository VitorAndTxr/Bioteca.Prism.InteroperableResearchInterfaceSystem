# Figma Desktop MCP Server

Design extraction and AI-powered code generation from Figma.

## Available Tools (7)

| Tool | Purpose | Doc |
|------|---------|-----|
| get_design_context | Generate React/TypeScript code | `get_design_context.md` |
| get_metadata | Get node structure | `get_metadata.md` |
| get_screenshot | Capture node screenshot | `get_screenshot.md` |
| get_variable_defs | Extract design tokens | `get_variable_defs.md` |
| get_code_connect_map | Map designs to code | `get_code_connect_map.md` |
| get_figjam | Extract FigJam content | `get_figjam.md` |
| get_annotations | Get design annotations | `get_annotations.md` |

## Primary Tool

**get_design_context** - Use this for code generation:
```typescript
mcp__figma-desktop__get_design_context({
  nodeId: "6804:13742",
  artifactType: "REUSABLE_COMPONENT",
  clientFrameworks: "react,typescript",
  clientLanguages: "typescript,jsx"
})
```

## Requirements

- Figma Desktop app must be running
- File must be open in Figma Desktop
- MCP server configured in Claude Code

## Common Workflow

1. Get metadata to understand structure
2. Get screenshot for visual reference
3. Get design context for code generation
4. Get variable defs for design tokens

---
Last Updated: November 2025
