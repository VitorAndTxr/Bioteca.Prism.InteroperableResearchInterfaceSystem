---
description: Update all Figma mappings and extract latest designs
---

# 🎨 Update Figma Mappings

I will sync all Figma designs and update the project mappings using **REST API scripts**.

## Process

### Step 1: Load Skills Documentation 📚

Following the skill documentation from `.claude/skills/figma-desktop/SKILL.md`:

```
1. Read: .claude/skills/figma-desktop/SKILL.md (overview)
2. Read: .claude/skills/figma-desktop/scripts/README.md (8 scripts)
3. Available scripts:
   - get-metadata.js (component structure)
   - get-screenshot.js (visual reference)
   - get-variable-defs.js (design tokens)
   - extract-frames.js (frame discovery)
   - get-annotations.js (dev mode notes)
```

**Why Scripts?**
- Works without Figma Desktop app running
- Batch processing and automation
- CI/CD pipeline integration
- Cross-platform compatibility

### Step 2: Extract Figma Resources 🎨

Using the REST API scripts:

**Figma File**: I.R.I.S.-Prototype (xFC8eCJcSwB9EyicTmDJ7w)
- Design System: 33 components (node 801-23931)
- Application Screens: 31 screens (node 6804-13742)

**Target Documentation**:
- `docs/figma/design-system-mapping.json`
- `docs/figma/frame-node-mapping.json`

**Primary Method - REST API Scripts**:
```bash
# Extract frames from page
node .claude/skills/figma-desktop/scripts/extract-frames.js xFC8eCJcSwB9EyicTmDJ7w 2501:2715

# Get metadata for design system
node .claude/skills/figma-desktop/scripts/get-metadata.js xFC8eCJcSwB9EyicTmDJ7w 801:23931

# Get metadata for app screens
node .claude/skills/figma-desktop/scripts/get-metadata.js xFC8eCJcSwB9EyicTmDJ7w 6804:13742

# Extract design tokens
node .claude/skills/figma-desktop/scripts/get-variable-defs.js xFC8eCJcSwB9EyicTmDJ7w

# Get screenshots
node .claude/skills/figma-desktop/scripts/get-screenshot.js xFC8eCJcSwB9EyicTmDJ7w 6804:13742
```

### Step 3: Update Documentation 📝

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
- `docs/figma/FIGMA_MAPPING_UPDATE.md` (update notes)

## Output Report

```
═══════════════════════════════════════
    FIGMA UPDATE COMPLETE
═══════════════════════════════════════

📚 Scripts Used:
✅ extract-frames.js - Frame discovery
✅ get-metadata.js - Structure extraction
✅ get-variable-defs.js - Design tokens
✅ get-screenshot.js - Visual reference

🎨 Design System:
✅ Components: {{updatedCount}}/33 updated
✅ Frame URLs: 33 mapped

📱 Application Screens:
✅ Screens: {{updatedCount}}/31 updated
✅ Frame URLs: 31 mapped

📁 Files Updated:
✅ design-system-mapping.json
✅ frame-node-mapping.json
✅ FIGMA_MAPPING_UPDATE.md

✨ All Figma resources synchronized!
═══════════════════════════════════════
```

Starting Figma sync with REST API scripts...
