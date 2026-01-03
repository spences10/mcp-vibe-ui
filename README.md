# MCP Vibe UI

A **Model Context Protocol (MCP)** server providing design tokens as
resources for LLM-powered UI generation. Themes are exposed as MCP
resources with Tailwind v4 CSS, patterns, and extended styling data.

## What This Does

When an LLM needs to generate themed UI:

1. **Search by intent** - `theme_search("dark futuristic neon")` finds
   matching theme
2. **Get theme data** - Tailwind v4 `@theme` CSS block, patterns,
   fonts, effects
3. **Generate code** - LLM uses the tokens to create consistent,
   styled components

## Available Themes (15)

| Theme                   | Description                              | Tags                     |
| ----------------------- | ---------------------------------------- | ------------------------ |
| **Claymorphic**         | Soft, puffy elements with pastel colors  | soft, pastel, rounded    |
| **Cyberpunk**           | Dark backgrounds with neon accents       | neon, dark, futuristic   |
| **Editorial**           | Magazine-inspired typography layouts     | clean, classic, print    |
| **Flat**                | Clean, minimal design with bright colors | minimal, flat, no-shadow |
| **Glassmorphic**        | Frosted glass effects and translucency   | frosted, translucent     |
| **Industrial**          | Utility-focused with warning accents     | utility, gritty, bold    |
| **Japanese Minimalist** | Zen aesthetics with natural tones        | minimal, calm, balanced  |
| **Monochrome**          | Strict grayscale with single accent      | grayscale, neutral       |
| **Neu-Brutalist**       | Bold, high-contrast with raw aesthetics  | bold, high-contrast      |
| **Neumorphic**          | Soft, tactile surfaces with shadows      | soft, shadowed           |
| **Organic Flow**        | Natural, fluid shapes and curves         | natural, rounded, green  |
| **Pixel Art**           | Retro, blocky aesthetic                  | retro, blocky            |
| **Retro Futurism**      | 80s-inspired neon and chrome             | neon, vaporwave          |
| **Typographic**         | Text-focused with grid systems           | content-first, readable  |
| **Wireframe**           | Blueprint-style skeletal elements        | skeletal, blueprint      |

## Installation

```json
{
	"mcpServers": {
		"mcp-vibe-ui": {
			"command": "node",
			"args": ["/path/to/mcp-vibe-ui/dist/index.js"]
		}
	}
}
```

```bash
npm install
npm run build
```

## API

### Resources

Themes are exposed as MCP resources:

```
theme://cyberpunk
theme://glassmorphic
theme://neumorphic
...
```

Use `resources/list` to get all available themes, `resources/read` to
get theme data.

### Tool: theme_search

Find theme by intent description:

```json
{
	"name": "theme_search",
	"arguments": {
		"intent": "dark futuristic neon"
	}
}
```

Returns:

```json
{
  "id": "cyberpunk",
  "name": "Cyberpunk",
  "uri": "theme://cyberpunk",
  "tags": ["neon", "dark", "futuristic"],
  "css": "@theme {\n  --color-background: oklch(12% 0.03 300);\n  ...\n}",
  "patterns": {
    "surface": "bg-background text-foreground",
    "glow": "shadow-[0_0_20px_var(--color-primary)]"
  },
  "fonts": [...],
  "extended": {...},
  "notes": "..."
}
```

## Theme Structure

Each theme provides:

### Tailwind v4 CSS

```css
@theme {
	--color-background: oklch(12% 0.03 300);
	--color-foreground: oklch(95% 0.02 300);
	--color-primary: oklch(65% 0.28 330);
	--color-primary-foreground: oklch(98% 0.01 330);
	--color-muted: oklch(16% 0.03 300);
	--color-accent: oklch(72% 0.28 190);
	--color-destructive: oklch(62% 0.3 25);

	--radius-sm: 0.25rem;
	--radius-md: 0.25rem;
	--radius-lg: 0.5rem;

	--font-display: 'Orbitron', monospace;
	--font-body: 'Exo 2', sans-serif;
}

/* Animations */
@keyframes neon-pulse {
	0% {
		opacity: 1;
		filter: brightness(1);
	}
	100% {
		opacity: 0.8;
		filter: brightness(1.2);
	}
}
```

### Patterns

Ready-to-use Tailwind class strings:

```json
{
	"patterns": {
		"surface": "bg-background text-foreground",
		"card": "bg-muted rounded-lg border border-border",
		"glow": "shadow-[0_0_20px_var(--color-primary)]",
		"neon-text": "text-primary drop-shadow-[0_0_10px_var(--color-primary)]"
	}
}
```

### Extended

Theme-specific effects, animations, and values:

```json
{
	"extended": {
		"effects": { "shadow": "...", "glow": "...", "blur": "..." },
		"animations": { "enter": "...", "hover": "...", "press": "..." },
		"keyframes": { "neon-pulse": "0% { ... } 100% { ... }" },
		"surfaces": {
			"raised": "...",
			"sunken": "...",
			"overlay": "..."
		},
		"themeSpecific": {
			/* unique to this theme */
		}
	}
}
```

### Fonts

Fontsource packages for easy installation:

```json
{
	"fonts": [
		{
			"package": "@fontsource/orbitron",
			"weights": [400, 700, 900],
			"variable": true
		}
	]
}
```

## Usage Example

```
Human: "Create a cyberpunk-themed login form with neon glow effects"

LLM: *calls theme_search("dark futuristic neon")*
     *receives Cyberpunk theme with CSS, patterns, fonts*

     *generates:*
     - Injects @theme CSS block
     - Uses `bg-background text-foreground` for surface
     - Applies `shadow-[0_0_20px_var(--color-primary)]` for glow
     - Uses `font-display` for headings
     - Includes @keyframes for neon-pulse animation
```

## Color Naming

Colors use Tailwind v4 semantic naming:

| Name                         | Purpose                 |
| ---------------------------- | ----------------------- |
| `background`                 | Page/app background     |
| `foreground`                 | Primary text color      |
| `muted`                      | Secondary backgrounds   |
| `muted-foreground`           | Secondary text          |
| `border`                     | Borders and dividers    |
| `primary`                    | Primary actions/accents |
| `primary-foreground`         | Text on primary         |
| `secondary`                  | Secondary actions       |
| `accent`                     | Highlights              |
| `destructive`                | Error/danger states     |
| `info`, `success`, `warning` | Status colors           |

## Development

```
src/
├── index.ts              # MCP server + resources + tool
├── lib/
│   ├── schemas.ts        # Valibot validation schemas
│   ├── cache.ts          # Theme cache (loads on startup)
│   ├── search.ts         # Intent matching
│   ├── css-builder.ts    # Tailwind v4 @theme generation
│   └── response.ts       # MCP response formatting
└── design-tokens/        # 15 theme JSON files
```

---

**Design tokens for LLM UI generation**
