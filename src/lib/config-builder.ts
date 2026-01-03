import type { DesignRecord } from './schemas.js';

export interface TailwindThemeExtend {
	colors: Record<string, string>;
	borderRadius: Record<string, string>;
	fontFamily?: Record<string, string[]>;
}

export function build_tailwind_config(
	design: DesignRecord,
): TailwindThemeExtend {
	const { tailwind } = design;
	return {
		colors: { ...tailwind.colors },
		borderRadius: { ...tailwind.borderRadius },
		...(tailwind.fontFamily && { fontFamily: tailwind.fontFamily }),
	};
}

export function build_tailwind_config_string(
	design: DesignRecord,
): string {
	const config = build_tailwind_config(design);
	const json = JSON.stringify(config, null, 2);
	return `// Tailwind config for ${design.name}
// Add to tailwind.config.js: theme.extend
${json}`;
}
