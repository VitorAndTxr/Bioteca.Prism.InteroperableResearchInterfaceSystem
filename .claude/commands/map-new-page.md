---
description: Map a new Figma page and extract all frame links for documentation
parameters:
  - name: pageUrl
    description: Figma page URL or node ID to map
---

# 🗺️ Map New Figma Page

I will map a new Figma page and extract all frame links for documentation.

## Process:

### 1. Check MCP Installation
- Verify if Figma Desktop MCP is available
- Verify if Playwright MCP is available
- If missing, guide user through installation

### 2. Attempt Figma MCP Access
```javascript
// Try direct Figma MCP access
try {
  const metadata = await mcp__figma-desktop__get_metadata({
    nodeId: pageNodeId
  })
  // Process metadata to extract frames
} catch (error) {
  // Fallback to web access
}
```

### 3. Fallback to Web Access (if MCP fails)
```javascript
// Use Playwright to access Figma web
await mcp__playwright__browser_navigate({
  url: figmaPageUrl
})

// Take snapshot for frame detection
const snapshot = await mcp__playwright__browser_snapshot()

// Extract frame links from page
```

### 4. Extract Frame Information
For each frame found:
- Frame ID/Node ID
- Frame name
- Frame URL (https://figma.com/design/...)
- Frame type (screen, component, etc.)
- Parent page information

### 5. Map to Documentation Structure
Create/update documentation files:
```
docs/figma/pages/
├── [page-name]-mapping.json
└── [page-name]-frames.md
```

### 6. Update Master Mapping
Update `docs/figma/master-mapping.json`:
```json
{
  "pages": [
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
      "lastUpdated": "2025-10-17T12:00:00Z"
    }
  ]
}
```

## MCP Installation Check

### Figma Desktop MCP
```bash
# Check if installed
npx @claude/mcp list | grep figma-desktop

# If not installed:
echo "Figma Desktop MCP not found. Please install:"
echo "1. Open Claude Desktop settings"
echo "2. Add MCP server: @claude/mcp-server-figma-desktop"
echo "3. Restart Claude"
```

### Playwright MCP
```bash
# Check if installed
npx @claude/mcp list | grep playwright

# If not installed:
echo "Playwright MCP not found. Please install:"
echo "1. Open Claude Desktop settings"
echo "2. Add MCP server: @claude/mcp-server-playwright"
echo "3. Restart Claude"
```

## Execution Steps:

1. **Validate MCPs**:
   - Check both MCPs are available
   - Provide installation instructions if needed

2. **Parse Input**:
   - Extract node ID from URL if provided
   - Validate format

3. **Access Page**:
   - Try Figma MCP first
   - Fallback to Playwright if needed

4. **Extract Frames**:
   - Get all frames on the page
   - Capture frame metadata

5. **Generate Documentation**:
   - Create structured JSON mapping
   - Generate markdown documentation
   - Update master mapping file

6. **Report Results**:
   - Show number of frames found
   - List all frame names and IDs
   - Provide links to documentation

## Output Format:
```
═══════════════════════════════════════
    FIGMA PAGE MAPPING COMPLETE
═══════════════════════════════════════

📄 Page: {{pageName}}
🔗 URL: {{pageUrl}}

📊 Frames Found: {{frameCount}}

Frames Mapped:
1. ✅ Login Screen (123-456)
2. ✅ Dashboard (123-457)
3. ✅ Settings (123-458)
...

📁 Documentation Created:
- docs/figma/pages/{{pageName}}-mapping.json
- docs/figma/pages/{{pageName}}-frames.md

✨ All frames successfully mapped!
═══════════════════════════════════════
```

## Error Handling:
- MCP not available → Provide installation guide
- Figma access denied → Check permissions
- Invalid URL → Request correct format
- No frames found → Verify page structure

Let me check MCP availability and begin mapping...