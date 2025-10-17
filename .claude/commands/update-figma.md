---
description: Update all Figma mappings and extract latest designs
---

# 🎨 Update Figma Mappings

I will sync all Figma designs and update the project mappings.

## Process:

### 1. Check MCP Installation
First, I'll verify that required MCPs are available:
- **Figma Desktop MCP**: For direct Figma access
- **Playwright MCP**: For web fallback if needed

If any MCP is missing, I'll provide installation instructions.

### 2. Access Method Selection
```javascript
// Try Figma MCP first
if (figmaMcpAvailable) {
  // Use direct Figma MCP access
  await useFigmaMCP()
} else if (playwrightMcpAvailable) {
  // Fallback to web access
  await usePlaywrightWebAccess()
} else {
  // Request MCP installation
  await requestMcpInstallation()
}
```

### 3. Retrieve Page Information
For each Figma resource (via MCP or web):
- Extract frame links and IDs
- Get component specifications
- Capture design tokens
- Download screenshots if needed

## Figma Resources to Update:

### Design System
- **Page Node**: 801-23931
- **Components**: 30 total
- **Location**: `docs/figma/design-system-mapping.json`

### Application Screens
- **Main Node**: 6804-13742
- **Screens**: 18 total
- **Location**: `docs/figma/frame-node-mapping.json`

## MCP Installation Check:

### Check Figma Desktop MCP
```bash
# Test if Figma MCP is available
try {
  await mcp__figma-desktop__get_metadata({ nodeId: "test" })
  echo "✅ Figma Desktop MCP is available"
} catch {
  echo "❌ Figma Desktop MCP not found"
  echo "Please install: @claude/mcp-server-figma-desktop"
}
```

### Check Playwright MCP
```bash
# Test if Playwright MCP is available
try {
  await mcp__playwright__browser_close()
  echo "✅ Playwright MCP is available"
} catch {
  echo "❌ Playwright MCP not found"
  echo "Please install: @claude/mcp-server-playwright"
}
```

## Update Process by Access Method:

### Method A: Direct Figma MCP Access
```javascript
// Get metadata for all pages
const designSystem = await mcp__figma-desktop__get_metadata({
  nodeId: "801-23931"
})

const screens = await mcp__figma-desktop__get_metadata({
  nodeId: "6804-13742"
})

// Extract frame links
for (const frame of [...designSystem.frames, ...screens.frames]) {
  frameLinks.push({
    id: frame.id,
    name: frame.name,
    url: `https://figma.com/design/file/${frame.id}`
  })
}
```

### Method B: Web Access via Playwright
```javascript
// Navigate to Figma page
await mcp__playwright__browser_navigate({
  url: "https://figma.com/design/..."
})

// Wait for page load
await mcp__playwright__browser_wait_for({
  text: "Pages"
})

// Take snapshot to analyze structure
const snapshot = await mcp__playwright__browser_snapshot()

// Extract frame information from DOM
const frames = await extractFramesFromSnapshot(snapshot)
```

## Actions to Perform:
1. **Extract latest component specs** with frame links
2. **Update design tokens** (colors, typography, spacing)
3. **Map all frame URLs** to documentation
4. **Download any new assets** if needed
5. **Check for component variants** and states
6. **Update implementation queue** with new items
7. **Generate frame link documentation**

## Output Documentation:

### Update existing files:
- `docs/figma/design-system-mapping.json` - With frame URLs
- `docs/figma/frame-node-mapping.json` - With frame URLs
- `docs/figma/design-tokens.json` - Latest tokens

### Create new files if needed:
- `docs/figma/frame-links.md` - All frame URLs
- `docs/figma/update-log.json` - Update history

## Expected Output:
```
═══════════════════════════════════════
    FIGMA UPDATE COMPLETE
═══════════════════════════════════════

📊 MCP Status:
✅ Figma Desktop MCP: Available
✅ Playwright MCP: Available

🎨 Design System:
- Components checked: 30
- New components: 0
- Updated components: 5
- Frame URLs mapped: 30

📱 Application Screens:
- Screens checked: 18
- New screens: 0
- Updated screens: 3
- Frame URLs mapped: 18

📁 Documentation Updated:
- design-system-mapping.json ✅
- frame-node-mapping.json ✅
- design-tokens.json ✅
- frame-links.md ✅

🔗 Frame Links Extracted:
Total: 48 frame URLs successfully mapped

✨ All Figma resources synchronized!
═══════════════════════════════════════
```

Starting MCP verification and Figma sync...