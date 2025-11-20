#!/bin/bash

# Figma Frame Verification Script
# Verifies current frame count and compares with documented frames

echo "════════════════════════════════════════════════════════"
echo "  FIGMA FRAME VERIFICATION TOOL"
echo "════════════════════════════════════════════════════════"
echo ""

# Configuration
FIGMA_FILE_KEY="xFC8eCJcSwB9EyicTmDJ7w"
PAGE_NODE_ID="2501:2715"
DOCUMENTED_FRAMES=31

echo "📁 Figma File: I.R.I.S.-Prototype"
echo "📄 Page Node ID: $PAGE_NODE_ID"
echo "📊 Currently Documented: $DOCUMENTED_FRAMES frames"
echo ""

# Check if FIGMA_TOKEN is set
if [ -z "$FIGMA_TOKEN" ]; then
    echo "⚠️  FIGMA_TOKEN environment variable not set"
    echo ""
    echo "To use this script, you need a Figma Personal Access Token:"
    echo ""
    echo "1. Go to: https://www.figma.com/settings"
    echo "2. Scroll to 'Personal Access Tokens'"
    echo "3. Click 'Generate new token'"
    echo "4. Copy the token and run:"
    echo ""
    echo "   export FIGMA_TOKEN=\"your-token-here\""
    echo "   ./scripts/verify-figma-frames.sh"
    echo ""
    echo "════════════════════════════════════════════════════════"
    echo "  MANUAL VERIFICATION INSTRUCTIONS"
    echo "════════════════════════════════════════════════════════"
    echo ""
    echo "1. Open Figma: https://www.figma.com/design/$FIGMA_FILE_KEY/I.R.I.S.-Prototype?node-id=2501-2715&m=dev"
    echo ""
    echo "2. In the left sidebar (Layers panel), count all FRAMES"
    echo ""
    echo "3. Compare with documented count: $DOCUMENTED_FRAMES frames"
    echo ""
    echo "4. Note any new frames you see"
    echo ""
    exit 1
fi

echo "🔍 Querying Figma API..."
echo ""

# Query Figma API
RESPONSE=$(curl -s -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/files/$FIGMA_FILE_KEY/nodes?ids=$PAGE_NODE_ID")

# Check for errors
if echo "$RESPONSE" | grep -q "err"; then
    echo "❌ API Error:"
    echo "$RESPONSE" | jq '.err // .message'
    exit 1
fi

# Extract frame count
echo "$RESPONSE" | jq '.' > /tmp/figma-response.json

# Count frames (children of type FRAME)
CURRENT_FRAMES=$(echo "$RESPONSE" | jq '[.nodes."2501:2715".document.children[] | select(.type == "FRAME")] | length')

echo "✅ API Query Successful"
echo ""
echo "════════════════════════════════════════════════════════"
echo "  RESULTS"
echo "════════════════════════════════════════════════════════"
echo ""
echo "📊 Current Frames in Figma:  $CURRENT_FRAMES"
echo "📄 Documented Frames:         $DOCUMENTED_FRAMES"
echo ""

if [ "$CURRENT_FRAMES" -gt "$DOCUMENTED_FRAMES" ]; then
    NEW_COUNT=$((CURRENT_FRAMES - DOCUMENTED_FRAMES))
    echo "🎉 NEW FRAMES DETECTED: +$NEW_COUNT frames"
    echo ""
    echo "New frames found! Extracting details..."
    echo ""
    echo "All frames on page $PAGE_NODE_ID:"
    echo "$RESPONSE" | jq -r '.nodes."2501:2715".document.children[] | select(.type == "FRAME") | "  - \(.name) (Node ID: \(.id))"'
elif [ "$CURRENT_FRAMES" -lt "$DOCUMENTED_FRAMES" ]; then
    REMOVED_COUNT=$((DOCUMENTED_FRAMES - CURRENT_FRAMES))
    echo "⚠️  FRAMES REMOVED: -$REMOVED_COUNT frames"
elif [ "$CURRENT_FRAMES" -eq "$DOCUMENTED_FRAMES" ]; then
    echo "✅ No changes detected - frame count matches documentation"
fi

echo ""
echo "Full response saved to: /tmp/figma-response.json"
echo ""
echo "════════════════════════════════════════════════════════"
