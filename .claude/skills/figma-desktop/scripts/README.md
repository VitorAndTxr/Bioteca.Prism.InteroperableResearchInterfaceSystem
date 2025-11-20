# Figma REST API Scripts

Node.js scripts for extracting Figma design data using the Figma REST API.

## Overview

These scripts provide automated extraction of design data from Figma files using the REST API. They allow batch processing, CI/CD integration, and don't require any desktop applications.

## Setup

### Get Figma Personal Access Token

1. Go to https://www.figma.com/settings
2. Scroll to "Personal Access Tokens"
3. Click "Generate new token"
4. Copy the token

### Set Environment Variable

```bash
# Windows (PowerShell)
$env:FIGMA_TOKEN="your-token-here"

# Windows (CMD)
set FIGMA_TOKEN=your-token-here

# Mac/Linux
export FIGMA_TOKEN="your-token-here"
```

## Available Scripts

### 1. extract-frames.js

Extract all frames from a Figma page.

**Usage**:
```bash
node extract-frames.js <file-key> <node-id> [token]
```

**Example**:
```bash
node extract-frames.js xFC8eCJcSwB9EyicTmDJ7w 2501:2715
```

**Output**:
- Console: List of all frames with names, IDs, dimensions
- File: `temp-frames-list.json`

---

### 2. get-metadata.js

Get metadata and structure for a Figma node.

**Usage**:
```bash
node get-metadata.js <file-key> <node-id> [token]
```

**Example**:
```bash
node get-metadata.js xFC8eCJcSwB9EyicTmDJ7w 6804:13742
```

**Output**:
- Console: XML-like structure of the node
- File: `temp-metadata-<node-id>.json`

---

### 3. get-screenshot.js

Get a screenshot of a Figma node.

**Usage**:
```bash
node get-screenshot.js <file-key> <node-id> [token] [output-file]
```

**Example**:
```bash
node get-screenshot.js xFC8eCJcSwB9EyicTmDJ7w 6804:13742 token login-screen.png
```

**Output**:
- File: PNG screenshot (default: `screenshot-<node-id>.png`)

---

### 4. get-variable-defs.js

Get design tokens and variables from Figma file.

**Usage**:
```bash
node get-variable-defs.js <file-key> [token]
```

**Example**:
```bash
node get-variable-defs.js xFC8eCJcSwB9EyicTmDJ7w
```

**Output**:
- Console: Summary of color styles, text styles, variables
- File: `temp-design-tokens-<file-key>.json`

---

### 5. compare-frames.js

Compare current Figma frames with documented frames to identify new additions.

**Usage**:
```bash
# First, run extract-frames.js to generate temp-frames-list.json
node extract-frames.js xFC8eCJcSwB9EyicTmDJ7w 2501:2715

# Then compare with documented frames
node compare-frames.js
```

**Output**:
- Console: Comparison report showing new/updated frames
- File: `temp-comparison-report.json`

---

## Common Use Cases

### Verify New Frames Added

```bash
# Extract all current frames
node extract-frames.js xFC8eCJcSwB9EyicTmDJ7w 2501:2715

# Compare with documentation
node compare-frames.js
```

### Get Screenshots of All Frames

```bash
# 1. Extract frame list
node extract-frames.js xFC8eCJcSwB9EyicTmDJ7w 2501:2715

# 2. Loop through frames (example for frame 6804:13742)
node get-screenshot.js xFC8eCJcSwB9EyicTmDJ7w 6804:13742 token login.png
node get-screenshot.js xFC8eCJcSwB9EyicTmDJ7w 6804:13670 token users.png
# ... repeat for each frame
```

### Extract Design Tokens

```bash
node get-variable-defs.js xFC8eCJcSwB9EyicTmDJ7w
```

### Get Frame Metadata

```bash
node get-metadata.js xFC8eCJcSwB9EyicTmDJ7w 6804:13742
```

---

## Node ID Format

Node IDs can be in either format:
- Colon format: `2501:2715` (API format)
- Dash format: `2501-2715` (URL format)

Scripts automatically convert between formats as needed.

---

## File Keys

Common file keys for IRIS project:
- **I.R.I.S.-Prototype**: `xFC8eCJcSwB9EyicTmDJ7w`

You can find the file key in any Figma URL:
```
https://figma.com/design/<FILE_KEY>/...
```

---

## Error Handling

All scripts include error handling for:
- Missing token
- Invalid node IDs
- API errors
- Network failures

Errors are displayed with `❌` prefix and helpful messages.

---

## Output Files

All scripts create temporary output files in the project root:
- `temp-frames-list.json` - Frame list
- `temp-metadata-<node-id>.json` - Node metadata
- `temp-design-tokens-<file-key>.json` - Design tokens
- `temp-comparison-report.json` - Comparison report
- `screenshot-<node-id>.png` - Screenshots

You can clean these up with:
```bash
rm temp-*.json screenshot-*.png
```

---

## Integration with Documentation

These scripts are designed to work with the IRIS documentation structure:

- **Frame mapping**: `docs/figma/frame-node-mapping.json`
- **Design tokens**: `docs/figma/design-system-mapping.json`
- **Screenshots**: `docs/figma/screenshots/`

---

## Advantages

1. **No Desktop App Required**: Works anywhere with Node.js
2. **Automation**: Can be scripted and run in CI/CD
3. **Batch Processing**: Easy to loop through multiple nodes
4. **Cross-platform**: Works on Windows, Mac, Linux

---

## Limitations

1. **Rate Limits**: Figma API has rate limits (use responsibly)
2. **Token Required**: Requires Figma Personal Access Token

---

## Created

- **Date**: November 14, 2025
- **Purpose**: Figma design data extraction via REST API
- **Project**: IRIS (Interoperable Research Interface System)
