import { it, expect } from "vitest";
import { readFile } from "node:fs/promises";

/**
 * Validates that the timer component follows Svelte 5 best practices
 */
export function validate(code: string) {
	const errors: string[] = [];

	// Must use $state() for elapsed time and running state
	if (!code.includes('$state')) {
		errors.push(
			'Component must use $state() for elapsed time and running state',
		);
	}

	// Must use $derived() for formatted display
	if (!code.includes('$derived')) {
		errors.push('Component must use $derived() for formatted time display');
	}

	// Must use $effect() for setInterval (this is a VALID use case for $effect!)
	if (!code.includes('$effect')) {
		errors.push('Component must use $effect() for managing setInterval');
	}

	// $effect must return cleanup function (clearInterval)
	// Check for return statement inside $effect that includes clearInterval
	const effectMatch = code.match(
		/\$effect\s*\(\s*\(\)\s*=>\s*\{[\s\S]*?\}\s*\)/,
	);
	if (effectMatch) {
		const effectBody = effectMatch[0];
		// Check if there's a return with clearInterval
		if (
			!effectBody.includes('return') ||
			!effectBody.includes('clearInterval')
		) {
			errors.push(
				'$effect must return a cleanup function that calls clearInterval',
			);
		}
	}

	// Must NOT use export let (Svelte 4 syntax)
	if (code.includes('export let')) {
		errors.push(
			"Component must NOT use 'export let' - use Svelte 5 syntax instead",
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
