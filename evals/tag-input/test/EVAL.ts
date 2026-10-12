import { render } from 'vitest-browser-svelte';
import { expect, test, describe } from 'vitest';
import { userEvent } from 'vitest/browser';
import TagInput from '../src/routes/+page.svelte';

describe('TagInput component', () => {
	test("Enter adds tag - type 'tag1', press Enter, verify tag appears", async () => {
		const screen = await render(TagInput);
		await userEvent.type(screen.getByTestId('tag-input'), 'tag1');
		await userEvent.keyboard('{Enter}');
		await expect
			.poll(() => screen.getByTestId('tag').elements().length)
			.toBe(1);
		await expect
			.element(screen.getByTestId('tag-text'))
			.toMatchTextContent('tag1');
	});

	test("Comma adds tag - type 'tag1,', verify tag appears", async () => {
		const screen = await render(TagInput);
		await userEvent.type(screen.getByTestId('tag-input'), 'tag1,');
		await expect
			.poll(() => screen.getByTestId('tag').elements().length)
			.toBe(1);
		await expect
			.element(screen.getByTestId('tag-text'))
			.toMatchTextContent('tag1');
	});

	test('X removes tag - click X button, verify tag gone', async () => {
		const screen = await render(TagInput);
		await userEvent.type(screen.getByTestId('tag-input'), 'tag1{Enter}');
		await expect.element(screen.getByTestId('tag')).toBeInTheDocument();
		await expect
			.element(screen.getByTestId('tag-text'))
			.toMatchTextContent('tag1');
		await screen.getByTestId('remove-tag-button').click();
		await expect.element(screen.getByTestId('tag')).not.toBeInTheDocument();
	});

	test('Backspace removes last tag - render with tags, focus empty input, press Backspace, verify last tag removed', async () => {
		const screen = await render(TagInput);
		const input = screen.getByTestId('tag-input');
		await userEvent.type(input, 'tag1{Enter}tag2{Enter}');
		await expect
			.poll(() => screen.getByTestId('tag').elements().length)
			.toBe(2);
		await input.click();
		await userEvent.keyboard('{Backspace}');
		await expect
			.poll(() => screen.getByTestId('tag').elements().length)
			.toBe(1);
		await expect
			.element(screen.getByTestId('tag-text'))
			.toMatchTextContent('tag1');
	});

	test("Respects maxTags - render with maxTags=2, try adding 'c', verify not added", async () => {
		const screen = await render(TagInput, { props: { maxTags: 2 } });
		const input = screen.getByTestId('tag-input');
		await userEvent.type(input, 'a{Enter}b{Enter}');
		await expect
			.poll(() => screen.getByTestId('tag').elements().length)
			.toBe(2);
		await expect.element(input).toBeDisabled();
		// A normal locator action waits for the input to become enabled. Attempt
		// the click explicitly, then send keys as a user would to the browser.
		await input.click({ force: true });
		await userEvent.keyboard('c{Enter}');
		await expect
			.poll(() => screen.getByTestId('tag').elements().length)
			.toBe(2);
	});

	test("Duplicates blocked by default - try adding 'tag1' again, verify not added", async () => {
		const screen = await render(TagInput);
		const input = screen.getByTestId('tag-input');
		await userEvent.type(input, 'tag1{Enter}');
		await expect
			.poll(() => screen.getByTestId('tag').elements().length)
			.toBe(1);
		await userEvent.type(input, 'tag1{Enter}');
		await expect
			.poll(() => screen.getByTestId('tag').elements().length)
			.toBe(1);
	});

	test('Duplicates allowed when enabled - render with allowDuplicates=true, add same tag twice, verify both exist', async () => {
		const screen = await render(TagInput, { props: { allowDuplicates: true } });
		const input = screen.getByTestId('tag-input');
		await userEvent.type(input, 'tag1{Enter}');
		await userEvent.type(input, 'tag1{Enter}');
		await expect
			.poll(() => screen.getByTestId('tag').elements().length)
			.toBe(2);
		await expect
			.element(screen.getByTestId('tag-text').nth(0))
			.toMatchTextContent('tag1');
		await expect
			.element(screen.getByTestId('tag-text').nth(1))
			.toMatchTextContent('tag1');
	});
});
