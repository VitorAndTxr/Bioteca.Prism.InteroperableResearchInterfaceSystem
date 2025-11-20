/#!/bin/bash

# Extract Figma Frames Script
# Maps all frames from a Figma page node using the Figma REST API
#
# Usage:
#   export FIGMA_TOKEN="your_figma_personal_access_token"
#   ./extract-figma-frames.sh 2501:2715

set -e

# Configuration
FILE_KEY="xFC8eCJcSwB9EyicTmDJ7w"
FILE_NAME="I.R.I.S.-Prototype"
BASE_URL="https://api.figma.com/v1"
OUTPUT_DIR="docs/figma/pages"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check prerequisites
if [ -z "$FIGMA_TOKEN" ]; then
    echo -e "${RED}Error: FIGMA_TOKEN environment variable not set${NC}"
    echo ""
    echo "To get a Figma token:"
    echo "1. Go to https://www.figma.com/settings"
    echo "2. Scroll to 'Personal access tokens'"
    echo "3. Click 'Generate new token'"
    echo "4. Copy the token and export it:"
    echo ""
    echo "   export FIGMA_TOKEN='your_token_here'"
    echo ""
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo -e "${RED}Error: jq is not installed${NC}"
    echo "Install jq to parse JSON:"
    echo "  - Ubuntu/Debian: sudo apt-get install jq"
    echo "  - macOS: brew install jq"
    echo "  - Windows: choco install jq"
    exit 1
fi

# Get node ID from argument or use default
NODE_ID="${1:-2501:2715}"
NODE_ID_FORMATTED=$(echo "$NODE_ID" | sed 's/-/:/')
NODE_ID_HYPHEN=$(echo "$NODE_ID" | sed 's/:/-/')

echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${BLUE}   FIGMA FRAME EXTRACTION TOOL${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""
echo -e "File: ${GREEN}$FILE_NAME${NC}"
echo -e "Node: ${GREEN}$NODE_ID_FORMATTED${NC}"
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Fetch node data from Figma API
echo -e "${YELLOW}Fetching data from Figma API...${NC}"
RAW_FILE="$OUTPUT_DIR/page-$NODE_ID_HYPHEN-raw.json"

HTTP_CODE=$(curl -s -w "%{http_code}" -o "$RAW_FILE" \
    -H "X-Figma-Token: $FIGMA_TOKEN" \
    "$BASE_URL/files/$FILE_KEY/nodes?ids=$NODE_ID_FORMATTED&depth=2")

if [ "$HTTP_CODE" != "200" ]; then
    echo -e "${RED}Error: Figma API request failed with HTTP $HTTP_CODE${NC}"
    echo "Response:"
    cat "$RAW_FILE"
    rm "$RAW_FILE"
    exit 1
fi

echo -e "${GREEN}✓ Data fetched successfully${NC}"

# Check if node exists
if ! jq -e ".nodes[\"$NODE_ID_FORMATTED\"]" "$RAW_FILE" > /dev/null 2>&1; then
    echo -e "${RED}Error: Node $NODE_ID_FORMATTED not found in file${NC}"
    rm "$RAW_FILE"
    exit 1
fi

# Extract page name
PAGE_NAME=$(jq -r ".nodes[\"$NODE_ID_FORMATTED\"].document.name // \"Unknown Page\"" "$RAW_FILE")
echo -e "Page Name: ${GREEN}$PAGE_NAME${NC}"

# Extract frames (children of the page node)
echo -e "${YELLOW}Extracting frames...${NC}"

FRAMES=$(jq -r "
.nodes[\"$NODE_ID_FORMATTED\"].document.children[]? |
select(.type == \"FRAME\" or .type == \"COMPONENT\") |
{
    name: .name,
    nodeId: .id,
    type: .type,
    width: .absoluteBoundingBox.width,
    height: .absoluteBoundingBox.height
}
" "$RAW_FILE")

if [ -z "$FRAMES" ]; then
    echo -e "${RED}Warning: No frames found in this node${NC}"
    echo "This might be:"
    echo "  - An empty page"
    echo "  - A single frame (not a page container)"
    echo "  - A component set"
    echo ""
    echo "Node structure:"
    jq ".nodes[\"$NODE_ID_FORMATTED\"].document | {name, type, children: .children[]? | .name}" "$RAW_FILE"
    exit 0
fi

FRAME_COUNT=$(echo "$FRAMES" | jq -s 'length')
echo -e "${GREEN}✓ Found $FRAME_COUNT frames${NC}"
echo ""

# Build JSON mapping
echo -e "${YELLOW}Building mapping JSON...${NC}"

MAPPING_FILE="$OUTPUT_DIR/page-$NODE_ID_HYPHEN-mapping.json"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

jq -n \
    --arg pageName "$PAGE_NAME" \
    --arg nodeId "$NODE_ID_HYPHEN" \
    --arg nodeIdFormatted "$NODE_ID_FORMATTED" \
    --arg fileKey "$FILE_KEY" \
    --arg fileName "$FILE_NAME" \
    --arg timestamp "$TIMESTAMP" \
    --argjson frames "$(echo "$FRAMES" | jq -s '
        map({
            id: ("F" + (. | to_entries | .[0].key + 1 | tostring)),
            name: .name,
            nodeId: .id,
            type: (if .type == "COMPONENT" then "Component" else "Screen" end),
            dimensions: "\(.width | floor)x\(.height | floor)",
            module: "PENDING_CLASSIFICATION",
            priority: "Medium",
            figmaUrl: "https://www.figma.com/design/'$FILE_KEY'/'$FILE_NAME'?node-id=\(.nodeId)"
        })
    ')" \
    '{
        pageName: $pageName,
        nodeId: $nodeId,
        nodeIdFormatted: $nodeIdFormatted,
        url: "https://www.figma.com/design/\($fileKey)/\($fileName)?node-id=\($nodeId)",
        fileKey: $fileKey,
        fileName: $fileName,
        mappingDate: $timestamp,
        lastUpdated: $timestamp,
        totalFrames: ($frames | length),
        status: "extracted",
        extractionMethod: "figma_api",
        frames: $frames
    }' > "$MAPPING_FILE"

echo -e "${GREEN}✓ Mapping JSON created${NC}"
echo -e "   $MAPPING_FILE"

# Generate markdown documentation
echo -e "${YELLOW}Generating markdown documentation...${NC}"

MD_FILE="$OUTPUT_DIR/page-$NODE_ID_HYPHEN-frames.md"

cat > "$MD_FILE" << EOF
# Figma Page Mapping - $PAGE_NAME

**Page Node ID**: $NODE_ID_FORMATTED ($NODE_ID_HYPHEN)
**Figma URL**: [Open in Figma](https://www.figma.com/design/$FILE_KEY/$FILE_NAME?node-id=$NODE_ID_HYPHEN)
**Extraction Date**: $TIMESTAMP
**Total Frames**: $FRAME_COUNT
**Extraction Method**: Figma REST API

---

## Frames Overview

| # | Frame Name | Node ID | Type | Dimensions | Module | Priority |
|---|------------|---------|------|------------|--------|----------|
EOF

# Add frame rows to markdown table
jq -r '.frames[] |
"| \(.id) | \(.name) | \(.nodeId) | \(.type) | \(.dimensions) | \(.module) | \(.priority) |"
' "$MAPPING_FILE" >> "$MD_FILE"

cat >> "$MD_FILE" << 'EOF'

---

## Next Steps

1. **Classify Modules**: Update `module` field for each frame
   - Auth, User Management, NPI Management, SNOMED, Research Management

2. **Set Priorities**: Adjust `priority` field
   - High: Core functionality
   - Medium: Secondary features
   - Low: UI feedback elements

3. **Verify Frame Types**: Ensure `type` is correct
   - Screen: Full-page layouts
   - Component: Reusable components
   - Modal: Dialogs/overlays
   - Toast: Notifications

4. **Update Master Mapping**: Add frames to `docs/figma/frame-node-mapping.json`

5. **Update Documentation**: Add to `docs/figma/frames-map.md`

---

## Frame Details

EOF

# Add detailed frame information
jq -r '.frames[] |
"### \(.id): \(.name)\n\n" +
"**Node ID**: `\(.nodeId)`\n" +
"**Type**: \(.type)\n" +
"**Dimensions**: \(.dimensions)\n" +
"**Module**: \(.module)\n" +
"**Priority**: \(.priority)\n" +
"**Figma URL**: [\(.name)](\(.figmaUrl))\n\n" +
"---\n"
' "$MAPPING_FILE" >> "$MD_FILE"

echo -e "${GREEN}✓ Markdown documentation created${NC}"
echo -e "   $MD_FILE"

# Summary
echo ""
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo -e "${GREEN}    EXTRACTION COMPLETE${NC}"
echo -e "${BLUE}═══════════════════════════════════════${NC}"
echo ""
echo -e "📄 Page: ${GREEN}$PAGE_NAME${NC}"
echo -e "🔗 Node: ${GREEN}$NODE_ID_FORMATTED${NC}"
echo -e "📊 Frames: ${GREEN}$FRAME_COUNT${NC}"
echo ""
echo -e "${YELLOW}Files Created:${NC}"
echo -e "  ✅ $MAPPING_FILE"
echo -e "  ✅ $MD_FILE"
echo -e "  📋 $RAW_FILE (raw API response)"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Review and classify frames in: $MAPPING_FILE"
echo "  2. Update master mapping: docs/figma/frame-node-mapping.json"
echo "  3. Update documentation: docs/figma/frames-map.md"
echo ""
