#!/usr/bin/env node
import { ValibotJsonSchemaAdapter } from '@tmcp/adapter-valibot';
import { StdioTransport } from '@tmcp/transport-stdio';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { McpServer } from 'tmcp';
import { resource } from 'tmcp/utils';
import * as v from 'valibot';
import { get_all, get_by_id, init_cache } from './lib/cache.js';
import { build_full_css } from './lib/css-builder.js';
import { format_error, format_response } from './lib/response.js';
import { find_by_intent } from './lib/search.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const package_json = JSON.parse(
	readFileSync(join(__dirname, '../package.json'), 'utf-8'),
);
const { version } = package_json;

const adapter = new ValibotJsonSchemaAdapter();

const server = new McpServer(
	{
		name: 'mcp-vibe-ui',
		version,
		description:
			'Design token server providing Tailwind v4 themes as MCP resources',
	},
	{
		adapter,
		capabilities: {
			resources: { listChanged: true },
			tools: { listChanged: true },
		},
	},
);

// Register theme resources after cache is initialized
function register_theme_resources() {
	const designs = get_all();

	for (const design of designs) {
		server.resource(
			{
				name: design.id,
				description: design.metadata?.description || design.name,
				uri: `theme://${design.id}`,
			},
			async () => {
				const theme = get_by_id(design.id);
				if (!theme) {
					return resource.text(
						`theme://${design.id}`,
						JSON.stringify({ error: 'Theme not found' }),
					);
				}

				const css = build_full_css(theme);

				const response = {
					id: theme.id,
					name: theme.name,
					tags: theme.tags,
					css, // Tailwind v4 @theme block + keyframes
					patterns: theme.patterns,
					fonts: theme.fonts,
					extended: theme.extended,
					notes: theme.notes,
				};

				return resource.text(
					`theme://${design.id}`,
					JSON.stringify(response, null, 2),
					'application/json',
				);
			},
		);
	}
}

// Single tool: theme_search - find theme by intent
server.tool(
	{
		name: 'theme_search',
		description:
			'Find theme by name OR intent. Accepts exact theme names (e.g., "editorial", "cyberpunk", "neu-brutalist") or style descriptions (e.g., "dark futuristic neon"). Returns Tailwind v4 CSS, patterns, and extended data.',
		schema: v.object({
			intent: v.pipe(
				v.string(),
				v.description(
					'Theme name (e.g., "editorial", "cyberpunk") or style description (e.g., "dark futuristic neon")',
				),
			),
		}),
	},
	async ({ intent }) => {
		const design = find_by_intent(intent);
		if (!design) {
			return format_error(
				'no_match',
				`No theme found matching: "${intent}"`,
				{ intent },
			);
		}

		const css = build_full_css(design);

		return format_response({
			id: design.id,
			name: design.name,
			uri: `theme://${design.id}`,
			tags: design.tags,
			css, // Tailwind v4 @theme block + keyframes
			patterns: design.patterns,
			fonts: design.fonts,
			extended: design.extended,
			notes: design.notes,
		});
	},
);

async function main() {
	await init_cache();
	register_theme_resources();
	const transport = new StdioTransport(server);
	transport.listen();
	console.error(
		`[mcp-vibe-ui] Server started with ${get_all().length} themes`,
	);
}

main().catch((error) => {
	console.error('Fatal error starting MCP server:', error);
	process.exit(1);
});
