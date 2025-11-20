---
name: figma-desktop
description: Extract design data from Figma files using REST API scripts and MCP tools. Includes frame extraction, metadata retrieval, screenshots, and design token extraction for design-to-code workflows.
---

# Figma Desktop Skill

Extract and process Figma design data for design-to-code implementation in the IRIS project.

## Capabilities

### REST API Scripts
Node.js scripts that work without Figma Desktop app:

- **extract-frames.js** - Extract all frames from a Figma page
- **get-metadata.js** - Get node structure (equivalent to MCP `get_metadata`)
- **get-screenshot.js** - Capture node screenshots (equivalent to MCP `get_screenshot`)
- **get-variable-defs.js** - Extract design tokens (equivalent to MCP `get_variable_defs`)
- **compare-frames.js** - Compare current vs documented frames

### MCP Tools (when Figma Desktop running)
For AI-powered code generation:

- `mcp__figma-desktop__get_design_context` - Generate React/TypeScript code from designs
- `mcp__figma-desktop__get_metadata` - Get node structure
- `mcp__figma-desktop__get_screenshot` - Capture screenshots
- `mcp__figma-desktop__get_variable_defs` - Extract design tokens
- `mcp__figma-desktop__get_code_connect_map` - Map designs to codebase
- `mcp__figma-desktop__get_figjam` - Extract FigJam content

## Setup

### Figma Token (for REST API scripts)

1. Go to https://www.figma.com/settings
2. Generate Personal Access Token
3. Set environment variable:
   ```bash
   # Windows (PowerShell)
   $env:FIGMA_TOKEN="your-token"
   ```

### IRIS Project File Key
```
xFC8eCJcSwB9EyicTmDJ7w
```

## Usage

### Extract Frames
```bash
node .claude/skills/figma-desktop/scripts/extract-frames.js xFC8eCJcSwB9EyicTmDJ7w 2501:2715
```

### Get Metadata
```bash
node .claude/skills/figma-desktop/scripts/get-metadata.js xFC8eCJcSwB9EyicTmDJ7w 6804:13742
```

### Get Screenshot
```bash
node .claude/skills/figma-desktop/scripts/get-screenshot.js xFC8eCJcSwB9EyicTmDJ7w 6804:13742
```

### Using MCP Tools
```typescript
// Get design context (primary tool for code generation)
mcp__figma-desktop__get_design_context({
  nodeId: "6804:13742",
  artifactType: "REUSABLE_COMPONENT",
  clientFrameworks: "react,typescript",
  clientLanguages: "typescript,jsx"
})

// Get node metadata
mcp__figma-desktop__get_metadata({ nodeId: "6804:13742" })

// Get screenshot
mcp__figma-desktop__get_screenshot({ nodeId: "6804:13742" })
```

## MCP Tool Documentation

For detailed MCP tool documentation, see:
- Global index: `.claude/skills/mcp-servers/INDEX.md`
- Figma tools: `.claude/skills/mcp-servers/figma-desktop/INDEX.md`

## Output Files

Scripts create temporary files in project root:
- `temp-frames-list.json` - Frame list
- `temp-metadata-*.json` - Node metadata
- `temp-design-tokens-*.json` - Design tokens
- `screenshot-*.png` - Screenshots

## Integration

This skill integrates with IRIS documentation:
- Frame mapping: `docs/figma/frame-node-mapping.json`
- Screenshots: `docs/figma/screenshots/`
- Design tokens: `docs/figma/design-system-mapping.json`

## When to Use

Use this skill when:
- Implementing UI components from Figma designs
- Extracting design tokens for the design system
- Updating frame mappings after Figma changes
- Generating screenshots for documentation
- Converting Figma components to React code
