#!/usr/bin/env node
import { ValibotJsonSchemaAdapter } from '@tmcp/adapter-valibot';
import { StdioTransport } from '@tmcp/transport-stdio';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { McpServer } from 'tmcp';
import * as v from 'valibot';
import {
	get_design_by_intent,
	get_design_by_name,
	list_designs,
} from './lib/token_store.js';

// Get version from package.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const package_json = JSON.parse(
	readFileSync(join(__dirname, '../package.json'), 'utf-8'),
);
const { version } = package_json;

// Create valibot adapter
const adapter = new ValibotJsonSchemaAdapter();

// Create tmcp server
const server = new McpServer(
	{
		name: 'mcp-vibe-ui',
		version,
		description: 'Design token server providing DaisyUI v5 themes',
	},
	{
		adapter,
		capabilities: {
			tools: { listChanged: true },
		},
	},
);

// Helper function to build CSS from theme variables
function build_theme_css(
	id: string,
	vars: Record<string, string>,
): string {
	const lines = Object.entries(vars).map(([k, v]) => `  ${k}: ${v};`);
	return `/* DaisyUI v5 theme variables for ${id} */\n[data-theme="${id}"] {\n${lines.join('\n')}\n}`;
}

// Tool: List available designs
server.tool(
	{
		name: 'tokens_list-designs',
		description:
			'Lists available design themes with their IDs, names, and tags. Returns metadata for approximately 15 design themes including cyberpunk, neumorphic, glassmorphic, and minimalist styles. Each theme provides DaisyUI v5 compatible CSS variables for complete UI theming. Use tokens_by-name to retrieve full theme data including CSS variables and extended properties.',
		schema: v.object({
			format: v.optional(
				v.union([v.literal('summary'), v.literal('detailed')]),
				'summary',
			),
		}),
	},
	async ({ format = 'summary' }) => {
		const designs = await list_designs();

		if (format === 'summary') {
			const summary = {
				count: designs.length,
				themes: designs.map((d) => d.id),
			};
			return {
				content: [
					{
						type: 'text' as const,
						text: JSON.stringify(summary, null, 2),
					},
				],
			};
		}

		return {
			content: [
				{
					type: 'text' as const,
					text: JSON.stringify({ designs }, null, 2),
				},
			],
		};
	},
);

// Tool: Get tokens by name
server.tool(
	{
		name: 'tokens_by-name',
		description:
			'Returns DaisyUI v5 tokens for a specific design by name or ID. Searches through available themes including cyberpunk, neumorphic, glassmorphic, and minimalist styles. Returns CSS variables, ready-to-use CSS blocks, and theme metadata. Use format="summary" for just CSS variables, "detailed" for complete theme data including typography and extended properties.',
		schema: v.object({
			name: v.pipe(
				v.string(),
				v.description('The name or ID of the design theme'),
			),
			format: v.optional(
				v.union([v.literal('summary'), v.literal('detailed')]),
				'detailed',
			),
		}),
	},
	async ({ name, format = 'detailed' }) => {
		const design = await get_design_by_name(name);
		if (!design) {
			return {
				content: [
					{
						type: 'text' as const,
						text: JSON.stringify(
							{
								error: 'not_found',
								message: `Design "${name}" not found`,
								name,
							},
							null,
							2,
						),
					},
				],
				isError: true,
			};
		}

		const { daisyThemeVars, ...rest } = design;
		const css = build_theme_css(rest.id, daisyThemeVars);

		if (format === 'summary') {
			return {
				content: [
					{
						type: 'text' as const,
						text: JSON.stringify(
							{
								id: rest.id,
								name: rest.name,
								daisyThemeVars,
								css,
							},
							null,
							2,
						),
					},
				],
			};
		}

		return {
			content: [
				{
					type: 'text' as const,
					text: JSON.stringify(
						{
							daisyThemeVars,
							design: rest,
							css,
						},
						null,
						2,
					),
				},
			],
		};
	},
);

// Tool: Get tokens by intent
server.tool(
	{
		name: 'tokens_by-intent',
		description:
			'Suggests and returns tokens for a design based on intent description. Uses semantic matching to find the best theme from available styles including cyberpunk, neumorphic, glassmorphic themes. Matches keywords in descriptions like "dark", "minimalist", "neon", "glass", "retro" against theme tags and metadata. Returns the closest matching design with confidence scoring.',
		schema: v.object({
			intent: v.pipe(
				v.string(),
				v.description(
					'Description of the desired design style (e.g., "dark futuristic neon")',
				),
			),
			format: v.optional(
				v.union([v.literal('summary'), v.literal('detailed')]),
				'detailed',
			),
		}),
	},
	async ({ intent, format = 'detailed' }) => {
		const design = await get_design_by_intent(intent);
		if (!design) {
			return {
				content: [
					{
						type: 'text' as const,
						text: JSON.stringify(
							{
								error: 'no_match',
								message: `No design found matching intent: "${intent}"`,
								intent,
							},
							null,
							2,
						),
					},
				],
				isError: true,
			};
		}

		const { daisyThemeVars, ...rest } = design;
		const css = build_theme_css(rest.id, daisyThemeVars);

		if (format === 'summary') {
			return {
				content: [
					{
						type: 'text' as const,
						text: JSON.stringify(
							{
								id: rest.id,
								name: rest.name,
								daisyThemeVars,
								css,
								matchedBy: 'intent',
							},
							null,
							2,
						),
					},
				],
			};
		}

		return {
			content: [
				{
					type: 'text' as const,
					text: JSON.stringify(
						{
							daisyThemeVars,
							design: rest,
							css,
							matchedBy: 'intent',
						},
						null,
						2,
					),
				},
			],
		};
	},
);

// Tool: Get help information
server.tool(
	{
		name: 'tokens_help',
		description:
			'Returns comprehensive usage guide and examples for all token tools. Provides documentation on available tools, input parameters, output formats, and practical usage examples. Includes information about the ~15 available design themes, format options (summary vs detailed), and best practices for integrating themes into applications.',
	},
	async () => {
		const help = {
			description: 'MCP Vibe UI - Design Token Server',
			tools: {
				'tokens_list-designs': {
					description: 'Lists all available design themes',
					input: {},
					output: '{ designs: Array<{id, name, tags}> }',
				},
				'tokens_by-name': {
					description: 'Get design tokens by name/ID',
					input: { name: 'string' },
					output: '{ daisyThemeVars, css, design }',
					example: { name: 'cyberpunk' },
				},
				'tokens_by-intent': {
					description: 'Find design by intent description',
					input: { intent: 'string' },
					output: '{ daisyThemeVars, css, design, matchedBy }',
					example: { intent: 'dark futuristic neon' },
				},
			},
			responseFields: {
				daisyThemeVars:
					'Record of DaisyUI v5 CSS variables and values',
				css: 'Ready-to-paste CSS theme block',
				design: 'Design metadata (id, name, tags, etc.)',
			},
		};

		return {
			content: [
				{
					type: 'text' as const,
					text: JSON.stringify(help, null, 2),
				},
			],
		};
	},
);

// Start the server
async function main() {
	const transport = new StdioTransport(server);
	transport.listen();
	console.error('MCP Vibe UI server started successfully');
}

main().catch((error) => {
	console.error('Fatal error starting MCP server:', error);
	process.exit(1);
});
