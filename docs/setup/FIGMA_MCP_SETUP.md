# Figma MCP Setup Guide

**Status**: Initial setup required
**Last Updated**: November 14, 2025

## Current Configuration Status

### ✅ What's Already Configured

The Figma Desktop MCP server is already configured in your global Claude settings (`c:\Users\vitor\.claude.json`):

```json
"mcpServers": {
  "figma-desktop": {
    "url": "http://127.0.0.1:3845/mcp"
  }
}
```

### ⚠️ What Needs to Be Fixed

The Figma Desktop MCP server is currently **disabled** for the IRIS project. The configuration shows:

```json
"disabledMcpServers": [
  "figma",
  "figma-desktop",
  "playwright"
]
```

## Step-by-Step Setup

### Step 1: Enable Figma Desktop MCP Server

You have two options to enable the Figma MCP server:

#### Option A: Using Claude Code Commands (Recommended)

```bash
# In your IRIS project directory, run:
claude mcp
```

Then follow the prompts to:
1. Find `figma-desktop` in the list
2. Toggle it to **enabled**
3. Restart Claude Code if prompted

#### Option B: Manual Configuration

1. Open `c:\Users\vitor\.claude.json` in a text editor
2. Find the IRIS project configuration section:
   ```json
   "D:\\Repos\\Faculdade\\PRISM\\IRIS": {
     ...
     "disabledMcpServers": [
       "figma",
       "figma-desktop",
       "playwright"
     ],
     ...
   }
   ```
3. Remove `"figma-desktop"` from the array:
   ```json
   "disabledMcpServers": [
     "figma",
     "playwright"
   ]
   ```
4. Save the file and restart Claude Code

### Step 2: Verify Figma Desktop App is Running

The Figma Desktop MCP server requires the Figma Desktop application to be running:

1. **Download Figma Desktop** (if not already installed):
   - Visit: https://www.figma.com/downloads/
   - Install for Windows

2. **Launch Figma Desktop**:
   - Open the Figma Desktop app
   - Sign in to your account
   - Open a design file you want to work with

3. **Verify MCP Server is Running**:
   - The MCP server runs automatically when Figma Desktop is open
   - It listens on `http://127.0.0.1:3845/mcp` by default

### Step 3: Test the Connection

After enabling the server, test it in Claude Code:

```bash
# Run the MCP command to list servers
claude mcp list

# Should show figma-desktop as "enabled" and "healthy"
```

Or use the `/check-mcp` slash command in the IRIS project:

```bash
/check-mcp
```

### Step 4: Try a Simple Tool

Once enabled, try using a Figma MCP tool:

```bash
# Example: Get metadata for a Figma node
mcp__figma-desktop__get_metadata
```

Or ask Claude to:
- "Get a screenshot from my current Figma selection"
- "Extract design tokens from Figma"
- "Generate code for the selected Figma component"

## Available Figma MCP Tools

Once enabled, you'll have access to **7 tools**:

| Tool | Purpose | Primary Use |
|------|---------|-------------|
| `get_design_context` | Generate UI code from Figma designs | **Component implementation** |
| `get_variable_defs` | Extract design tokens (colors, fonts, spacing) | **Design system consistency** |
| `get_code_connect_map` | Map Figma designs to existing code | **Component discovery** |
| `get_screenshot` | Capture design screenshots | **Visual reference** |
| `get_metadata` | Get design structure in XML | **Architecture overview** |
| `create_design_system_rules` | Generate design system documentation | **Style guides** |
| `get_figjam` | Extract FigJam board content | **Collaboration artifacts** |

## Common Use Cases for IRIS

### 1. Implement New UI Component from Figma

```typescript
// Claude can generate code like this from your Figma designs:
import { useState } from 'react';
import { UserIcon } from '@heroicons/react/24/outline';

interface ButtonProps {
  label: string;
  variant: 'primary' | 'secondary';
  onClick: () => void;
}

export const Button: React.FC<ButtonProps> = ({ label, variant, onClick }) => {
  // Implementation generated from Figma design...
};
```

**How to use**:
1. Select a component in Figma Desktop
2. Ask Claude: "Implement this Figma component as a React TypeScript component"
3. Claude will use `get_design_context` to extract the design and generate code

### 2. Extract Design Tokens

```typescript
// Claude can extract design tokens from Figma:
export const colors = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    // ... extracted from Figma variables
  },
  // ...
};
```

**How to use**:
1. Ask Claude: "Extract all color variables from Figma"
2. Claude will use `get_variable_defs` to get design tokens

### 3. Validate Implementation Against Design

**How to use**:
1. Ask Claude: "Compare the Button component implementation with the Figma design"
2. Claude will:
   - Get screenshot from Figma (`get_screenshot`)
   - Compare with current implementation
   - Identify differences

## Troubleshooting

### Issue: "No MCP servers configured"

**Solution**:
- Check that you removed `"figma-desktop"` from `disabledMcpServers`
- Restart Claude Code after configuration changes

### Issue: "MCP server not healthy"

**Solution**:
- Verify Figma Desktop app is running
- Check that the app is on the default port (3845)
- Try restarting Figma Desktop

### Issue: "No Figma node selected"

**Solution**:
- Select a component, frame, or element in Figma Desktop before running commands
- Some tools require an active selection

### Issue: "Connection refused to 127.0.0.1:3845"

**Solution**:
- Ensure Figma Desktop app is running
- Check Windows Firewall isn't blocking localhost connections
- Verify no other application is using port 3845

## Project Permissions

The following Figma MCP tools are already whitelisted in `.claude/settings.local.json`:

```json
"permissions": {
  "allow": [
    "mcp__figma-desktop__get_metadata",
    "mcp__figma-desktop__get_screenshot",
    "mcp__figma-desktop__get_variable_defs",
    "mcp__figma-desktop__get_design_context"
  ]
}
```

You may need to approve other tools (`get_code_connect_map`, `create_design_system_rules`, `get_figjam`) on first use.

## Next Steps

After successful setup:

1. ✅ Enable the server (`claude mcp` or manual edit)
2. ✅ Launch Figma Desktop with a design file
3. ✅ Test connection (`/check-mcp`)
4. ✅ Try extracting a component design
5. ✅ Integrate Figma-to-code workflow into development

## References

- **MCP Skills Documentation**: `.claude/skills/mcp-servers/figma-desktop/INDEX.md`
- **Individual Tool Docs**: `.claude/skills/mcp-servers/figma-desktop/*.md`
- **Project Permissions**: `.claude/settings.local.json`
- **Global MCP Config**: `c:\Users\vitor\.claude.json`

---

**Need Help?**

Run `/check-mcp` in Claude Code for automated diagnostics, or ask Claude:
- "Debug my Figma MCP connection"
- "Show me how to use Figma MCP tools"
- "Extract a component from my Figma design"
