# MCP Vibe UI 🎨

A **Model Context Protocol (MCP)** server that provides AI assistants
with comprehensive design token systems for daisyUI themes. Generate
beautiful, consistent UI designs from natural language descriptions.

## ✨ What is MCP Vibe UI?

MCP Vibe UI bridges the gap between design intent and implementation
by providing LLMs with rich, structured design tokens for 12 distinct
UI aesthetics. Instead of generating generic CSS, AI assistants can
now access curated design systems with:

- **daisyUI v5 compatible** CSS variables
- **Extended design guidance** (typography, animations, effects)
- **Theme-specific color palettes** and visual patterns
- **Implementation notes** and best practices

## 🎭 Available Design Themes

| Theme                      | Description                               | Best For                       |
| -------------------------- | ----------------------------------------- | ------------------------------ |
| **🎨 Claymorphic**         | Soft, puffy elements with pastel colors   | Friendly, approachable apps    |
| **🌊 Cyberpunk**           | Dark backgrounds with neon accents        | Gaming, tech, futuristic UIs   |
| **📰 Editorial**           | Magazine-inspired typography layouts      | Content-heavy applications     |
| **⚡ Flat**                | Clean, minimal design with bright colors  | Modern web applications        |
| **🔮 Glassmorphic**        | Frosted glass effects and translucency    | Premium, modern interfaces     |
| **⚙️ Industrial**          | Utility-focused with warning accents      | Technical, professional tools  |
| **🌸 Japanese Minimalist** | Zen aesthetics with natural tones         | Mindfulness, wellness apps     |
| **⚫ Monochrome**          | Strict grayscale with single accent       | Timeless, professional designs |
| **🏔️ Neu-Brutalist**       | Bold, high-contrast with raw aesthetics   | Statement designs, portfolios  |
| **☁️ Neumorphic**          | Soft, tactile surfaces with shadows       | Touch interfaces, mobile apps  |
| **🌿 Organic Flow**        | Natural, fluid shapes and curves          | Health, lifestyle applications |
| **🎮 Pixel Art**           | Retro, blocky aesthetic with bitmap fonts | Gaming, nostalgic interfaces   |
| **🔮 Retro Futurism**      | 80s-inspired neon and chrome              | Creative, entertainment apps   |
| **📝 Typographic**         | Text-focused with grid systems            | Documentation, reading apps    |
| **📐 Wireframe**           | Blueprint-style skeletal elements         | Prototyping, developer tools   |

## 🚀 Quick Start

### Install as MCP Server

1. **Add to your MCP configuration:**

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

2. **Build the project:**

```bash
npm install
npm run build
```

### Usage Examples

**Get all available themes:**

```javascript
// MCP Tool: tokens_list-designs
// Returns: Array of all 12 themes with IDs, names, and tags
```

**Get specific theme by name:**

```javascript
// MCP Tool: tokens_by-name
// Input: { name: "cyberpunk" }
// Returns: daisyUI variables + extended design guidance
```

**Find theme by design intent:**

```javascript
// MCP Tool: tokens_by-intent
// Input: { intent: "dark futuristic neon" }
// Returns: Best matching theme (cyberpunk) with full tokens
```

## 💡 AI Assistant Integration

### Claude Code Example

```
Human: "Create a cyberpunk-themed login form with neon glow effects"

Assistant: I'll use the cyberpunk theme tokens to create that for you.
*Uses tokens_by-intent with "dark futuristic neon"*

[Creates login form with daisyUI classes + cyberpunk design tokens:
- Neon glow effects from theme.extended.neonGlow
- Orbitron font from theme.extended.typography.fontStacks
- Dark background with magenta/cyan accents
- Glitch animations and scanlines]
```

The AI assistant automatically:

1. **Matches intent** to appropriate theme
2. **Applies design tokens** (colors, fonts, effects)
3. **Uses daisyUI components** with theme variables
4. **Adds theme-specific enhancements** (animations, patterns)

## 🛠️ Design Token Structure

Each theme provides:

### Core daisyUI Variables

```css
[data-theme='cyberpunk'] {
	--color-base-100: oklch(12% 0.03 300);
	--color-primary: oklch(65% 0.28 330);
	--radius-box: 0.5rem;
	/* ... all daisyUI v5 variables */
}
```

### Extended Design Guidance

```json
{
	"typography": {
		"fontStacks": {
			"display": {
				"fontsource": {
					"package": "@fontsource/orbitron",
					"family": "Orbitron",
					"weights": [400, 700, 900],
					"variable": true
				},
				"fallbacks": ["Consolas", "Monaco", "monospace"],
				"css": "Orbitron, Consolas, Monaco, monospace",
				"performance": {
					"fontDisplay": "swap",
					"preload": true,
					"priority": "high"
				}
			}
		}
	},
	"neonColors": {
		"backgrounds": ["#ff006e", "#8338ec", "#3a86ff"],
		"gradients": ["linear-gradient(45deg, #ff006e, #8338ec)"]
	},
	"animations": {
		"neon-pulse": "neon-pulse 2s ease-in-out infinite"
	},
	"notes": "Use neon glow effects sparingly for performance"
}
```

### 📝 Font Integration

Many themes now include **detailed font specifications** with:

- **Fontsource package info** for easy npm installation
- **Weight and style variants** for complete typography systems
- **Fallback chains** for graceful degradation
- **Performance optimization** (preloading, font-display, priority)
- **Variable font support** where available

This enables AI assistants to provide **complete font implementation
guidance**, not just font names.

## 🎯 Use Cases

### For Designers

- **Rapid prototyping** with consistent design systems
- **Design handoff** with detailed token specifications
- **Brand exploration** across different aesthetic directions

### For Developers

- **daisyUI integration** with pre-built theme variables
- **Design consistency** across components and pages
- **Performance optimization** with curated font and color choices

### For AI Assistants

- **Context-aware design** based on user intent
- **Comprehensive styling** beyond basic CSS
- **Best practice guidance** for each design aesthetic

## 🔧 Development

### Project Structure

```
mcp-vibe-ui/
├── src/
│   ├── design-tokens/          # 12 theme JSON files
│   ├── lib/token_store.ts     # Token management logic
│   └── index.ts               # MCP server implementation
├── dist/                      # Compiled output
└── prompts.md                 # Original design prompts
```

### Build & Run

```bash
npm install
npm run build
node dist/index.js  # Start MCP server
```

### Available Tools

- `tokens_list-designs` - Get all available themes
- `tokens_by-name` - Get specific theme by name/ID
- `tokens_by-intent` - Find theme matching description
- `tokens_help` - Usage guide and examples

## 📚 Theme Details

Each theme includes:

- **12+ daisyUI variables** (colors, radius, borders)
- **Typography systems** with font stacks and fallbacks
- **Color palettes** with semantic naming
- **Visual effects** (shadows, glows, textures)
- **Animation definitions** with timing and easing
- **Layout patterns** and spacing systems
- **Implementation notes** and performance tips

## 🤝 Contributing

Want to add a new theme or enhance existing ones?

1. **Add theme JSON** in `src/design-tokens/`
2. **Follow the structure** of existing themes
3. **Include daisyUI variables** + extended properties
4. **Test with various intents** for discoverability
5. **Add implementation notes** for developers

## 📖 Inspiration

Based on design prompts from [uitovibe.com](https://uitovibe.com) -
transformed into structured design tokens for programmatic use.

## ⚡ Performance Notes

- **Font loading** optimized with `font-display: swap`
- **Color systems** use OKLCH for consistent perceptual brightness
- **Animation guidance** includes performance considerations
- **Token structure** enables efficient CSS generation

---

**Made for daisyUI developers who want AI assistants to understand
good design** 🎨✨
