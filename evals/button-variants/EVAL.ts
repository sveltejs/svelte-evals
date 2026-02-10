import { it, expect } from "vitest";
import { readFile } from "node:fs/promises";

/**
 * Validates that the button component uses Svelte 5 patterns
 */
export function validate(code: string) {
	const errors: string[] = [];

	// Check for $props usage
	if (!code.includes('$props')) {
		errors.push(
			'Component must use the $props rune to accept component properties',
		);
	}

	// Check that export let is NOT used
	if (/export\s+let\s+/.test(code)) {
		errors.push(
			"Component must NOT use 'export let' - use $props() instead",
		);
	}

	// Check that createEventDispatcher is NOT used
	if (code.includes('createEventDispatcher')) {
		errors.push(
			'Component must NOT use createEventDispatcher - forward events directly instead',
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
