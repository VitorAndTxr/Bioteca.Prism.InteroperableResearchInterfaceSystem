# Playwright MCP Server

Browser automation for testing and web interaction.

## Available Tools (21)

### Navigation
| Tool | Purpose |
|------|---------|
| browser_navigate | Navigate to URL |
| browser_go_back | Go back in history |
| browser_go_forward | Go forward in history |
| browser_wait_for | Wait for element/network |

### Interaction
| Tool | Purpose |
|------|---------|
| browser_click | Click element |
| browser_type | Type into field |
| browser_fill_form | Fill multiple fields |
| browser_hover | Hover over element |
| browser_press_key | Press keyboard key |
| browser_select_option | Select dropdown option |

### Inspection
| Tool | Purpose |
|------|---------|
| browser_snapshot | Get accessibility tree (preferred) |
| browser_take_screenshot | Capture visual screenshot |
| browser_console_messages | Get console output |
| browser_network_requests | Monitor network |
| browser_evaluate | Execute JavaScript |

### Management
| Tool | Purpose |
|------|---------|
| browser_close | Close browser |
| browser_resize | Resize viewport |
| browser_tab_new | Open new tab |
| browser_tab_select | Switch tabs |
| browser_tab_close | Close tab |
| browser_generate_playwright_test | Generate test code |

## Quick Start

```typescript
// Navigate and interact
mcp__playwright__browser_navigate({ url: "http://localhost:5173" })
mcp__playwright__browser_snapshot({})
mcp__playwright__browser_click({ element: "Login Button", ref: "btn123" })
mcp__playwright__browser_type({ element: "Email input", ref: "input456", text: "user@example.com" })
```

## Best Practice

Always use `browser_snapshot` for element inspection (accessibility tree is more reliable than screenshots for automation).

---
Last Updated: November 2025
