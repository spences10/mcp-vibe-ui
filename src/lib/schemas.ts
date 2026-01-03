import {
	any,
	array,
	boolean,
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

export const tailwind_schema = object({
	colors: record(string(), string()),
	borderRadius: record(string(), string()),
	fontFamily: optional(record(string(), array(string()))),
});

export const design_schema = object({
	version: string(),
	id: string(),
	name: string(),
	tags: array(string()),
	aliases: optional(array(string())),
	tailwind: tailwind_schema,
	fonts: optional(array(font_schema)),
	metadata: optional(
		object({
			description: optional(string()),
			builtInThemeHint: optional(string()),
		}),
	),
	extended: optional(record(string(), any())),
	notes: optional(string()),
});

export type DesignRecord = InferOutput<typeof design_schema>;
export type TailwindConfig = InferOutput<typeof tailwind_schema>;
export type FontConfig = InferOutput<typeof font_schema>;
