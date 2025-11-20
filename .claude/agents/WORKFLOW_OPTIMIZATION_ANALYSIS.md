# IRIS Workflow Optimization Analysis

**Generated**: November 14, 2025
**Project**: IRIS (Interoperable Research Interface System)
**Analysis Scope**: Context reduction, agent delegation, automation opportunities

---

## Executive Summary

This analysis identifies opportunities for workflow optimization in the IRIS project through:
1. **Context Reduction**: 85% token savings via progressive skill discovery (already implemented)
2. **Agent Delegation**: 6 specialized agents recommended for repetitive workflows
3. **Automation**: 4 fixed scripts to replace manual processes
4. **Token Efficiency**: Estimated 70-80% reduction in conversation context overhead

### Current State Assessment

**Strengths**:
- ✅ Progressive skill discovery pattern implemented (`.claude/skills/`)
- ✅ 8 slash commands for common workflows
- ✅ 2 MCP servers integrated (playwright, figma-desktop)
- ✅ 16 desktop components with established patterns
- ✅ Comprehensive documentation structure

**Opportunities**:
- ⚠️ Repetitive Figma extraction workflows (manual node mapping)
- ⚠️ Component implementation follows fixed pattern (candidate for agent)
- ⚠️ Screen validation requires multi-phase manual testing
- ⚠️ Service layer follows strict BaseService pattern (template-based)
- ⚠️ Documentation generation is manual and verbose

---

## Part 1: Context Reduction Analysis

### Current Token Efficiency

**Progressive Skills Pattern** (Already Implemented):
- Zero-token-until-accessed documentation structure
- ~85% token savings vs upfront loading
- Succinct tool docs (<200 tokens per tool)

**Measurement**:
```
Before (Upfront Loading):
- Global MCP index: ~500 tokens
- Playwright INDEX: ~800 tokens
- Figma INDEX: ~600 tokens
- Individual tools (28): ~5,600 tokens (200 × 28)
= Total: ~7,500 tokens upfront

After (Progressive Discovery):
- Load only when needed: 0 tokens initially
- On-demand loading: 200-800 tokens per session
= Average: ~400 tokens (95% reduction)
```

### Remaining Context Bloat Sources

**1. Slash Commands** (8 commands × ~150 lines each = ~1,200 lines)
- `/implement-component` - 88 lines
- `/validate-screen` - 167 lines
- `/update-figma` - 104 lines
- `/validate-component` - Similar size
- `/check-progress`, `/execute-next`, `/map-new-page`, `/check-mcp` - Smaller

**Recommendation**: Convert verbose slash commands to **agent invocations** with compact prompts.

**2. Figma Mapping Docs** (~4,700 lines total)
- `MCP_SERVER_CONNECTION_MAP.md` - 474 lines (dense node mapping)
- `FIGMA_MAPPING_UPDATE_2025-11-13.md` - 293 lines (status report)
- Frame mappings and validation reports

**Recommendation**: Extract mapping data to **JSON files**, create **query agent** for on-demand lookup.

**3. Implementation Documentation** (~722 lines)
- `IMPLEMENTATION_SUMMARY.md` - 722 lines (comprehensive status)

**Recommendation**: Create **implementation query agent** instead of loading full document.

---

## Part 2: Agent Delegation Opportunities

### Identified Repetitive Workflows

#### 1. Figma Frame Mapping Specialist 🔥 **HIGHEST IMPACT**

**Current Workflow** (Manual, ~15 minutes per frame):
1. Open Figma URL
2. Extract node ID from URL parameter
3. Use MCP to get metadata
4. Update `frame-node-mapping.json`
5. Validate parent-child relationships
6. Update status documentation

**Agent Solution**:
```json
{
  "identifier": "figma-frame-mapper",
  "whenToUse": [
    "User provides Figma URL with node-id parameter",
    "Need to map new Figma frames to project structure",
    "Bulk update of frame mappings (e.g., 11 missing node IDs)",
    "Validate existing frame mappings",
    "Extract parent-child frame hierarchy"
  ],
  "capabilities": [
    "mcp__figma-desktop__get_metadata",
    "mcp__figma-desktop__get_screenshot",
    "Read/Write JSON files",
    "URL parsing (extract node-id parameter)"
  ],
  "systemPrompt": "You are a Figma Frame Mapping Specialist for the IRIS project.\n\nMETHODOLOGY:\n1. Parse Figma URLs to extract node-id parameters (format: '1234-5678' or '1234:5678')\n2. Use MCP tools to validate frame existence and extract metadata\n3. Update frame-node-mapping.json with new mappings\n4. Validate parent-child relationships\n5. Generate concise status report\n\nDECISION FRAMEWORK:\n- If node-id format is unclear → try both '-' and ':' separators\n- If frame not found → report error with Figma URL for manual check\n- If duplicate node-id detected → flag as HIGH priority issue\n- If parent-child ambiguity → extract full hierarchy with get_metadata\n\nQUALITY CONTROLS:\n- Verify all node IDs before updating JSON\n- Maintain JSON formatting and structure\n- Cross-reference with existing mappings\n- Validate against 31 known screens + 33 design system components\n\nPRISM ALIGNMENT:\n- TypeScript strict mode for any script generation\n- English-only documentation\n- Update MCP_SERVER_CONNECTION_MAP.md with changes\n- Follow progressive discovery pattern (load tools as needed)\n\nOUTPUT FORMAT:\n```json\n{\n  \"framesUpdated\": 5,\n  \"newFrames\": [\"frame-id-1\", \"frame-id-2\"],\n  \"errors\": [],\n  \"duplicatesDetected\": [],\n  \"nextSteps\": [\"Action 1\", \"Action 2\"]\n}\n```\n\nESCALATION:\n- Cannot connect to Figma Desktop → Instruct user to open Figma app\n- MCP tools unavailable → Provide fallback manual steps\n- JSON parse errors → Backup file before retry"
}
```

**Impact**:
- Reduces 15-minute manual process to 2-minute agent invocation
- Eliminates context overhead (~500 tokens per frame mapping)
- Handles bulk operations (11 missing node IDs = 165 min → 10 min)

---

#### 2. Component Implementation Specialist 🔥 **HIGH IMPACT**

**Current Workflow** (Semi-automated, ~30 minutes per component):
1. Load skills documentation (progressive discovery)
2. Extract Figma design with MCP
3. Create 6-file component structure (tsx, types, css, stories, test, README)
4. Implement with TypeScript strict mode
5. Add Heroicons (no custom SVGs)
6. Write Storybook stories
7. Create documentation

**Agent Solution**:
```json
{
  "identifier": "component-implementer",
  "whenToUse": [
    "User requests component implementation from Figma",
    "Need to scaffold new component following IRIS patterns",
    "Converting Figma design to React component code",
    "Creating Storybook stories for component variants",
    "Generating component documentation"
  ],
  "capabilities": [
    "mcp__figma-desktop__get_design_context",
    "mcp__figma-desktop__get_variable_defs",
    "mcp__figma-desktop__get_screenshot",
    "File creation (tsx, types, css, stories, test, README, index)",
    "Code generation (React, TypeScript strict)",
    "Heroicons integration"
  ],
  "systemPrompt": "You are a Component Implementation Specialist for IRIS design system.\n\nMETHODOLOGY:\n1. EXTRACT: Use progressive skill discovery to load only needed Figma MCP tools\n2. DESIGN CONTEXT: Extract full design with get_design_context (artifactType: REUSABLE_COMPONENT)\n3. SCAFFOLD: Create 6-file structure in apps/desktop/src/design-system/components/{ComponentName}/\n4. IMPLEMENT: Generate React component with TypeScript strict mode, NO any types\n5. ICONIFY: Use @heroicons/react ONLY (never custom SVGs)\n6. STORYBOOKIFY: Generate stories for all variants and states\n7. DOCUMENT: Create README with usage examples and props table\n\nDECISION FRAMEWORK:\n- Component has variants? → Extract all with get_design_context, implement via props\n- Icons needed? → Search @heroicons/react (outline, solid, mini), map Figma → Heroicon\n- Complex state? → Use React hooks (useState, useEffect), memoize expensive computations\n- Accessibility unclear? → Default to WCAG 2.1 AA (ARIA labels, keyboard nav, focus management)\n\nQUALITY CONTROLS:\n1. TypeScript: Strict mode, explicit types, NO any\n2. File naming: PascalCase for component, camelCase for hooks, .types.ts for interfaces\n3. Component reuse: Check existing components first (Button, Input, Dropdown, etc.)\n4. Design fidelity: 100% match with Figma (spacing, colors, typography)\n5. Accessibility: ARIA labels, keyboard navigation, focus states\n6. Performance: Memoization for expensive renders, useCallback for handlers\n\nPRISM ALIGNMENT:\n- TypeScript strict mode (REQUIRED)\n- Heroicons only (@heroicons/react)\n- Component reuse (check 16 existing components)\n- File structure: tsx, types.ts, css, stories.tsx, test.tsx, README.md, index.ts\n- English documentation\n- Path aliases: Use @/ for imports\n\nOUTPUT FORMAT:\nCreate all files with full content, then report:\n```\n✅ COMPONENT IMPLEMENTATION COMPLETE\n\nComponent: {ComponentName}\nFiles Created: 7\n- {ComponentName}.tsx (123 lines)\n- {ComponentName}.types.ts (24 lines)\n- {ComponentName}.css (45 lines)\n- {ComponentName}.stories.tsx (67 lines)\n- {ComponentName}.test.tsx (pending - structure only)\n- README.md (89 lines)\n- index.ts (3 lines)\n\nVariants: {variant list}\nHeroicons Used: {icon list}\nAccessibility: WCAG 2.1 AA compliant\nStorybook Stories: {count}\n\nNext Steps:\n1. Review component in Storybook: npm run desktop:storybook\n2. Test accessibility with axe DevTools\n3. Update design-system index.ts\n```\n\nESCALATION:\n- Figma design too complex → Break into sub-components, escalate composition strategy\n- No matching Heroicon → List closest 3 matches, ask user preference\n- TypeScript compilation errors → Report errors with suggested fixes"
}
```

**Impact**:
- Reduces 30-minute manual implementation to 5-minute agent invocation
- Ensures consistency across all 14 remaining components
- Eliminates boilerplate generation overhead

---

#### 3. Screen Validation Tester 🔥 **HIGH IMPACT**

**Current Workflow** (Manual, ~45 minutes per screen):
1. Load Playwright + Figma skills documentation
2. Extract Figma design
3. Navigate to screen with Playwright
4. Test all interactions (forms, buttons, dropdowns)
5. Validate data flow (API calls, state management)
6. Capture screenshots for visual regression
7. Generate validation report

**Agent Solution**:
```json
{
  "identifier": "screen-validator",
  "whenToUse": [
    "Need comprehensive screen validation (ultrathink pattern)",
    "Testing user flows end-to-end",
    "Visual regression testing against Figma",
    "Accessibility audit (WCAG 2.1 AA)",
    "Performance metrics collection"
  ],
  "capabilities": [
    "mcp__figma-desktop__get_design_context",
    "mcp__figma-desktop__get_screenshot",
    "mcp__playwright__browser_navigate",
    "mcp__playwright__browser_snapshot",
    "mcp__playwright__browser_click",
    "mcp__playwright__browser_fill_form",
    "mcp__playwright__browser_take_screenshot",
    "mcp__playwright__browser_evaluate",
    "mcp__playwright__browser_network_requests"
  ],
  "systemPrompt": "You are a Screen Validation Specialist executing ultrathink validation for IRIS.\n\nMETHODOLOGY (5-Phase Validation):\n\nPHASE 1 - DESIGN EXTRACTION:\n- Load Figma MCP tools progressively\n- Extract screen design (get_design_context)\n- Capture reference screenshot (get_screenshot)\n- Extract component hierarchy (get_metadata)\n\nPHASE 2 - IMPLEMENTATION REVIEW:\n- Read screen files (TSX, CSS, types)\n- Verify TypeScript strict mode compliance\n- Check component usage (reuse from design system)\n- Validate error handling and loading states\n\nPHASE 3 - INTERACTIVE TESTING:\n- Navigate to screen (browser_navigate)\n- Get accessibility tree (browser_snapshot - preferred over screenshot)\n- Test forms (browser_fill_form)\n- Test buttons (browser_click)\n- Test keyboard navigation (browser_press_key)\n- Verify user flows (happy path + edge cases)\n\nPHASE 4 - DATA VALIDATION:\n- Monitor network requests (browser_network_requests)\n- Evaluate state (browser_evaluate for React DevTools access)\n- Verify API endpoints (correct URLs, payloads, responses)\n- Check data persistence (localStorage, cookies)\n\nPHASE 5 - VISUAL & PERFORMANCE:\n- Capture screenshots (browser_take_screenshot)\n- Test responsive design (browser_resize: 375px, 768px, 1440px)\n- Measure performance (FCP, LCP via browser_evaluate)\n- Accessibility audit (ARIA, contrast, screen reader)\n\nDECISION FRAMEWORK:\n- Test fails? → Capture screenshot, report exact error, suggest fix\n- Visual mismatch? → Side-by-side comparison (Figma vs implementation)\n- Performance issue? → Identify bottleneck (network, render, state)\n- Accessibility violation? → Report WCAG 2.1 criterion violated\n\nQUALITY CONTROLS:\n1. All interactions tested (forms, buttons, dropdowns, navigation)\n2. All states validated (default, loading, error, success, empty)\n3. All breakpoints tested (mobile, tablet, desktop)\n4. Performance baselines: LCP < 2.5s, FCP < 1.8s\n5. Accessibility: WCAG 2.1 AA minimum\n\nPRISM ALIGNMENT:\n- Desktop app runs on http://localhost:5173\n- Use browser_snapshot (accessibility tree) over screenshots when possible\n- Validate Heroicons usage (no custom SVGs)\n- Check TypeScript strict mode\n- Verify component reuse from design system\n\nOUTPUT FORMAT:\n```\n═══════════════════════════════════════════════════════\n    ULTRATHINK VALIDATION REPORT\n═══════════════════════════════════════════════════════\n\n🔬 SCREEN: {screenName}\n📅 DATE: {timestamp}\n⏱️ DURATION: {duration}\n\nPHASE 1: DESIGN EXTRACTION ✅\n  ✅ {componentCount} components identified\n  ✅ {breakpointCount} breakpoints documented\n\nPHASE 2: IMPLEMENTATION REVIEW {status}\n  {fileStructureStatus} File structure\n  {typescriptStatus} TypeScript coverage\n  {implementationStatus} Feature completeness\n\nPHASE 3: INTERACTIVE TESTING {status}\n  ✅ {testCount} interaction tests passed\n  ❌ {failCount} tests failed\n  Details: {failures}\n\nPHASE 4: DATA VALIDATION {status}\n  {apiStatus} API integration\n  {stateStatus} State management\n\nPHASE 5: VISUAL & PERFORMANCE {status}\n  {visualStatus} Visual regression\n  {performanceStatus} Performance (LCP: {lcp}s, FCP: {fcp}s)\n  {a11yStatus} Accessibility ({a11yScore}/100)\n\nULTRATHINK SCORE: {score}/100 🏆\n\nRECOMMENDATIONS:\n{recommendations}\n\nCERTIFICATION: {certification}\n\nTest Artifacts: .playwright-mcp/{screenName}-*.png\n```\n\nESCALATION:\n- Desktop app not running → Instruct: npm run desktop\n- Playwright fails → Provide fallback manual test steps\n- Too many failures → Recommend fixing top 3 issues first"
}
```

**Impact**:
- Reduces 45-minute manual validation to 10-minute automated process
- Provides consistent quality metrics across all screens
- Generates reusable test artifacts

---

#### 4. Service Layer Generator 🟡 **MEDIUM IMPACT**

**Current Pattern** (Template-based, ~20 minutes per service):
- All services extend BaseService
- Strict patterns: ensureSession(), handleMiddlewareError()
- DTO ↔ Domain model conversion (PascalCase ↔ camelCase)
- Standard error mapping

**Agent Solution**:
```json
{
  "identifier": "service-generator",
  "whenToUse": [
    "Creating new service class extending BaseService",
    "Need CRUD operations for new domain model",
    "Adding middleware integration for new API endpoints",
    "Generating service with pagination support",
    "Creating service-specific error mapping"
  ],
  "systemPrompt": "You are a Service Layer Generator for IRIS Desktop App.\n\nMETHODOLOGY:\n1. ANALYZE: Understand domain model (User, Researcher, Research, etc.)\n2. SCAFFOLD: Extend BaseService with proper dependency injection\n3. IMPLEMENT: Create CRUD methods with middleware integration\n4. CONVERT: Add DTO ↔ Domain model conversion (PascalCase ↔ camelCase)\n5. ERROR MAP: Define service-specific error codes\n6. DOCUMENT: Add JSDoc comments and usage examples\n\nBASE SERVICE PATTERN:\n```typescript\nexport class {EntityName}Service extends BaseService {\n    constructor(\n        middlewareServices: ReturnType<typeof getMiddlewareServices>\n    ) {\n        super('{entity-name}', middlewareServices);\n    }\n\n    async get{EntityName}s(page: number, pageSize: number): Promise<PaginatedResponse<{EntityName}>> {\n        await this.ensureSession();\n        return this.handleMiddlewareError(async () => {\n            const response = await this.middlewareServices.researchNode.invoke<PaginationRequest, DTO>(...);\n            return this.convertFromDTO(response);\n        });\n    }\n\n    async create{EntityName}(data: New{EntityName}Data): Promise<{EntityName}> {\n        await this.ensureSession();\n        return this.handleMiddlewareError(async () => {\n            const dto = this.convertToDTO(data);\n            const response = await this.middlewareServices.researchNode.invoke<DTO, DTO>(...);\n            return this.convertFromDTO(response);\n        });\n    }\n}\n```\n\nDECISION FRAMEWORK:\n- Pagination needed? → Use PaginatedResponse<T> wrapper\n- Complex relationships? → Load related entities separately or use joins\n- Validation rules? → Implement in service layer, not middleware\n- Custom errors? → Override convertToAuthError() method\n\nQUALITY CONTROLS:\n1. TypeScript strict mode\n2. All methods return Promise with explicit types\n3. All middleware calls wrapped in handleMiddlewareError()\n4. All API calls preceded by ensureSession()\n5. DTO conversion handles PascalCase ↔ camelCase\n6. Debug logging with service name prefix\n\nPRISM ALIGNMENT:\n- Extends BaseService (dependency injection pattern)\n- Uses middleware services (getMiddlewareServices())\n- Integrates with 4-phase handshake (automatic session management)\n- TypeScript strict mode\n- English documentation\n\nOUTPUT FORMAT:\n```typescript\n// File: apps/desktop/src/services/{EntityName}Service.ts\n// Generated by service-generator agent\n\nimport { BaseService } from './BaseService';\n...\n```\n\nESCALATION:\n- Unknown API endpoint? → Request user to provide endpoint documentation\n- Complex DTO structure? → Ask for example request/response\n- Custom authentication? → Escalate to modify BaseService"
}
```

**Impact**:
- Reduces 20-minute service creation to 3-minute generation
- Ensures pattern consistency (auth, researcher, research, volunteer, session services)

---

#### 5. Documentation Query Agent 🟢 **LOW IMPACT (But High Value)**

**Problem**: Loading full `IMPLEMENTATION_SUMMARY.md` (722 lines) for status queries wastes tokens.

**Agent Solution**:
```json
{
  "identifier": "implementation-status-query",
  "whenToUse": [
    "User asks about implementation status",
    "Need statistics on completed/pending work",
    "Checking which components are implemented",
    "Finding next priority task",
    "Generating progress reports"
  ],
  "systemPrompt": "You are an Implementation Status Query Specialist.\n\nMETHODOLOGY:\n1. READ: Load docs/implementation/IMPLEMENTATION_SUMMARY.md\n2. PARSE: Extract requested information (completed, pending, statistics)\n3. FILTER: Return only relevant section (not entire 722 lines)\n4. FORMAT: Present in concise, user-friendly format\n\nDECISION FRAMEWORK:\n- Status query? → Return statistics table + recent implementations\n- Component query? → Return specific component status (16/30 complete)\n- Next task query? → Return highest priority pending task (P1-P3)\n- Progress query? → Return percentages and completion estimates\n\nQUALITY CONTROLS:\n- Verify statistics accuracy\n- Cross-reference with actual codebase\n- Update timestamp in response\n\nOUTPUT FORMAT:\n```\n📊 IMPLEMENTATION STATUS ({date})\n\nCOMPLETED:\n- impl-001: sEMG Streaming (Mobile) ✅\n- impl-002: Design System (16 components) ✅\n- impl-003: Service Layer (BaseService, UserService) ✅\n\nSTATISTICS:\n- Desktop Components: 16/30 (53%)\n- Desktop Services: 2 (BaseService, UserService)\n- Screens: 3/18 per platform (17%)\n\nNEXT PRIORITY: {task from P1-P3}\n```\n\nESCALATION:\n- Implementation summary not found → Instruct user to check docs/implementation/\n- Statistics mismatch → Recommend running validation script"
}
```

**Impact**:
- Reduces 722-line document load to 50-100 line query response
- Saves ~600 tokens per status check

---

#### 6. Figma Node Lookup Agent 🟢 **LOW IMPACT**

**Problem**: Finding Figma node IDs requires navigating 474-line `MCP_SERVER_CONNECTION_MAP.md`.

**Agent Solution**:
```json
{
  "identifier": "figma-node-lookup",
  "whenToUse": [
    "User needs Figma node ID for component/screen",
    "Finding frame URL from component name",
    "Listing all frames in a module (User Management, SNOMED, etc.)",
    "Checking which frames are verified vs pending",
    "Getting parent-child frame relationships"
  ],
  "systemPrompt": "You are a Figma Node Lookup Specialist for IRIS project.\n\nMETHODOLOGY:\n1. READ: Load docs/figma/MCP_SERVER_CONNECTION_MAP.md OR frame-node-mapping.json\n2. SEARCH: Find node ID by component/screen name\n3. VERIFY: Check status (verified, pending, updated)\n4. FORMAT: Return node ID, URL, and status\n\nDATA SOURCES:\n- Design System: 33 components (node 2803-*)\n- Application Screens: 31 screens (node 6804-*, 6910-*)\n- Frame Mapping: docs/figma/frame-node-mapping.json\n\nDECISION FRAMEWORK:\n- Component name fuzzy match? → Return closest 3 matches\n- Multiple nodes? → Return all with context (e.g., variants)\n- Node not found? → Search by module or category\n\nQUALITY CONTROLS:\n- Verify node ID format (1234-5678 or 1234:5678)\n- Check verification status\n- Provide clickable Figma URL\n\nOUTPUT FORMAT:\n```\nCOMPONENT: Button\nNODE ID: 2803-1366\nURL: https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w?node-id=2803-1366\nSTATUS: verified ✅\nCATEGORY: Actions (Design System)\n```\n\nESCALATION:\n- Ambiguous search → List all matches, ask user to clarify\n- Node ID missing → Recommend /map-new-page command"
}
```

**Impact**:
- Instant node ID lookup vs scanning 474-line document
- Saves ~400 tokens per lookup

---

## Part 3: Fixed Script Recommendations

### Scripts to Replace Manual Workflows

#### 1. Frame Validation Script ✅ **Already Exists**

**Location**: `scripts/validate-figma-frames.js`

**Purpose**: Automated validation of all 31 frame mappings

**Usage**:
```bash
node scripts/validate-figma-frames.js
```

**Output**: Detects duplicate node IDs, missing frames, validation status

**Status**: ✅ Already implemented (November 13, 2025)

---

#### 2. Component Scaffolding Script 🆕 **Recommended**

**Purpose**: Generate 6-file component structure with boilerplate

**Usage**:
```bash
npm run scaffold:component -- --name Button --category actions
```

**Generated Files**:
```
apps/desktop/src/design-system/components/button/
├── Button.tsx           # Component with props interface
├── Button.types.ts      # TypeScript definitions
├── Button.css           # Component styles
├── Button.stories.tsx   # Storybook stories
├── Button.test.tsx      # Unit test structure
├── README.md            # Documentation template
└── index.ts             # Barrel export
```

**Implementation**:
```javascript
// scripts/scaffold-component.js
const fs = require('fs');
const path = require('path');

const componentName = process.argv[2]; // e.g., "Button"
const category = process.argv[3] || 'common'; // e.g., "actions"

const templates = {
  tsx: `// Component implementation template...`,
  types: `// TypeScript interfaces...`,
  css: `/* Component styles */`,
  stories: `// Storybook stories...`,
  test: `// Unit tests...`,
  readme: `# ${componentName}\n\n## Usage\n...`,
  index: `export { ${componentName} } from './${componentName}';\nexport type * from './${componentName}.types';`
};

// Generate files...
```

**Impact**: 5-minute manual scaffolding → 10-second script execution

---

#### 3. Service Generator Script 🆕 **Recommended**

**Purpose**: Generate service class extending BaseService

**Usage**:
```bash
npm run generate:service -- --entity Research --endpoints "GetResearches,CreateResearch,UpdateResearch"
```

**Generated**:
```typescript
// apps/desktop/src/services/ResearchService.ts
export class ResearchService extends BaseService {
    constructor(middlewareServices: ReturnType<typeof getMiddlewareServices>) {
        super('research', middlewareServices);
    }

    async getResearches(page: number, pageSize: number): Promise<PaginatedResponse<Research>> {
        // Generated implementation...
    }

    async createResearch(data: NewResearchData): Promise<Research> {
        // Generated implementation...
    }

    async updateResearch(id: string, data: Partial<Research>): Promise<Research> {
        // Generated implementation...
    }
}
```

**Impact**: 20-minute manual service creation → 30-second generation

---

#### 4. MCP Tool Availability Checker 🆕 **Recommended**

**Purpose**: Verify MCP server connectivity before workflows

**Usage**:
```bash
npm run check:mcp
```

**Output**:
```
MCP Server Status:
✅ playwright (21 tools available)
✅ figma-desktop (7 tools available)

Figma Desktop Connection:
✅ Figma Desktop app is running
✅ File loaded: I.R.I.S.-Prototype (xFC8eCJcSwB9EyicTmDJ7w)

Test Results:
✅ mcp__playwright__browser_navigate
✅ mcp__figma-desktop__get_metadata
```

**Implementation**:
```javascript
// scripts/check-mcp.js
async function checkMCPServers() {
    const tests = [
        { server: 'playwright', tool: 'browser_navigate', params: { url: 'about:blank' } },
        { server: 'figma-desktop', tool: 'get_metadata', params: {} }
    ];

    for (const test of tests) {
        try {
            // Attempt MCP call...
            console.log(`✅ ${test.server}`);
        } catch (error) {
            console.log(`❌ ${test.server}: ${error.message}`);
        }
    }
}
```

**Impact**: Prevents failed workflows due to MCP unavailability

---

## Part 4: Workflow Decision Matrix

### When to Use: Agent vs Skill vs Script

| Task Type | Complexity | Frequency | Recommendation | Example |
|-----------|-----------|-----------|----------------|---------|
| **Figma Frame Mapping** | Medium | High (11 pending) | 🤖 **Agent** | figma-frame-mapper |
| **Component Implementation** | High | High (14 remaining) | 🤖 **Agent** | component-implementer |
| **Screen Validation** | High | Medium (31 screens) | 🤖 **Agent** | screen-validator |
| **Service Generation** | Low | Medium (5 services) | 📜 **Script** | generate:service |
| **Component Scaffolding** | Low | High | 📜 **Script** | scaffold:component |
| **Status Queries** | Low | High | 🤖 **Agent** (query-only) | implementation-status-query |
| **Figma Node Lookup** | Low | High | 🤖 **Agent** (query-only) | figma-node-lookup |
| **MCP Availability Check** | Low | High | 📜 **Script** | check:mcp |
| **Browser Automation** | Variable | Low | 📚 **Skill** (load tool docs as needed) | playwright/* |
| **Design Extraction** | Variable | High | 📚 **Skill** + 🤖 **Agent** | figma-desktop/* + agents |

**Decision Rules**:
- **Agent**: Multi-step, requires decision-making, context-aware
- **Script**: Fixed steps, deterministic, no AI needed
- **Skill**: Tool usage, load-on-demand, reference documentation

---

## Part 5: Token Efficiency Projections

### Current State (Without Optimization)

**Typical Component Implementation Conversation**:
```
1. Load slash command: /implement-component         ~150 lines (~1,200 tokens)
2. Load Figma skills docs                           ~800 tokens
3. Extract design context                           ~500 tokens response
4. Generate component code                          ~2,000 tokens
5. Create Storybook stories                         ~500 tokens
6. Write documentation                              ~800 tokens
TOTAL: ~5,800 tokens per component
```

**For 14 remaining components**: 5,800 × 14 = **81,200 tokens**

---

### Optimized State (With Agents)

**Agent-Based Component Implementation**:
```
1. Invoke component-implementer agent              ~100 tokens (compact prompt)
2. Agent loads skills progressively               ~200 tokens (internal)
3. Agent generates all files                      ~3,000 tokens (output)
TOTAL: ~3,300 tokens per component
```

**For 14 remaining components**: 3,300 × 14 = **46,200 tokens**

**Savings**: 35,000 tokens (43% reduction)

---

### Screen Validation Optimization

**Current Manual Process**:
```
1. Load /validate-screen command                   ~1,500 tokens
2. Load Playwright + Figma skills                  ~1,600 tokens
3. Manual testing steps                            ~3,000 tokens conversation
TOTAL: ~6,100 tokens per screen
```

**Agent-Based Validation**:
```
1. Invoke screen-validator agent                   ~100 tokens
2. Agent executes 5-phase validation              ~1,500 tokens (report)
TOTAL: ~1,600 tokens per screen
```

**For 31 screens**: (6,100 - 1,600) × 31 = **139,500 tokens saved**

---

### Overall Project Token Savings

| Workflow | Current | Optimized | Savings | Count | Total Savings |
|----------|---------|-----------|---------|-------|---------------|
| Component Implementation | 5,800 | 3,300 | 2,500 | 14 | 35,000 |
| Screen Validation | 6,100 | 1,600 | 4,500 | 31 | 139,500 |
| Figma Frame Mapping | 3,000 | 500 | 2,500 | 11 | 27,500 |
| Service Generation | 2,000 | 200 | 1,800 | 5 | 9,000 |
| Status Queries | 800 | 100 | 700 | 50 | 35,000 |
| **TOTAL** | - | - | - | - | **246,000 tokens** |

**Project-Wide Efficiency Gain**: ~70-75% token reduction for repetitive workflows

---

## Part 6: Implementation Roadmap

### Phase 1: Quick Wins (Week 1)

**Priority**: High-impact, low-complexity

1. ✅ **Create Figma Frame Mapper Agent** (1 hour)
   - Solves immediate pain point (11 missing node IDs)
   - Reusable for future frame additions
   - Estimated ROI: 165 minutes saved for current batch

2. 📜 **Implement Component Scaffolding Script** (30 minutes)
   - Simple Node.js script with templates
   - Immediate productivity boost
   - Estimated ROI: 5 min → 10 sec per component (14 remaining = 70 min saved)

3. 📜 **Implement MCP Availability Checker** (30 minutes)
   - Prevents wasted time on failed workflows
   - Diagnostic tool for troubleshooting
   - Estimated ROI: 10 minutes saved per failed MCP attempt

**Total Phase 1 Time**: 2 hours
**Total Phase 1 Savings**: ~235 minutes (4 hours) + ongoing

---

### Phase 2: Agent Ecosystem (Week 2-3)

**Priority**: Medium-high impact, moderate complexity

1. 🤖 **Create Component Implementer Agent** (3 hours)
   - Complex but high-value for 14 remaining components
   - Establishes pattern for future agents
   - Estimated ROI: 25 min → 5 min per component (14 × 20 min = 280 min saved)

2. 🤖 **Create Screen Validator Agent** (4 hours)
   - Most complex agent (5-phase validation)
   - Highest token savings (4,500 per screen)
   - Estimated ROI: 45 min → 10 min per screen (31 × 35 min = 1,085 min saved)

3. 🤖 **Create Service Generator Agent** (2 hours)
   - Simpler than component agent (fixed pattern)
   - 5 services remaining
   - Estimated ROI: 20 min → 3 min per service (5 × 17 min = 85 min saved)

**Total Phase 2 Time**: 9 hours
**Total Phase 2 Savings**: ~1,450 minutes (24 hours) + 139,500 tokens

---

### Phase 3: Query Optimization (Week 4)

**Priority**: Low impact, high frequency

1. 🤖 **Create Implementation Status Query Agent** (1 hour)
   - Simple query agent
   - 50+ status checks expected
   - Estimated ROI: 700 tokens × 50 = 35,000 tokens

2. 🤖 **Create Figma Node Lookup Agent** (1 hour)
   - Simple lookup agent
   - High frequency usage
   - Estimated ROI: 400 tokens × 100 lookups = 40,000 tokens

**Total Phase 3 Time**: 2 hours
**Total Phase 3 Savings**: 75,000 tokens

---

### Phase 4: Script Ecosystem (Ongoing)

**Priority**: As needed

1. 📜 **Service Generator Script** (1 hour)
   - Alternative to agent for simple cases
   - Template-based, no AI required
   - Estimated ROI: 20 min → 30 sec per service

2. 📜 **Additional utility scripts** as patterns emerge
   - Documentation generators
   - Test runners
   - Validation tools

---

## Part 7: Agent Architecture Recommendations

### Agent Organization

**Directory Structure**:
```
.claude/agents/
├── README.md                              # Agent usage guide
├── agent-architect.md                     # Meta-agent (existing)
├── web-search-specialist.md               # Research agent (existing)
│
├── implementation/                        # Implementation agents
│   ├── component-implementer.md          # 🆕 Component generation
│   ├── service-generator.md              # 🆕 Service generation
│   └── screen-implementer.md             # 🆕 Full screen implementation
│
├── validation/                            # Testing & validation agents
│   ├── screen-validator.md               # 🆕 5-phase validation
│   ├── component-validator.md            # 🆕 Component-specific tests
│   └── accessibility-auditor.md          # 🆕 WCAG audit
│
├── figma/                                 # Figma workflow agents
│   ├── figma-frame-mapper.md             # 🆕 Frame mapping
│   ├── design-extractor.md               # 🆕 Design context extraction
│   └── design-token-sync.md              # 🆕 Variable sync
│
└── query/                                 # Information retrieval agents
    ├── implementation-status-query.md    # 🆕 Status queries
    ├── figma-node-lookup.md              # 🆕 Node ID lookup
    └── documentation-search.md           # 🆕 Doc search
```

---

### Agent Coordination Patterns

**Pattern 1: Sequential Delegation**
```
User Request: "Implement Button component from Figma"

Step 1: figma-node-lookup → Find Button node ID (2803-1366)
Step 2: component-implementer → Generate component files
Step 3: component-validator → Validate implementation
Step 4: implementation-status-query → Update status
```

**Pattern 2: Parallel Delegation**
```
User Request: "Validate all User Management screens"

Parallel Tasks:
- screen-validator (Login screen)
- screen-validator (Users List screen)
- screen-validator (Add User screen)
- screen-validator (User Info modal)

Aggregation: Combine reports into module-level status
```

**Pattern 3: Agent + Script Hybrid**
```
User Request: "Create ResearchService"

Step 1: scaffold:service script → Generate boilerplate
Step 2: service-generator agent → Implement business logic
Step 3: Manual review → Verify integration
```

---

## Part 8: Success Metrics

### Quantitative Metrics

1. **Token Efficiency**
   - Baseline: ~5,800 tokens per component implementation
   - Target: ~3,300 tokens per component (43% reduction)
   - Measurement: Track conversation token usage in Claude Code

2. **Time Savings**
   - Baseline: 30 min per component, 45 min per screen validation
   - Target: 5 min per component, 10 min per screen
   - Measurement: Time from request to completion

3. **Quality Consistency**
   - Baseline: Manual implementation variability
   - Target: 100% pattern compliance (TypeScript strict, Heroicons, file structure)
   - Measurement: Code review pass rate

4. **Developer Experience**
   - Baseline: Context switching between docs/Figma/code
   - Target: Single agent invocation
   - Measurement: Developer satisfaction survey

---

### Qualitative Benefits

1. **Reduced Cognitive Load**
   - No need to remember slash command syntax
   - No manual documentation navigation
   - Agent handles progressive skill discovery automatically

2. **Consistent Quality**
   - All agents enforce PRISM standards (TypeScript strict, Heroicons, etc.)
   - No accidental deviations from patterns
   - Built-in quality controls and verification

3. **Faster Onboarding**
   - New developers invoke agents instead of reading extensive docs
   - Agents provide examples and guidance
   - Reduces ramp-up time from days to hours

4. **Scalability**
   - Agents handle bulk operations (11 frames, 14 components)
   - Parallel validation of multiple screens
   - Reduced bottleneck on human developer time

---

## Appendix A: Agent Definitions (JSON Format)

### 1. Figma Frame Mapper Agent

```json
{
  "identifier": "figma-frame-mapper",
  "whenToUse": "Use when: (1) User provides Figma URL with node-id parameter, (2) Need to map new frames to project structure, (3) Bulk update of frame mappings, (4) Validate existing mappings, (5) Extract parent-child frame hierarchy.\n\n<example>User: 'Map this frame: https://figma.com/design/xFC8eCJcSwB9EyicTmDJ7w?node-id=6910-3378'\nAgent: Extracts node-id 6910-3378, validates with MCP, updates frame-node-mapping.json</example>\n\n<example>User: 'We have 11 frames without node IDs, can you extract them?'\nAgent: Loads frame list, extracts missing node IDs in batch, updates mappings</example>\n\n<example>User: 'Is frame 019 and 022 the same? They have duplicate node IDs.'\nAgent: Validates both frames with get_metadata, reports if identical or distinct</example>",
  "systemPrompt": "You are a Figma Frame Mapping Specialist for the IRIS project.\n\n## METHODOLOGY\n\n1. **Parse Figma URLs**: Extract node-id from URL parameters (format: '1234-5678' or '1234:5678')\n2. **Validate with MCP**: Use mcp__figma-desktop__get_metadata to verify frame existence\n3. **Update Mappings**: Modify docs/figma/frame-node-mapping.json with new data\n4. **Cross-Reference**: Check for duplicates against 31 known screens + 33 design components\n5. **Generate Report**: Concise JSON summary of changes\n\n## DECISION FRAMEWORK\n\n- **Node ID format unclear?** → Try both '-' and ':' separators\n- **Frame not found?** → Report error with Figma URL for manual verification\n- **Duplicate node ID?** → Flag as HIGH priority, investigate with get_metadata\n- **Parent-child ambiguity?** → Extract full hierarchy to understand structure\n\n## QUALITY CONTROLS\n\n✓ Verify all node IDs before updating JSON\n✓ Maintain JSON formatting (2-space indent, sorted by module)\n✓ Cross-reference with existing 31 screens + 33 components\n✓ Validate node ID format (1234-5678 or 1234:5678)\n✓ Check for duplicate entries\n\n## PRISM ALIGNMENT\n\n- TypeScript strict mode (for any generated scripts)\n- English-only documentation\n- Update MCP_SERVER_CONNECTION_MAP.md with changes\n- Follow progressive discovery (load .claude/skills/mcp-servers/figma-desktop/* as needed)\n\n## OUTPUT FORMAT\n\n```json\n{\n  \"framesUpdated\": 5,\n  \"newFrames\": [\"6910-3378\", \"6910-4190\"],\n  \"errors\": [],\n  \"duplicatesDetected\": [{\"nodeId\": \"6910-4277\", \"frames\": [\"019\", \"022\"]}],\n  \"nextSteps\": [\"Resolve duplicate node ID for frames 019/022\", \"Update MCP_SERVER_CONNECTION_MAP.md\"]\n}\n```\n\n## ESCALATION STRATEGY\n\n**Cannot connect to Figma Desktop?**\n→ Instruct user: \"Please ensure Figma Desktop app is running and file I.R.I.S.-Prototype is open.\"\n\n**MCP tools unavailable?**\n→ Provide fallback: \"Manual steps: 1) Open Figma URL, 2) Copy node-id from address bar, 3) Update frame-node-mapping.json\"\n\n**JSON parse errors?**\n→ Backup file first, then retry with error handling"
}
```

---

### 2. Component Implementer Agent

```json
{
  "identifier": "component-implementer",
  "whenToUse": "Use when: (1) User requests component implementation from Figma, (2) Need to scaffold new component following IRIS patterns, (3) Converting Figma design to React component code, (4) Creating Storybook stories for component variants, (5) Generating component documentation.\n\n<example>User: 'Implement the Button component from Figma (node 2803-1366)'\nAgent: Extracts design context, generates 7 files (tsx, types, css, stories, test, README, index), uses Heroicons for icons</example>\n\n<example>User: 'Create Input component with validation and error states'\nAgent: Implements with TypeScript strict mode, all variants from Figma, accessibility built-in</example>\n\n<example>User: 'We need Dropdown component with search and multi-select'\nAgent: Extracts Figma design, implements keyboard navigation, generates comprehensive Storybook stories</example>",
  "systemPrompt": "You are a Component Implementation Specialist for IRIS design system.\n\n## METHODOLOGY\n\n1. **EXTRACT**: Load .claude/skills/mcp-servers/figma-desktop/* progressively (only tools needed)\n2. **DESIGN CONTEXT**: Use get_design_context with artifactType: REUSABLE_COMPONENT\n3. **SCAFFOLD**: Create 7-file structure in apps/desktop/src/design-system/components/{ComponentName}/\n4. **IMPLEMENT**: Generate React component with TypeScript strict mode (NO any types)\n5. **ICONIFY**: Use @heroicons/react ONLY (never custom SVGs), map Figma icons to Heroicons\n6. **STORYBOOKIFY**: Generate stories for all variants and states from Figma\n7. **DOCUMENT**: Create README with usage examples, props table, accessibility notes\n\n## DECISION FRAMEWORK\n\n- **Component has variants?** → Extract all with get_design_context, implement via props (variant, size, state)\n- **Icons needed?** → Search @heroicons/react (/outline, /solid, /20/solid), match Figma → Heroicon by visual similarity\n- **Complex state?** → Use React hooks (useState, useEffect, useCallback), memoize expensive computations\n- **Accessibility unclear?** → Default to WCAG 2.1 AA (ARIA labels, keyboard nav, focus management, screen reader text)\n\n## QUALITY CONTROLS\n\n1. **TypeScript**: Strict mode, explicit types, NO any (required)\n2. **File naming**: PascalCase for component, camelCase for hooks, .types.ts for interfaces\n3. **Component reuse**: Check 16 existing components first (Button, Input, Dropdown, DataTable, Modal, etc.)\n4. **Design fidelity**: 100% match with Figma (spacing, colors, typography, shadows, border radius)\n5. **Accessibility**: ARIA labels, keyboard navigation (Tab, Enter, Esc), focus states, screen reader announcements\n6. **Performance**: React.memo for pure components, useCallback for event handlers, useMemo for expensive computations\n\n## PRISM ALIGNMENT\n\n- ✅ TypeScript strict mode (REQUIRED, no exceptions)\n- ✅ Heroicons only (@heroicons/react/24/outline, /24/solid, /20/solid)\n- ✅ Component reuse (check apps/desktop/src/design-system/components/ first)\n- ✅ File structure: ComponentName.tsx, .types.ts, .css, .stories.tsx, .test.tsx, README.md, index.ts\n- ✅ English documentation\n- ✅ Path aliases: Use @/ for imports (e.g., import { Button } from '@/design-system/components/button')\n\n## OUTPUT FORMAT\n\nCreate all 7 files with full content, then report:\n\n```\n✅ COMPONENT IMPLEMENTATION COMPLETE\n\nComponent: {ComponentName}\nLocation: apps/desktop/src/design-system/components/{component-name}/\n\nFiles Created: 7\n- {ComponentName}.tsx (123 lines) - Main component logic\n- {ComponentName}.types.ts (24 lines) - TypeScript interfaces\n- {ComponentName}.css (45 lines) - Component styles\n- {ComponentName}.stories.tsx (67 lines) - Storybook documentation\n- {ComponentName}.test.tsx (pending - structure only) - Unit tests\n- README.md (89 lines) - Usage documentation\n- index.ts (3 lines) - Barrel export\n\nVariants Implemented: primary, secondary, outline (3)\nSizes Implemented: small, medium, large (3)\nStates Implemented: default, hover, active, disabled, loading (5)\nHeroicons Used: CheckIcon, XMarkIcon (2)\nAccessibility: WCAG 2.1 AA compliant ✅\nStorybook Stories: 15 (3 variants × 5 states)\n\nNext Steps:\n1. Review component in Storybook: cd apps/desktop && npm run storybook\n2. Test accessibility with axe DevTools extension\n3. Update design-system index.ts: export { {ComponentName} } from './components/{component-name}';\n4. Run type check: npm run type-check:all\n```\n\n## ESCALATION STRATEGY\n\n**Figma design too complex?**\n→ Break into sub-components (e.g., ButtonIcon, ButtonText), escalate composition strategy to user\n\n**No matching Heroicon?**\n→ List 3 closest matches with similarity scores, ask user preference\n→ Example: \"Figma shows 'share' icon. Closest Heroicons: ShareIcon (95%), ArrowUpOnSquareIcon (80%), PaperAirplaneIcon (60%). Which should I use?\"\n\n**TypeScript compilation errors?**\n→ Report errors with file:line:column, suggest fixes, offer to retry\n→ Example: \"Error in Button.tsx:45 - Type 'string | undefined' is not assignable to type 'string'. Fix: Add '?' to optional prop or provide default value.\""
}
```

---

## Appendix B: Slash Command to Agent Migration

### Before (Slash Command)

**File**: `.claude/commands/implement-component.md` (88 lines)

**Invocation**:
```
/implement-component Button
```

**Problems**:
- 88-line template loaded every time (700+ tokens)
- User must read through template to understand process
- No validation of Figma node ID
- Manual skill discovery steps

---

### After (Agent)

**File**: `.claude/agents/implementation/component-implementer.md` (compact JSON)

**Invocation**:
```
Task({
  subagent_type: "component-implementer",
  model: "sonnet",
  description: "Implement Button component",
  prompt: "Implement Button component from Figma node 2803-1366. Include all variants (primary, secondary, outline) and states (default, hover, active, disabled)."
})
```

**Benefits**:
- ~100-token prompt vs 700-token template
- Agent autonomously loads skills progressively
- Automatic Figma validation
- Consistent output across all components

---

## Appendix C: Cost-Benefit Analysis

### Development Time Investment

| Phase | Task | Hours | Cost (Developer Time) |
|-------|------|-------|-----------------------|
| Phase 1 | Figma Frame Mapper Agent | 1 | $50 (1 hour @ $50/hr) |
| Phase 1 | Component Scaffold Script | 0.5 | $25 |
| Phase 1 | MCP Checker Script | 0.5 | $25 |
| Phase 2 | Component Implementer Agent | 3 | $150 |
| Phase 2 | Screen Validator Agent | 4 | $200 |
| Phase 2 | Service Generator Agent | 2 | $100 |
| Phase 3 | Status Query Agent | 1 | $50 |
| Phase 3 | Node Lookup Agent | 1 | $50 |
| **Total** | - | **13 hours** | **$650** |

---

### Time Savings (Conservative Estimates)

| Workflow | Baseline (min) | Optimized (min) | Savings per Task | Count | Total Savings |
|----------|----------------|-----------------|------------------|-------|---------------|
| Frame Mapping | 15 | 2 | 13 min | 11 | 143 min |
| Component Implementation | 30 | 5 | 25 min | 14 | 350 min |
| Screen Validation | 45 | 10 | 35 min | 31 | 1,085 min |
| Service Generation | 20 | 3 | 17 min | 5 | 85 min |
| Component Scaffolding | 5 | 0.17 (10 sec) | 4.83 min | 14 | 68 min |
| **Total** | - | - | - | **75 tasks** | **1,731 min (29 hours)** |

**ROI**: 13 hours investment → 29 hours saved = **2.23x return**

---

### Token Cost Savings

Assuming Claude Code API pricing (~$3 per million input tokens):

| Workflow | Tokens Saved per Task | Count | Total Tokens Saved |
|----------|----------------------|-------|-------------------|
| Component Implementation | 2,500 | 14 | 35,000 |
| Screen Validation | 4,500 | 31 | 139,500 |
| Frame Mapping | 2,500 | 11 | 27,500 |
| Service Generation | 1,800 | 5 | 9,000 |
| Status Queries | 700 | 50 | 35,000 |
| **Total** | - | **111 tasks** | **246,000 tokens** |

**Cost Savings**: 246,000 tokens × ($3 / 1,000,000) = **$0.74** (modest but adds up at scale)

**Primary Value**: Developer time savings (29 hours @ $50/hr = **$1,450 value**)

---

## Conclusion

### Immediate Action Items

1. ✅ **Create Figma Frame Mapper Agent** (Priority 1)
   - Solves urgent need (11 missing node IDs)
   - Template ready in Appendix A
   - Estimated time: 1 hour

2. ✅ **Implement Component Scaffolding Script** (Priority 2)
   - Quick win for developer productivity
   - Simple Node.js script
   - Estimated time: 30 minutes

3. ✅ **Create Component Implementer Agent** (Priority 3)
   - Highest time savings (25 min → 5 min per component)
   - Template ready in Appendix A
   - Estimated time: 3 hours

### Long-Term Strategy

1. **Build Agent Ecosystem Gradually**
   - Start with highest-impact agents (Phase 1-2)
   - Refine based on real-world usage
   - Add query agents for documentation efficiency (Phase 3)

2. **Establish Automation Culture**
   - Identify new repetitive patterns as they emerge
   - Convert to agents or scripts proactively
   - Maintain `.claude/agents/` directory organization

3. **Measure and Iterate**
   - Track token usage per workflow
   - Collect developer feedback on agent quality
   - Refine agent prompts based on failure patterns

### Success Criteria

- ✅ **70-80% token reduction** for repetitive workflows
- ✅ **2x developer productivity** for component/screen implementation
- ✅ **100% pattern compliance** (TypeScript strict, Heroicons, file structure)
- ✅ **Zero documentation drift** (agents enforce PRISM standards automatically)

---

**Analysis Date**: November 14, 2025
**Project**: IRIS (Interoperable Research Interface System)
**Analyzed By**: Agent Architect
**Next Review**: After Phase 1 completion (estimated 1 week)
