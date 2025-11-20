---
description: Figma page URL or node ID to map
---

# 🗺️ Map New Figma Page

I will map a new Figma page and extract all frame links using progressive skill discovery.

## Process

### Step 1: Load Skills Documentation 📚

```
1. Read: .claude/skills/mcp-servers/figma-desktop/INDEX.md
2. Read individual tool docs as needed:
   - get_metadata.md (extract frames)
   - get_screenshot.md (visual reference)
```

**Fallback** (if Figma MCP unavailable):
```
1. Read: .claude/skills/mcp-servers/playwright/INDEX.md
2. Read: browser_navigate.md, browser_snapshot.md
```

### Step 2: Parse Input 🔍

Extract node ID from URL: `{{pageUrl}}`
- Format: `https://figma.com/design/[fileKey]?node-id=[nodeId]`
- Or direct node ID: `[nodeId]`

### Step 3: Execute MCP Tools 🔧

**Primary Method - Figma MCP**:
```
mcp__figma-desktop__get_metadata({ nodeId: "{{nodeId}}" })
mcp__figma-desktop__get_screenshot({ nodeId: "{{nodeId}}" })
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

Starting progressive skill discovery and page mapping...