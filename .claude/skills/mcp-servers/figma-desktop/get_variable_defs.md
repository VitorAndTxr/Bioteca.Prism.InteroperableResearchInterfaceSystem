# get_variable_defs

Extract design tokens and variables from Figma file.

## Parameters

None (uses currently open file)

## Returns

Design tokens including:
- Color styles and variables
- Text styles (fonts, sizes, weights)
- Spacing and layout variables
- Effects (shadows, blur)

## Example

```typescript
mcp__figma-desktop__get_variable_defs({})
```

## Use Cases

- Building design system tokens
- Ensuring color consistency
- Extracting typography scales
- Generating CSS custom properties

## REST API Alternative

```bash
node .claude/skills/figma-desktop/scripts/get-variable-defs.js xFC8eCJcSwB9EyicTmDJ7w
```
