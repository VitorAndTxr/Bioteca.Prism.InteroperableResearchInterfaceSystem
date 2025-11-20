---
description: Debug skills documentation and MCP tool availability
---

# 🔬 Skills System Debug

I will debug the skills documentation system and verify tool availability.

## What This Command Does

This command validates the **progressive skill discovery pattern** implemented in `.claude/skills/`:

1. **Documentation Structure**: Verifies skills documentation exists and is accessible
2. **Tool Availability**: Tests that MCP tools and Figma scripts are available
3. **Progressive Discovery**: Validates the token-efficient pattern works correctly

## Debug Process

### Phase 1: Skills Documentation Validation 📚

**Step 1 - Verify Global Index**:
```
Read: .claude/skills/README.md
```

Expected:
- ✅ README explains progressive discovery pattern
- ✅ Lists all available skills
- ✅ Documentation is in English

**Step 2 - Verify Figma Skills Documentation**:
```
Read: .claude/skills/figma-desktop/SKILL.md
Read: .claude/skills/figma-desktop/scripts/README.md
```

Expected:
- ✅ Lists all 8 Figma scripts
- ✅ Each script has clear description
- ✅ Usage examples provided
- ✅ Setup instructions included

**Step 3 - Verify Playwright Skills Documentation**:
```
Read: .claude/skills/mcp-servers/playwright/INDEX.md
```

Expected:
- ✅ Lists all 21 Playwright tools
- ✅ Categorized by function (navigation, interaction, etc.)
- ✅ Links to individual tool documentation
- ✅ Tool documentation exists and is <200 tokens

### Phase 2: Tool Availability Testing 🔧

**Test 1 - Figma Scripts**:
```bash
# Test script execution
node .claude/skills/figma-desktop/scripts/get-metadata.js xFC8eCJcSwB9EyicTmDJ7w 0:0
```

Possible outcomes:
- ✅ **Success**: Script responds (even if node doesn't exist)
- ❌ **Missing token**: FIGMA_TOKEN not set
- ❌ **Script error**: Script file not found

**Test 2 - Playwright MCP**:
```
Try: mcp__playwright__browser_close()
```

Possible outcomes:
- ✅ **Success**: Tool responds (even if no browser open)
- ❌ **Tool not found**: MCP server not installed
- ⚠️ **No browser**: Expected if no active session

**Test 3 - Pre-approved Tool Access**:
Verify these tools can be called without user approval:
```
Figma Scripts (via Bash):
- get-metadata.js
- get-screenshot.js
- get-variable-defs.js

Playwright MCP:
- mcp__playwright__browser_navigate
- mcp__playwright__browser_snapshot
- mcp__playwright__browser_take_screenshot
- mcp__playwright__browser_click
- mcp__playwright__browser_hover
- mcp__playwright__browser_evaluate
```

### Phase 3: Progressive Discovery Workflow Test 🔄

**Simulate Real Usage**:
```
1. Start with zero context
2. Read global skills README
3. Navigate to figma-desktop/SKILL.md
4. Load scripts README for details
5. Execute script via Bash
6. Measure token efficiency
```

**Token Budget Analysis**:
- Global README: ~200 tokens
- SKILL.md: ~300 tokens
- Scripts README: ~400 tokens
- **Total**: ~900 tokens (efficient on-demand loading)

### Phase 4: Documentation Coverage Audit 📊

**Figma Desktop Scripts** (Expected: 8):
1. `extract-frames.js` - Frame discovery
2. `get-metadata.js` - Node structure
3. `get-screenshot.js` - Visual capture
4. `get-variable-defs.js` - Design tokens
5. `get-annotations.js` - Dev mode notes
6. `get-code-connect-map.js` - Component mapping
7. `get-figjam.js` - FigJam content
8. `compare-frames.js` - Frame comparison

**Playwright Tools** (Expected: 21):
- **Navigation** (3): navigate, wait_for, close
- **Interaction** (6): click, hover, type, fill_form, press_key, select_option
- **Information** (5): snapshot, take_screenshot, console_messages, network_requests, evaluate
- **State** (4): cookies_get, cookies_set, storage_get, storage_set
- **Advanced** (3): pdf, accessibility_tree, drag_and_drop

### Phase 5: Cross-Reference with Commands 🔗

**Commands Using Skills**:
```
/update-figma       → Uses Figma scripts
/map-new-page       → Uses Figma scripts + Playwright MCP
/validate-component → Uses Figma scripts + Playwright MCP
/validate-screen    → Uses Figma scripts + Playwright MCP
/implement-component→ Uses Figma scripts
```

**Validate Each Command**:
- ✅ Follows progressive discovery pattern
- ✅ Reads SKILL.md before using tools
- ✅ Loads only needed documentation
- ✅ Uses tools correctly

## Output Report

```
═══════════════════════════════════════════════════════
    SKILLS SYSTEM DEBUG REPORT
═══════════════════════════════════════════════════════

📚 PHASE 1: DOCUMENTATION VALIDATION
═══════════════════════════════════════════════════════
✅ Global Skills Documentation
   - README.md: {{status}}

✅ Figma Desktop Skills (8 scripts)
   - SKILL.md: {{status}}
   - Scripts README: {{status}}
   - Scripts found: {{foundCount}}/8

✅ Playwright Skills (21 tools)
   - INDEX.md: {{status}}
   - Tool docs: {{foundCount}}/21

📊 Documentation Quality:
   - Structure consistency: {{score}}/100
   - Example quality: {{score}}/100

═══════════════════════════════════════════════════════
🔧 PHASE 2: TOOL AVAILABILITY
═══════════════════════════════════════════════════════
{{figmaStatus}} Figma Scripts
   - FIGMA_TOKEN: {{tokenStatus}}
   - Scripts accessible: {{accessible}}
   - Test result: {{testResult}}

{{playwrightStatus}} Playwright MCP
   - Server installed: {{installed}}
   - Browser available: {{browserStatus}}
   - Test result: {{testResult}}

🔑 Pre-approved Tools:
   - Figma scripts: {{approvedCount}}/8
   - Playwright tools: {{approvedCount}}/21

═══════════════════════════════════════════════════════
🔄 PHASE 3: PROGRESSIVE DISCOVERY TEST
═══════════════════════════════════════════════════════
✅ Workflow simulation completed
   - Token usage (progressive): {{progressiveTokens}}
   - Efficiency: Token-efficient on-demand loading

═══════════════════════════════════════════════════════
📊 PHASE 4: COVERAGE AUDIT
═══════════════════════════════════════════════════════
Figma Desktop: {{foundCount}}/8 scripts documented
Playwright: {{foundCount}}/21 tools documented
Total coverage: {{percentage}}%

Missing documentation: {{missingTools}}

═══════════════════════════════════════════════════════
🔗 PHASE 5: COMMAND INTEGRATION
═══════════════════════════════════════════════════════
{{commandCheckResults}}

═══════════════════════════════════════════════════════
🎯 OVERALL STATUS: {{overallStatus}}
═══════════════════════════════════════════════════════

{{nextSteps}}
```

## Troubleshooting Guide

### Issue: Documentation files missing
**Solution**: Verify `.claude/skills/` directory structure exists

### Issue: Figma scripts not working
**Solution**: Set FIGMA_TOKEN environment variable

### Issue: Playwright MCP not found
**Solution**: Install MCP server via Claude Desktop settings

### Issue: Commands not following progressive pattern
**Solution**: Update command files to read SKILL.md before using tools

## Success Criteria

Skills system is healthy when:
- ✅ All 8 Figma scripts documented
- ✅ All 21 Playwright tools documented
- ✅ FIGMA_TOKEN configured
- ✅ Playwright MCP server responds
- ✅ All commands follow progressive pattern
- ✅ Documentation is accurate and current

Starting skills system debug...
