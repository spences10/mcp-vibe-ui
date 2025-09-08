import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	any,
	array,
	object,
	optional,
	parse,
	record,
	strictObject,
	string,
} from 'valibot';

// DaisyUI v5 required theme variables (names kept exact)
export const REQUIRED_DAISY_VARS = [
	'--color-base-100',
	'--color-base-200',
	'--color-base-300',
	'--color-base-content',
	'--color-primary',
	'--color-primary-content',
	'--color-secondary',
	'--color-secondary-content',
	'--color-accent',
	'--color-accent-content',
	'--color-neutral',
	'--color-neutral-content',
	'--color-info',
	'--color-info-content',
	'--color-success',
	'--color-success-content',
	'--color-warning',
	'--color-warning-content',
	'--color-error',
	'--color-error-content',
	'--radius-selector',
	'--radius-field',
	'--radius-box',
	'--size-selector',
	'--size-field',
	'--border',
	'--depth',
	'--noise',
];

const theme_vars_schema = strictObject(
	Object.fromEntries(REQUIRED_DAISY_VARS.map((k) => [k, string()])),
);

const design_schema = object({
	version: string(),
	id: string(),
	name: string(),
	tags: array(string()),
	aliases: optional(array(string())),
	daisyThemeVars: theme_vars_schema,
	metadata: optional(
		object({
			description: optional(string()),
			builtInThemeHint: optional(string()),
		}),
	),
	extended: optional(record(string(), any())),
	notes: optional(string()),
});

export type DesignRecord = ReturnType<typeof validate_design>;

function validate_design(input: unknown) {
	return parse(design_schema, input);
}

function get_tokens_dir(): string {
	const current_dir = path.dirname(fileURLToPath(import.meta.url));
	// Works in dev (src/lib -> src/design-tokens) and in build (dist/lib -> dist/design-tokens)
	return path.resolve(current_dir, '../design-tokens');
}

export async function list_designs() {
	const dir = get_tokens_dir();
	const entries = await fs.readdir(dir).catch(() => []);
	const designs: Array<{ id: string; name: string; tags: string[] }> =
		[];
	for (const entry of entries) {
		if (!entry.endsWith('.json')) continue;
		const raw = await fs.readFile(path.join(dir, entry), 'utf8');
		try {
			const parsed = JSON.parse(raw);
			const d = validate_design(parsed);
			designs.push({ id: d.id, name: d.name, tags: d.tags });
		} catch {
			// skip invalid entries
		}
	}
	designs.sort((a, b) => a.name.localeCompare(b.name));
	return designs;
}

export async function get_design_by_name(name: string) {
	const target = normalize_name(name);
	const dir = get_tokens_dir();
	const entries = await fs.readdir(dir).catch(() => []);
	for (const entry of entries) {
		if (!entry.endsWith('.json')) continue;
		const raw = await fs.readFile(path.join(dir, entry), 'utf8');
		try {
			const d = validate_design(JSON.parse(raw));
			if (
				normalize_name(d.id) === target ||
				normalize_name(d.name) === target ||
				(d.aliases || []).some((a) => normalize_name(a) === target)
			) {
				return d;
			}
		} catch {
			// skip invalid
		}
	}
	return undefined;
}

export async function get_design_by_intent(intent: string) {
	const words = tokenize(intent);
	const candidates = await list_full_designs();
	let best: { score: number; design: DesignRecord } | undefined;
	for (const d of candidates) {
		const hay = new Set([
			...d.tags.map(normalize_name),
			...[d.id, d.name, ...(d.aliases || [])].map(normalize_name),
		]);
		const score = words.reduce(
			(acc, w) => acc + (hay.has(w) ? 2 : 0),
			0,
		);
		if (!best || score > best.score) best = { score, design: d };
	}
	return best?.design;
}

async function list_full_designs() {
	const dir = get_tokens_dir();
	const entries = await fs.readdir(dir).catch(() => []);
	const out: DesignRecord[] = [];
	for (const entry of entries) {
		if (!entry.endsWith('.json')) continue;
		const raw = await fs.readFile(path.join(dir, entry), 'utf8');
		try {
			out.push(validate_design(JSON.parse(raw)));
		} catch {
			// skip
		}
	}
	return out;
}

function normalize_name(s: string) {
	return s.trim().toLowerCase().replace(/\s+/g, '-');
}

function tokenize(s: string) {
	return s
		.toLowerCase()
		.split(/[^a-z0-9]+/)
		.filter(Boolean)
		.map((w) => (w.length > 2 ? w : ''))
		.filter(Boolean);
}
