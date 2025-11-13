# browser_evaluate

Evaluate JavaScript expression on page or element.

**Access**: `mcp__playwright__browser_evaluate`

## Parameters

- `function` (string, required): JavaScript function - `() => { /* code */ }` or `(element) => { /* code */ }` with element
- `element` (string, optional): Human-readable element description (requires `ref`)
- `ref` (string, optional): Element reference from snapshot (requires `element`)

## Returns

Result of JavaScript execution

## Errors

- JavaScript execution error
- Element not found
- Browser closed

## Example

```typescript
// Execute page-level script
mcp__playwright__browser_evaluate({
  function: "() => { return document.title; }"
})

// Execute on specific element
mcp__playwright__browser_evaluate({
  function: "(element) => { return element.innerText; }",
  element: "Article content",
  ref: "div123"
})
```
