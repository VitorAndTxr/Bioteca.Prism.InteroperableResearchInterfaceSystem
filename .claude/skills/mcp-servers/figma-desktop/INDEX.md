# Figma Desktop MCP Server

**Purpose**: Extract design context, screenshots, and code from Figma designs for implementation

**Integration**: Native Claude Code MCP integration via `mcp__figma-desktop__*` tools

**Setup**: Requires Figma Desktop app running with selected design nodes

## Tools: 7

| Tool | Description | File |
|------|-------------|------|
| get_design_context | Generate UI code for Figma node (primary tool) | `get_design_context.md` |
| get_variable_defs | Get variable definitions (colors, fonts, spacing) | `get_variable_defs.md` |
| get_code_connect_map | Map Figma nodes to codebase components | `get_code_connect_map.md` |
| get_screenshot | Generate screenshot for Figma node | `get_screenshot.md` |
| get_metadata | Get node metadata in XML format (structure only) | `get_metadata.md` |
| create_design_system_rules | Generate design system rules prompt | `create_design_system_rules.md` |
| get_figjam | Extract FigJam board content | `get_figjam.md` |

## Common Use Cases

### Design-to-Code Implementation
1. Select component in Figma Desktop
2. Use `get_design_context` to extract implementation code
3. Use `get_variable_defs` for design tokens
4. Use `get_code_connect_map` to find existing components

### Design System Documentation
1. Use `get_variable_defs` to extract design tokens
2. Use `create_design_system_rules` for style guide
3. Map components with `get_code_connect_map`

### Visual Reference
1. Capture designs with `get_screenshot`
2. Extract structure with `get_metadata`
3. Compare with implementation

## Node ID Format

Node IDs can be provided in two formats:
- Standard: `"123:456"` or `"123-456"`
- From URL: Extract from Figma URL
  - Example: `https://figma.com/design/:fileKey/:fileName?node-id=1-2`
  - Extracted nodeId: `"1:2"`

## Key Features

- **AI-Powered Code Generation**: Generates implementation code from designs
- **Design Token Extraction**: Variables, colors, fonts, spacing
- **Component Mapping**: Links Figma components to codebase
- **FigJam Support**: Extract content from FigJam boards
- **Context-Aware**: Understands artifact type and frameworks

## Best Practices

1. **Always use `get_design_context` first** for implementation - most comprehensive tool
2. **Extract node IDs from Figma URLs** for precise targeting
3. **Specify frameworks and languages** for better code generation
4. **Use `get_metadata` for structure overview** before diving into details
5. **Leverage design tokens** via `get_variable_defs` for consistency

## Artifact Types

When using `get_design_context`, specify:
- `WEB_PAGE_OR_APP_SCREEN` - Full page/screen
- `COMPONENT_WITHIN_A_WEB_PAGE_OR_APP_SCREEN` - Component in a page
- `REUSABLE_COMPONENT` - Standalone reusable component
- `DESIGN_SYSTEM` - Design system documentation

## Supported Frameworks

Common frameworks to specify:
- react, vue, angular, svelte
- react-native, expo
- tailwindcss, styled-components
- typescript, javascript

---

**Documentation Source**: Claude Code MCP integration
**Last Updated**: November 12, 2025
**Requires**: Figma Desktop app running
