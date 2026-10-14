import { it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import './__agent_eval__/verify-tests.mjs';

/**
 * Validates that the checklist component follows Svelte 5 best practices
 */
export function validate(code: string) {
	const errors: string[] = [];

	// Selection reactivity is covered by the browser tests: both $state arrays
	// and reactive collections such as SvelteSet are valid.

	// Must use $derived() for allSelected and someSelected
	if (!code.includes('$derived')) {
		errors.push(
			'Component must use $derived() for allSelected, someSelected, and selectedCount',
		);
	}

	// Must not use effects to synchronize selection state
	if (code.includes('$effect')) {
		errors.push('Component must not use $effect()');
	}

	// Must NOT use export let (Svelte 4 syntax)
	if (code.includes('export let')) {
		errors.push(
			"Component must NOT use 'export let' - use $props() instead",
		);
	}

	// Must use $props() for items
	if (!code.includes('$props')) {
		errors.push('Component must use $props() to receive items prop');
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
