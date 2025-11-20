# Playwright Automation Scripts

Browser automation scripts for the IRIS project using Playwright with persistent browser state.

## Quick Start

```bash
# Install dependencies
npm install

# Install browser
npm run install-browsers

# Test it works
node navigate.js "https://google.com"
node snapshot.js
node screenshot.js "test.png"
node close.js
```

## Usage Pattern

1. **Navigate** to a page
2. **Snapshot** to discover element refs
3. **Interact** using refs
4. **Capture** screenshots or data
5. **Close** when done

## Complete Example: Login Flow

```bash
# 1. Navigate to login page
node navigate.js "http://localhost:5173/login"

# 2. Get element references
node snapshot.js
# Output:
# - textbox "Email" [ref=ref1]
# - textbox "Password" [ref=ref2]
# - button "Login" [ref=ref3]

# 3. Fill the form
node fill-form.js '{"fields": [{"ref": "ref1", "value": "user@example.com"}, {"ref": "ref2", "value": "secret123"}]}'

# 4. Click login button
node click.js ref3

# 5. Wait for dashboard
node wait-for.js "[data-testid='dashboard']" 10000

# 6. Take screenshot of result
node screenshot.js "logged-in.png"

# 7. Close browser
node close.js
```

## Complete Example: Search Google

```bash
# Navigate
node navigate.js "https://google.com"

# Find search box
node snapshot.js

# Type search query
node type.js "PRISM biomedical research" ref1

# Press Enter
node press-key.js "Enter"

# Wait for results
node wait.js 2000

# Screenshot results
node screenshot.js "search-results.png" --full

# Close
node close.js
```

## Scripts Reference

| Script | Arguments | Description |
|--------|-----------|-------------|
| `navigate.js` | `<url>` | Navigate to URL |
| `snapshot.js` | | Get accessibility tree with refs |
| `click.js` | `<ref>` | Click element |
| `type.js` | `<text> [ref]` | Type text |
| `fill-form.js` | `<json>` | Fill multiple fields |
| `press-key.js` | `<key>` | Press keyboard key |
| `hover.js` | `<ref>` | Hover over element |
| `select-option.js` | `<ref> <value>` | Select dropdown |
| `wait.js` | `<ms>` | Wait milliseconds |
| `wait-for.js` | `<selector> [timeout]` | Wait for selector |
| `screenshot.js` | `[filename] [--full]` | Take screenshot |
| `pdf-save.js` | `[filename]` | Save as PDF |
| `evaluate.js` | `<script>` | Run JavaScript |
| `go-back.js` | | Browser back |
| `go-forward.js` | | Browser forward |
| `close.js` | | Close browser |
| `generate-test.js` | `[testName]` | Generate test code |

## Tips

### Keyboard Keys
```bash
node press-key.js "Enter"
node press-key.js "Tab"
node press-key.js "Escape"
node press-key.js "Control+a"
node press-key.js "ArrowDown"
```

### Full Page Screenshot
```bash
node screenshot.js "full-page.png" --full
```

### Execute Custom JavaScript
```bash
node evaluate.js "document.title"
node evaluate.js "document.querySelectorAll('button').length"
node evaluate.js "localStorage.getItem('token')"
```

### Fill Multiple Form Fields
```bash
node fill-form.js '{"fields": [
  {"ref": "ref1", "value": "John Doe"},
  {"ref": "ref2", "value": "john@example.com"},
  {"ref": "ref3", "value": "password123"}
]}'
```

## State Files

The scripts create these state files (auto-managed):

- `.browser-state.json` - Current URL and title
- `.element-refs.json` - Element references from last snapshot
- `.storage-state.json` - Browser cookies and storage

To reset everything:
```bash
node close.js
```

## Troubleshooting

### "Ref not found"
Run `snapshot.js` again. Refs expire after page changes.

### Browser won't open
```bash
npm run install-browsers
```

### Scripts hang
Check for popups/dialogs in the browser window.

## Architecture

```
scripts/
├── browser-controller.js  # Main controller (singleton)
├── utils/
│   ├── state-manager.js   # Manages refs and state files
│   └── output-formatter.js # JSON output formatting
├── navigate.js            # Navigation script
├── snapshot.js            # Element discovery
├── click.js              # Click interactions
├── type.js               # Text input
├── fill-form.js          # Form filling
├── press-key.js          # Keyboard input
├── hover.js              # Mouse hover
├── select-option.js      # Dropdown selection
├── wait.js               # Timed wait
├── wait-for.js           # Conditional wait
├── screenshot.js         # Screenshot capture
├── pdf-save.js           # PDF export
├── evaluate.js           # JavaScript execution
├── go-back.js            # History back
├── go-forward.js         # History forward
├── close.js              # Browser cleanup
└── generate-test.js      # Test code generation
```
