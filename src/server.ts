import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { object, parse, string } from 'valibot';

// Minimal MCP server per official SDK patterns
async function main() {
	const server = new McpServer(
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
	server.tool(
		'echo',
		'Echoes back the provided message.',
		async (args: Record<string, unknown>) => {
			const schema = object({ message: string() });
			const { message } = parse(schema, args ?? {});
			return { content: [{ type: 'text', text: String(message) }] };
		},
	);

	// Health tool
	server.tool(
		'ping',
		"Returns 'pong' to confirm server is responsive.",
		async () => ({ content: [{ type: 'text', text: 'pong' }] }),
	);

	const transport = new StdioServerTransport();
	await server.connect(transport);
}

main().catch((err) => {
	// eslint-disable-next-line no-console
	console.error('Fatal error starting MCP server:', err);
	process.exit(1);
});
