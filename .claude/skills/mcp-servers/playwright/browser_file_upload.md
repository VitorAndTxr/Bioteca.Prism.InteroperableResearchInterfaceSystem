# browser_file_upload

Upload one or multiple files.

**Access**: `mcp__playwright__browser_file_upload`

## Parameters

- `paths` (array, optional): Absolute paths to files (omit to cancel file chooser)

## Returns

Success status

## Errors

- File not found
- Invalid file path
- No file chooser active

## Example

```typescript
// Upload single file
mcp__playwright__browser_file_upload({
  paths: ["C:/Users/documents/file.pdf"]
})

// Upload multiple files
mcp__playwright__browser_file_upload({
  paths: [
    "C:/Users/documents/file1.pdf",
    "C:/Users/documents/file2.pdf"
  ]
})

// Cancel file chooser
mcp__playwright__browser_file_upload({})
```
