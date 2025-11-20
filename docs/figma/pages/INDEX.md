# Figma Pages Mapping Index

**Last Updated**: November 14, 2025
**Location**: `docs/figma/pages/`

---

## Overview

This directory contains detailed mappings of Figma design pages, with focus on page 2501-2715 (I.R.I.S. Prototype) which contains all screens and components for the IRIS desktop application.

---

## Available Page Mappings

### Page 2501-2715: I.R.I.S. Prototype

**File Key**: xFC8eCJcSwB9EyicTmDJ7w
**Node ID**: 2501-2715 (2501:2715)
**Total Frames**: 31

#### Documentation Files

| File | Purpose | Status | Date |
|------|---------|--------|------|
| **REMAPPING_REPORT_2025-11-14.md** | Comprehensive remapping report with full frame catalog | ✅ **LATEST** | Nov 14, 2025 |
| **COMPLETE_FRAME_MAPPING_2501-2715.md** | Executive summary and module breakdown | ✅ Current | Nov 14, 2025 |
| **page-2501-2715-mapping.json** | Structured JSON mapping data | 🚧 In progress | Nov 14, 2025 |
| **page-2501-2715-mapping-template.json** | Template for mapping new frames | ✅ Reference | Nov 14, 2025 |
| **MANUAL_MAPPING_GUIDE_2501-2715.md** | Step-by-step manual extraction guide | ✅ Reference | Nov 14, 2025 |

#### Quick Links

- **Full Remapping Report**: [REMAPPING_REPORT_2025-11-14.md](./REMAPPING_REPORT_2025-11-14.md)
- **Complete Frame Mapping**: [COMPLETE_FRAME_MAPPING_2501-2715.md](./COMPLETE_FRAME_MAPPING_2501-2715.md)
- **Figma Page**: https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=2501-2715&m=dev

---

## Frame Summary

### By Module

| Module | Frames | Status | Coverage |
|--------|--------|--------|----------|
| **Authentication** | 1 | ✅ Complete | 100% |
| **User Management** | 9 | 🔶 In Progress | 44% |
| **Research Management** | 4 | ✅ Complete* | 100%* |
| **NPI Management** | 3 | 🔶 In Progress | 67% |
| **SNOMED Management** | 14 | 🔶 In Progress | 57% |
| **TOTAL** | **31** | 🔶 **68%** | - |

*Research Management marked complete but contains 1 duplicate node ID requiring resolution

### By Status

| Status | Count | Percentage |
|--------|-------|-----------|
| ✅ Verified | 21 | 67.7% |
| ✅ Updated | 1 | 3.2% |
| ⏳ Pending | 7 | 22.6% |
| ⚠️ Duplicate Issues | 2 | 6.5% |
| **TOTAL** | **31** | **100%** |

---

## Frame Categories

### Screens (28 frames - 90.3%)
- **Authentication**: 1 (Login)
- **User Management**: 6 (Lists, Forms)
- **Research Management**: 4 (Lists, Details, Forms)
- **NPI Management**: 3 (Requests, Connections, New)
- **SNOMED Management**: 14 (7 Lists + 7 Forms)

### Modals (3 frames - 9.7%)
- **User Info Modal**: 6835-991
- **Researcher Info Modal**: 6835-1017
- **Success Toast Notifications**: 6816-2701, 6816-2702

---

## Critical Issues

### Issue #1: Duplicate Node ID (HIGH PRIORITY)

**Problem**: Node ID `6910-4277` assigned to TWO frames:
- Frame 019: "Pesquisas" (Research Management)
- Frame 022: "Voluntários" (User Management)

**Impact**: Blocks implementation of both frames

**Resolution**: See REMAPPING_REPORT_2025-11-14.md, section "Critical Issues & Resolutions"

### Issue #2: 7 Pending Verifications (MEDIUM PRIORITY)

Frames requiring cross-reference with current implementation:
- Frame 004: Novo usuário (User creation)
- Frame 005: Novo pesquisador (Researcher creation)
- Frame 006: User info modal
- Frame 008: User success toast
- Frame 009: Researcher success toast
- Frame 011: Active connections
- Frames 012-018: All SNOMED list screens

---

## Implementation Status by Module

### ✅ Authentication (Complete)
- Login screen: Implemented in desktop app

### 🚧 User Management (In Progress)
- ✅ Users List (6804-13670)
- ✅ Researchers List (6910-3378)
- ⏳ User creation form (6804-12778)
- ⏳ Researcher creation form (6804-12812)
- ⏳ Modals and toasts

### 🚧 Research Management (In Progress)
- ✅ Backend service complete (with pagination)
- ⏳ Research list screen (6910-4277) - *blocked by duplicate*
- ⏳ Detail views and forms

### ⏳ NPI Management (Not Started)
- Related to Phase 4 backend (secure handshake)
- 3 screens ready for implementation
- Depends on backend connection management

### 🚧 SNOMED Management (In Progress)
- ✅ List screens with pagination: Complete
- ✅ Form screens: Verified
- ⏳ Form implementations: Pending
- 7 SNOMED categories covered

---

## Design System Integration

### Components Used

All 31 frames use components from the design system:
- **Button**: 31/31 frames
- **Input**: 20+ frames (forms)
- **DataTable**: 11 frames (lists)
- **Modal**: 3 frames
- **Dropdown**: 15+ frames
- **Avatar**: 8+ frames (user management)
- **SearchBar**: 11 frames (lists)
- **Pagination**: 11 frames (list screens)
- **Toast**: 2 frames (notifications)
- **Typography**: 31/31 frames

**Design System Reference**: `docs/figma/design-system-mapping.json` (33 components)

---

## Navigation Guide

### For Different Users

**Project Manager**: Read [COMPLETE_FRAME_MAPPING_2501-2715.md](./COMPLETE_FRAME_MAPPING_2501-2715.md) for module overview and status

**Developer (Frontend)**: Read [REMAPPING_REPORT_2025-11-14.md](./REMAPPING_REPORT_2025-11-14.md) for detailed frame specifications and implementation priorities

**Designer**: Visit Figma directly at https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=2501-2715

**QA/Tester**: Use frame node IDs from tables to navigate Figma and verify implementations

---

## Frame Node ID Reference

### Complete Node ID List

**Authentication**:
- 6804-13742 (Login)

**User Management**:
- 6804-13670, 6910-3378, 6804-12778, 6804-12812, 6835-991, 6835-1017, 6816-2701, 6816-2702

**Research Management**:
- 6910-4277 (Pesquisas)
- 6910-4190, 6910-3745, 6910-4029

**NPI Management**:
- 6804-13591, 6804-13512, 6910-3543

**SNOMED Management**:
- Lists: 6804-12924, 6804-13008, 6804-13092, 6804-13176, 6804-13260, 6804-13344, 6804-13428
- Forms: 6910-2905, 6910-2825, 6910-2719, 6910-3177, 6910-3052, 6910-2612, 6910-2488

**Volunteers/Management**:
- 6910-4277 (Voluntários) ⚠️ *Same as Pesquisas*

---

## Related Documentation

### In This Directory

- **[REMAPPING_REPORT_2025-11-14.md](./REMAPPING_REPORT_2025-11-14.md)** - Full remapping with all details
- **[COMPLETE_FRAME_MAPPING_2501-2715.md](./COMPLETE_FRAME_MAPPING_2501-2715.md)** - Executive summary
- **[MANUAL_MAPPING_GUIDE_2501-2715.md](./MANUAL_MAPPING_GUIDE_2501-2715.md)** - Manual extraction instructions
- **[page-2501-2715-mapping.json](./page-2501-2715-mapping.json)** - JSON mapping data
- **[page-2501-2715-mapping-template.json](./page-2501-2715-mapping-template.json)** - Mapping template

### Parent Directory (`docs/figma/`)

- **[frame-node-mapping.json](../frame-node-mapping.json)** - Master mapping registry (31 frames)
- **[design-system-mapping.json](../design-system-mapping.json)** - Design system (33 components)
- **[FIGMA_MAPPING_UPDATE_2025-11-13.md](../FIGMA_MAPPING_UPDATE_2025-11-13.md)** - Previous update
- **[FRAME_VALIDATION_REPORT_2025-11-13.md](../FRAME_VALIDATION_REPORT_2025-11-13.md)** - Validation analysis
- **[validation-issues.json](../validation-issues.json)** - Known issues

### Tools & Scripts

- **[scripts/extract-figma-frames.sh](../../scripts/extract-figma-frames.sh)** - API extraction script
- **[scripts/validate-figma-frames.js](../../scripts/validate-figma-frames.js)** - Validation script

---

## How to Use These Reports

### Quick Start (5 minutes)
1. Read [COMPLETE_FRAME_MAPPING_2501-2715.md](./COMPLETE_FRAME_MAPPING_2501-2715.md) Executive Summary
2. Check frame counts and status percentages
3. Identify your module's priority items

### Deep Dive (30 minutes)
1. Read [REMAPPING_REPORT_2025-11-14.md](./REMAPPING_REPORT_2025-11-14.md) full report
2. Review frame details in your module
3. Check implementation status
4. Identify blockers (duplicate node IDs)

### Implementation (Ongoing)
1. Use frame node IDs to navigate Figma: `https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=XXXX-XXXX`
2. Reference JSON files for structured data
3. Track implementation progress in ticket system
4. Update status periodically

---

## Action Items

### Immediate (This Week)

- [ ] Resolve duplicate node ID (frames 019/022) - see section "Critical Issues"
- [ ] Verify 7 pending frames against implementation
- [ ] Update master mapping with corrections

### Short-term (Weeks 2-3)

- [ ] Extract screenshots for all frames
- [ ] Extract design tokens and variables
- [ ] Generate code contexts for priority screens

### Long-term (Weeks 4-8)

- [ ] Implement remaining User Management forms
- [ ] Implement NPI Management screens
- [ ] Complete SNOMED Management forms
- [ ] Implement Research Management frontend

---

## Statistics

```
FRAMES MAPPING SUMMARY
════════════════════════════════════════════════════════

Total Frames:                           31 frames
Fully Documented:                       31 frames (100%)
With Node IDs:                          31 frames (100%)
With Figma Links:                       31 frames (100%)
Verified:                               21 frames (67.7%)
Pending Verification:                    7 frames (22.6%)
Known Issues:                            2 frames (6.5%)

IMPLEMENTATION STATUS
────────────────────────────────────────────────────────
Modules Complete:                        1 (Authentication)
Modules In Progress:                     4 (User, Research, NPI, SNOMED)
Overall Progress:                        68%

DESIGN SYSTEM ALIGNMENT
────────────────────────────────────────────────────────
Component Coverage:                      11 types
Most Used Components:                    Button (31), Input (20+), DataTable (11)
Design System Reference:                 docs/figma/design-system-mapping.json

DOCUMENTATION
────────────────────────────────────────────────────────
Report Files:                            5 markdown files
JSON Mappings:                           2 files
Total Pages:                             ~50 pages of documentation
```

---

## Troubleshooting

### Finding a Specific Frame

1. **By Frame Name**: Use browser find (Ctrl+F) in REMAPPING_REPORT
2. **By Node ID**: Look in "Frame Node ID Reference" section
3. **By Module**: Check module overview tables
4. **In Figma**: Use node-id URL parameter

### Finding Implementation Status

1. Check the status column in module tables
2. ✅ = Verified/Complete
3. 🔶 = In Progress
4. ⏳ = Pending
5. ⚠️ = Issues/Blockers

### Getting Help

- For frame specifications: See REMAPPING_REPORT detailed frame descriptions
- For implementation: Check design system and related screens in same module
- For blockers: See "Critical Issues" section
- For design questions: Review COMPLETE_FRAME_MAPPING module summaries

---

**Index Last Updated**: November 14, 2025
**Report Files**: 5 documents
**Total Frames Documented**: 31
**Coverage**: 100%
**Status**: ✅ Complete

---

See [REMAPPING_REPORT_2025-11-14.md](./REMAPPING_REPORT_2025-11-14.md) for the comprehensive remapping report.
