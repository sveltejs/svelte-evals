import { it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import './__agent_eval__/verify-tests.mjs';

/**
 * Validates that the tag input component follows Svelte 5 best practices
 */
export function validate(code: string) {
	const errors: string[] = [];

	// Must use $state() for tags array
	if (!code.includes('$state')) {
		errors.push('Component must use $state() for the tags array');
	}

	// Must use $derived() for canAddMore
	if (!code.includes('$derived')) {
		errors.push(
			'Component must use $derived() for the canAddMore computed value',
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
