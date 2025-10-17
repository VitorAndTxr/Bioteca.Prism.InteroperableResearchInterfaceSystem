---
description: Automatically execute the next pending implementation task
---

# 🚀 Execute Next Implementation Task

I will automatically find and execute the next highest priority pending task.

## Process:
1. Read `docs/implementation/tracking/task-queue.json`
2. Find the highest priority task with status "pending" or "in_progress"
3. Check if dependencies are met
4. Execute the implementation based on task type
5. Update tracking files
6. Show what's next

## Task Types:

### Component Implementation
- Extract design from Figma
- Create component structure
- Implement all variants and states
- Add TypeScript types
- Create basic tests
- Update documentation

### Screen Implementation
- Extract screen design from Figma
- Create mobile version (React Native)
- Create desktop version (Next.js/Web)
- Connect to appropriate context
- Add navigation
- Update documentation

### Context Implementation
- Create context provider
- Add TypeScript interfaces
- Implement mock service
- Add to app providers
- Update documentation

## Automatic Actions:
- Read current task queue
- Check implementation log for context
- Extract Figma designs if needed
- Generate appropriate code
- Update all tracking files
- Commit with descriptive message

Let me check the current task queue and execute the next task...