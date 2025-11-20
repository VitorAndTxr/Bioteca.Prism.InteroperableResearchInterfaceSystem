---
description: Validate component implementation against Figma design
---

# 🔍 Component Validation Workflow

I will validate a component's implementation against Figma design using REST API scripts and Playwright.

## Process

### Step 0: Load Skills Documentation 📚

```
1. Read: .claude/skills/figma-desktop/SKILL.md
2. Read: .claude/skills/mcp-servers/playwright/INDEX.md
3. Available tools:
   - Figma scripts (get-metadata.js, get-screenshot.js)
   - Playwright MCP (browser_navigate, browser_hover, browser_take_screenshot)
```

### Phase 1: Figma Design Extraction 🎨

**Goal**: Extract source of truth from Figma

**REST API Scripts**:
```bash
# Get component metadata
node .claude/skills/figma-desktop/scripts/get-metadata.js xFC8eCJcSwB9EyicTmDJ7w {{componentNode}}

# Get screenshot
node .claude/skills/figma-desktop/scripts/get-screenshot.js xFC8eCJcSwB9EyicTmDJ7w {{componentNode}}
```

**Extract per variant/state**:
- Primary (Default, Hover, Active, Disabled)
- Secondary (Default, Hover, Active, Disabled)
- Outline (Default, Hover, Active, Disabled)

**Example**:
```
Button Node 2803-1366:
├── Primary/Default: #49A2A8 bg + #DAFAFD text
├── Primary/Hover: #DAFAFD bg + #285F63 text
├── Primary/Active: #387F84 bg + #DAFAFD text
└── ...
```

### Phase 2: Code Analysis 🔍

**Goal**: Compare implementation with Figma

**Steps**:
1. Read component files (TSX, CSS, types, stories)
2. Compare colors, states, variants, spacing
3. Document discrepancies

**Example Discrepancies**:
```
❌ PRIMARY/HOVER: Expected #DAFAFD bg, Found #387F84 bg
❌ OUTLINE/DEFAULT: Expected #DAFAFD bg, Found transparent bg
❌ SECONDARY/ACTIVE: Expected #7B6FDB bg, Found #5244AB bg
```

### Phase 3: Apply Corrections ✏️

**Goal**: Update code to match Figma

**Actions**:
1. Apply correct colors/styles
2. Add design token comments with Figma node refs
3. Preserve already-correct values

**Example**:
```css
/**
 * Button Styles - Figma node 2803-1366
 * PRIMARY/Hover: #DAFAFD bg + #285F63 text
 */
.iris-button--primary:hover:not(:disabled) {
    background-color: #DAFAFD;  /* ✅ Corrected */
    color: #285F63;              /* ✅ Corrected */
}
```

### Phase 4: Visual Validation 📸

**Goal**: Confirm corrections match Figma visually

**Playwright MCP Tools**:
```
mcp__playwright__browser_navigate({ url: "http://localhost:5173" })
mcp__playwright__browser_hover({ element: "Primary button" })
mcp__playwright__browser_take_screenshot({ filename: "primary-hover.png" })
mcp__playwright__browser_click({ element: "Primary button" })
mcp__playwright__browser_take_screenshot({ filename: "primary-active.png" })
```

**Test Matrix**:
- Default, Hover, Active, Disabled states
- Primary, Secondary, Outline variants
- Screenshots in `.playwright-mcp/`

## Output Report

```
═══════════════════════════════════════════════════════
    COMPONENT VALIDATION REPORT
═══════════════════════════════════════════════════════

🎨 COMPONENT: {{componentName}}
📍 FIGMA NODE: {{nodeId}}
🔗 DEMO PAGE: http://localhost:5173

PHASE 1: FIGMA EXTRACTION ✅
  ✅ Metadata extracted via scripts
  ✅ Colors extracted for all states

PHASE 2: CODE ANALYSIS
  📄 Files: {{fileList}}
  {{discrepancyCount}} discrepancies found

PHASE 3: CORRECTIONS APPLIED ✅
  ✅ Updated styles with correct colors
  ✅ Added design token documentation
  ✅ All {{discrepancyCount}} issues resolved

PHASE 4: VISUAL VALIDATION ✅
  🌐 Dev server: http://localhost:5173
  📸 Screenshots: .playwright-mcp/
  ✅ All {{variantCount}} variants validated

VALIDATION RESULT: {{status}}
═══════════════════════════════════════════════════════

Files modified: {{modifiedFiles}}
```

## Success Criteria

- ✅ All colors/spacing match Figma exactly
- ✅ Playwright screenshots match Figma
- ✅ CSS includes design token comments
- ✅ No regressions introduced
- ✅ All states/variants validated

Starting comprehensive validation for {{componentName}}...
