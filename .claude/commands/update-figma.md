---
description: Update all Figma mappings and extract latest designs
---

# 🎨 Update Figma Mappings

I will sync all Figma designs and update the project mappings using the **progressive skill discovery pattern**.

## Process

### Step 1: Load Skills Documentation 📚

Following the progressive discovery pattern from `.claude/skills/README.md`:

```
1. Read: .claude/skills/mcp-servers/INDEX.md (global overview)
2. Read: .claude/skills/mcp-servers/figma-desktop/INDEX.md (7 Figma tools)
3. Read individual tool docs as needed:
   - get_metadata.md (component structure)
   - get_design_context.md (code generation)
   - get_variable_defs.md (design tokens)
   - get_screenshot.md (visual reference)
```

**Why Progressive Discovery?**
- Zero tokens until accessed
- ~85% token savings vs. upfront loading
- Load only what you need when you need it

### Step 2: Extract Figma Resources 🎨

Using the loaded MCP tools:

**Figma File**: I.R.I.S.-Prototype (xFC8eCJcSwB9EyicTmDJ7w)
- Design System: 33 components (node 801-23931)
- Application Screens: 31 screens (node 6804-13742)

**Target Documentation**:
- `docs/figma/design-system-mapping.json`
- `docs/figma/frame-node-mapping.json`
- `docs/figma/MCP_SERVER_CONNECTION_MAP.md`

**Primary Method - Figma MCP**:
```
mcp__figma-desktop__get_metadata({ nodeId: "801-23931" })  // Design system
mcp__figma-desktop__get_metadata({ nodeId: "6804-13742" }) // App screens
mcp__figma-desktop__get_design_context({ nodeId: "...", artifactType: "REUSABLE_COMPONENT" })
mcp__figma-desktop__get_variable_defs() // Design tokens
```

**Fallback Method - Playwright MCP** (if Figma unavailable):
```
mcp__playwright__browser_navigate({ url: "https://figma.com/design/..." })
mcp__playwright__browser_snapshot() // Extract structure
mcp__playwright__browser_take_screenshot({ fullPage: true })
```

### Step 4: Update Documentation 📝

Actions performed:
1. Extract component specs with frame links
2. Update design tokens (colors, typography, spacing)
3. Map frame URLs
4. Check for component variants/states
5. Update implementation queue
6. Generate frame link documentation

**Files Updated**:
- `docs/figma/design-system-mapping.json` (33 components)
- `docs/figma/frame-node-mapping.json` (31 screens)
- `docs/figma/MCP_SERVER_CONNECTION_MAP.md` (MCP mapping)
- `docs/figma/FIGMA_MAPPING_UPDATE.md` (update notes)

## Output Report

```
═══════════════════════════════════════
    FIGMA UPDATE COMPLETE
═══════════════════════════════════════

📚 Skills Documentation:
✅ Progressive discovery pattern applied
✅ Loaded: INDEX → figma-desktop → individual tools
✅ Token efficiency: ~85% savings

🎨 Design System:
✅ Components: {{updatedCount}}/33 updated
✅ Frame URLs: 33 mapped

📱 Application Screens:
✅ Screens: {{updatedCount}}/31 updated
✅ Frame URLs: 31 mapped

📁 Files Updated:
✅ design-system-mapping.json
✅ frame-node-mapping.json
✅ MCP_SERVER_CONNECTION_MAP.md
✅ FIGMA_MAPPING_UPDATE.md

✨ All Figma resources synchronized!
═══════════════════════════════════════
```

Starting Figma sync with progressive skill discovery...