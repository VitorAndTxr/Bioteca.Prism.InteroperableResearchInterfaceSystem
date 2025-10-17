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
- Create component structure (Component.tsx, Component.css, Component.types.ts, index.ts)
- Implement all variants and states
- Add TypeScript types
- Create Storybook stories (Component.stories.tsx)
- Add component README.md
- Update documentation
- Update tracking files

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
- Create Storybook stories (if component/screen)
- Update all tracking files
- Commit with descriptive message

## Storybook Integration (for Components):

When implementing a component, **always** create a corresponding `Component.stories.tsx` file:

### Story Requirements:
1. **Meta Configuration**: title, component, parameters, tags, argTypes
2. **Basic Variants**: One story per variant (e.g., Primary, Secondary, Outline)
3. **Sizes**: One story per size (Small, Medium, Big)
4. **States**: Stories for disabled, loading, error states
5. **Features**: Stories showcasing icons, prefixes, validation, etc.
6. **Interactive Examples**: Stories with hooks for user interaction
7. **Showcases**: Combined stories showing multiple variants/states
8. **Playground**: Story with all controls enabled for testing

### Story Structure:
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from './index';

const meta = {
    title: 'Design System/ComponentName',
    component: ComponentName,
    parameters: { layout: 'centered' },
    tags: ['autodocs'],
    argTypes: { /* ... */ },
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: { /* ... */ },
};
```

### Documentation:
- Reference Figma node in component description
- Document all props with descriptions and types
- Include usage examples and patterns
- Update `.storybook/README.md` if needed

Let me check the current task queue and execute the next task...