import { it, expect } from "vitest";
import { readFile } from "node:fs/promises";

/**
 * Validates that the counter component uses Svelte 5's $state rune
 */
export function validate(code: string) {
	const errors: string[] = [];

	// Check for $state usage
	if (!code.includes('$state')) {
		errors.push('Component must use the $state rune for reactivity');
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
