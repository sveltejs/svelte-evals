import { it, expect } from "vitest";
import { readFile } from "node:fs/promises";

/**
 * Validates that the text analyzer component uses Svelte 5's $derived.by rune
 */
export function validate(code: string) {
	const errors: string[] = [];

	// Check for $derived.by usage - this is the specific rune for complex derivations
	if (!code.includes('$derived.by')) {
		errors.push(
			'Component must use the $derived.by rune for complex derivations',
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
