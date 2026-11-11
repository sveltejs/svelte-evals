import { it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import './__agent_eval__/verify-tests.mjs';

/**
 * Validates that the chart component integrates Chart.js the Svelte 5 way
 */
export function validate(code: string) {
	const errors: string[] = [];

	// Must use an attachment to manage the Chart.js instance
	if (!code.includes('{@attach')) {
		errors.push(
			'Component must use an attachment ({@attach}) to create and destroy the chart',
		);
	}

	// Must NOT use export let (Svelte 4 syntax)
	if (code.includes('export let')) {
		errors.push(
			"Component must NOT use 'export let' - use $props() instead",
		);
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}

it("validate", async () => {
	const code = await readFile("src/routes/+page.svelte", "utf-8");
	const result = validate(code);
	expect(result.errors).toEqual([]);
	expect(result.valid).toBe(true);
});
