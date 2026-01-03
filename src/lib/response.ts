export interface McpResponse {
	content: Array<{ type: 'text'; text: string }>;
	isError?: boolean;
}

export function format_response(data: unknown): McpResponse {
	return {
		content: [
			{
				type: 'text' as const,
				text: JSON.stringify(data, null, 2),
			},
		],
	};
}

export function format_error(
	code: string,
	message: string,
	extra?: Record<string, unknown>,
): McpResponse {
	return {
		content: [
			{
				type: 'text' as const,
				text: JSON.stringify(
					{ error: code, message, ...extra },
					null,
					2,
				),
			},
		],
		isError: true,
	};
}
