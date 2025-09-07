import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { object, parse, string } from 'valibot';
import {
	get_design_by_intent,
	get_design_by_name,
	list_designs,
} from './lib/token_store.js';

// Minimal MCP server per official SDK patterns
async function main() {
	const mcp_server = new McpServer(
		{ name: 'mcp-vibe-ui-server', version: '0.1.0' },
		{
			capabilities: {
				tools: {},
				resources: {},
				prompts: {},
			},
		},
	);

	// Simple echo tool to verify connectivity
	mcp_server.tool(
		'echo',
		'Echoes back the provided message.',
		async (args: Record<string, unknown>) => {
			const schema = object({ message: string() });
			const { message } = parse(schema, args ?? {});
			return { content: [{ type: 'text', text: String(message) }] };
		},
	);

	// Token tools (JSON-only)
	mcp_server.tool(
		'tokens.list-designs',
		'List available design token packs (ids, names, tags).',
		async () => {
			const designs = await list_designs();
			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify({ designs }, null, 2),
					},
				],
			};
		},
	);

	mcp_server.tool(
		'tokens.by-name',
		'Get DaisyUI v5 theme variables by design name/id (args: { name: string }).',
		async (args: Record<string, unknown>) => {
			const schema = object({ name: string() });
			const { name } = parse(schema, args ?? {});
			const design = await get_design_by_name(name);
			if (!design) {
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify({ error: 'not_found', name }),
						},
					],
					isError: true,
				};
			}
			const { daisyThemeVars, ...rest } = design;
			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify(
							{ daisyThemeVars, design: rest },
							null,
							2,
						),
					},
				],
			};
		},
	);

	mcp_server.tool(
		'tokens.by-intent',
		'Get DaisyUI v5 theme variables by free-text intent (args: { intent: string }).',
		async (args: Record<string, unknown>) => {
			const schema = object({ intent: string() });
			const { intent } = parse(schema, args ?? {});
			const design = await get_design_by_intent(intent);
			if (!design) {
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify({ error: 'no_match', intent }),
						},
					],
					isError: true,
				};
			}
			const { daisyThemeVars, ...rest } = design;
			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify(
							{ daisyThemeVars, design: rest, matchedBy: 'intent' },
							null,
							2,
						),
					},
				],
			};
		},
	);

	// Health tool
	mcp_server.tool(
		'ping',
		"Returns 'pong' to confirm server is responsive.",
		async () => ({ content: [{ type: 'text', text: 'pong' }] }),
	);

	const stdio_transport = new StdioServerTransport();
	await mcp_server.connect(stdio_transport);
}

main().catch((error) => {
	// eslint-disable-next-line no-console
	console.error('Fatal error starting MCP server:', error);
	process.exit(1);
});
