# MCP Servers Index

Global index of available MCP servers for Claude Code.

## Available Servers

| Server | Purpose | Tools | Documentation |
|--------|---------|-------|---------------|
| figma-desktop | Design extraction, code generation | 7 | `figma-desktop/INDEX.md` |
| playwright | Browser automation, testing | 21 | `playwright/INDEX.md` |

## Usage Pattern

### Progressive Discovery
1. Start here to find available servers
2. Navigate to server INDEX.md for tool overview
3. Load individual tool docs as needed

### Quick Reference

**Figma Desktop** - Design-to-code:
```typescript
mcp__figma-desktop__get_design_context({ nodeId: "123:456", ... })
mcp__figma-desktop__get_metadata({ nodeId: "123:456" })
mcp__figma-desktop__get_screenshot({ nodeId: "123:456" })
```

**Playwright** - Browser automation:
```typescript
mcp__playwright__browser_navigate({ url: "http://localhost:5173" })
mcp__playwright__browser_snapshot({})
mcp__playwright__browser_click({ element: "Button", ref: "btn123" })
```

## Adding New Servers

1. Create directory: `mcp-servers/{server-name}/`
2. Create `INDEX.md` with tool overview
3. Create individual tool files: `{tool-name}.md`
4. Update this table

---
Last Updated: November 2025
