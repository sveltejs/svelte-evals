import { it, expect } from "vitest";
import { readFile } from "node:fs/promises";

/**
 * Validates that the character list component uses Svelte's {#each} block
 */
export function validate(code: string) {
	const errors: string[] = [];

	// Check for {#each usage
	if (!code.includes('{#each')) {
		errors.push('Component must use the {#each} block for iteration');
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
