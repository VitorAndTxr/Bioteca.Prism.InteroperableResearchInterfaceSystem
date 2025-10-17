---
description: Check if required MCPs are installed and provide installation guidance
---

# 🔍 Check MCP Installation Status

I will verify the installation status of required MCP servers for the IRIS project.

## Required MCPs:

### 1. Figma Desktop MCP
- **Purpose**: Direct access to Figma designs and components
- **Package**: `@figma/mcp-server-figma-desktop`
- **Capabilities**: Extract designs, get metadata, capture screenshots

### 2. Playwright MCP
- **Purpose**: Web automation for fallback Figma access
- **Package**: `@anthropic/mcp-server-playwright`
- **Capabilities**: Browser control, web navigation, DOM interaction

## Checking Process:

### Step 1: Test Figma Desktop MCP
```javascript
async function checkFigmaMCP() {
  try {
    // Try a simple metadata request
    await mcp__figma-desktop__get_metadata({
      nodeId: "0:0"
    })
    return {
      installed: true,
      status: "✅ Figma Desktop MCP is available"
    }
  } catch (error) {
    return {
      installed: false,
      status: "❌ Figma Desktop MCP not found",
      error: error.message
    }
  }
}
```

### Step 2: Test Playwright MCP
```javascript
async function checkPlaywrightMCP() {
  try {
    // Try to check browser status
    await mcp__playwright__browser_close()
    return {
      installed: true,
      status: "✅ Playwright MCP is available"
    }
  } catch (error) {
    return {
      installed: false,
      status: "❌ Playwright MCP not found",
      error: error.message
    }
  }
}
```

## Installation Instructions:

### If Figma Desktop MCP is missing:

**For Windows:**
```powershell
# 1. Open Claude Desktop settings
# 2. Click on "Developer" tab
# 3. Click "Add MCP Server"
# 4. Add configuration:
{
  "mcpServers": {
    "figma-desktop": {
      "command": "node",
      "args": ["C:/Users/[username]/AppData/Roaming/npm/node_modules/@figma/mcp-server-figma-desktop/dist/index.js"]
    }
  }
}

# Or install globally first:
npm install -g @figma/mcp-server-figma-desktop
```

**For Mac/Linux:**
```bash
# Install the MCP server
npm install -g @figma/mcp-server-figma-desktop

# Add to Claude Desktop config:
~/.claude/mcp.json
{
  "mcpServers": {
    "figma-desktop": {
      "command": "npx",
      "args": ["@figma/mcp-server-figma-desktop"]
    }
  }
}
```

### If Playwright MCP is missing:

**For Windows:**
```powershell
# Install Playwright and the MCP server
npm install -g @anthropic/mcp-server-playwright
npx playwright install chromium

# Add to Claude Desktop config
{
  "mcpServers": {
    "playwright": {
      "command": "node",
      "args": ["C:/Users/[username]/AppData/Roaming/npm/node_modules/@anthropic/mcp-server-playwright/dist/index.js"]
    }
  }
}
```

**For Mac/Linux:**
```bash
# Install the MCP server
npm install -g @anthropic/mcp-server-playwright
npx playwright install chromium

# Add to Claude Desktop config:
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@anthropic/mcp-server-playwright"]
    }
  }
}
```

## Output Report:

```
═══════════════════════════════════════
    MCP INSTALLATION STATUS
═══════════════════════════════════════

📊 MCP Servers:

1. Figma Desktop MCP
   Status: {{status}}
   Required for: Direct Figma access
   {{installInstructions}}

2. Playwright MCP
   Status: {{status}}
   Required for: Web fallback access
   {{installInstructions}}

📋 Summary:
- Total MCPs required: 2
- Installed: {{installedCount}}
- Missing: {{missingCount}}

{{nextSteps}}

═══════════════════════════════════════
```

## Troubleshooting:

### Common Issues:

**1. MCP not recognized after installation:**
- Restart Claude Desktop application
- Verify the MCP configuration in settings
- Check npm global installation path

**2. Permission errors:**
- Run installation with administrator privileges (Windows)
- Use sudo for global npm installations (Mac/Linux)

**3. Path issues:**
- Ensure npm global bin directory is in PATH
- Verify node/npm are installed correctly

**4. Figma authentication:**
- Ensure you're logged into Figma Desktop app
- Check Figma API access permissions

## Next Steps:

Based on MCP availability:

**Both MCPs installed:**
✅ Ready to use all Figma commands
- Run `/update-figma` to sync designs
- Run `/map-new-page [url]` to map new pages

**Only Figma MCP installed:**
⚠️ Limited to direct Figma access
- Can use `/update-figma` with Figma MCP
- Web fallback not available

**Only Playwright MCP installed:**
⚠️ Limited to web access
- Can use web fallback for Figma access
- Direct Figma API not available

**No MCPs installed:**
❌ Cannot access Figma resources
- Follow installation instructions above
- Restart Claude after installation

Let me check your MCP installation status...