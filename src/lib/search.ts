import { get_all, get_all_map } from './cache.js';
import type { DesignRecord } from './schemas.js';

function normalize(s: string): string {
	return s.trim().toLowerCase().replace(/\s+/g, '-');
}

function tokenize(s: string): string[] {
	return s
		.toLowerCase()
		.split(/[^a-z0-9]+/)
		.filter((w) => w.length > 2);
}

export function find_by_name(name: string): DesignRecord | undefined {
	const target = normalize(name);
	const designs = get_all_map();

	for (const design of designs.values()) {
		if (normalize(design.id) === target) return design;
		if (normalize(design.name) === target) return design;
		if (design.aliases?.some((a) => normalize(a) === target)) {
			return design;
		}
	}
	return undefined;
}

export function find_by_intent(
	intent: string,
): DesignRecord | undefined {
	const words = tokenize(intent);
	if (words.length === 0) return undefined;

	const designs = get_all();
	let best: { score: number; design: DesignRecord } | undefined;

	for (const design of designs) {
		const searchable = [
			design.id,
			design.name,
			...(design.aliases || []),
			...design.tags,
			design.metadata?.description || '',
		]
			.map((s) => s.toLowerCase())
			.join(' ');

		let score = 0;
		for (const word of words) {
			if (searchable.includes(word)) {
				const exact_match =
					design.tags.some((t) => t.toLowerCase() === word) ||
					design.id.toLowerCase() === word ||
					design.aliases?.some((a) => a.toLowerCase() === word);
				score += exact_match ? 3 : 1;
			}
		}

		if (score > 0 && (!best || score > best.score)) {
			best = { score, design };
		}
	}

	return best?.design;
}
