# Design System Mapping Report - IRIS UI Components

**Project**: PRISM - Padrão de Rótulos e Interfaces para Sistemas Médicos
**Component**: IRIS (Interface de Pesquisa Interoperável Segura)
**Date**: 2025-10-17
**Operator**: Claude CLI (automatizado via MCP Playwright + Figma)
**Figma File**: [I.R.I.S. Prototype - Design System Page](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=801-23931)

---

## Executive Summary

Automated mapping of **30 UI components** from the IRIS Design System page in Figma. This is distinct from the previous mapping which documented 18 application screens. The Design System contains reusable components that will form the foundation of the IRIS component library.

**Status**: ✅ Mapping complete | 📝 Implementation pending

---

## Statistics

### Coverage
- ✅ **Components mapped**: 30 identified
- ✅ **Node IDs collected**: 26 unique (4 duplicates found)
- ✅ **Categories defined**: 8 categories
- ✅ **Documentation generated**: 2 files (JSON + Markdown)
- ⚠️ **Duplicate node IDs**: 4 pairs requiring manual review

### Component Distribution by Category

| Category | Count | % Total | Priority |
|----------|-------|---------|----------|
| Input | 9 | 30.0% | 🔴 High |
| Foundation | 6 | 20.0% | 🔴 Critical |
| Navigation | 3 | 10.0% | 🟡 Medium |
| Feedback | 3 | 10.0% | 🟢 Low |
| Layout | 3 | 10.0% | 🟡 Medium |
| Actions | 2 | 6.7% | 🔴 High |
| Content | 2 | 6.7% | 🟢 Low |
| Visual Elements | 2 | 6.7% | 🔴 High |

### Implementation Priority Breakdown

| Priority | Components | Examples |
|----------|------------|----------|
| 🔴 Critical | 6 | Spacing, Typography, Colors, Border radius, Shadow, Layouts |
| 🔴 High | 11 | Button, Inputs, Dropdown, Password, Icons, Avatars, Selectors |
| 🟡 Medium | 9 | Tabs, Breadcrumbs, Context menu, Dialogs, Date/time, Stepper |
| 🟢 Low | 4 | Notifications, Tooltips, Progress, Tags, Accordions |

---

## Execution Time

- **Phase 1 (Navigation and discovery)**: ~2 minutes
- **Phase 2 (Node ID collection)**: ~8 minutes
- **Phase 3 (Documentation generation)**: ~2 minutes
- **Total**: ~12 minutes

---

## Files Generated

```
docs/figma/
├── design-system-mapping.json           # Structured data (30 components) ✅
├── design-system-map.md                 # Comprehensive documentation ✅
├── DESIGN_SYSTEM_MAPPING_REPORT.md      # This report ✅
└── screens/
    └── design-system-overview.png       # Canvas overview screenshot ✅
```

---

## Component Breakdown

### Critical Foundation Components (6)

These define the base design tokens for the entire system:

| ID | Component | Node ID | Purpose |
|----|-----------|---------|---------|
| DS-024 | Border radius | `2803-1115` | Corner radius scale |
| DS-025 | Shadow | `2803-1087` | Elevation system |
| DS-026 | Mobile layout | `2803-720` | Mobile grid (375px) |
| DS-027 | Desktop Layout | `2803-696` | Desktop grid (1280px) |
| DS-028 | Spacing | `2803-437` | Spacing scale |
| DS-029 | Typography | `2803-437` | Type system |
| DS-030 | Colors | `2803-696` | Color palette |

### High-Priority Interactive Components (11)

Core building blocks used throughout the application:

| ID | Component | Node ID | Category |
|----|-----------|---------|----------|
| DS-002 | Icons | `2803-4064` | Visual Elements |
| DS-005 | Selectors | `2803-3884` | Input |
| DS-006 | Segmented control | `2803-3776` | Input |
| DS-015 | Avatars | `2803-3248` | Visual Elements |
| DS-018 | Inputs | `2803-2414` | Input |
| DS-019 | Dropdown | `2803-2339` | Input |
| DS-022 | Password | `2803-2225` | Input |
| DS-023 | Button | `2803-1366` | Actions |
| DS-007 | Popover button | `2803-3574` | Actions |

### Medium-Priority Components (9)

Navigation, layout, and specialized inputs:

| ID | Component | Node ID | Category |
|----|-----------|---------|----------|
| DS-004 | Tabs | `2803-3974` | Navigation |
| DS-009 | Big scrollable window | `2803-3526` | Layout |
| DS-010 | Dialog window | `2803-3525` | Layout |
| DS-012 | Mobile elements | `2803-3498` | Layout |
| DS-013 | Context menu | `2803-3415` | Navigation |
| DS-014 | Breadcrumbs | `2803-3275` | Navigation |
| DS-017 | Date and time input | `2803-2455` | Input |
| DS-020 | Stepper | `2803-2339` | Input |
| DS-021 | Phone number | `2803-3514` | Input |

### Low-Priority Components (4)

Supporting components for feedback and content:

| ID | Component | Node ID | Category |
|----|-----------|---------|----------|
| DS-001 | Temporary notifications | `2803-4053` | Feedback |
| DS-003 | Tags | `2803-4028` | Content |
| DS-008 | Tooltips and popovers | `2803-3568` | Feedback |
| DS-011 | Progress | `2803-3514` | Feedback |
| DS-016 | Accordions | `2803-3214` | Content |

---

## Warnings and Observations

### Duplicate Node IDs Found

Four pairs of components share the same node ID, suggesting they may be grouped in a single frame or variants of the same component:

| Shared Node ID | Component 1 | Component 2 | Action Required |
|----------------|-------------|-------------|-----------------|
| `2803-2339` | Dropdown (DS-019) | Stepper (DS-020) | Manual review in Figma |
| `2803-3514` | Progress (DS-011) | Phone number (DS-021) | Manual review in Figma |
| `2803-437` | Spacing (DS-028) | Typography (DS-029) | Likely sections of same frame |
| `2803-696` | Desktop Layout (DS-027) | Colors (DS-030) | Likely sections of same frame |

**Recommendation**: Open these node IDs in Figma to understand:
- Are they variants of the same component?
- Are they separate elements within a larger frame?
- Should they be extracted as separate components or as a single component with variants?

### Technical Observations

1. **Large frame sizes**: Some component frames are very large (e.g., Inputs: 2078x2573), suggesting they contain multiple variants or states
2. **Auto layout detected**: Mobile elements (DS-012) uses auto layout, indicating responsive behavior
3. **Foundation tokens**: Spacing, Typography, and Colors should be extracted as design tokens first before implementing components
4. **Icon system**: Icons frame (DS-002) likely contains an icon library that should be implemented as SVG components or icon font

---

## Comparison with Application Screens

This Design System mapping complements the previous application screen mapping:

| Aspect | Application Screens | Design System Components |
|--------|---------------------|-------------------------|
| **Total items** | 18 screens | 30 components |
| **Purpose** | Complete user flows | Reusable UI building blocks |
| **Priority** | Feature implementation | Component library foundation |
| **Dependencies** | Depends on Design System | Independent, foundational |
| **File** | `frame-node-mapping.json` | `design-system-mapping.json` |

**Recommended workflow**:
1. Implement Design System components first (Phase 1-2)
2. Use components to build application screens (Phase 3-4)
3. Iterate on components based on application needs (Phase 5)

---

## Next Steps Recommended

### Immediate (1-2 days)
1. ✅ Review `design-system-map.md` and validate component categorization
2. ⏳ Manually review the 4 duplicate node IDs in Figma
3. ⏳ Extract foundation tokens (Spacing, Typography, Colors) using MCP Figma:
   ```bash
   mcp__figma-desktop__get_variable_defs --nodeId=2803-437  # Spacing/Typography
   mcp__figma-desktop__get_variable_defs --nodeId=2803-696  # Colors/Layout
   ```
4. ⏳ Create `theme.ts` file with extracted design tokens

### Short Term (1 week)
5. ⏳ Set up Storybook or component documentation tool
6. ⏳ Implement Phase 1 (Foundation tokens)
7. ⏳ Implement Phase 2 (Core components: Button, Input, Dropdown, Password)
8. ⏳ Extract component specs using MCP Figma for high-priority components
9. ⏳ Create unit tests for implemented components

### Medium Term (2-4 weeks)
10. ⏳ Implement Phase 3 (Navigation & Layout components)
11. ⏳ Implement Phase 4 (Advanced Input components)
12. ⏳ Integrate component library with IRIS application screens
13. ⏳ Create component usage documentation
14. ⏳ Accessibility audit (WCAG 2.1 AA compliance)

### Long Term (1-2 months)
15. ⏳ Implement Phase 5 (Feedback & Content components)
16. ⏳ Create component variants and states
17. ⏳ Performance optimization
18. ⏳ Full integration testing with IRIS application
19. ⏳ Component library v1.0 release
20. ⏳ Documentation in TCC (Capítulo 4, Seção "Design System")

---

## MCP Figma Extraction Commands

### Extract Foundation Tokens

```bash
# Extract Spacing and Typography tokens
mcp__figma-desktop__get_variable_defs --nodeId=2803-437

# Extract Color tokens
mcp__figma-desktop__get_variable_defs --nodeId=2803-696

# Extract Border radius
mcp__figma-desktop__get_variable_defs --nodeId=2803-1115

# Extract Shadow tokens
mcp__figma-desktop__get_variable_defs --nodeId=2803-1087
```

### Extract Component Specifications

For each high-priority component, run:

```bash
# Get component structure (metadata)
mcp__figma-desktop__get_metadata --nodeId=<component-node-id>

# Get component screenshot
mcp__figma-desktop__get_screenshot --nodeId=<component-node-id>

# Get design context (code + assets)
mcp__figma-desktop__get_design_context \
  --nodeId=<component-node-id> \
  --dirForAssetWrites=docs/figma/assets \
  --clientLanguages=typescript \
  --clientFrameworks=react
```

**Example for Button component**:
```bash
mcp__figma-desktop__get_metadata --nodeId=2803-1366
mcp__figma-desktop__get_screenshot --nodeId=2803-1366
mcp__figma-desktop__get_design_context \
  --nodeId=2803-1366 \
  --dirForAssetWrites=docs/figma/assets/button \
  --clientLanguages=typescript \
  --clientFrameworks=react
```

---

## Technology Stack Recommendations

### Component Library Framework

**Option 1: Shadcn/UI (Recommended)**
```bash
npx shadcn-ui@latest init
```
- **Pros**: Accessible (Radix UI), customizable, Tailwind CSS
- **Cons**: Need to adapt to IRIS design system
- **Best for**: Fast implementation with solid foundation

**Option 2: Headless UI + Tailwind**
```bash
npm install @headlessui/react
npm install -D tailwindcss
```
- **Pros**: Maximum flexibility, perfect Figma match
- **Cons**: More implementation work
- **Best for**: Custom design system implementation

**Option 3: Custom from Scratch**
- **Pros**: Perfect control, exact Figma match
- **Cons**: Time-consuming, need accessibility expertise
- **Best for**: Unique requirements not met by existing libraries

### Documentation Tool

**Option 1: Storybook (Recommended)**
```bash
npx storybook@latest init
```
- **Pros**: Industry standard, great for component documentation
- **Cons**: Can be heavy for small projects

**Option 2: Ladle**
```bash
npm install --save-dev @ladle/react
```
- **Pros**: Lightweight, fast, Vite-based
- **Cons**: Less mature than Storybook

### Testing

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```
- **Unit tests**: Vitest + React Testing Library
- **Visual regression**: Chromatic or Percy
- **Accessibility**: axe-core, jest-axe

---

## Integration with TCC

### Documentation Structure

This Design System should be documented in the TCC as follows:

**Capítulo 4, Seção 4.4: "Design System IRIS"**
- 4.4.1: Fundamentos do Design System (Spacing, Typography, Colors)
- 4.4.2: Componentes de Interface (Input, Button, etc.)
- 4.4.3: Padrões de Interação
- 4.4.4: Acessibilidade e Usabilidade

**Capítulo 5: "Implementação"**
- 5.3.1: Biblioteca de Componentes
- 5.3.2: Integração com Aplicação IRIS
- 5.3.3: Testes de Componentes

### Figures for TCC

Create figures from component screenshots:

```latex
\begin{figure}[htpb]
\captionsetup{width=0.9\textwidth}
\caption{Componentes de input do Design System IRIS.}
\label{fig:iris-design-system-inputs}
\includegraphics[width=0.9\textwidth]{figuras/iris/design-system-inputs.png}
\fonte{Autoria própria (2025)}
\end{figure}
```

---

## Relationship to Previous Mapping

This Design System mapping complements the application screen mapping completed earlier:

### Previous Mapping (Application Screens)
- **File**: `frame-node-mapping.json`
- **Page**: Prototype
- **Total**: 18 screens
- **Purpose**: Document user interface flows
- **Examples**: Login, Usuários, NPIs, SNOMED screens

### Current Mapping (Design System)
- **File**: `design-system-mapping.json`
- **Page**: Design System
- **Total**: 30 components
- **Purpose**: Document reusable UI components
- **Examples**: Button, Input, Dropdown, Icons

### Combined Workflow
1. **Foundation**: Implement Design System components (this mapping)
2. **Application**: Build screens using Design System components (previous mapping)
3. **Integration**: Ensure all screen requirements are met by Design System
4. **Iteration**: Add missing components as needed

---

## Success Metrics

### Mapping Success
- ✅ All visible components identified and cataloged
- ✅ Node IDs extracted for Figma access
- ✅ Components categorized logically
- ✅ Implementation priority assigned
- ✅ Duplicate node IDs flagged for review

### Implementation Success (To be measured)
- [ ] Foundation tokens extracted and implemented
- [ ] 80% of high-priority components implemented
- [ ] All components documented in Storybook
- [ ] WCAG 2.1 AA compliance achieved
- [ ] Unit test coverage > 80%
- [ ] Integration with IRIS screens successful

---

## Observations and Learnings

### Successful Aspects
- ✅ Systematic navigation through Figma layers panel
- ✅ Node ID extraction via URL change detection
- ✅ Clear categorization of components by function
- ✅ Identification of duplicate node IDs for manual review
- ✅ Comprehensive documentation generated automatically

### Challenges Encountered
- ⚠️ Some components share node IDs (grouped frames)
- ⚠️ Large frame sizes suggest multiple variants in single frame
- ⚠️ Typography and Spacing share same node (likely sections)
- ⚠️ Colors and Desktop Layout share same node (likely sections)

### Recommendations for Future Mappings
1. **Verify component separation**: Check if grouped components should be split in Figma
2. **Extract variants**: Use MCP Figma to identify component variants within large frames
3. **Document states**: Capture all component states (default, hover, active, disabled)
4. **Token extraction**: Prioritize extracting design tokens before component specs

---

## Commands Reference

### Access Figma Components

View any component directly by constructing URL:
```
https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id={nodeId}
```

Example:
```
https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=2803-1366
```

### View Documentation

```bash
# View component mapping JSON
cat docs/figma/design-system-mapping.json

# View comprehensive documentation
cat docs/figma/design-system-map.md

# View this report
cat docs/figma/DESIGN_SYSTEM_MAPPING_REPORT.md

# View previous screen mapping
cat docs/figma/frame-node-mapping.json
cat docs/figma/frames-map.md
```

---

## Contact and Support

For questions about this mapping or assistance with implementation:

- **Documentation**: See `docs/figma/design-system-map.md`
- **Technical details**: See `design-system-mapping.json`
- **Previous mapping**: See `frame-node-mapping.json` and `MAPPING_REPORT.md`
- **Figma access**: [I.R.I.S. Prototype](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype)

---

**Generated automatically by**: Claude CLI - IRIS Frame Mapper
**Version**: 1.0.0
**Date**: 2025-10-17
**Total execution time**: ~12 minutes
**Components mapped**: 30
**Unique node IDs**: 26
**Documentation files**: 3
