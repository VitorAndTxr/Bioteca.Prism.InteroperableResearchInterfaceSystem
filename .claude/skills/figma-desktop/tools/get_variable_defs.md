# get_variable_defs

Extract design tokens and variables from Figma file.

## Parameters

None (uses file key)

## Returns

Design tokens including:
- Color styles and variables
- Text styles (fonts, sizes, weights)
- Spacing and layout variables
- Effects (shadows, blur)

## REST API Script

```bash
node .claude/skills/figma-desktop/scripts/get-variable-defs.js xFC8eCJcSwB9EyicTmDJ7w
```

## MCP Tool (when Figma Desktop running)

```typescript
mcp__figma-desktop__get_variable_defs({})
```

## Use Cases

- Building design system tokens
- Ensuring color consistency
- Extracting typography scales
- Generating CSS custom properties

## Notes

Both REST API script and MCP tool provide equivalent functionality.
