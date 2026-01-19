---
description: Show detailed implementation progress report with code verification
---

# Implementation Progress Report

I will analyze the CURRENT codebase state and generate an accurate progress report.

## Verification Steps

### 1. Scan Actual Implementation

**Design System Components** - Verify by checking:
```
apps/desktop/src/design-system/components/*/index.ts
```

**Desktop Screens** - Verify by checking:
```
apps/desktop/src/screens/**/*Screen.tsx
apps/desktop/src/screens/**/Login.tsx
```

**Mobile Screens** - Verify by checking:
```
apps/mobile/src/screens/*.tsx
```

**Services** - Verify by checking:
```
apps/desktop/src/services/**/*.ts
```

**Storybook Stories** - Verify by checking:
```
apps/desktop/src/**/*.stories.tsx
```

**Domain Models** - Verify by checking:
```
packages/domain/src/models/*.ts
```

### 2. Generate Report

After scanning, produce a report with:

```
═════════════════════════════════════════════════════════════════════════
                         IRIS IMPLEMENTATION STATUS
                         Verified: [CURRENT_DATE]
═════════════════════════════════════════════════════════════════════════

📈 OVERALL PROGRESS: X%
Desktop: [progress bar] X%
Mobile:  [progress bar] X%

═════════════════════════════════════════════════════════════════════════

## Summary by Category

| Category              | Progress       | Details                        |
|-----------------------|----------------|--------------------------------|
| Design Components     | X/30 (X%)      | [list verified components]     |
| Desktop Screens       | X/18 (X%)      | [list verified screens]        |
| Mobile Screens        | X/18 (X%)      | [list verified screens]        |
| Services              | X/X (100%)     | [list verified services]       |
| Domain Models         | X+             | [count]                        |
| Storybook Stories     | X              | [count]                        |
| Test Coverage         | X%             | [status]                       |

## Verified Components (X total)
[List each component found in design-system/components/]

## Verified Screens
Desktop: [List each screen found]
Mobile: [List each screen found]

## Verified Services
[List each service found]

## Pending Tasks
[Read from task-queue.json and list pending items]

## Next Priority
[First 3 pending tasks from queue]
```

### 3. Update Documentation

After generating the report, UPDATE the following files:

1. **Update `docs/implementation/tracking/implementation-log.json`**:
   - Set `projectInfo.lastUpdated` to current date
   - Update `statistics` section with verified counts

2. **Update `docs/implementation/tracking/task-queue.json`**:
   - Set `lastUpdated` to current date
   - Update `statistics` counts

3. **Update `docs/implementation/IMPLEMENTATION_SUMMARY.md`**:
   - Update "Last Updated" date
   - Update statistics tables with verified counts
   - Update component lists with verified items
   - Update screen lists with verified items

## Report Template

The report MUST include:
- Exact counts from code verification (not from cached docs)
- List of verified component names
- List of verified screen names
- List of verified service names
- Pending tasks from task-queue.json
- Next priority items

## Important

- DO NOT trust documentation - VERIFY in code first
- Components = folders with index.ts in design-system/components/
- Screens = files ending in Screen.tsx or Login.tsx
- Services = .ts files in services/ (excluding index.ts)
- Stories = files ending in .stories.tsx

Generate the report and update documentation now.
