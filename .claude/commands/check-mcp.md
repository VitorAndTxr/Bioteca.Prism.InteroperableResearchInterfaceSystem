---
description: Debug skills documentation and MCP tool availability
---

# 🔬 Skills System Debug

I will debug the skills documentation system and verify MCP tool availability.

## What This Command Does

This command validates the **progressive skill discovery pattern** implemented in `.claude/skills/`:

1. **Documentation Structure**: Verifies skills documentation exists and is accessible
2. **MCP Tool Availability**: Tests that MCP tools are available for use
3. **Progressive Discovery**: Validates the token-efficient pattern works correctly

## Debug Process

### Phase 1: Skills Documentation Validation 📚

**Step 1 - Verify Global Index**:
```
Read: .claude/skills/README.md
Read: .claude/skills/mcp-servers/INDEX.md
```

Expected:
- ✅ README explains progressive discovery pattern
- ✅ INDEX lists all available MCP servers
- ✅ Documentation is in English

**Step 2 - Verify Figma Skills Documentation**:
```
Read: .claude/skills/mcp-servers/figma-desktop/INDEX.md
```

Expected:
- ✅ Lists all 7 Figma tools
- ✅ Each tool has concise description (<50 chars)
- ✅ Links to individual tool documentation
- ✅ Tool documentation exists and is <200 tokens

**Step 3 - Verify Playwright Skills Documentation**:
```
Read: .claude/skills/mcp-servers/playwright/INDEX.md
```

Expected:
- ✅ Lists all 21 Playwright tools
- ✅ Categorized by function (navigation, interaction, etc.)
- ✅ Links to individual tool documentation
- ✅ Tool documentation exists and is <200 tokens

**Step 4 - Validate Documentation Quality**:
For each tool file:
- Consistent structure (parameters, returns, errors, examples)
- Token count <200 per file
- Real-world usage examples
- Matches actual MCP tool implementation

### Phase 2: MCP Tool Availability Testing 🔧

**Test 1 - Figma Desktop MCP**:
```
Try: mcp__figma-desktop__get_metadata({ nodeId: "0:0" })
```

Possible outcomes:
- ✅ **Success**: Tool responds (even if node doesn't exist)
- ❌ **Tool not found**: MCP server not installed
- ❌ **Auth error**: Figma Desktop not logged in

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
- mcp__figma-desktop__get_metadata
- mcp__figma-desktop__get_screenshot
- mcp__figma-desktop__get_design_context
- mcp__figma-desktop__get_variable_defs
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
2. Read global INDEX.md
3. Navigate to figma-desktop/INDEX.md
4. Load specific tool: get_design_context.md
5. Use tool: mcp__figma-desktop__get_design_context
6. Measure token efficiency
```

**Token Budget Analysis**:
- Global INDEX: ~150 tokens
- Server INDEX (Figma): ~300 tokens
- Individual tool doc: ~150 tokens
- **Total**: ~600 tokens (vs. loading all 28 tools upfront = ~4200 tokens)
- **Savings**: 85% token reduction

### Phase 4: Documentation Coverage Audit 📊

**Figma Desktop Tools** (Expected: 7):
1. `get_design_context` - Primary tool for code generation
2. `get_metadata` - Component structure
3. `get_variable_defs` - Design tokens
4. `get_code_connect_map` - Design-to-code mapping
5. `get_screenshot` - Visual reference
6. `get_component_info` - Component details
7. `list_available_files` - File browser

**Playwright Tools** (Expected: 21):
- **Navigation** (3): navigate, wait_for, close
- **Interaction** (6): click, hover, type, fill_form, press_key, select_option
- **Information** (5): snapshot, take_screenshot, console_messages, network_requests, evaluate
- **State** (4): cookies_get, cookies_set, storage_get, storage_set
- **Advanced** (3): pdf, accessibility_tree, drag_and_drop

### Phase 5: Cross-Reference with Commands 🔗

**Commands Using Skills**:
```
/update-figma       → Uses Figma + Playwright skills
/map-new-page       → Uses Figma + Playwright skills
/validate-component → Uses Figma + Playwright skills
/validate-screen    → Uses Figma + Playwright skills
/implement-component→ Uses Figma skills
```

**Validate Each Command**:
- ✅ Follows progressive discovery pattern
- ✅ Reads INDEX before using tools
- ✅ Loads only needed tool documentation
- ✅ Uses MCP tools correctly

## Output Report

```
═══════════════════════════════════════════════════════
    SKILLS SYSTEM DEBUG REPORT
═══════════════════════════════════════════════════════

📚 PHASE 1: DOCUMENTATION VALIDATION
═══════════════════════════════════════════════════════
✅ Global Skills Documentation
   - README.md: {{status}}
   - INDEX.md: {{status}}

✅ Figma Desktop Skills (7 tools)
   - INDEX.md: {{status}}
   - Tool docs: {{foundCount}}/7
   - Token budget: {{tokenCount}} tokens

✅ Playwright Skills (21 tools)
   - INDEX.md: {{status}}
   - Tool docs: {{foundCount}}/21
   - Token budget: {{tokenCount}} tokens

📊 Documentation Quality:
   - Structure consistency: {{score}}/100
   - Token efficiency: {{savings}}% savings
   - Example quality: {{score}}/100

═══════════════════════════════════════════════════════
🔧 PHASE 2: MCP TOOL AVAILABILITY
═══════════════════════════════════════════════════════
{{figmaStatus}} Figma Desktop MCP
   - Server installed: {{installed}}
   - Auth status: {{authStatus}}
   - Test result: {{testResult}}

{{playwrightStatus}} Playwright MCP
   - Server installed: {{installed}}
   - Browser available: {{browserStatus}}
   - Test result: {{testResult}}

🔑 Pre-approved Tools:
   - Figma tools: {{approvedCount}}/7
   - Playwright tools: {{approvedCount}}/21

═══════════════════════════════════════════════════════
🔄 PHASE 3: PROGRESSIVE DISCOVERY TEST
═══════════════════════════════════════════════════════
✅ Workflow simulation completed
   - Token usage (progressive): {{progressiveTokens}}
   - Token usage (upfront load): {{upfrontTokens}}
   - Efficiency gain: {{savings}}%

═══════════════════════════════════════════════════════
📊 PHASE 4: COVERAGE AUDIT
═══════════════════════════════════════════════════════
Figma Desktop: {{foundCount}}/7 tools documented
Playwright: {{foundCount}}/21 tools documented
Total: {{totalFound}}/28 tools documented

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

### Issue: MCP tools not found
**Solution**: Install MCP servers via Claude Desktop settings

### Issue: Token budget exceeds expectations
**Solution**: Review individual tool documentation for verbosity

### Issue: Pre-approved tools requiring approval
**Solution**: Check Claude Code configuration for tool permissions

### Issue: Commands not following progressive pattern
**Solution**: Update command files to read INDEX before tool use

## Success Criteria

Skills system is healthy when:
- ✅ All 28 tools documented (<200 tokens each)
- ✅ Progressive discovery saves >80% tokens
- ✅ All MCP servers respond to test calls
- ✅ Pre-approved tools work without prompts
- ✅ All commands follow progressive pattern
- ✅ Documentation is accurate and current

## Next Steps Based on Results

**All Green ✅**:
- Skills system working perfectly
- Ready for production use
- Monitor token usage in real workflows

**Partial Success ⚠️**:
- Review missing documentation
- Fix broken tool references
- Update command patterns

**Critical Issues ❌**:
- Install missing MCP servers
- Rebuild skills documentation structure
- Review command implementations

Starting skills system debug...