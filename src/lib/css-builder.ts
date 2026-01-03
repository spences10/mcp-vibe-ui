import type { DesignRecord } from './schemas.js';

/**
 * Build Tailwind v4 @theme CSS block from design tokens
 */
export function build_theme_css(design: DesignRecord): string {
	const lines: string[] = [];

	// Colors
	for (const [key, value] of Object.entries(design.tailwind.colors)) {
		lines.push(`  --color-${key}: ${value};`);
	}

	// Border radius
	for (const [key, value] of Object.entries(
		design.tailwind.borderRadius,
	)) {
		lines.push(`  --radius-${key}: ${value};`);
	}

	// Font families
	if (design.tailwind.fontFamily) {
		for (const [key, fonts] of Object.entries(
			design.tailwind.fontFamily,
		)) {
			const fontList = fonts
				.map((f) => (f.includes(' ') ? `"${f}"` : f))
				.join(', ');
			lines.push(`  --font-${key}: ${fontList};`);
		}
	}

	return `@theme {\n${lines.join('\n')}\n}`;
}

/**
 * Build @keyframes CSS blocks from design extended.keyframes
 */
export function build_keyframes_css(
	design: DesignRecord,
): string | null {
	const keyframes = design.extended?.keyframes;
	if (!keyframes || Object.keys(keyframes).length === 0) {
		return null;
	}

	const blocks: string[] = [];
	for (const [name, css] of Object.entries(keyframes)) {
		blocks.push(`@keyframes ${name} {\n${css}\n}`);
	}

	return blocks.join('\n\n');
}

/**
 * Build complete CSS output for a theme
 */
export function build_full_css(design: DesignRecord): string {
	const parts: string[] = [];

	// Theme variables
	parts.push(`/* ${design.name} Theme */`);
	parts.push(build_theme_css(design));

	// Keyframes
	const keyframes = build_keyframes_css(design);
	if (keyframes) {
		parts.push('');
		parts.push('/* Animations */');
		parts.push(keyframes);
	}

	return parts.join('\n');
}
