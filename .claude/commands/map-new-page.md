---
description: Figma page URL or node ID to map
---

# 🗺️ Map New Figma Page

I will map a new Figma page and extract all frame links using REST API scripts.

## Process

### Step 1: Load Skills Documentation 📚

```
1. Read: .claude/skills/figma-desktop/SKILL.md
2. Read: .claude/skills/figma-desktop/scripts/README.md
3. Available scripts:
   - extract-frames.js (discover all frames)
   - get-metadata.js (frame structure)
   - get-screenshot.js (visual reference)
```

**Fallback** (if scripts fail):
```
1. Read: .claude/skills/mcp-servers/playwright/INDEX.md
2. Use: browser_navigate, browser_snapshot
```

### Step 2: Parse Input 🔍

Extract node ID from URL: `{{pageUrl}}`
- Format: `https://figma.com/design/[fileKey]?node-id=[nodeId]`
- Or direct node ID: `[nodeId]`

### Step 3: Execute REST API Scripts 🔧

**Primary Method - Figma Scripts**:
```bash
# Extract all frames from page
node .claude/skills/figma-desktop/scripts/extract-frames.js xFC8eCJcSwB9EyicTmDJ7w {{nodeId}}

# Get metadata
node .claude/skills/figma-desktop/scripts/get-metadata.js xFC8eCJcSwB9EyicTmDJ7w {{nodeId}}

# Get screenshot
node .claude/skills/figma-desktop/scripts/get-screenshot.js xFC8eCJcSwB9EyicTmDJ7w {{nodeId}}
```

**Fallback Method - Playwright MCP**:
```
mcp__playwright__browser_navigate({ url: "{{pageUrl}}" })
mcp__playwright__browser_snapshot()
```

### Step 4: Extract Frame Information 📊

For each frame:
- Frame ID/Node ID
- Frame name
- Frame URL
- Frame type (screen/component)
- Parent page info

### Step 5: Update Documentation 📝

**Files Created/Updated**:
```
docs/figma/pages/
├── {{pageName}}-mapping.json
└── {{pageName}}-frames.md

docs/figma/master-mapping.json (updated)
```

**Mapping Structure**:
```json
{
  "name": "{{pageName}}",
  "nodeId": "{{nodeId}}",
  "url": "{{pageUrl}}",
  "frames": [
    {
      "id": "frame-1",
      "name": "Login Screen",
      "nodeId": "123-456",
      "url": "https://figma.com/design/..."
    }
  ],
  "lastUpdated": "{{timestamp}}"
}
```

## Output Report

```
═══════════════════════════════════════
    FIGMA PAGE MAPPING COMPLETE
═══════════════════════════════════════

📄 Page: {{pageName}}
🔗 URL: {{pageUrl}}
📊 Frames Found: {{frameCount}}

Frames Mapped:
{{frameList}}

📁 Documentation:
✅ {{pageName}}-mapping.json
✅ {{pageName}}-frames.md
✅ master-mapping.json updated

✨ All frames successfully mapped!
═══════════════════════════════════════
```

Starting page mapping with REST API scripts...
