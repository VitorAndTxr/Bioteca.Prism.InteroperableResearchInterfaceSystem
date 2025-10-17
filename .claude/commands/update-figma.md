---
description: Update all Figma mappings and extract latest designs
---

# 🎨 Update Figma Mappings

I will sync all Figma designs and update the project mappings.

## Process:
1. Connect to Figma via MCP tools
2. Check for new or updated designs
3. Update node mappings in `docs/figma/`
4. Extract any new design tokens
5. Generate new tasks if components/screens are added
6. Update documentation

## Figma Resources:

### Design System
- **Page Node**: 801-23931
- **Components**: 30 total
- **Location**: `docs/figma/design-system-mapping.json`

### Application Screens
- **Main Node**: 6804-13742
- **Screens**: 18 total
- **Location**: `docs/figma/frame-node-mapping.json`

## Actions:
1. Extract latest component specs
2. Update design tokens (colors, typography, spacing)
3. Download any new assets
4. Check for component variants
5. Update implementation queue with new items

## MCP Commands:
```bash
# Get design system updates
mcp__figma-desktop__get_metadata --nodeId=801-23931

# Get specific component
mcp__figma-desktop__get_design_context --nodeId={nodeId}

# Extract variables
mcp__figma-desktop__get_variable_defs --nodeId={nodeId}
```

Let me check for Figma updates...