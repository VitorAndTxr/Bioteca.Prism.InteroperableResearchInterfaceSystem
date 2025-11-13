# Playwright MCP Server

**Purpose**: Browser automation and testing with accessibility-focused snapshots

**Integration**: Native Claude Code MCP integration via `mcp__playwright__*` tools

**Setup**: No additional setup required - already integrated with Claude Code

## Tools: 21

| Tool | Description | File |
|------|-------------|------|
| browser_close | Close the browser page | `browser_close.md` |
| browser_resize | Resize browser window dimensions | `browser_resize.md` |
| browser_console_messages | Get all console messages from page | `browser_console_messages.md` |
| browser_handle_dialog | Accept or dismiss browser dialogs | `browser_handle_dialog.md` |
| browser_evaluate | Execute JavaScript in page context | `browser_evaluate.md` |
| browser_file_upload | Upload files via file input elements | `browser_file_upload.md` |
| browser_fill_form | Fill multiple form fields at once | `browser_fill_form.md` |
| browser_install | Install browser specified in config | `browser_install.md` |
| browser_press_key | Press keyboard keys | `browser_press_key.md` |
| browser_type | Type text into editable elements | `browser_type.md` |
| browser_navigate | Navigate to a URL | `browser_navigate.md` |
| browser_navigate_back | Go back to previous page | `browser_navigate_back.md` |
| browser_network_requests | Get all network requests since page load | `browser_network_requests.md` |
| browser_take_screenshot | Take PNG/JPEG screenshot of page or element | `browser_take_screenshot.md` |
| browser_snapshot | Capture accessibility snapshot (preferred over screenshot) | `browser_snapshot.md` |
| browser_click | Perform click actions with modifiers | `browser_click.md` |
| browser_drag | Drag and drop between elements | `browser_drag.md` |
| browser_hover | Hover over elements | `browser_hover.md` |
| browser_select_option | Select dropdown options | `browser_select_option.md` |
| browser_tabs | List, create, close, or select tabs | `browser_tabs.md` |
| browser_wait_for | Wait for text appearance/disappearance or time | `browser_wait_for.md` |

## Common Use Cases

### Testing User Flows
1. Navigate to URL with `browser_navigate`
2. Fill forms with `browser_fill_form`
3. Click buttons with `browser_click`
4. Capture results with `browser_snapshot`

### Visual Debugging
1. Take screenshots with `browser_take_screenshot`
2. Check console logs with `browser_console_messages`
3. Inspect network traffic with `browser_network_requests`

### Automated Data Extraction
1. Navigate to target page
2. Execute custom scripts with `browser_evaluate`
3. Extract structured data from accessibility tree

## Key Features

- **Accessibility-First**: `browser_snapshot` provides structured data for actions
- **Screenshot Capability**: Both viewport and full-page screenshots
- **Element Interactions**: Click, type, hover, drag with precise targeting
- **Network Monitoring**: Track all HTTP requests/responses
- **Multi-Tab Support**: Manage multiple browser tabs
- **File Operations**: Upload files via file inputs

## Best Practices

1. **Prefer snapshots over screenshots** for element selection
2. **Use ref attributes** from snapshots for precise element targeting
3. **Handle dialogs proactively** to prevent workflow blocking
4. **Wait for elements** before interaction to avoid timing issues
5. **Check console messages** for runtime errors

---

**Documentation Source**: Claude Code MCP integration
**Last Updated**: November 12, 2025
