#!/bin/bash

# IRIS Implementation System Initialization Script
# This script sets up the complete implementation tracking system

echo "================================================"
echo "   IRIS IMPLEMENTATION SYSTEM INITIALIZATION   "
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Creating directory structure...${NC}"

# Create implementation directories if they don't exist
mkdir -p docs/implementation/feature/{design-system,authentication,user-management,npi,snomed,shared-architecture}
mkdir -p docs/implementation/{tracking,templates}
mkdir -p .claude/commands
mkdir -p scripts
mkdir -p packages/ui-components/{atoms,molecules,organisms,templates}
mkdir -p packages/{contexts,services,theme}
mkdir -p apps/mobile/src/screens/{auth,users,npi,snomed}
mkdir -p apps/desktop/src/app/{auth,users,npi,snomed}

echo -e "${GREEN}✓ Directory structure created${NC}"
echo ""

echo -e "${YELLOW}Step 2: Initializing tracking files if needed...${NC}"

# Check if tracking files exist, if not create them
if [ ! -f "docs/implementation/tracking/implementation-log.json" ]; then
  echo '{
  "projectInfo": {
    "name": "IRIS",
    "version": "0.1.0",
    "startDate": "'$(date -Iseconds)'",
    "lastUpdated": "'$(date -Iseconds)'"
  },
  "implementations": [],
  "statistics": {
    "totalImplementations": 0,
    "completed": 0,
    "inProgress": 0,
    "pending": 0
  },
  "nextId": "impl-001"
}' > docs/implementation/tracking/implementation-log.json
  echo -e "${GREEN}✓ Created implementation-log.json${NC}"
else
  echo -e "${GREEN}✓ implementation-log.json already exists${NC}"
fi

if [ ! -f "docs/implementation/tracking/task-queue.json" ]; then
  echo '{
  "lastUpdated": "'$(date -Iseconds)'",
  "queue": [],
  "completedTasks": [],
  "statistics": {
    "totalTasks": 0,
    "pending": 0,
    "inProgress": 0,
    "completed": 0
  }
}' > docs/implementation/tracking/task-queue.json
  echo -e "${GREEN}✓ Created task-queue.json${NC}"
else
  echo -e "${GREEN}✓ task-queue.json already exists${NC}"
fi

echo ""
echo -e "${YELLOW}Step 3: Setting up package structure...${NC}"

# Create packages structure if needed
if [ ! -d "packages/domain" ]; then
  mkdir -p packages/domain/src/models
  echo -e "${GREEN}✓ Created domain package structure${NC}"
fi

if [ ! -d "packages/ui-components" ]; then
  mkdir -p packages/ui-components/{atoms,molecules,organisms}
  echo -e "${GREEN}✓ Created ui-components package structure${NC}"
fi

echo ""
echo -e "${YELLOW}Step 4: Checking Claude commands...${NC}"

# List available Claude commands
if [ -d ".claude/commands" ]; then
  echo "Available Claude commands:"
  for file in .claude/commands/*.md; do
    if [ -f "$file" ]; then
      filename=$(basename "$file" .md)
      echo -e "  ${GREEN}/${filename}${NC}"
    fi
  done
else
  echo -e "${YELLOW}No Claude commands found. Creating commands directory...${NC}"
  mkdir -p .claude/commands
fi

echo ""
echo "================================================"
echo -e "${GREEN}✨ IRIS Implementation System Ready!${NC}"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Run 'claude /update-figma' to sync with latest designs"
echo "2. Run 'claude /check-progress' to see current status"
echo "3. Run 'claude /execute-next' to start implementing"
echo ""
echo "Documentation:"
echo "- Main hub: docs/implementation/README.md"
echo "- Design System: docs/implementation/feature/design-system/README.md"
echo "- Task Queue: docs/implementation/tracking/task-queue.json"
echo ""
echo "Happy coding! 🚀"