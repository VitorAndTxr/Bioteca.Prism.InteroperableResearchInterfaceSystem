---
description: Comprehensive screen validation with ultrathink test flow
---

# 🔬 Ultrathink Screen Validation

I will execute a comprehensive "ultrathink" test flow for screen validation, performing deep analysis and testing across multiple dimensions.

## What is Ultrathink Testing?

Ultrathink is a comprehensive testing methodology that goes beyond basic validation to ensure:
- **Ultra-thorough** analysis of all screen elements
- **Think-through** every user interaction path
- **Ultra-deep** validation of state management
- **Think-ahead** for edge cases and error scenarios

## 5-Phase Ultrathink Validation Flow

### Phase 1: Design Extraction & Analysis 🎨
**Goal**: Extract complete screen design from Figma with all components and layouts

**Steps**:
1. **Screen Overview** (`get_design_context`)
   - Extract main screen layout
   - Identify all child components
   - Map responsive breakpoints
   - Document design tokens

2. **Component Inventory**
   - List all components used in screen
   - Extract each component's Figma node
   - Map component states and variants
   - Document interaction patterns

3. **Visual References** (`get_screenshot`)
   - Capture full screen design
   - Capture mobile/tablet/desktop variants
   - Capture all interactive states
   - Document animation/transition specs

4. **Layout Analysis** (`get_metadata`)
   - Extract spacing and padding
   - Document grid system
   - Identify responsive rules
   - Map component hierarchy

**Output**:
```
SCREEN DESIGN ANALYSIS
=====================
📱 Screen: {{screenName}}
📍 Figma Node: {{nodeId}}
📐 Breakpoints: Mobile (375px), Tablet (768px), Desktop (1440px)

Components Used:
  - Button (3 instances)
  - Input (5 instances)
  - Dropdown (2 instances)
  - DataTable (1 instance)

Layout Structure:
  - Header: Fixed, 64px height
  - Content: Scrollable, padding 24px
  - Footer: Fixed, 80px height
```

### Phase 2: Implementation Review 🔍
**Goal**: Analyze current implementation for completeness and correctness

**Steps**:
1. **File Structure Review**
   ```
   screens/
   ├── ScreenName.tsx        # Main component
   ├── ScreenName.css        # Styles
   ├── ScreenName.types.ts   # TypeScript types
   ├── ScreenName.test.tsx   # Unit tests
   └── ScreenName.stories.tsx # Storybook stories
   ```

2. **Code Analysis**
   - Component structure and props
   - State management implementation
   - Event handlers and callbacks
   - API integration points
   - Error boundary implementation

3. **Style Validation**
   - CSS/styled-components review
   - Responsive breakpoints
   - Theme token usage
   - Animation implementations

4. **TypeScript Coverage**
   - Type definitions completeness
   - Props interface validation
   - Event handler typing
   - API response types

**Checklist**:
```typescript
interface ScreenValidation {
  // Structure
  ✅ hasMainComponent: boolean
  ✅ hasStyles: boolean
  ✅ hasTypes: boolean
  ✅ hasTests: boolean
  ✅ hasStorybook: boolean

  // Implementation
  ✅ usesCorrectComponents: boolean
  ✅ implementsAllFeatures: boolean
  ✅ handlesAllStates: boolean
  ✅ hasErrorHandling: boolean
  ✅ hasLoadingStates: boolean

  // Quality
  ✅ typescriptStrict: boolean
  ✅ accessibilityCompliant: boolean
  ✅ responsiveDesign: boolean
  ✅ performanceOptimized: boolean
}
```

### Phase 3: Interactive Testing 🎮
**Goal**: Test all user interactions and flows using Playwright

**Steps**:
1. **Navigation Testing**
   ```typescript
   // Navigate to screen
   await browser_navigate('http://localhost:5173/{{screenPath}}')
   await browser_wait_for({ text: '{{screenTitle}}' })
   await browser_snapshot() // Accessibility tree
   ```

2. **Component Interaction**
   ```typescript
   // Test each interactive element
   // Buttons
   await browser_click('Primary Action Button')
   await browser_snapshot()

   // Forms
   await browser_fill_form({
     fields: [
       { name: 'Username', type: 'textbox', value: 'testuser' },
       { name: 'Password', type: 'textbox', value: 'Test123!' }
     ]
   })

   // Dropdowns
   await browser_select_option('Category Dropdown', ['Option 1'])
   ```

3. **State Transitions**
   - Test loading states
   - Test error states
   - Test success states
   - Test empty states
   - Test edge cases

4. **User Flows**
   ```typescript
   // Complete user journey
   // Example: Login Flow
   1. Navigate to login
   2. Enter invalid credentials
   3. Verify error message
   4. Enter valid credentials
   5. Verify successful navigation
   6. Check session state
   ```

**Test Scenarios**:
```
INTERACTIVE TEST SUITE
======================
📋 Total Tests: 25
✅ Navigation: 5/5
✅ Form Inputs: 8/8
✅ Buttons: 4/4
✅ Dropdowns: 3/3
✅ Data Table: 5/5

User Flows Tested:
  ✅ Happy Path
  ✅ Error Recovery
  ✅ Edge Cases
  ✅ Accessibility
  ✅ Keyboard Navigation
```

### Phase 4: Data & State Validation 📊
**Goal**: Validate data flow, state management, and API integration

**Steps**:
1. **Context Integration**
   ```typescript
   // Verify context providers
   - AuthContext usage
   - BluetoothContext (if applicable)
   - Custom contexts
   ```

2. **API Communication**
   ```typescript
   // Monitor network requests
   await browser_network_requests()

   // Verify:
   - Correct endpoints
   - Request payloads
   - Response handling
   - Error handling
   ```

3. **State Management**
   ```typescript
   // Test state updates
   await browser_evaluate(() => {
     // Check React state
     // Verify Redux store
     // Validate context values
   })
   ```

4. **Data Persistence**
   - LocalStorage/SessionStorage
   - Cookie management
   - Cache handling

**Validation Matrix**:
```
DATA FLOW VALIDATION
====================
API Endpoints:
  ✅ GET /api/users - List loading
  ✅ POST /api/auth/login - Authentication
  ✅ PUT /api/users/:id - Update handling
  ✅ DELETE /api/users/:id - Deletion flow

State Management:
  ✅ Initial state correct
  ✅ Loading states work
  ✅ Error states handled
  ✅ Success updates UI
  ✅ Optimistic updates (if applicable)
```

### Phase 5: Visual Regression & Performance 📸
**Goal**: Comprehensive visual validation and performance metrics

**Steps**:
1. **Visual Regression Testing**
   ```typescript
   // Capture screenshots for each state
   const screenshots = {
     default: 'screen-default.png',
     loading: 'screen-loading.png',
     error: 'screen-error.png',
     success: 'screen-success.png',
     empty: 'screen-empty.png'
   }

   // Compare with Figma
   for (const [state, file] of Object.entries(screenshots)) {
     await captureState(state)
     await browser_take_screenshot({ filename: file })
   }
   ```

2. **Responsive Testing**
   ```typescript
   // Test different viewport sizes
   const viewports = [
     { width: 375, height: 812 },  // Mobile
     { width: 768, height: 1024 }, // Tablet
     { width: 1440, height: 900 }  // Desktop
   ]

   for (const viewport of viewports) {
     await browser_resize(viewport.width, viewport.height)
     await browser_take_screenshot({
       filename: `screen-${viewport.width}x${viewport.height}.png`
     })
   }
   ```

3. **Performance Metrics**
   ```typescript
   // Measure performance
   await browser_evaluate(() => {
     return {
       FCP: performance.getEntriesByType('paint')[0].startTime,
       LCP: // Largest Contentful Paint
       FID: // First Input Delay
       CLS: // Cumulative Layout Shift
     }
   })
   ```

4. **Accessibility Audit**
   ```typescript
   // Check accessibility
   const a11y = await browser_snapshot()
   // Verify:
   - ARIA labels
   - Keyboard navigation
   - Screen reader support
   - Color contrast
   ```

**Performance Report**:
```
PERFORMANCE & VISUAL VALIDATION
================================
Visual Regression:
  ✅ Default state matches Figma
  ✅ All interactive states correct
  ✅ Responsive layouts work
  ✅ Animations smooth

Performance Metrics:
  ⚡ First Contentful Paint: 0.8s
  ⚡ Largest Contentful Paint: 1.2s
  ⚡ Time to Interactive: 1.5s
  ⚡ Cumulative Layout Shift: 0.02

Accessibility:
  ✅ WCAG 2.1 AA compliant
  ✅ Keyboard navigable
  ✅ Screen reader friendly
```

## Ultrathink Validation Report

After completing all phases, generate comprehensive report:

```
═══════════════════════════════════════════════════════
    ULTRATHINK VALIDATION REPORT
═══════════════════════════════════════════════════════

🔬 SCREEN: {{screenName}}
📅 DATE: {{timestamp}}
⏱️ DURATION: {{duration}}

═══════════════════════════════════════════════════════
PHASE 1: DESIGN EXTRACTION ✅
═══════════════════════════════════════════════════════
✅ Figma design extracted successfully
✅ 12 components identified
✅ 3 breakpoints documented
✅ Design tokens mapped

═══════════════════════════════════════════════════════
PHASE 2: IMPLEMENTATION REVIEW ✅
═══════════════════════════════════════════════════════
✅ File structure complete
✅ TypeScript coverage: 100%
✅ Component usage correct
⚠️ Missing error boundary (non-critical)

═══════════════════════════════════════════════════════
PHASE 3: INTERACTIVE TESTING ✅
═══════════════════════════════════════════════════════
✅ 25/25 interaction tests passed
✅ All user flows validated
✅ Edge cases handled
✅ Keyboard navigation works

═══════════════════════════════════════════════════════
PHASE 4: DATA VALIDATION ✅
═══════════════════════════════════════════════════════
✅ API integration correct
✅ State management working
✅ Context providers connected
✅ Data persistence verified

═══════════════════════════════════════════════════════
PHASE 5: VISUAL & PERFORMANCE ✅
═══════════════════════════════════════════════════════
✅ Visual regression: PASS
✅ Performance: GOOD (LCP < 2.5s)
✅ Accessibility: AA compliant
✅ Responsive design: Perfect

═══════════════════════════════════════════════════════
ULTRATHINK SCORE: 98/100 🏆
═══════════════════════════════════════════════════════

RECOMMENDATIONS:
1. Add error boundary for better error handling
2. Consider lazy loading for DataTable
3. Optimize bundle size (current: 245KB)

CERTIFICATION: ✅ ULTRATHINK VALIDATED
This screen meets all quality standards and is
production-ready.

Files Modified:
  - None (validation only)

Test Artifacts:
  - .playwright-mcp/{{screenName}}-*.png (15 files)
  - validation-report-{{timestamp}}.json
```

## Usage Examples

```bash
# Validate specific screen
/validate-screen Login

# Validate with specific Figma node
/validate-screen UsersList --node 6804-13670

# Validate with custom viewport
/validate-screen Dashboard --viewport mobile

# Quick validation (skip performance)
/validate-screen Settings --quick

# Full ultrathink validation
/validate-screen CriticalScreen --ultrathink
```

## Success Criteria

A screen passes Ultrathink validation when:

1. **Design Fidelity**: 100% match with Figma design
2. **Code Quality**: TypeScript strict, no any types
3. **Interaction**: All user flows work correctly
4. **Performance**: LCP < 2.5s, FCP < 1.8s
5. **Accessibility**: WCAG 2.1 AA compliant
6. **Responsive**: Works on all target devices
7. **Error Handling**: Graceful degradation
8. **State Management**: Predictable and testable
9. **Documentation**: README and Storybook stories
10. **Test Coverage**: Unit and integration tests

## Ultrathink Philosophy

The Ultrathink approach ensures:
- **No stone unturned**: Every aspect validated
- **User-centric**: Real user flows tested
- **Production-ready**: No surprises in production
- **Quality-first**: Standards enforced
- **Documentation**: Future developers thanked

## Integration with CI/CD

```yaml
# .github/workflows/ultrathink.yml
name: Ultrathink Validation
on:
  pull_request:
    paths:
      - 'src/screens/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Run Ultrathink
        run: /validate-screen ${{ github.event.pull_request.title }}
```

---

**Screen to validate**: {{args}}

Starting Ultrathink validation process...