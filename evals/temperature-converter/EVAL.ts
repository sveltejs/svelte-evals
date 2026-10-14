import { it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import './__agent_eval__/verify-tests.mjs';

/**
 * Validates that the temperature converter component uses proper Svelte 5 patterns:
 * - Reactive temperature values using $state()
 * - Conversions via derived values or input handlers
 * - No $effect for conversions
 * - No export let (Svelte 4 pattern)
 */
export function validate(code: string) {
	const errors: string[] = [];

	// Must have $state() for reactive temperature values
	if (!code.includes('$state')) {
		errors.push(
			'Component must use $state() for reactive temperature values',
		);
	}

	// Must NOT use $effect for conversions (anti-pattern that causes loops)
	if (code.includes('$effect')) {
		errors.push(
			'Component should NOT use $effect for temperature conversions. ' +
				'Use $derived() or input handlers instead.',
		);
	}

	// Must NOT use export let (Svelte 4 pattern)
	if (/export\s+let\s+/.test(code)) {
		errors.push(
			"Component should NOT use 'export let' (Svelte 4 pattern). " +
				'Use $props() for Svelte 5 if props are needed.',
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
