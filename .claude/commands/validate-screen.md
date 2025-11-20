---
description: Comprehensive screen validation with ultrathink test flow
---

# 🔬 Ultrathink Screen Validation

I will execute comprehensive "ultrathink" validation: ultra-thorough analysis, think-through interaction paths, ultra-deep state validation, and think-ahead for edge cases.

## Process

### Step 0: Load Skills Documentation 📚

```
1. Read: .claude/skills/figma-desktop/SKILL.md
2. Read: .claude/skills/mcp-servers/playwright/INDEX.md
3. Available tools:
   - Figma scripts (get-metadata.js, get-screenshot.js)
   - Playwright MCP (browser_navigate, browser_snapshot, etc.)
```

## 5-Phase Validation

### Phase 1: Design Extraction 🎨

**Goal**: Extract screen design from Figma

**REST API Scripts**:
```bash
# Get screen metadata
node .claude/skills/figma-desktop/scripts/get-metadata.js xFC8eCJcSwB9EyicTmDJ7w {{screenNode}}

# Get screenshot
node .claude/skills/figma-desktop/scripts/get-screenshot.js xFC8eCJcSwB9EyicTmDJ7w {{screenNode}}

# Extract design tokens
node .claude/skills/figma-desktop/scripts/get-variable-defs.js xFC8eCJcSwB9EyicTmDJ7w
```

**Extract**:
- Screen layout and component hierarchy
- Responsive breakpoints (Mobile/Tablet/Desktop)
- Component inventory and states
- Design tokens and spacing

### Phase 2: Implementation Review 🔍

**Goal**: Analyze implementation completeness

**Review**:
1. File structure (TSX, CSS, types, tests, stories)
2. Component usage and state management
3. TypeScript strict mode compliance
4. Responsive design and theme tokens
5. Error handling and loading states

**Validation Checklist**:
```
✅ Structure: All files present
✅ Implementation: Features complete
✅ Types: TypeScript strict mode
✅ Quality: Accessible, responsive, performant
```

### Phase 3: Interactive Testing 🎮

**Goal**: Test user interactions with Playwright

**MCP Tools**:
```
mcp__playwright__browser_navigate({ url: "http://localhost:5173/{{screenPath}}" })
mcp__playwright__browser_wait_for({ text: "{{screenTitle}}" })
mcp__playwright__browser_snapshot()
mcp__playwright__browser_fill_form({ fields: [...] })
mcp__playwright__browser_click({ element: "Button" })
mcp__playwright__browser_hover({ element: "Element" })
```

**Test Coverage**:
- Navigation and loading
- Form inputs and validation
- Button interactions
- Dropdowns and selections
- Data table operations
- User flow scenarios (happy path, errors, edge cases)
- Keyboard navigation and accessibility

### Phase 4: Data & State Validation 📊

**Goal**: Validate data flow and state management

**MCP Tools**:
```
mcp__playwright__browser_network_requests()
mcp__playwright__browser_evaluate({ script: "..." })
mcp__playwright__browser_cookies_get()
mcp__playwright__browser_storage_get({ key: "..." })
```

**Validate**:
- Context integration (AuthContext, custom contexts)
- API endpoints (correct URLs, payloads, responses)
- State management (initial, loading, error, success states)
- Data persistence (localStorage, cookies, cache)

### Phase 5: Visual & Performance 📸

**Goal**: Visual validation and performance metrics

**MCP Tools**:
```
mcp__playwright__browser_take_screenshot({ filename: "screen-{{state}}.png" })
mcp__playwright__browser_evaluate({ script: "performance.getEntriesByType('paint')" })
```

**Test**:
- Visual regression (default, loading, error, success, empty states)
- Responsive design (Mobile 375px, Tablet 768px, Desktop 1440px)
- Performance metrics (FCP, LCP, TTI, CLS)
- Accessibility audit (ARIA, keyboard nav, screen reader, contrast)

## Output Report

```
═══════════════════════════════════════════════════════
    ULTRATHINK VALIDATION REPORT
═══════════════════════════════════════════════════════

🔬 SCREEN: {{screenName}}
📅 DATE: {{timestamp}}
⏱️ DURATION: {{duration}}

PHASE 1: DESIGN EXTRACTION ✅
  ✅ {{componentCount}} components identified
  ✅ {{breakpointCount}} breakpoints documented

PHASE 2: IMPLEMENTATION REVIEW {{status}}
  {{fileStructureStatus}} File structure
  {{typescriptStatus}} TypeScript coverage
  {{implementationStatus}} Feature completeness

PHASE 3: INTERACTIVE TESTING ✅
  ✅ {{testCount}} interaction tests passed
  ✅ All user flows validated

PHASE 4: DATA VALIDATION ✅
  ✅ API integration correct
  ✅ State management working

PHASE 5: VISUAL & PERFORMANCE ✅
  ✅ Visual regression: PASS
  ✅ Performance: {{performanceScore}}
  ✅ Accessibility: {{a11yScore}}

ULTRATHINK SCORE: {{score}}/100 🏆
═══════════════════════════════════════════════════════

RECOMMENDATIONS:
{{recommendations}}

CERTIFICATION: {{certification}}

Test Artifacts: .playwright-mcp/{{screenName}}-*.png
```

## Success Criteria

- ✅ Design fidelity: 100% match with Figma
- ✅ Code quality: TypeScript strict mode
- ✅ Performance: LCP < 2.5s, FCP < 1.8s
- ✅ Accessibility: WCAG 2.1 AA compliant
- ✅ Responsive: All target devices
- ✅ User flows: All scenarios tested

Starting Ultrathink validation for {{screenName}}...
