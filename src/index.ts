import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
	CallToolRequestSchema,
	ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import {
	get_design_by_intent,
	get_design_by_name,
	list_designs,
} from './lib/token_store.js';

// Create a proper MCP server that actually works
const server = new Server(
	{
		name: 'mcp-vibe-ui',
		version: '0.1.0',
	},
	{
		capabilities: {
			tools: {},
			resources: {},
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

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
	return {
		tools: [
			{
				name: 'tokens_list-designs',
				description:
					'Lists available design themes with their IDs, names, and tags',
				inputSchema: {
					type: 'object',
					properties: {},
					additionalProperties: false,
				},
			},
			{
				name: 'tokens_by-name',
				description:
					'Returns DaisyUI v5 tokens for a specific design by name',
				inputSchema: {
					type: 'object',
					properties: {
						name: {
							type: 'string',
							description: 'The name or ID of the design theme',
						},
					},
					required: ['name'],
					additionalProperties: false,
				},
			},
			{
				name: 'tokens_by-intent',
				description:
					'Suggests and returns tokens for a design based on intent description',
				inputSchema: {
					type: 'object',
					properties: {
						intent: {
							type: 'string',
							description:
								'Description of the desired design style (e.g., "dark futuristic neon")',
						},
					},
					required: ['intent'],
					additionalProperties: false,
				},
			},
			{
				name: 'tokens_help',
				description:
					'Returns usage guide and examples for the token tools',
				inputSchema: {
					type: 'object',
					properties: {},
					additionalProperties: false,
				},
			},
		],
	};
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
	const { name, arguments: args } = request.params;

	try {
		switch (name) {
			case 'tokens_list-designs': {
				const designs = await list_designs();
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify({ designs }, null, 2),
						},
					],
				};
			}

			case 'tokens_by-name': {
				const name_arg = args?.name;
				if (!name_arg || typeof name_arg !== 'string') {
					return {
						content: [
							{
								type: 'text',
								text: JSON.stringify(
									{
										error: 'invalid_arguments',
										message:
											'Missing required parameter: name (string)',
										example: { name: 'cyberpunk' },
									},
									null,
									2,
								),
							},
						],
						isError: true,
					};
				}

				const design = await get_design_by_name(name_arg);
				if (!design) {
					return {
						content: [
							{
								type: 'text',
								text: JSON.stringify(
									{
										error: 'not_found',
										message: `Design "${name_arg}" not found`,
										name: name_arg,
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

				return {
					content: [
						{
							type: 'text',
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
			}

			case 'tokens_by-intent': {
				const intent_arg = args?.intent;
				if (!intent_arg || typeof intent_arg !== 'string') {
					return {
						content: [
							{
								type: 'text',
								text: JSON.stringify(
									{
										error: 'invalid_arguments',
										message:
											'Missing required parameter: intent (string)',
										example: { intent: 'dark futuristic neon' },
									},
									null,
									2,
								),
							},
						],
						isError: true,
					};
				}

				const design = await get_design_by_intent(intent_arg);
				if (!design) {
					return {
						content: [
							{
								type: 'text',
								text: JSON.stringify(
									{
										error: 'no_match',
										message: `No design found matching intent: "${intent_arg}"`,
										intent: intent_arg,
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

				return {
					content: [
						{
							type: 'text',
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
			}

			case 'tokens_help': {
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
							type: 'text',
							text: JSON.stringify(help, null, 2),
						},
					],
				};
			}

			default:
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(
								{
									error: 'unknown_tool',
									message: `Unknown tool: ${name}`,
								},
								null,
								2,
							),
						},
					],
					isError: true,
				};
		}
	} catch (error) {
		return {
			content: [
				{
					type: 'text',
					text: JSON.stringify(
						{
							error: 'internal_error',
							message:
								error instanceof Error
									? error.message
									: 'Unknown error',
						},
						null,
						2,
					),
				},
			],
			isError: true,
		};
	}
});

// Start the server
async function main() {
	const transport = new StdioServerTransport();
	await server.connect(transport);
	console.error('MCP Vibe UI server started successfully');
}

main().catch((error) => {
	console.error('Fatal error starting MCP server:', error);
	process.exit(1);
});
