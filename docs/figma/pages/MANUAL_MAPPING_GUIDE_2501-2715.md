# Manual Mapping Guide - Figma Page 2501-2715

**Date**: 2025-11-14
**Page Node ID**: 2501-2715 (2501:2715)
**Figma URL**: https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=2501-2715&m=dev
**Status**: Awaiting manual extraction

---

## Problem

The MCP Figma Desktop server layer is not responding, preventing automatic frame extraction. This guide provides manual steps to map all frames in this Figma page.

---

## Method 1: Using Figma Desktop (Recommended)

### Step 1: Open in Figma Desktop

1. Launch **Figma Desktop** application
2. Navigate to the URL above or open from recent files
3. Locate page node **2501-2715** in the layers panel

### Step 2: Extract Frame Information

For each frame in the page, collect the following information:

```json
{
  "name": "Frame Name",
  "nodeId": "XXXX-XXXX",
  "type": "Screen | Component | Modal | Toast",
  "dimensions": "WIDTHxHEIGHT",
  "module": "Auth | User Management | NPI Management | SNOMED | Research Management",
  "priority": "High | Medium | Low"
}
```

### Step 3: Get Node IDs

**Option A - Using Figma Desktop:**
1. Right-click on each frame
2. Select "Copy/Paste" → "Copy link"
3. Extract node-id from the URL

**Option B - Using Dev Mode:**
1. Enable Dev Mode (Shift+D)
2. Select frame
3. Node ID appears in properties panel

### Step 4: Update Mapping File

Update the template file:
`docs/figma/pages/page-2501-2715-mapping-template.json`

Add each frame to the `frames` array:

```json
{
  "frames": [
    {
      "id": "001",
      "name": "Example Frame",
      "nodeId": "1234-5678",
      "module": "User Management",
      "type": "Screen",
      "priority": "High",
      "dimensions": "1280x720",
      "figmaUrl": "https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=1234-5678"
    }
  ]
}
```

---

## Method 2: Using Figma REST API

### Prerequisites

You need a Figma Personal Access Token:
1. Go to https://www.figma.com/settings
2. Scroll to "Personal access tokens"
3. Click "Generate new token"
4. Copy the token

### API Request

```bash
# Set your Figma token
export FIGMA_TOKEN="your_token_here"

# Get file data
curl -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/files/xFC8eCJcSwB9EyicTmDJ7w/nodes?ids=2501:2715" \
  | jq '.' > page-2501-2715-raw.json

# Extract frames (children of the page node)
cat page-2501-2715-raw.json | jq '.nodes["2501:2715"].document.children[] | {name, id, type}'
```

### Process API Response

The API will return a JSON structure. Look for the `children` array under the page node to find all frames.

---

## Method 3: Using Figma Plugin

### Install Plugin

1. In Figma Desktop, go to **Plugins** → **Browse plugins in Community**
2. Search for "Node Inspector" or "Frame Export"
3. Install a plugin that can export layer structure

### Export Frame List

1. Select the page node (2501-2715)
2. Run the plugin
3. Export the frame list as JSON or CSV
4. Convert to the required format

---

## Expected Output

After mapping, you should have:

1. **JSON File**: `docs/figma/pages/page-2501-2715-mapping.json`
   - Contains all frames with metadata
   - Follows the structure defined in template

2. **Markdown Documentation**: `docs/figma/pages/page-2501-2715-frames.md`
   - Human-readable list of frames
   - Organized by module/priority

3. **Master Mapping Update**: `docs/figma/frame-node-mapping.json`
   - Add new frames to the global mapping
   - Increment `totalFrames` count
   - Update `lastUpdated` date

---

## Frame Classification Guidelines

### Module Assignment

- **Auth**: Login, authentication screens
- **User Management**: Users, researchers, volunteers
- **NPI Management**: Node connections, requests
- **SNOMED**: Clinical terminology screens
- **Research Management**: Research projects, studies

### Priority Assignment

- **High**: Core functionality screens (login, main lists)
- **Medium**: Secondary screens (forms, details)
- **Low**: UI feedback (toasts, notifications)

### Type Assignment

- **Screen**: Full-page screens (1280x720 typical)
- **Component**: Reusable components
- **Modal**: Dialog/popup overlays
- **Toast**: Notification banners

---

## Next Steps After Mapping

1. Update master mapping: `frame-node-mapping.json`
2. Generate markdown documentation
3. Verify all frame URLs work
4. Take screenshots for visual reference
5. Update `frames-map.md` with new frames
6. Commit changes to git

---

## Troubleshooting

### MCP Server Not Responding

The MCP Figma Desktop server requires:
- Figma Desktop application running
- MCP server properly configured in Claude Code settings
- Correct permissions in `.claude/settings.local.json`

Check MCP server status:
```bash
# Check if MCP tools are available
# (This is normally automatic in Claude Code)
```

### Can't Access Figma File

If you can't access the Figma file:
1. Ensure you have edit access to the file
2. Check if the file is shared with your account
3. Verify the file URL is correct
4. Try opening in browser first, then Figma Desktop

---

## Contact

If you need assistance with mapping:
- Check existing mappings in `docs/figma/frame-node-mapping.json`
- Review `docs/figma/FIGMA_MAPPING_UPDATE.md` for examples
- See `docs/figma/FRAME_VALIDATION_REPORT_2025-11-13.md` for validation process

---

**Status**: 📋 Awaiting manual extraction
**Priority**: 🔴 High (blocking implementation planning)
**Estimated Time**: 15-30 minutes depending on frame count
