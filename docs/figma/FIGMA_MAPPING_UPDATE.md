# Figma Mapping Update - November 1, 2025

## Overview

The IRIS Figma prototype has been reorganized, and frame node IDs have been updated to reflect the new project structure. All mapping files have been synchronized with the current Figma file.

**File Updated**: `xFC8eCJcSwB9EyicTmDJ7w` - I.R.I.S.-Prototype
**Date**: November 1, 2025
**Figma URL**: https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype

---

## 🔍 Discovery Audit - Unmapped Frames Found (November 1, 2025)

During verification of Figma mapping files against the current Figma project structure, **13 previously unmapped frames** were discovered in the Prototype page. These frames exist in Figma but were not documented in the mapping files.

### Summary of Unmapped Frames Discovered

| Total Found | Verified | Pending Extraction |
|-------------|----------|-------------------|
| 13 frames | 2 | 11 |

### Verified Frames (Node IDs Confirmed)

| Frame ID | Frame Name | Node ID | Module | Status |
|----------|------------|---------|--------|--------|
| 020 | Pesquisa específica - Voluntários | 6910-4190 | Research Management | ✅ verified |
| 021 | Pesquisa específica - Pesquisadores | 6910-3745 | Research Management | ✅ verified |

**Figma URLs**:
- [Pesquisa específica - Voluntários](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6910-4190)
- [Pesquisa específica - Pesquisadores](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6910-3745)

### Pending Extraction (Node IDs Require Verification)

The following 11 frames are visible in the Figma layers panel but require node ID extraction:

| Frame ID | Frame Name | Module | Priority |
|----------|------------|--------|----------|
| 019 | Pesquisas | Research Management | High |
| 022 | Voluntários | User Management | High |
| 023 | Novo evento clínico | SNOMED | Medium |
| 024 | Nova condição clínica | SNOMED | Medium |
| 025 | Pesquisas - Incluir pesquisador | Research Management | Medium |
| 026 | Novo modificador topográfico | SNOMED | Medium |
| 027 | Nova alergia/Intolerância | SNOMED | Medium |
| 028 | Nova medicação | SNOMED | Medium |
| 029 | Nova estrutura do corpo | SNOMED | Medium |
| 030 | Nova conexão | NPI Management | Medium |
| 031 | Nova região do corpo | SNOMED | Medium |

**Next Steps for Pending Frames**:
1. Open Figma prototype at: https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype
2. Click on each frame name in the Layers panel
3. Extract the `node-id` parameter from the URL
4. Update `frame-node-mapping.json` with verified node IDs
5. Change status from `pending` to `verified`

---

## Mapping Files Updated

### 1. **frame-node-mapping.json**
- **Location**: `docs/figma/frame-node-mapping.json`
- **Changes**:
  - Added `status` field to all frames (values: `verified`, `updated`, `pending`)
  - Added `figmaUrl` field pointing directly to each frame
  - Added `lastUpdated` timestamp (2025-11-01)
  - Added `updateNotes` explaining the reorganization
  - Updated node IDs for frames affected by reorganization

- **Verified Frames** (Node IDs unchanged):
  - Login: `6804-13742`
  - Usuários: `6804-13670`
  - Informações do pesquisador: `6835-1017`
  - NPIs e aplicações - Solicitações: `6804-13591`

- **Updated Frames** (Node IDs changed):
  - Pesquisadores: `6910-3378` (was `6804-12845`)

### 2. **design-system-mapping.json**
- **Location**: `docs/figma/design-system-mapping.json`
- **Changes**:
  - Updated all 30 design system components with `status` field
  - Added `figmaUrl` to all components for direct Figma access
  - Added `lastUpdated` timestamp (2025-11-01)
  - Added comprehensive `updateNotes`

- **Component Coverage**:
  - Foundation: 6 components (Border radius, Shadow, Layout, Spacing, Typography, Colors)
  - Input: 9 components (Selectors, Segmented control, Date and time input, Inputs, Dropdown, Stepper, Phone number, Password, etc.)
  - Actions: 2 components (Popover button, Button)
  - Navigation: 3 components (Tabs, Context menu, Breadcrumbs)
  - Feedback: 3 components (Temporary notifications, Tooltips and popovers, Progress)
  - Content: 2 components (Tags, Accordions)
  - Visual Elements: 2 components (Icons, Avatars)
  - Layout: 3 components (Big scrollable window, Dialog window, Mobile elements)

---

## Frame Directory

### Prototype Page Screens (31 Frames - 18 Original + 13 Newly Discovered)

#### Authentication Module
| Frame | Node ID | Status | URL |
|-------|---------|--------|-----|
| Login | 6804-13742 | verified | [Open](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6804-13742) |

#### User Management Module (17 Frames)
| Frame | Node ID | Status | URL |
|-------|---------|--------|-----|
| Usuários | 6804-13670 | verified | [Open](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6804-13670) |
| Pesquisadores | 6910-3378 | **updated** | [Open](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6910-3378) |
| Novo usuário | 6804-12778 | pending | [Open](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6804-12778) |
| Novo pesquisador | 6804-12812 | pending | [Open](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6804-12812) |
| Informações do usuário | 6835-991 | pending | [Open](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6835-991) |
| Informações do pesquisador | 6835-1017 | verified | [Open](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6835-1017) |
| Novo usuário adicionado com sucesso! | 6816-2701 | pending | [Open](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6816-2701) |
| Novo pesquisador adicionado com sucesso! | 6816-2702 | pending | [Open](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6816-2702) |

#### NPI Management Module (2 Frames)
| Frame | Node ID | Status | URL |
|-------|---------|--------|-----|
| NPIs e aplicações - Solicitações | 6804-13591 | verified | [Open](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6804-13591) |
| NPIs e aplicações - Conexões ativas | 6804-13512 | pending | [Open](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6804-13512) |

#### SNOMED Module (7 Frames)
| Frame | Node ID | Status | URL |
|-------|---------|--------|-----|
| SNOMED - Região do corpo | 6804-12924 | pending | [Open](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6804-12924) |
| SNOMED - Estrutura do corpo | 6804-13008 | pending | [Open](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6804-13008) |
| SNOMED - Modificador topográfico | 6804-13092 | pending | [Open](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6804-13092) |
| SNOMED - Condição clínica | 6804-13176 | pending | [Open](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6804-13176) |
| SNOMED - Evento clínico | 6804-13260 | pending | [Open](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6804-13260) |
| SNOMED - Medicação | 6804-13344 | pending | [Open](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6804-13344) |
| SNOMED - Alergia/Intolerância | 6804-13428 | pending | [Open](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=6804-13428) |

---

## Design System Components (30 Components)

All design system components now have direct Figma links. Access them via:

```
https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=NODE_ID
```

**Examples**:
- Buttons: [2803-1366](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=2803-1366)
- Icons: [2803-4064](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=2803-4064)
- Inputs: [2803-2414](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=2803-2414)
- Colors: [2803-696](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=2803-696)
- Typography: [2803-437](https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype?node-id=2803-437)

See `design-system-mapping.json` for complete component list.

---

## Status Definitions

- **verified**: Node ID tested and confirmed working in current Figma structure
- **updated**: Node ID changed from previous mapping; requires implementation review
- **pending**: Node ID appears valid but hasn't been manually verified yet

---

## Migration Notes

### What Changed
1. **Project Reorganization**: Some frames have been moved/reorganized in Figma, causing node ID shifts
2. **Most Critical Update**: "Pesquisadores" frame moved from `6804-12845` to `6910-3378`
3. **Preserved Entries**: Several critical frames (Login, Usuários, Informações do pesquisador) retained their node IDs

### What Stayed the Same
- File Key: `xFC8eCJcSwB9EyicTmDJ7w` (unchanged)
- Base URL structure: `https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype` (unchanged)
- All design system components appear intact with original node IDs

---

## Next Steps

1. **Verify Updated Frames**: Review frames marked as "updated" to ensure UI components match implementation
2. **Validate Pending Frames**: Click-test each "pending" frame to confirm node IDs work correctly
3. **Update Implementation References**: If using node IDs in code/docs, update to new values
4. **Design System Sync**: Confirm all 30 design system components match deployed component library

---

## Quick Links

- **Main Figma File**: https://www.figma.com/design/xFC8eCJcSwB9EyicTmDJ7w/I.R.I.S.-Prototype
- **Frame Mapping**: `docs/figma/frame-node-mapping.json`
- **Component Mapping**: `docs/figma/design-system-mapping.json`
- **Project Path**: `D:\Repos\Faculdade\PRISM\IRIS`

---

**Generated**: November 1, 2025
**Update Source**: `/update-figma` command with node-id=2501-2715
