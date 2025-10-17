---
description: Validate component implementation against Figma design using MCP tools
---

# 🔍 Component Validation Workflow

I will validate a component's implementation against Figma design specifications using the Figma MCP and Playwright MCP integration.

## Validation Process

This command implements a comprehensive 4-phase validation workflow developed during Button component color correction:

### Phase 1: Figma Design Extraction
**Goal**: Extract the source of truth from Figma design

**Steps**:
1. **Get Component Overview** (`get_design_context`)
   - Extract initial design specifications
   - Identify component node ID
   - Get variable definitions and color tokens

2. **Get Visual Reference** (`get_screenshot`)
   - Capture Figma design screenshot
   - Visual reference for all states and variants

3. **Get Detailed Metadata** (`get_metadata`)
   - List all child nodes (variants, states)
   - Extract specific node IDs for each variant/state
   - Map Figma structure to component structure

4. **Extract Exact Colors** (per-node `get_design_context`)
   - For each variant (Primary, Secondary, Outline, etc.)
   - For each state (Default, Hover, Active, Disabled)
   - Extract exact color values from specific nodes
   - Document design token mapping

**Example Figma Extraction**:
```typescript
// Node 2803-1366: Button component parent
// Child nodes:
//   - 2418-16647: Primary/Default/Medium
//   - 2418-16654: Primary/Hover/Medium
//   - 2418-16661: Primary/Active/Medium
//   - 2418-17137: Secondary/Default/Medium
//   - etc.

Primary/Default:
  - Background: #49A2A8 (Brand/Primary/500)
  - Text: #DAFAFD (Brand/Primary/50)
  - Border: #49A2A8

Primary/Hover:
  - Background: #DAFAFD (Brand/Primary/50)
  - Text: #285F63 (Brand/Primary/700)
  - Border: #DAFAFD
```

### Phase 2: Code Analysis
**Goal**: Compare implementation with Figma specifications

**Steps**:
1. **Read Component Files**
   - Component TypeScript/TSX
   - Component CSS/styles
   - Storybook stories
   - Type definitions

2. **Identify Discrepancies**
   - Compare colors (background, text, border)
   - Validate states (hover, active, disabled)
   - Check variants (primary, secondary, outline)
   - Verify spacing and sizing

3. **Document Issues**
   - List all incorrect values
   - Note which states/variants are affected
   - Prioritize critical vs. minor issues

**Example Discrepancy Report**:
```
❌ PRIMARY/HOVER:
   Expected: #DAFAFD bg + #285F63 text
   Found: #387F84 bg + white text

❌ OUTLINE/DEFAULT:
   Expected: #DAFAFD bg + #53B7BE border
   Found: transparent bg + #555555 border

❌ SECONDARY/ACTIVE:
   Expected: #7B6FDB bg + #F4F3FE text
   Found: #5244AB bg + white text
```

### Phase 3: Apply Corrections
**Goal**: Update code to match Figma design

**Steps**:
1. **Update Styles**
   - Apply correct colors
   - Fix state styles
   - Update variant definitions
   - Add design token comments

2. **Update Documentation**
   - Document color mappings in CSS header
   - Link to Figma node IDs
   - Explain design token usage

3. **Preserve Correct Values**
   - Don't change what's already correct
   - Validate each change against Figma
   - Ask for confirmation if uncertain

**Example Correction**:
```css
/**
 * Button Component Styles
 * Based on IRIS Design System - Figma node 2803-1366
 *
 * Design tokens from Figma (extracted via MCP):
 * PRIMARY:
 *   - Default: #49A2A8 bg + #DAFAFD text (Brand/Primary/500 + Primary/50)
 *   - Hover: #DAFAFD bg + #285F63 text (Brand/Primary/50 + Primary/700)
 *   - Active: #387F84 bg + #DAFAFD text (Brand/Primary/600 + Primary/50)
 */

.iris-button--primary:hover:not(:disabled) {
    background-color: #DAFAFD;  /* ✅ Corrected from #387F84 */
    color: #285F63;              /* ✅ Corrected from white */
    border-color: #DAFAFD;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(218, 250, 253, 0.3);
}
```

### Phase 4: Playwright Visual Validation
**Goal**: Confirm corrections match Figma design visually

**Steps**:
1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Navigate to Component Demo**
   - Use `browser_navigate` to demo page
   - Wait for page load
   - Take initial screenshot

3. **Test Each Variant/State**
   - **Default State**: Take screenshot
   - **Hover State**:
     - Use `browser_hover` to trigger hover
     - Take screenshot
     - Compare with Figma
   - **Active State**:
     - Use `browser_click` to trigger active
     - Take screenshot
     - Compare with Figma
   - **Disabled State**: Take screenshot

4. **Generate Validation Report**
   - Store screenshots in `.playwright-mcp/`
   - Compare side-by-side with Figma screenshots
   - Document pass/fail for each variant

**Example Playwright Test Flow**:
```typescript
// 1. Navigate
await browser_navigate('http://localhost:5173/InputDemo')

// 2. Screenshot default state
await browser_take_screenshot('component-default.png')

// 3. Test hover
await browser_hover('Primary button')
await browser_take_screenshot('primary-hover.png')

// 4. Test active
await browser_click('Primary button')
await browser_take_screenshot('primary-active.png')

// 5. Repeat for all variants
```

## Validation Checklist

After running this workflow, verify:

- ✅ All Figma colors extracted correctly
- ✅ All code discrepancies identified
- ✅ All corrections applied
- ✅ All visual states tested
- ✅ Screenshots match Figma design
- ✅ No regressions introduced
- ✅ Design tokens documented
- ✅ Ready for commit

## MCP Tools Reference

### Figma MCP Tools
- `get_design_context` - Extract component design and code
- `get_screenshot` - Capture visual reference
- `get_metadata` - Get component structure and node IDs
- `get_variable_defs` - Extract design tokens

### Playwright MCP Tools
- `browser_navigate` - Navigate to page
- `browser_snapshot` - Get page accessibility tree
- `browser_take_screenshot` - Capture visual state
- `browser_hover` - Trigger hover state
- `browser_click` - Trigger active state
- `browser_evaluate` - Run JavaScript for state inspection

## Example Usage

```bash
# Run validation on Button component
/validate-component Button

# Run validation on Input component
/validate-component Input

# Run validation with specific Figma node
/validate-component Button --node 2803-1366
```

## Output Format

```
═══════════════════════════════════════════════════════
    COMPONENT VALIDATION REPORT
═══════════════════════════════════════════════════════

🎨 COMPONENT: Button
📍 FIGMA NODE: 2803-1366
🔗 DEMO PAGE: http://localhost:5173/InputDemo

═══════════════════════════════════════════════════════
PHASE 1: FIGMA EXTRACTION
═══════════════════════════════════════════════════════

✅ Design context extracted
✅ Screenshot captured
✅ Metadata retrieved (12 variant nodes)
✅ Colors extracted for 3 variants × 4 states

PRIMARY:
  Default: #49A2A8 bg + #DAFAFD text ✓
  Hover: #DAFAFD bg + #285F63 text ✓
  Active: #387F84 bg + #DAFAFD text ✓

SECONDARY:
  Default: #7B6FDB bg + white text ✓
  Hover: #D4CEFB bg + #5244AB text ✓
  Active: #7B6FDB bg + #F4F3FE text ✓

OUTLINE:
  Default: #DAFAFD bg + #53B7BE border ✓
  Hover: #ADF4FA bg + #285F63 border ✓
  Active: #387F84 bg + #285F63 border ✓

═══════════════════════════════════════════════════════
PHASE 2: CODE ANALYSIS
═══════════════════════════════════════════════════════

📄 Files analyzed:
  - Button.tsx
  - Button.css
  - Button.stories.tsx

❌ DISCREPANCIES FOUND: 5

1. PRIMARY/HOVER background
   Expected: #DAFAFD
   Found: #387F84
   Severity: HIGH

2. PRIMARY/HOVER text
   Expected: #285F63
   Found: white
   Severity: HIGH

3. OUTLINE/DEFAULT (all properties)
   Expected: Specific colors per Figma
   Found: Generic gray values
   Severity: CRITICAL

4. SECONDARY/ACTIVE text
   Expected: #F4F3FE
   Found: white
   Severity: MEDIUM

═══════════════════════════════════════════════════════
PHASE 3: CORRECTIONS APPLIED
═══════════════════════════════════════════════════════

✅ Updated Button.css with correct colors
✅ Added design token documentation
✅ Preserved correct values (Secondary default)
✅ All 5 discrepancies resolved

═══════════════════════════════════════════════════════
PHASE 4: VISUAL VALIDATION
═══════════════════════════════════════════════════════

🌐 Dev server: http://localhost:5173
📸 Screenshots: .playwright-mcp/

✅ Primary default: PASS
✅ Primary hover: PASS
✅ Primary active: PASS
✅ Secondary default: PASS
✅ Secondary hover: PASS
✅ Secondary active: PASS
✅ Outline default: PASS
✅ Outline hover: PASS
✅ Outline active: PASS

═══════════════════════════════════════════════════════
VALIDATION RESULT: ✅ PASS
═══════════════════════════════════════════════════════

All variants match Figma design specifications.
Ready for commit.

Files modified:
  - apps/desktop/src/design-system/components/button/Button.css
```

## Success Criteria

A component passes validation when:

1. **Figma Match**: All colors, spacing, and states match Figma design exactly
2. **Visual Confirmation**: Playwright screenshots match Figma screenshots
3. **Documentation**: CSS includes design token comments and Figma node references
4. **No Regressions**: Existing correct values are preserved
5. **Cross-State**: All states (default, hover, active, disabled) validated
6. **Cross-Variant**: All variants (primary, secondary, outline, etc.) validated

## Notes

- This workflow was developed during Button component color correction
- Extracts colors at the node level for maximum accuracy
- Combines automated extraction with visual validation
- Prevents regressions by verifying existing correct values
- Screenshots provide audit trail for design decisions

---

**Component to validate**: {{args}}

Let me run the comprehensive validation workflow...
