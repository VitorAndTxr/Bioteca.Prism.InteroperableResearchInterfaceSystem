# Figma Page Verification Task - November 14, 2025

## Mission: Verify Current Frame Count vs Documented Count

**Reported Issue**: User reports new screens have been created in Figma page 2501-2715
**Current Documentation**: Reports 31 frames (as of November 14, 2025, 19:15 UTC)
**Task**: Verify current state and identify new frames

---

## Current Status: MCP Tool Access Issue

### MCP Server Status
- **Figma Desktop MCP Server**: Running (http://127.0.0.1:3845/mcp)
- **Server Response**: Active but requires session authentication
- **Tool Availability**: MCP tools are configured in `.claude/settings.local.json` but not directly accessible in current execution context

### Available MCP Tools (Configured)
- `mcp__figma-desktop__get_metadata` - Extract page structure and frame hierarchy
- `mcp__figma-desktop__get_screenshot` - Capture frame screenshots
- `mcp__figma-desktop__get_design_context` - Generate implementation code
- `mcp__figma-desktop__get_variable_defs` - Extract design tokens

---

## Previously Documented Frames (November 14, 2025)

**Source**: `docs/figma/pages/REMAPPING_REPORT_2025-11-14.md`

### Summary
- **Total Frames**: 31
- **Distribution**:
  - Authentication: 1 frame (3.2%)
  - User Management: 9 frames (29.0%)
  - Research Management: 4 frames (12.9%)
  - NPI Management: 3 frames (9.7%)
  - SNOMED Management: 14 frames (45.2%)

### Complete Frame Inventory (31 Frames)

#### Module 1: Authentication (1 frame)
1. Login - `6804-13742`

#### Module 2: User Management (9 frames)
2. Usuários - `6804-13670`
3. Pesquisadores - `6910-3378`
4. Novo usuário - `6804-12778`
5. Novo pesquisador - `6804-12812`
6. Informações do usuário - `6835-991`
7. Informações do pesquisador - `6835-1017`
8. Toast: Novo usuário - `6816-2701`
9. Toast: Novo pesquisador - `6816-2702`
22. Voluntários - `6910-4277` ⚠️ DUPLICATE

#### Module 3: NPI Management (3 frames)
10. NPIs - Solicitações - `6804-13591`
11. NPIs - Conexões ativas - `6804-13512`
30. Nova conexão - `6910-3543`

#### Module 4: SNOMED Management (14 frames)

**List Screens (7)**:
12. SNOMED - Região do corpo - `6804-12924`
13. SNOMED - Estrutura do corpo - `6804-13008`
14. SNOMED - Modificador topográfico - `6804-13092`
15. SNOMED - Condição clínica - `6804-13176`
16. SNOMED - Evento clínico - `6804-13260`
17. SNOMED - Medicação - `6804-13344`
18. SNOMED - Alergia/Intolerância - `6804-13428`

**Form Screens (7)**:
23. Novo evento clínico - `6910-2905`
24. Nova condição clínica - `6910-2825`
26. Novo modificador topográfico - `6910-2719`
27. Nova alergia/Intolerância - `6910-3177`
28. Nova medicação - `6910-3052`
29. Nova estrutura do corpo - `6910-2612`
31. Nova região do corpo - `6910-2488`

#### Module 5: Research Management (4 frames)
19. Pesquisas - `6910-4277` ⚠️ DUPLICATE
20. Pesquisa específica - Voluntários - `6910-4190`
21. Pesquisa específica - Pesquisadores - `6910-3745`
25. Pesquisas - Incluir pesquisador - `6910-4029`

---

## Known Issues from Previous Report

### Issue #1: Duplicate Node IDs
- **Node ID `6910-4277`** appears twice:
  - Frame 19: "Pesquisas" (Research Management)
  - Frame 22: "Voluntários" (User Management)
- **Impact**: Navigation conflicts, ambiguous routing
- **Status**: Unresolved

---

## Verification Methods (Manual Alternatives)

Since direct MCP tool access is currently unavailable, here are alternative verification methods:

### Method 1: Manual Figma Desktop Inspection
1. Open Figma Desktop application
2. Navigate to file: `xFC8eCJcSwB9EyicTmDJ7w` (I.R.I.S.-Prototype)
3. Select page node: `2501:2715`
4. Count all visible frames in the left panel (Layers view)
5. Compare count with documented 31 frames
6. Note any new frame names or node IDs

### Method 2: Figma Web Interface
1. Open: https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=2501-2715&m=dev
2. View all layers in the page
3. Export layer list or take screenshot
4. Compare with documented frames

### Method 3: Figma API (if access token available)
```bash
# Requires FIGMA_ACCESS_TOKEN
curl -H "X-Figma-Token: $FIGMA_ACCESS_TOKEN" \
  "https://api.figma.com/v1/files/xFC8eCJcSwB9EyicTmDJ7w/nodes?ids=2501:2715"
```

### Method 4: MCP Tool via Claude Code UI
If MCP tools are available in the Claude Code interface:
1. Use the `/map-new-page` slash command
2. Or directly call `mcp__figma-desktop__get_metadata({ nodeId: "2501:2715" })`
3. Parse the returned XML for all frame nodes
4. Count and compare

---

## Expected Verification Output

When verification is complete, the following should be documented:

### Frame Count Comparison
```
BEFORE (Nov 14, 2025 report):  31 frames
AFTER (Current verification):  ?? frames
DIFFERENCE:                    +?? frames (NEW) / -?? frames (REMOVED)
```

### New Frames Discovered
```
ID   | Frame Name              | Node ID     | Type   | Module
-----|-------------------------|-------------|--------|--------
032  | [Name]                  | [Node ID]   | Screen | [Module]
033  | [Name]                  | [Node ID]   | Screen | [Module]
...
```

### Removed Frames (if any)
```
ID   | Frame Name              | Node ID     | Status
-----|-------------------------|-------------|--------
[ID] | [Name]                  | [Node ID]   | REMOVED
```

### Modified Frames (if any)
```
ID   | Frame Name              | Change
-----|-------------------------|--------
[ID] | [Old Name → New Name]   | RENAMED
[ID] | [Old ID → New ID]       | RE-ASSIGNED
```

---

## Action Items

### Immediate Actions
- [ ] **CRITICAL**: Gain access to MCP tools or use manual method to verify current frame count
- [ ] Document total frame count as of current verification
- [ ] Identify all new frames added since November 14 report
- [ ] Update node ID mappings for any new frames
- [ ] Verify if duplicate node ID issue (6910-4277) has been resolved

### Documentation Updates Needed
- [ ] Update `docs/figma/frame-node-mapping.json` with new frames
- [ ] Create new verification report with comparison analysis
- [ ] Update `docs/figma/pages/REMAPPING_REPORT_2025-11-14.md` or create new dated report
- [ ] Generate screenshots for new frames
- [ ] Extract design context for high-priority new frames

### Implementation Planning
- [ ] Classify new frames by module (Auth, User Mgmt, Research, NPI, SNOMED, or NEW module)
- [ ] Assign priority levels (High, Medium, Low)
- [ ] Add new frames to implementation roadmap
- [ ] Update module completion percentages

---

## Next Steps for AI Assistant

Once MCP tool access is restored or manual verification is completed:

1. **Execute Discovery**:
   ```typescript
   const metadata = await mcp__figma-desktop__get_metadata({
     nodeId: "2501:2715"
   });
   // Parse XML to extract all child frame nodes
   ```

2. **Count Frames**:
   - Parse XML for all `<FRAME>` elements
   - Extract node IDs and names
   - Count total frames

3. **Compare with Documentation**:
   - Load previous report (31 frames)
   - Diff the two lists
   - Identify additions, removals, changes

4. **Generate Comparison Report**:
   - Summary statistics (before/after counts)
   - Detailed diff table
   - Impact analysis (which modules affected)
   - Updated priority roadmap

5. **Update All Documentation**:
   - Master mapping JSON
   - Module-specific reports
   - Implementation status
   - Design system integration

---

## Technical Details

### Figma File Information
- **File Key**: `xFC8eCJcSwB9EyicTmDJ7w`
- **File Name**: I.R.I.S.-Prototype
- **Page Node ID**: `2501:2715` (formatted: `2501-2715` in URLs)
- **Page URL**: https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=2501-2715&m=dev

### MCP Server Configuration
- **Server Type**: HTTP
- **Server URL**: http://127.0.0.1:3845/mcp
- **Server Status**: Running (requires session)
- **Config Location**: `.claude/mcp-config/figma-desktop.json`

### Node ID Format
- **Figma API Format**: `"2501:2715"` (colon separator)
- **URL Format**: `node-id=2501-2715` (hyphen separator)
- **Both formats** are valid for MCP tools

---

## Conclusion

**Current Status**: Verification task identified but cannot be completed due to MCP tool access limitations in current execution context.

**Required**: Manual verification via Figma Desktop/Web OR access to MCP tools via alternative invocation method.

**User Impact**: Cannot confirm if new frames exist until verification is completed.

**Recommendation**:
1. User should manually count frames in Figma Desktop (Layers panel)
2. OR provide Figma API access token for REST API verification
3. OR retry this task in Claude Code environment with direct MCP tool access

---

**Task Created**: November 14, 2025
**Task Status**: BLOCKED - Awaiting MCP tool access or manual verification
**Reporter**: User via Claude Code
**Assignee**: Requires manual intervention or MCP tool restoration
