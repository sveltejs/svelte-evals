import { it, expect } from "vitest";
import { readFile } from "node:fs/promises";

/**
 * Validates that the component uses Svelte 5's $inspect rune with all required patterns
 */
export function validate(code: string) {
	const errors: string[] = [];

	// Check for basic $inspect usage
	if (!code.includes('$inspect')) {
		errors.push('Component must use the $inspect rune');
	}

	// Check for $inspect(...).with pattern
	if (!code.includes('.with')) {
		errors.push(
			'Component must use $inspect(...).with for custom callbacks',
		);
	}

	// Check for $inspect.trace usage
	if (!code.includes('$inspect.trace')) {
		errors.push('Component must use $inspect.trace() inside an effect');
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
