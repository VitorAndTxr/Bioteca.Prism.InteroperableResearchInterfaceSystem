# IRIS Documentation Hub

**Interoperable Research Interface System** - React Native application for PRISM sEMG/FES device control and biosignal visualization.

> This documentation hub provides comprehensive guides, references, and resources for developing, deploying, and maintaining IRIS. All documentation follows the standards defined in [DOCUMENTATION_GUIDELINES.md](DOCUMENTATION_GUIDELINES.md).

## 📚 Documentation Sections

### Setup & Getting Started

Essential setup and configuration for developers getting started with IRIS:

- **[setup/QUICK_START.md](setup/QUICK_START.md)** - 5-minute setup to get IRIS running locally
- **[setup/BLUETOOTH_SETUP.md](setup/BLUETOOTH_SETUP.md)** - Complete guide to integrating `react-native-bluetooth-classic` with Expo
- **[setup/ENVIRONMENT_SETUP.md](setup/ENVIRONMENT_SETUP.md)** - Environment variables and configuration

### Architecture & Design

System design, component architecture, and protocol specifications:

- **[architecture/ARCHITECTURE_OVERVIEW.md](architecture/ARCHITECTURE_OVERVIEW.md)** - High-level system design and component relationships
- **[architecture/BLUETOOTH_PROTOCOL.md](architecture/BLUETOOTH_PROTOCOL.md)** - Complete Bluetooth protocol specification (all 15 message codes)
- **[architecture/STATE_MANAGEMENT.md](architecture/STATE_MANAGEMENT.md)** - React Context and state management patterns
- **[architecture/COMPONENT_STRUCTURE.md](architecture/COMPONENT_STRUCTURE.md)** - Component hierarchy and file organization

### Development Guides

Comprehensive guides for implementing features and following project standards:

- **[development/DEVELOPMENT_GUIDE.md](development/DEVELOPMENT_GUIDE.md)** - Main development guide with workflow and best practices
- **[development/CODE_PATTERNS.md](development/CODE_PATTERNS.md)** - Reusable code patterns and architectural patterns
- **[development/TYPESCRIPT_PATTERNS.md](development/TYPESCRIPT_PATTERNS.md)** - TypeScript best practices and type definitions
- **[development/TESTING_GUIDE.md](development/TESTING_GUIDE.md)** - Manual and automated testing strategies

### API Reference

Technical API documentation:

- **[api/BLUETOOTH_COMMANDS.md](api/BLUETOOTH_COMMANDS.md)** - Complete Bluetooth message codes and protocol
- **[api/CONTEXT_API.md](api/CONTEXT_API.md)** - BluetoothContext hooks and state management API
- **[api/HOOKS_REFERENCE.md](api/HOOKS_REFERENCE.md)** - Custom React hooks documentation

### Feature Documentation

Feature-specific implementation guides:

- **[features/STREAMING.md](features/STREAMING.md)** - Real-time sEMG data streaming with charts
- **[features/FES_SESSION_CONTROL.md](features/FES_SESSION_CONTROL.md)** - FES (Functional Electrical Stimulation) session management
- **[features/DEVICE_CONNECTION.md](features/DEVICE_CONNECTION.md)** - Bluetooth device discovery and connection

### Implementation Details

Detailed technical documentation of implemented features:

- **[implementation/IMPLEMENTATION_SUMMARY.md](implementation/IMPLEMENTATION_SUMMARY.md)** - Overview of all implemented features and current status
- **[implementation/STREAMING_IMPLEMENTATION.md](implementation/STREAMING_IMPLEMENTATION.md)** - Complete guide to sEMG streaming implementation (codes 11-14)

### Troubleshooting

Problem-solving guides and common issues:

- **[troubleshooting/COMMON_ISSUES.md](troubleshooting/COMMON_ISSUES.md)** - FAQ and common problems with solutions
- **[troubleshooting/DEBUGGING_GUIDE.md](troubleshooting/DEBUGGING_GUIDE.md)** - Debugging techniques and tools
- **[troubleshooting/ANDROID_ISSUES.md](troubleshooting/ANDROID_ISSUES.md)** - Android-specific problems and fixes
- **[troubleshooting/WINDOWS_LONG_PATH_FIX.md](troubleshooting/WINDOWS_LONG_PATH_FIX.md)** - Enabling long path support on Windows

### Deployment

Production build and deployment guides:

- **[deployment/PRODUCTION_BUILD.md](deployment/PRODUCTION_BUILD.md)** - Building production APKs and AABs
- **[deployment/EAS_BUILD.md](deployment/EAS_BUILD.md)** - Using Expo Application Services for builds
- **[deployment/APK_DISTRIBUTION.md](deployment/APK_DISTRIBUTION.md)** - Distributing APKs to testers and production

---

## 🚀 Quick Navigation

### For New Developers

1. Start here: **[setup/QUICK_START.md](setup/QUICK_START.md)** - Get IRIS running in 5 minutes
2. Then read: **[architecture/ARCHITECTURE_OVERVIEW.md](architecture/ARCHITECTURE_OVERVIEW.md)** - Understand the design
3. Reference: **[development/CODE_PATTERNS.md](development/CODE_PATTERNS.md)** - Learn how to code in IRIS
4. When stuck: **[troubleshooting/COMMON_ISSUES.md](troubleshooting/COMMON_ISSUES.md)** - Find solutions

### For Feature Implementation

1. Check: **[implementation/IMPLEMENTATION_SUMMARY.md](implementation/IMPLEMENTATION_SUMMARY.md)** - What's already done?
2. Design: **[architecture/](architecture/)** - Review relevant architecture
3. Implement: **[development/DEVELOPMENT_GUIDE.md](development/DEVELOPMENT_GUIDE.md)** - Follow development practices
4. Test: **[development/TESTING_GUIDE.md](development/TESTING_GUIDE.md)** - Write and run tests
5. Deploy: **[deployment/PRODUCTION_BUILD.md](deployment/PRODUCTION_BUILD.md)** - Build for production

### For AI Assistants (Claude Code)

- **Primary guidance**: [../CLAUDE.md](../CLAUDE.md) - Project context and structure
- **Documentation standards**: [DOCUMENTATION_GUIDELINES.md](DOCUMENTATION_GUIDELINES.md) - How to write docs
- **Device protocol**: [../../InteroperableResearchsEMGDevice/CLAUDE.md](../../InteroperableResearchsEMGDevice/CLAUDE.md) - Device communication
- **Backend reference**: [../../InteroperableResearchNode/CLAUDE.md](../../InteroperableResearchNode/CLAUDE.md) - Research Node API

### For Project Maintainers

1. Check status: **[implementation/IMPLEMENTATION_SUMMARY.md](implementation/IMPLEMENTATION_SUMMARY.md)** - What's complete?
2. Review architecture: **[architecture/ARCHITECTURE_OVERVIEW.md](architecture/ARCHITECTURE_OVERVIEW.md)** - Is design sound?
3. Understand deployment: **[deployment/](deployment/)** - Build and release process
4. Follow standards: **[DOCUMENTATION_GUIDELINES.md](DOCUMENTATION_GUIDELINES.md)** - Enforce doc quality

---

## 📖 Key Concepts

### Bluetooth Protocol

IRIS communicates with the ESP32 NeuroEstimulator device using a JSON-based protocol:

```json
{
  "cd": <number>,    // Message code (0-14)
  "mt": "<string>",  // Method: 'r', 'w', 'x', 'a'
  "bd": <object>     // Optional body with parameters
}
```

**All 15 Message Codes**:
| Code | Name | Purpose |
|------|------|---------|
| 0-10 | Device Control | Gyroscope, FES sessions, parameters |
| 11-14 | Data Streaming | Real-time sEMG data acquisition |

See **[api/BLUETOOTH_COMMANDS.md](api/BLUETOOTH_COMMANDS.md)** for complete reference.

### Real-Time Streaming

Features:
- Configurable sampling rates (10-200 Hz)
- Multiple data types (raw, filtered, RMS)
- Live chart visualization
- Circular buffer (max 1000 packets)

See **[features/STREAMING.md](features/STREAMING.md)** for details.

### Architecture Layers

```
UI Layer (React Components)
    ↓
BluetoothContext (Global State)
    ↓
Bluetooth Module (react-native-bluetooth-classic)
    ↓
ESP32 Device (NeuroEstimulator)
```

See **[architecture/COMPONENT_STRUCTURE.md](architecture/COMPONENT_STRUCTURE.md)** for details.

---

## 📋 Contributing & Standards

### Before Writing Documentation

1. **Read guidelines**: [DOCUMENTATION_GUIDELINES.md](DOCUMENTATION_GUIDELINES.md)
2. **Choose category**: Setup? Architecture? Feature?
3. **Follow naming**: `UPPERCASE_SNAKE_CASE` for filenames
4. **Write in English**: All documentation in English
5. **Include examples**: Code examples with explanations

### Documentation Quality Checklist

- [ ] Placed in appropriate `/docs` subdirectory
- [ ] Filename in `UPPERCASE_SNAKE_CASE`
- [ ] Purpose is clear in first paragraph
- [ ] Audience is defined (developers/AI/researchers)
- [ ] Code examples are tested
- [ ] Cross-references to related docs
- [ ] "Last Updated" date included
- [ ] Reviewed for clarity and accuracy

### Adding New Documentation

```bash
# 1. Create file in appropriate directory
touch docs/features/NEW_FEATURE.md

# 2. Write using guidelines
# - Follow DOCUMENTATION_GUIDELINES.md
# - Use existing files as templates

# 3. Update directory README if needed
# - Add link to docs/features/README.md

# 4. Update main README
# - Add link to this README.md (current file)

# 5. Commit
git add docs/features/NEW_FEATURE.md
git commit -m "docs: Add NEW_FEATURE documentation"
```

---

## 📊 Documentation Statistics

- **Total Documents**: 25+
- **Coverage**: Architecture, development, API, features, troubleshooting, deployment
- **Last Updated**: 2025-10-17
- **Language**: English
- **Format**: Markdown
- **Standards**: See [DOCUMENTATION_GUIDELINES.md](DOCUMENTATION_GUIDELINES.md)

---

## 🔗 Related Projects

- **Device Firmware**: [../../InteroperableResearchsEMGDevice/CLAUDE.md](../../InteroperableResearchsEMGDevice/CLAUDE.md) - ESP32 device documentation
- **Backend Node**: [../../InteroperableResearchNode/CLAUDE.md](../../InteroperableResearchNode/CLAUDE.md) - Research Node API
- **Main README**: [../README.md](../README.md) - Project overview
- **PRISM Overview**: [../../CLAUDE.md](../../CLAUDE.md) - Master project documentation

---

## ❓ Questions?

- **How do I find documentation on a topic?** → Use the search above or browse categories
- **How do I write new documentation?** → Read [DOCUMENTATION_GUIDELINES.md](DOCUMENTATION_GUIDELINES.md)
- **Where should I place my documentation?** → Choose the appropriate subdirectory based on type
- **What if I can't find what I need?** → Check [troubleshooting/COMMON_ISSUES.md](troubleshooting/COMMON_ISSUES.md)

---

**IRIS Documentation Hub**
Last Updated: 2025-10-17
Version: 1.0
