# IRIS Skills Documentation

This directory contains organized documentation for MCP (Model Context Protocol) servers integrated with Claude Code, following the progressive tool discovery pattern for token efficiency.

## Overview

Skills are organized to minimize token usage by loading documentation on-demand rather than upfront. Each tool has its own file that's only accessed when needed.

## Structure

```
.claude/skills/
├── README.md                    # This file
├── MCP_SUBAGENT_PATTERN.md      # Zero-memory loading pattern
│
├── figma-desktop/               # Figma Desktop Skill
│   ├── SKILL.md                 # Skill metadata (required)
│   └── scripts/                 # REST API scripts
│       ├── README.md            # Scripts documentation
│       ├── extract-frames.js    # Extract all frames from page
│       ├── get-metadata.js      # Get node structure
│       ├── get-screenshot.js    # Capture screenshots
│       ├── get-variable-defs.js # Extract design tokens
│       └── compare-frames.js    # Compare frames
│
└── mcp-servers/                 # MCP Tool Documentation
    ├── INDEX.md                 # Global MCP servers index
    │
    ├── playwright/              # Browser automation
    │   └── INDEX.md             # Server overview (21 tools)
    │
    └── figma-desktop/           # Figma design extraction
        ├── INDEX.md             # Server overview
        ├── get_design_context.md
        ├── get_metadata.md
        ├── get_screenshot.md
        ├── get_variable_defs.md
        ├── get_code_connect_map.md
        ├── get_figjam.md
        └── get_annotations.md
```

## Usage Pattern

### 1. Progressive Discovery

**Start with the global index:**
```
Read: .claude/skills/mcp-servers/INDEX.md
```

**Navigate to specific server:**
```
Read: .claude/skills/mcp-servers/playwright/INDEX.md
```

**Load individual tools as needed:**
```
Read: .claude/skills/mcp-servers/playwright/browser_navigate.md
```

### 2. Token Efficiency Benefits

- **Zero tokens until accessed**: Tool docs only loaded when needed
- **Succinct documentation**: <200 tokens per tool file
- **Searchable structure**: Easy to find relevant tools
- **No redundancy**: Each tool documented once

### 3. Integration with Claude Code

All MCP tools are already integrated and accessible via the `mcp__` prefix:

**Playwright:**
```typescript
mcp__playwright__browser_navigate({ url: "https://example.com" })
mcp__playwright__browser_snapshot({})
mcp__playwright__browser_click({ element: "Button", ref: "btn123" })
```

**Figma Desktop:**
```typescript
mcp__figma-desktop__get_design_context({
  nodeId: "123:456",
  artifactType: "REUSABLE_COMPONENT",
  clientFrameworks: "react,typescript"
})
```

## Available MCP Servers

### Playwright (21 tools)
Browser automation for testing, screenshots, and web interaction.

**Key Tools:**
- `browser_navigate` - Navigate to URLs
- `browser_snapshot` - Capture accessibility tree (preferred)
- `browser_click` - Click elements
- `browser_type` - Type into inputs
- `browser_fill_form` - Fill multiple fields
- `browser_take_screenshot` - Capture visual screenshots
- `browser_evaluate` - Execute JavaScript
- `browser_network_requests` - Monitor network traffic

**Use Cases:**
- Automated testing
- Web scraping
- Visual debugging
- User flow testing

### Figma Desktop (7 tools)
Design-to-code implementation with AI-powered code generation.

**Key Tools:**
- `get_design_context` - Generate code from designs (primary)
- `get_variable_defs` - Extract design tokens
- `get_code_connect_map` - Map designs to codebase
- `get_screenshot` - Capture design visuals
- `get_metadata` - Get structure overview
- `get_figjam` - Extract FigJam content

**Use Cases:**
- Design-to-code implementation
- Design token extraction
- Component mapping
- Design system documentation

## Best Practices

### For AI Assistants (Claude Code)

1. **Reference skills when relevant**: When a user asks about browser automation or Figma, reference these docs
2. **Load progressively**: Start with INDEX files, drill down as needed
3. **Cite sources**: Reference specific tool documentation when providing examples
4. **Stay current**: These docs reflect the actual MCP tool parameters

### For Developers

1. **Start with INDEX files**: Get overview before diving into specific tools
2. **Use examples**: Each tool file includes practical examples
3. **Check parameters**: All required/optional parameters documented
4. **Handle errors**: Common errors listed for each tool

### For Documentation Updates

1. **Keep concise**: Target <200 tokens per tool file
2. **Update timestamp**: Mark "Last Updated" when changing
3. **Validate parameters**: Match actual MCP tool signatures
4. **Add examples**: Show typical usage patterns

## Documentation Standards

Following the mcp-mapper agent pattern:

- **Succinct**: Every word costs tokens - optimize ruthlessly
- **Structured**: Consistent format across all tool files
- **Practical**: Examples show real-world usage
- **Current**: Documentation matches actual tool implementations

## Maintenance

### Adding New Tools

1. Create tool file in appropriate server directory
2. Update server INDEX.md tool count and table
3. Update global INDEX.md if adding new server
4. Follow template from existing tool files

### Updating Existing Tools

1. Locate tool file in server directory
2. Update parameters, returns, or examples
3. Update "Last Updated" in server INDEX.md
4. Validate changes against actual MCP behavior

## Integration with IRIS Project

These skills support the IRIS (Interoperable Research Interface System) project:

- **Desktop App**: Uses Playwright for automated testing
- **Design System**: Uses Figma for component implementation
- **Development Workflow**: Progressive tool discovery improves development efficiency

## Related Documentation

- **Project Setup**: `../../CLAUDE.md`
- **MCP Mapper Agent**: `../agents/mcp-mapper.md`
- **Development Guide**: `../../docs/development/DEVELOPMENT_GUIDE.md`

---

**Created**: November 12, 2025
**Pattern**: Based on Anthropic's "Code Execution with MCP" progressive discovery pattern
**Maintained By**: IRIS Project Team
