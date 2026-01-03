# MCP Vibe UI Restructure

This document explains the architectural changes made to mcp-vibe-ui
and the reasoning behind each decision.

## Why Restructure?

The original implementation had several issues:

1. **No caching** - Every tool call read all 15 JSON files from disk
2. **Duplicate code** - `list_designs()` and `list_full_designs()`
   were nearly identical
3. **Weak intent matching** - Simple word-in-set matching that missed
   partial matches (e.g., "glass" wouldn't find "glassmorphic")
4. **Mixed concerns** - Validation, file I/O, and search logic all in
   one file
5. **DaisyUI-specific** - Output format was DaisyUI CSS vars, but most
   LLM-generated UI uses raw Tailwind

## Format Change: DaisyUI to Tailwind

### The Problem

Modern LLM UI generation (v0, Bolt, Lovable) outputs React +
Tailwind + shadcn/ui. DaisyUI's value is pre-styled components, but
LLMs generate custom markup anyway. The abstraction didn't save much.

### The Solution

Changed from DaisyUI CSS variables:

```json
{
	"daisyThemeVars": {
		"--color-primary": "oklch(65% 0.28 330)",
		"--radius-box": "0.5rem"
	}
}
```

To Tailwind config format:

```json
{
	"tailwind": {
		"colors": {
			"primary": "oklch(65% 0.28 330)"
		},
		"borderRadius": {
			"box": "0.5rem"
		},
		"fontFamily": {
			"display": ["Orbitron", "Consolas", "monospace"]
		}
	},
	"fonts": [
		{ "package": "@fontsource/orbitron", "weights": [400, 700, 900] }
	]
}
```

LLMs can now drop the `tailwind` object directly into
`tailwind.config.js` and use `bg-primary`, `rounded-box`,
`font-display` in generated code.

## File Structure Changes

### Before

```
src/
├── index.ts              # Server + tools + CSS builder
└── lib/
    └── token_store.ts    # Everything else
```

### After

```
src/
├── index.ts              # Server setup + tool registration only
└── lib/
    ├── schemas.ts        # Valibot validation schemas
    ├── cache.ts          # In-memory cache, loads once on startup
    ├── search.ts         # Name lookup + intent matching
    ├── config-builder.ts # Tailwind config generation
    └── response.ts       # MCP response formatting helpers
```

### Reasoning

- **schemas.ts** - Single source of truth for the token format. Easy
  to update when adding new fields.
- **cache.ts** - Eliminates redundant file reads. All 15 themes loaded
  once on startup, stored in a Map for O(1) lookup.
- **search.ts** - Separated search logic allows for improved matching
  algorithms without touching other code.
- **config-builder.ts** - Isolates Tailwind-specific output
  formatting.
- **response.ts** - DRY principle for MCP response wrapping.

## Tool Changes

### Renamed

| Old Name              | New Name        |
| --------------------- | --------------- |
| `tokens_list-designs` | `tokens_list`   |
| `tokens_by-name`      | `tokens_get`    |
| `tokens_by-intent`    | `tokens_search` |

Consistent naming, no mixed underscore/hyphen.

### Removed

- `tokens_help` - Redundant. Tool descriptions already contain usage
  info, parameters, and output format. LLMs read these natively.

## Improved Intent Matching

### Before

```typescript
// Only matched exact words in tags
const hay = new Set([...d.tags.map(normalize_name)]);
const score = words.reduce((acc, w) => acc + (hay.has(w) ? 2 : 0), 0);
```

"glass" would NOT match "glassmorphic" because it's not an exact
match.

### After

```typescript
// Substring matching against all searchable text
const searchable = [
	design.id,
	design.name,
	...design.aliases,
	...design.tags,
	design.metadata?.description || '',
]
	.join(' ')
	.toLowerCase();

for (const word of words) {
	if (searchable.includes(word)) {
		// Exact tag/alias matches score higher
		const exact_match = design.tags.some(
			(t) => t.toLowerCase() === word,
		);
		score += exact_match ? 3 : 1;
	}
}
```

Now "glass" matches "glassmorphic" (score 1), and "frosted" matches
exactly (score 3).

## Caching

### Before

Every tool call triggered:

1. `fs.readdir()` to list files
2. `fs.readFile()` for each JSON file
3. `JSON.parse()` + validation for each file

For `tokens_search`, this meant reading all 15 files on every request.

### After

```typescript
// Called once on server startup
export async function init_cache(): Promise<void> {
	// Load all files once, validate, store in Map
	cache.set(design.id, design);
}

// O(1) lookup
export function get_by_id(id: string): DesignRecord | undefined {
	return cache.get(id);
}
```

Server startup logs: `[mcp-vibe-ui] Loaded 15 designs`

## Error Logging

### Before

```typescript
} catch {
  // skip invalid entries
}
```

Silent failures. Invalid themes disappeared with no trace.

### After

```typescript
} catch (err) {
  console.error(`[mcp-vibe-ui] Failed to load ${entry}:`, err);
}
```

Validation errors now visible in stderr for debugging.

## Output Format

### tokens_get / tokens_search Response

```json
{
  "id": "cyberpunk",
  "name": "Cyberpunk",
  "tags": ["neon", "dark", "futuristic"],
  "tailwind": {
    "colors": { "primary": "oklch(65% 0.28 330)", ... },
    "borderRadius": { "box": "0.5rem", ... },
    "fontFamily": { "display": ["Orbitron", ...] }
  },
  "tailwindConfig": "// Tailwind config for Cyberpunk\n// Add to tailwind.config.js: theme.extend\n{...}",
  "fonts": [
    { "package": "@fontsource/orbitron", "weights": [400, 700, 900], "variable": true }
  ],
  "extended": { ... },
  "notes": "Use neon glow effects sparingly for performance."
}
```

The `tailwindConfig` field is a ready-to-paste string that LLMs can
directly insert into the user's config file.

## Migration Notes

If you were using the old `daisyThemeVars` format:

1. `--color-*` variables are now in `tailwind.colors` without the
   prefix
2. `--radius-*` variables are now in `tailwind.borderRadius`
3. Font stacks are now in `tailwind.fontFamily`
4. Fontsource packages are in the top-level `fonts` array

The `extended` object with effects, animations, and layout hints
remains unchanged.
