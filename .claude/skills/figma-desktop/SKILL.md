---
name: figma-desktop
description: Extract design data from Figma files using REST API scripts and MCP tools. Includes frame extraction, metadata retrieval, screenshots, design token extraction, annotations, and FigJam content for design-to-code workflows.
---

# Figma Desktop Skill

Extract and process Figma design data for design-to-code implementation in the IRIS project.

## Capabilities

### REST API Scripts
Node.js scripts that work **without** Figma Desktop app (requires `FIGMA_TOKEN`):

- **extract-frames.js** - Extract all frames from a Figma page
- **get-metadata.js** - Get node structure and hierarchy
- **get-screenshot.js** - Capture node screenshots
- **get-variable-defs.js** - Extract design tokens (colors, text styles, variables)
- **get-annotations.js** - Get dev mode annotations and handoff notes
- **get-code-connect-map.js** - Get Figma component metadata for code mapping
- **get-figjam.js** - Extract FigJam board content (sticky notes, shapes, text)
- **compare-frames.js** - Compare current vs documented frames

### MCP Tools
For AI-powered features (requires Figma Desktop app running):

- `mcp__figma-desktop__get_design_context` - **AI code generation** (React/TypeScript) - **MCP ONLY**
- `mcp__figma-desktop__get_metadata` - Get node structure (also available via REST API)
- `mcp__figma-desktop__get_screenshot` - Capture screenshots (also available via REST API)
- `mcp__figma-desktop__get_variable_defs` - Extract design tokens (also available via REST API)
- `mcp__figma-desktop__get_annotations` - Get annotations (REST API has limited access)
- `mcp__figma-desktop__get_code_connect_map` - Map designs to codebase (REST API has limited access)
- `mcp__figma-desktop__get_figjam` - Extract FigJam content (also available via REST API)

> [!IMPORTANT]
> **AI Code Generation**: The `get_design_context` tool is **MCP-exclusive** and cannot be replicated via REST API. Use the MCP server with Figma Desktop for AI-powered code generation.

## Tool Documentation

Detailed documentation for each tool is available in `tools/`:
- [get_design_context.md](tools/get_design_context.md) - AI code generation (MCP only)
- [get_metadata.md](tools/get_metadata.md) - Node structure
- [get_screenshot.md](tools/get_screenshot.md) - Screenshots
- [get_variable_defs.md](tools/get_variable_defs.md) - Design tokens
- [get_annotations.md](tools/get_annotations.md) - Annotations and handoff notes
- [get_code_connect_map.md](tools/get_code_connect_map.md) - Component mapping
- [get_figjam.md](tools/get_figjam.md) - FigJam content

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

### REST API Scripts

#### Extract Frames
```bash
node .claude/skills/figma-desktop/scripts/extract-frames.js xFC8eCJcSwB9EyicTmDJ7w 2501:2715
```

#### Get Metadata
```bash
node .claude/skills/figma-desktop/scripts/get-metadata.js xFC8eCJcSwB9EyicTmDJ7w 6804:13742
```

#### Get Screenshot
```bash
node .claude/skills/figma-desktop/scripts/get-screenshot.js xFC8eCJcSwB9EyicTmDJ7w 6804:13742
```

#### Get Design Tokens
```bash
node .claude/skills/figma-desktop/scripts/get-variable-defs.js xFC8eCJcSwB9EyicTmDJ7w
```

#### Get Annotations
```bash
node .claude/skills/figma-desktop/scripts/get-annotations.js xFC8eCJcSwB9EyicTmDJ7w 6804:13742
```

#### Get Code Connect Mapping
```bash
node .claude/skills/figma-desktop/scripts/get-code-connect-map.js xFC8eCJcSwB9EyicTmDJ7w
```

#### Get FigJam Content
```bash
node .claude/skills/figma-desktop/scripts/get-figjam.js xFC8eCJcSwB9EyicTmDJ7w 123:456
```

### MCP Tools

#### AI Code Generation (MCP Only)
```typescript
// Primary tool for design-to-code - generates React/TypeScript components
mcp__figma-desktop__get_design_context({
  nodeId: "6804:13742",
  artifactType: "REUSABLE_COMPONENT",
  clientFrameworks: "react,typescript",
  clientLanguages: "typescript,jsx"
})
```

#### Get Node Metadata
```typescript
mcp__figma-desktop__get_metadata({ nodeId: "6804:13742" })
```

#### Get Screenshot
```typescript
mcp__figma-desktop__get_screenshot({ nodeId: "6804:13742" })
```

#### Get Design Tokens
```typescript
mcp__figma-desktop__get_variable_defs({})
```

## When to Use REST API vs MCP

### Use REST API Scripts When:
- ✅ Figma Desktop is not running
- ✅ You need to extract design data (metadata, screenshots, tokens)
- ✅ You're automating batch operations
- ✅ You're running in CI/CD pipelines

### Use MCP Tools When:
- ✅ You need AI-powered code generation (`get_design_context`)
- ✅ Figma Desktop is already running
- ✅ You need full Dev Mode annotation access
- ✅ You need complete Code Connect mappings

## Output Files

Scripts create temporary files in project root:
- `temp-frames-list.json` - Frame list
- `temp-metadata-*.json` - Node metadata
- `temp-design-tokens-*.json` - Design tokens
- `temp-annotations-*.json` - Annotations data
- `temp-code-connect-*.json` - Component mappings
- `temp-figjam-*.json` - FigJam content
- `screenshot-*.png` - Screenshots

## Integration

This skill integrates with IRIS documentation:
- Frame mapping: `docs/figma/frame-node-mapping.json`
- Screenshots: `docs/figma/screenshots/`
- Design tokens: `docs/figma/design-system-mapping.json`

## When to Use This Skill

Use this skill when:
- Implementing UI components from Figma designs
- Extracting design tokens for the design system
- Updating frame mappings after Figma changes
- Generating screenshots for documentation
- Converting Figma components to React code (MCP only)
- Extracting FigJam brainstorming content
- Getting dev handoff notes and annotations
