# browser_fill_form

Fill multiple form fields at once.

**Access**: `mcp__playwright__browser_fill_form`

## Parameters

- `fields` (array, required): Array of field objects containing:
  - `name` (string): Human-readable field name
  - `ref` (string): Element reference from snapshot
  - `type` (string): Field type - "textbox", "checkbox", "radio", "combobox", "slider"
  - `value` (string): Value to fill (true/false for checkbox, option text for combobox)

## Returns

Success/failure status for each field

## Errors

- Field not found
- Invalid field type
- Invalid value for field type

## Example

```typescript
mcp__playwright__browser_fill_form({
  fields: [
    { name: "Email", ref: "email1", type: "textbox", value: "user@example.com" },
    { name: "Subscribe", ref: "check1", type: "checkbox", value: "true" },
    { name: "Country", ref: "select1", type: "combobox", value: "United States" }
  ]
})
```
