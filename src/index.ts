#!/usr/bin/env node
import { ValibotJsonSchemaAdapter } from '@tmcp/adapter-valibot';
import { StdioTransport } from '@tmcp/transport-stdio';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { McpServer } from 'tmcp';
import * as v from 'valibot';
import { get_all, init_cache } from './lib/cache.js';
import {
	build_tailwind_config,
	build_tailwind_config_string,
} from './lib/config-builder.js';
import { format_error, format_response } from './lib/response.js';
import { find_by_intent, find_by_name } from './lib/search.js';

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
			'Design token server providing Tailwind-compatible themes',
	},
	{
		adapter,
		capabilities: {
			tools: { listChanged: true },
		},
	},
);

server.tool(
	{
		name: 'tokens_list',
		description:
			'Lists available design themes. Returns ~15 themes (cyberpunk, glassmorphic, neumorphic, etc). Use format="detailed" for full metadata including tags.',
		schema: v.object({
			format: v.optional(
				v.union([v.literal('summary'), v.literal('detailed')]),
				'summary',
			),
		}),
	},
	async ({ format = 'summary' }) => {
		const designs = get_all();

		if (format === 'summary') {
			return format_response({
				count: designs.length,
				themes: designs.map((d) => d.id),
			});
		}

		return format_response({
			designs: designs.map((d) => ({
				id: d.id,
				name: d.name,
				tags: d.tags,
			})),
		});
	},
);

server.tool(
	{
		name: 'tokens_get',
		description:
			'Get Tailwind theme config by name or ID. Returns colors, borderRadius, fontFamily ready for tailwind.config.js. Use format="summary" for just the config, "detailed" for full theme data.',
		schema: v.object({
			name: v.pipe(
				v.string(),
				v.description('Theme name or ID (e.g., "cyberpunk")'),
			),
			format: v.optional(
				v.union([v.literal('summary'), v.literal('detailed')]),
				'detailed',
			),
		}),
	},
	async ({ name, format = 'detailed' }) => {
		const design = find_by_name(name);
		if (!design) {
			return format_error('not_found', `Theme "${name}" not found`, {
				name,
			});
		}

		const tailwind_config = build_tailwind_config(design);
		const config_string = build_tailwind_config_string(design);

		if (format === 'summary') {
			return format_response({
				id: design.id,
				name: design.name,
				tailwind: tailwind_config,
				tailwindConfig: config_string,
			});
		}

		return format_response({
			id: design.id,
			name: design.name,
			tags: design.tags,
			tailwind: tailwind_config,
			tailwindConfig: config_string,
			fonts: design.fonts,
			extended: design.extended,
			notes: design.notes,
		});
	},
);

server.tool(
	{
		name: 'tokens_search',
		description:
			'Find theme by intent description (e.g., "dark futuristic neon"). Matches against tags, names, aliases. Returns best matching theme with Tailwind config.',
		schema: v.object({
			intent: v.pipe(
				v.string(),
				v.description(
					'Description of desired style (e.g., "dark futuristic neon")',
				),
			),
			format: v.optional(
				v.union([v.literal('summary'), v.literal('detailed')]),
				'detailed',
			),
		}),
	},
	async ({ intent, format = 'detailed' }) => {
		const design = find_by_intent(intent);
		if (!design) {
			return format_error(
				'no_match',
				`No theme found matching: "${intent}"`,
				{ intent },
			);
		}

		const tailwind_config = build_tailwind_config(design);
		const config_string = build_tailwind_config_string(design);

		if (format === 'summary') {
			return format_response({
				id: design.id,
				name: design.name,
				tailwind: tailwind_config,
				tailwindConfig: config_string,
				matchedBy: 'intent',
			});
		}

		return format_response({
			id: design.id,
			name: design.name,
			tags: design.tags,
			tailwind: tailwind_config,
			tailwindConfig: config_string,
			fonts: design.fonts,
			extended: design.extended,
			notes: design.notes,
			matchedBy: 'intent',
		});
	},
);

async function main() {
	await init_cache();
	const transport = new StdioTransport(server);
	transport.listen();
	console.error('MCP Vibe UI server started successfully');
}

main().catch((error) => {
	console.error('Fatal error starting MCP server:', error);
	process.exit(1);
});
