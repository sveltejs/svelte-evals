import { it, expect } from "vitest";
import { readFile } from "node:fs/promises";

/**
 * Validates that the book list component uses Svelte 5's snippets feature
 */
export function validate(code: string) {
	const errors: string[] = [];

	// Check for {#snippet usage
	if (!code.includes('{#snippet')) {
		errors.push('Component must define snippets using {#snippet}');
	}

	// Check for {@render usage
	if (!code.includes('{@render')) {
		errors.push('Component must render snippets using {@render}');
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
