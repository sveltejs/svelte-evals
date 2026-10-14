import { render } from 'vitest-browser-svelte';
import { describe, expect, test } from 'vitest';
import Page from '../src/routes/+page.svelte';

// This file is hidden from the LLM, so PROMPT.md must specify everything these tests
// rely on (data-testid attributes, props, text formats, roles...).
describe('Page', () => {
	test('renders', async () => {
		const { container } = await render(Page);

		await expect.element(container).not.toBeEmptyDOMElement();
	});
});
