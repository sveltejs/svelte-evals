import { it, expect } from "vitest";
import { readFile } from "node:fs/promises";

/**
 * Validates that the number doubler component uses Svelte 5's $derived rune (not $derived.by)
 */
export function validate(code: string) {
	const errors: string[] = [];

	// Check for basic $derived usage
	if (!code.includes('$derived')) {
		errors.push('Component must use the $derived rune');
	}

	// Should NOT use $derived.by - the simple form is sufficient for this use case
	if (code.includes('$derived.by')) {
		errors.push(
			'Component should use simple $derived, not $derived.by (this test is for basic derivations)',
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
