import { it, expect } from "vitest";
import { readFile } from "node:fs/promises";

/**
 * Validates that the component uses Svelte 5's $props rune
 */
export function validate(code: string) {
	const errors: string[] = [];

	// Check for $props usage
	if (!code.includes('$props')) {
		errors.push(
			'Component must use the $props rune to accept component properties',
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
