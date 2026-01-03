import {
	any,
	array,
	boolean,
	nullable,
	number,
	object,
	optional,
	record,
	string,
	type InferOutput,
} from 'valibot';

export const font_schema = object({
	package: string(),
	weights: array(number()),
	styles: optional(array(string())),
	variable: optional(boolean()),
});

// Tailwind v4 CSS theme variables
export const tailwind_schema = object({
	colors: record(string(), string()), // background, foreground, primary, etc.
	borderRadius: record(string(), string()), // sm, md, lg
	fontFamily: optional(record(string(), array(string()))), // display, body
});

// Ready-to-use Tailwind class patterns for achieving the aesthetic
// Keys: surface, card, elevated, interactive, plus theme-specific (glow, glass, etc.)
export const patterns_schema = record(string(), string());

// Normalized extended structure
export const extended_schema = object({
	effects: optional(
		object({
			shadow: optional(nullable(string())),
			glow: optional(nullable(string())),
			blur: optional(nullable(string())),
		}),
	),
	animations: optional(
		object({
			enter: optional(nullable(string())),
			hover: optional(nullable(string())),
			press: optional(nullable(string())),
		}),
	),
	keyframes: optional(record(string(), string())), // actual @keyframes CSS
	surfaces: optional(
		object({
			raised: optional(string()),
			sunken: optional(string()),
			overlay: optional(string()),
		}),
	),
	themeSpecific: optional(record(string(), any())), // freeform theme-unique stuff
});

export const design_schema = object({
	version: string(),
	id: string(),
	name: string(),
	tags: array(string()),
	aliases: optional(array(string())),
	tailwind: tailwind_schema,
	patterns: optional(record(string(), string())), // ready-to-use class strings
	fonts: optional(array(font_schema)),
	metadata: optional(
		object({
			description: optional(string()),
		}),
	),
	extended: optional(extended_schema),
	notes: optional(string()),
});

export type DesignRecord = InferOutput<typeof design_schema>;
export type TailwindConfig = InferOutput<typeof tailwind_schema>;
export type FontConfig = InferOutput<typeof font_schema>;
export type PatternsConfig = InferOutput<typeof patterns_schema>;
export type ExtendedConfig = InferOutput<typeof extended_schema>;
