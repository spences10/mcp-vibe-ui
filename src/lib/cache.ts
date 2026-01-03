import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'valibot';
import { design_schema, type DesignRecord } from './schemas.js';

const cache = new Map<string, DesignRecord>();
let initialized = false;

function get_tokens_dir(): string {
	const current_dir = path.dirname(fileURLToPath(import.meta.url));
	return path.resolve(current_dir, '../design-tokens');
}

export async function init_cache(): Promise<void> {
	if (initialized) return;

	const dir = get_tokens_dir();
	const entries = await fs.readdir(dir).catch(() => []);

	for (const entry of entries) {
		if (!entry.endsWith('.json')) continue;
		const filepath = path.join(dir, entry);
		try {
			const raw = await fs.readFile(filepath, 'utf8');
			const parsed = JSON.parse(raw);
			const design = parse(design_schema, parsed);
			cache.set(design.id, design);
		} catch (err) {
			console.error(`[mcp-vibe-ui] Failed to load ${entry}:`, err);
		}
	}

	initialized = true;
	console.error(`[mcp-vibe-ui] Loaded ${cache.size} designs`);
}

export function get_all(): DesignRecord[] {
	return Array.from(cache.values()).sort((a, b) =>
		a.name.localeCompare(b.name),
	);
}

export function get_by_id(id: string): DesignRecord | undefined {
	return cache.get(id);
}

export function get_all_map(): Map<string, DesignRecord> {
	return cache;
}
