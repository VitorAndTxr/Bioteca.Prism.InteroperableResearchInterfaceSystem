# IRIS Documentation Guidelines

This document defines standards and best practices for all development documentation in the IRIS (Interoperable Research Interface System) project.

## Table of Contents

1. [General Principles](#general-principles)
2. [Directory Structure](#directory-structure)
3. [File Organization](#file-organization)
4. [Documentation Types](#documentation-types)
5. [Writing Standards](#writing-standards)
6. [File Naming Conventions](#file-naming-conventions)
7. [Markdown Formatting](#markdown-formatting)
8. [Code Examples](#code-examples)
9. [Cross-References](#cross-references)
10. [Review Process](#review-process)

---

## General Principles

### 1. Single Source of Truth
- All development documentation must be stored in `/docs` directory at the project root
- No scattered documentation in subdirectories (except `/node_modules`)
- Cross-link to device and backend documentation in parent directories when necessary

### 2. Language Standard
- **All documentation must be written in English**
- Use clear, professional technical language
- Avoid colloquialisms and cultural references
- Use consistent terminology throughout

### 3. Audience-Focused
Documentation should be written for multiple audiences:
- **Developers**: Implementation details, code patterns, architecture
- **AI Assistants** (Claude Code): Quick navigation, file structure, protocols
- **Researchers**: Feature overview, usage workflows, data flow
- **DevOps/Maintainers**: Setup, deployment, troubleshooting

### 4. Keep Documentation Current
- Update documentation when code changes
- Include "Last Updated" date on significant documents
- Mark deprecated sections clearly
- Document breaking changes immediately

---

## Directory Structure

### Organized Subdirectories

All documentation must be organized in appropriate subdirectories:

```
docs/
├── README.md                          # Main documentation hub
├── DOCUMENTATION_GUIDELINES.md        # This file
├── CLAUDE.md                          # Integration with Claude context
├── architecture/                      # System design and patterns
│   ├── ARCHITECTURE_OVERVIEW.md
│   ├── BLUETOOTH_PROTOCOL.md
│   ├── STATE_MANAGEMENT.md
│   └── COMPONENT_STRUCTURE.md
├── setup/                            # Installation and configuration
│   ├── QUICK_START.md
│   ├── BLUETOOTH_SETUP.md
│   ├── ENVIRONMENT_SETUP.md
│   └── DEPENDENCIES.md
├── development/                      # Development guides
│   ├── DEVELOPMENT_GUIDE.md
│   ├── CODE_PATTERNS.md
│   ├── TYPESCRIPT_PATTERNS.md
│   └── TESTING_GUIDE.md
├── api/                              # API documentation
│   ├── BLUETOOTH_COMMANDS.md
│   ├── CONTEXT_API.md
│   └── HOOKS_REFERENCE.md
├── features/                         # Feature-specific documentation
│   ├── STREAMING.md
│   ├── FES_SESSION_CONTROL.md
│   └── DEVICE_CONNECTION.md
├── troubleshooting/                  # Problem-solving guides
│   ├── COMMON_ISSUES.md
│   ├── DEBUGGING_GUIDE.md
│   ├── WINDOWS_LONG_PATH_FIX.md
│   └── ANDROID_ISSUES.md
├── implementation/                   # Implementation details
│   ├── IMPLEMENTATION_SUMMARY.md
│   ├── STREAMING_IMPLEMENTATION.md
│   └── [FEATURE_NAME]_IMPLEMENTATION.md
├── testing/                          # Testing documentation
│   ├── TESTING_STRATEGY.md
│   ├── MANUAL_TESTING.md
│   └── AUTOMATED_TESTING.md
└── deployment/                       # Deployment guides
    ├── PRODUCTION_BUILD.md
    ├── EAS_BUILD.md
    └── APK_DISTRIBUTION.md
```

### When to Create New Subdirectories

Create a new subdirectory when:
- Documentation covers 3+ related files on the same topic
- Topic is distinct from existing categories
- Future expansion is expected
- Examples: `docs/features/`, `docs/deployment/`

### When to Add to Existing Category

Add to existing subdirectory when:
- Documentation is related to an established topic
- Single file or 1-2 related files
- Part of comprehensive existing documentation
- Examples: Add "FES_SESSION_CONTROL.md" to `docs/features/`

---

## File Organization

### README.md (Main Hub)

Every documentation directory should have a `README.md` that serves as an index:

```markdown
# [Directory Name] Documentation

Brief description of what this section covers.

## Contents

- **[Topic 1](TOPIC1.md)** - Description
- **[Topic 2](TOPIC2.md)** - Description

## Quick Navigation

Links to commonly accessed files.
```

### Documentation Hierarchy

```
docs/
├── README.md (Main index - what is IRIS?)
│
├── setup/README.md (How do I set up IRIS?)
│   ├── QUICK_START.md
│   ├── BLUETOOTH_SETUP.md
│   └── ENVIRONMENT_SETUP.md
│
├── development/README.md (How do I develop for IRIS?)
│   ├── DEVELOPMENT_GUIDE.md
│   ├── CODE_PATTERNS.md
│   └── TESTING_GUIDE.md
│
└── troubleshooting/README.md (How do I fix problems?)
    ├── COMMON_ISSUES.md
    └── DEBUGGING_GUIDE.md
```

---

## Documentation Types

### 1. Architecture Documentation

**Purpose**: Explain system design, data flow, and component relationships

**Structure**:
- System overview diagram
- Component responsibilities
- Data flow diagrams
- Key design decisions
- Tradeoffs and alternatives

**File Naming**: `ARCHITECTURE_[FEATURE].md` or `[FEATURE]_ARCHITECTURE.md`

**Example**: `docs/architecture/BLUETOOTH_PROTOCOL.md`

### 2. Setup & Configuration Guides

**Purpose**: Guide users through installation and initial configuration

**Structure**:
- Prerequisites checklist
- Step-by-step instructions
- Configuration examples
- Verification steps
- Troubleshooting common setup issues

**File Naming**: `[COMPONENT]_SETUP.md` or `SETUP_[COMPONENT].md`

**Example**: `docs/setup/BLUETOOTH_SETUP.md`

### 3. Development Guides

**Purpose**: Explain how to implement features, follow patterns, and write code

**Structure**:
- Overview of topic
- Code patterns and examples
- Best practices
- Common mistakes to avoid
- References to related documentation

**File Naming**: `[TOPIC]_GUIDE.md` or `DEVELOPMENT_[TOPIC].md`

**Example**: `docs/development/TYPESCRIPT_PATTERNS.md`

### 4. API Documentation

**Purpose**: Document interfaces, functions, methods, and protocols

**Structure**:
- API signature/interface definition
- Parameter specifications
- Return values/responses
- Usage examples
- Error handling

**File Naming**: `[API_NAME]_API.md` or `[API_NAME]_REFERENCE.md`

**Example**: `docs/api/BLUETOOTH_COMMANDS.md`

### 5. Implementation Documentation

**Purpose**: Document technical details of implemented features

**Structure**:
- Feature overview
- Technical specifications
- Implementation details
- Code examples
- Test cases
- Known limitations

**File Naming**: `[FEATURE]_IMPLEMENTATION.md`

**Example**: `docs/implementation/STREAMING_IMPLEMENTATION.md`

### 6. Troubleshooting Guides

**Purpose**: Help users diagnose and resolve problems

**Structure**:
- Problem description
- Symptoms/error messages
- Root cause explanation
- Step-by-step solution
- Prevention tips
- Related issues

**File Naming**: `[ISSUE]_FIX.md` or `TROUBLESHOOT_[COMPONENT].md`

**Example**: `docs/troubleshooting/BLUETOOTH_CONNECTION_FIX.md`

---

## Writing Standards

### 1. Clarity and Precision

- Use simple, direct language
- Define technical terms on first use
- Avoid jargon when possible; when necessary, explain it
- Use active voice whenever possible
- Keep sentences concise (avg 15-20 words)

### 2. Structure

- Use clear hierarchical headings (H1 → H2 → H3)
- Lead with the most important information
- Use bullet points for lists
- Break up large blocks of text with subheadings

### 3. Context and Scope

- Start each document with a clear purpose statement
- Explain who should read this document and why
- Link to related documentation
- Note any prerequisites

### 4. Examples

- Include practical, runnable examples
- Show both good and bad practices
- Explain what each example demonstrates
- Keep examples focused and short

### 5. Consistency

- Use consistent terminology throughout the project
- Maintain consistent formatting and structure
- Use consistent abbreviations (define first use)
- Use consistent naming conventions

---

## File Naming Conventions

### Rules

1. **Use UPPERCASE_SNAKE_CASE for file names**
   ```
   ✅ BLUETOOTH_PROTOCOL.md
   ✅ STREAMING_IMPLEMENTATION.md
   ✅ DEVELOPMENT_GUIDE.md

   ❌ bluetooth-protocol.md
   ❌ Streaming Implementation.md
   ❌ developmentGuide.md
   ```

2. **Include descriptive keywords**
   ```
   ✅ TYPESCRIPT_PATTERNS.md (clear what it covers)
   ❌ PATTERNS.md (ambiguous - patterns for what?)
   ```

3. **Use logical prefixes when applicable**
   ```
   ✅ docs/api/BLUETOOTH_COMMANDS.md
   ✅ docs/troubleshooting/BLUETOOTH_CONNECTION_FIX.md
   ✅ docs/implementation/STREAMING_IMPLEMENTATION.md
   ```

4. **Avoid prefixes in main directory**
   ```
   ✅ docs/README.md (at root level)
   ❌ docs/INDEX.md
   ```

5. **Match file content to filename**
   - Filename should accurately reflect content
   - If content changes significantly, rename file
   - Use "UPDATE" in commit message if renaming

### Common Naming Patterns

```
docs/setup/
  - QUICK_START.md
  - BLUETOOTH_SETUP.md
  - ENVIRONMENT_SETUP.md

docs/api/
  - BLUETOOTH_COMMANDS.md
  - CONTEXT_API.md
  - HOOKS_REFERENCE.md

docs/troubleshooting/
  - COMMON_ISSUES.md
  - BLUETOOTH_CONNECTION_FIX.md
  - DEBUGGING_GUIDE.md

docs/implementation/
  - [FEATURE]_IMPLEMENTATION.md
  - IMPLEMENTATION_SUMMARY.md
```

---

## Markdown Formatting

### Headings

```markdown
# H1: Document Title (use only once per document)

## H2: Major Sections

### H3: Subsections

#### H4: Minor subsections (use sparingly)
```

### Code Blocks

**With language identifier** (always specify language):

````markdown
```typescript
import { useBluetoothContext } from '@/context/BluetoothContext';

function MyComponent() {
    const { startStream } = useBluetoothContext();
}
```
````

**Inline code** for variables, filenames:

```markdown
Use `setFesParams()` to configure parameters.
See `BluetoothContext.tsx` for implementation.
```

### Lists

```markdown
**Ordered lists** (for steps):
1. First step
2. Second step
3. Third step

**Unordered lists** (for items):
- Item one
- Item two
- Item three

**Definition lists** (for terms):
- **Term**: Definition
- **Another Term**: Its definition
```

### Emphasis

```markdown
- **Bold** for important terms, function names
- *Italic* for emphasis, first mention of terms
- `Code` for variables, filenames, commands
- > Blockquote for important notes
```

### Tables

```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data     | Data     | Data     |
```

### Links

```markdown
[Link Text](../relative/path/FILE.md) - Prefer relative paths
[External Link](https://example.com) - Use for external sites
```

### Special Sections

```markdown
> **Note**: Important information that should be highlighted

> **Warning**: Critical warning or caution

> **Tip**: Helpful suggestion or best practice

> **API Reference**: Technical specification details
```

---

## Code Examples

### Best Practices

1. **Context**: Explain what the example demonstrates
   ```markdown
   Here's how to connect to a Bluetooth device:

   ```typescript
   // Code here
   ```
   ```

2. **Complete Examples**: Show runnable code
   ```markdown
   ❌ Don't: Show only snippets
   ✅ Do: Show imports, complete function, usage
   ```

3. **Error Cases**: Include error handling
   ```typescript
   try {
       // Operation
   } catch (error) {
       console.error('Error:', error);
   }
   ```

4. **Comments**: Explain non-obvious parts
   ```typescript
   // Use meaningful comments
   const config = { rate: 100 }; // Rate in Hz (10-200)
   ```

5. **Realistic Data**: Use realistic values in examples
   ```typescript
   // ✅ Good
   { amplitude: 7.5, frequency: 60, pulseWidth: 300 }

   // ❌ Bad
   { a: 1, f: 1, pw: 1 }
   ```

### Code Example Template

```markdown
### Example: [What This Does]

Here's a complete example of [feature]. This demonstrates [specific concept].

\`\`\`typescript
// Full, runnable code
import { useBluetoothContext } from '@/context/BluetoothContext';

function StreamingComponent() {
    const { configureStream, startStream } = useBluetoothContext();

    const handleStream = async () => {
        await configureStream(100, 'filtered');
        await startStream();
    };

    return (
        <button onPress={handleStream}>
            Start Streaming
        </button>
    );
}
\`\`\`

**What this does**:
- Line 1-2: Import necessary hooks
- Line 4-7: Define component with streaming logic
- Line 9-10: Create event handler
- Line 12-15: Render UI

**Key points**:
- `configureStream()` must be called before `startStream()`
- Streaming rate limited by Bluetooth baud rate (9600 default)
- See [STREAMING_IMPLEMENTATION.md](STREAMING_IMPLEMENTATION.md) for details
```

---

## Cross-References

### Internal Cross-References (Same Project)

```markdown
# Link to adjacent file
[Streaming Documentation](STREAMING_IMPLEMENTATION.md)
[Bluetooth Protocol](../api/BLUETOOTH_COMMANDS.md)

# Link to parent/sibling directories
[Setup Guide](../setup/QUICK_START.md)
[Architecture](../architecture/BLUETOOTH_PROTOCOL.md)
```

### External Cross-References (Other Projects)

```markdown
# Link to device firmware documentation
[Device Protocol Reference](../../InteroperableResearchsEMGDevice/CLAUDE.md)

# Link to backend documentation
[Backend Architecture](../../InteroperableResearchNode/CLAUDE.md)

# Link to external resources
[React Native Bluetooth Library](https://github.com/kenjdavidson/react-native-bluetooth-classic)
```

### Reference Sections

Every document should include a "See Also" section:

```markdown
## See Also

- [Related Document 1](RELATED1.md) - Why it's related
- [Related Document 2](RELATED2.md) - Why it's related
- [Device Protocol](../../InteroperableResearchsEMGDevice/CLAUDE.md) - Device communication reference
```

---

## Review Process

### Before Publishing Documentation

1. **Self-Review Checklist**
   - [ ] Content is accurate and up-to-date with code
   - [ ] Language is English throughout
   - [ ] Audience is clearly defined
   - [ ] Examples are tested and correct
   - [ ] Cross-references are valid

2. **Technical Accuracy**
   - [ ] Code examples run without errors
   - [ ] API references match actual implementation
   - [ ] Architecture diagrams are correct
   - [ ] Performance numbers are realistic

3. **Format and Style**
   - [ ] File naming follows UPPERCASE_SNAKE_CASE
   - [ ] Placed in appropriate subdirectory
   - [ ] Markdown formatting is clean
   - [ ] Links are relative and valid

4. **Completeness**
   - [ ] Purpose is clear in first paragraph
   - [ ] Examples are provided
   - [ ] Related documentation is linked
   - [ ] Troubleshooting section included (if applicable)

### Version Control Practices

```bash
# Good commit messages for documentation
git commit -m "docs: Add TYPESCRIPT_PATTERNS guide with examples"
git commit -m "docs: Update BLUETOOTH_SETUP with new permissions"
git commit -m "docs: Reorganize setup/ directory structure"

# Avoid
git commit -m "doc update"
git commit -m "Fixed typo"  # Include file name
```

### Documentation Updates

- Document significant changes in related `.md` files
- Include date in format: "**Last Updated**: 2025-10-17"
- Link old documentation to new if renamed
- Keep changelog in `README.md` if frequently updated

---

## Summary of Key Guidelines

| Aspect | Standard |
|--------|----------|
| **Language** | English only |
| **Location** | `/docs` directory at project root |
| **File Names** | `UPPERCASE_SNAKE_CASE` |
| **Structure** | Clear hierarchy with README indices |
| **Audience** | Developers, AI assistants, researchers |
| **Content** | Current, accurate, with examples |
| **Format** | Markdown with consistent styling |
| **Links** | Relative paths, prefer internal links |
| **Reviews** | Self-review checklist before publishing |

---

## Questions?

For questions about these guidelines, refer to:
- `docs/README.md` - Documentation index
- `../CLAUDE.md` - Project context for Claude Code
- Existing documentation in `docs/` for examples

**Document Version**: 1.0
**Last Updated**: 2025-10-17
