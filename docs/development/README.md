# Development Documentation

This section contains comprehensive guides for developing IRIS features, following project standards, and writing code that aligns with project conventions.

## Contents

### Guides

- **[DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)** - Main development guide with project workflow, setup, and best practices

- **[CODE_PATTERNS.md](CODE_PATTERNS.md)** - Architectural patterns and code organization patterns used throughout IRIS

- **[TYPESCRIPT_PATTERNS.md](TYPESCRIPT_PATTERNS.md)** - TypeScript best practices, type definitions, and strict mode patterns

- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Manual testing strategies, automated testing setup, and test case examples

---

## Quick Start for Developers

### 1. Setup Development Environment

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Run development server
npm start

# For Android development
npm run android
```

See [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) for detailed instructions.

### 2. Understand the Codebase

```
src/
├── context/
│   └── BluetoothContext.tsx      # Global state + protocol implementation
├── screens/
│   └── HomeScreen.tsx            # Main application screens
├── types/
│   └── index.ts                  # TypeScript type definitions
└── utils/
    └── index.ts                  # Utility functions
```

See [../architecture/COMPONENT_STRUCTURE.md](../architecture/COMPONENT_STRUCTURE.md) for details.

### 3. Learn Code Patterns

Review [CODE_PATTERNS.md](CODE_PATTERNS.md) to understand:
- Context provider patterns
- Custom hook patterns
- Component composition patterns
- Error handling patterns

### 4. Implement a Feature

1. **Design**: Review [../architecture/](../architecture/) for system design
2. **Implement**: Follow [CODE_PATTERNS.md](CODE_PATTERNS.md) and [TYPESCRIPT_PATTERNS.md](TYPESCRIPT_PATTERNS.md)
3. **Test**: Follow [TESTING_GUIDE.md](TESTING_GUIDE.md)
4. **Document**: Write docs following [../DOCUMENTATION_GUIDELINES.md](../DOCUMENTATION_GUIDELINES.md)

---

## Development Workflow

### Creating a New Feature

#### Step 1: Plan
- Check [../implementation/IMPLEMENTATION_SUMMARY.md](../implementation/IMPLEMENTATION_SUMMARY.md) for existing features
- Review [../architecture/](../architecture/) for system design
- Define requirements and acceptance criteria

#### Step 2: Design
- Sketch component structure in [../architecture/COMPONENT_STRUCTURE.md](../architecture/COMPONENT_STRUCTURE.md)
- Define state management needs using [../architecture/STATE_MANAGEMENT.md](../architecture/STATE_MANAGEMENT.md)
- Review [CODE_PATTERNS.md](CODE_PATTERNS.md) for similar patterns

#### Step 3: Implement
- Follow [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) for development practices
- Use patterns from [CODE_PATTERNS.md](CODE_PATTERNS.md)
- Follow TypeScript conventions from [TYPESCRIPT_PATTERNS.md](TYPESCRIPT_PATTERNS.md)
- Use provided utilities and hooks

#### Step 4: Test
- Manual testing: [TESTING_GUIDE.md](TESTING_GUIDE.md#manual-testing)
- Automated testing: [TESTING_GUIDE.md](TESTING_GUIDE.md#automated-testing)
- Test edge cases and error scenarios

#### Step 5: Document
- Create feature documentation in [../features/](../features/)
- Update [../implementation/IMPLEMENTATION_SUMMARY.md](../implementation/IMPLEMENTATION_SUMMARY.md)
- Add code comments for complex logic
- Follow [../DOCUMENTATION_GUIDELINES.md](../DOCUMENTATION_GUIDELINES.md)

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/FEATURE_NAME

# Make changes and commit
git add src/...
git commit -m "feat: Implement FEATURE_NAME"

# Push to remote
git push origin feature/FEATURE_NAME

# Create pull request on GitHub
# Include description, testing notes, and documentation updates
```

Commit message format:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `test:` Testing
- `refactor:` Code refactoring
- `chore:` Project maintenance

---

## Code Organization

### Directory Structure

```
src/
├── context/
│   └── BluetoothContext.tsx
│       ├── State definitions
│       ├── Effect hooks
│       ├── Event handlers
│       ├── Protocol implementation
│       └── Context provider
├── screens/
│   ├── HomeScreen.tsx
│   └── [FeatureScreen].tsx
├── components/
│   ├── [FeatureComponent].tsx
│   └── [AnotherComponent].tsx
├── hooks/
│   ├── useCustomHook.ts
│   └── [AnotherHook].ts
├── types/
│   └── index.ts
├── utils/
│   └── index.ts
└── App.tsx
```

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `StreamingScreen.tsx` |
| Screens | PascalCase + Screen | `HomeScreen.tsx` |
| Hooks | camelCase + use prefix | `useStreamData.ts` |
| Utilities | camelCase | `formatData.ts` |
| Types | PascalCase | `StreamDataPacket` |
| Variables | camelCase | `isStreaming` |
| Constants | UPPERCASE_SNAKE_CASE | `DEFAULT_RATE` |

See [CODE_PATTERNS.md](CODE_PATTERNS.md) for more conventions.

---

## Common Tasks

### Adding a New Screen

1. Create file in `src/screens/`
2. Follow component structure from [CODE_PATTERNS.md](CODE_PATTERNS.md)
3. Import and use BluetoothContext hooks
4. Add navigation in `App.tsx`

See [CODE_PATTERNS.md](CODE_PATTERNS.md#component-pattern) for example.

### Adding a New Hook

1. Create file in `src/hooks/`
2. Use `use` prefix: `useMyHook.ts`
3. Export React hooks or custom logic
4. Document with JSDoc comments

See [CODE_PATTERNS.md](CODE_PATTERNS.md#custom-hooks) for examples.

### Implementing Bluetooth Commands

1. Review [../api/BLUETOOTH_COMMANDS.md](../api/BLUETOOTH_COMMANDS.md)
2. Study existing commands in BluetoothContext
3. Implement in `BluetoothContext.tsx`
4. Export via context provider
5. Use in components with hook

See [CODE_PATTERNS.md](CODE_PATTERNS.md#bluetooth-patterns) for examples.

### Adding Documentation

1. Read [../DOCUMENTATION_GUIDELINES.md](../DOCUMENTATION_GUIDELINES.md)
2. Choose appropriate subdirectory (`docs/features/`, `docs/api/`, etc.)
3. Use `UPPERCASE_SNAKE_CASE` filename
4. Follow markdown format standards
5. Update directory README
6. Update main `docs/README.md`

See [../DOCUMENTATION_GUIDELINES.md](../DOCUMENTATION_GUIDELINES.md#review-process) for checklist.

---

## Best Practices

### Code Quality

- **Type Safety**: Enable TypeScript strict mode
- **Error Handling**: Always handle errors in async operations
- **Comments**: Explain WHY, not WHAT (code shows what)
- **Testing**: Write tests for critical paths
- **Documentation**: Document public APIs and complex logic

### Performance

- **Re-renders**: Use `useMemo` and `useCallback` when needed
- **State Updates**: Batch related updates together
- **Memory**: Manage subscriptions and cleanup effects
- **Charts**: Use windowing for large datasets

### Security

- **Validation**: Validate all user input and Bluetooth data
- **Permissions**: Request permissions before Bluetooth operations
- **Error Messages**: Don't expose sensitive information in errors
- **Dependencies**: Keep dependencies updated regularly

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Type errors after code changes | Run `npm run type-check` |
| Build fails | Clear cache: `npm run clean` then rebuild |
| Device not found | Check Bluetooth permissions and pairing |
| Hot reload not working | Restart development server |

See [../troubleshooting/DEBUGGING_GUIDE.md](../troubleshooting/DEBUGGING_GUIDE.md) for detailed debugging.

---

## References

- **Architecture**: [../architecture/](../architecture/)
- **API Reference**: [../api/](../api/)
- **Troubleshooting**: [../troubleshooting/](../troubleshooting/)
- **Device Protocol**: [../../InteroperableResearchsEMGDevice/CLAUDE.md](../../InteroperableResearchsEMGDevice/CLAUDE.md)
- **Guidelines**: [../DOCUMENTATION_GUIDELINES.md](../DOCUMENTATION_GUIDELINES.md)

---

**Development Documentation**
Last Updated: 2025-10-17
