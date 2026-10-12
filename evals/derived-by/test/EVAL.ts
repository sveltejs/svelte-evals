import { render } from 'vitest-browser-svelte';
import { expect, test, describe } from 'vitest';
import TextAnalyzer from '../src/routes/+page.svelte';

describe('TextAnalyzer component', () => {
	test('renders with initial state', async () => {
		const screen = await render(TextAnalyzer);
		await expect
			.element(screen.getByTestId('word-count'))
			.toMatchTextContent('Words: 0');
		await expect
			.element(screen.getByTestId('char-count'))
			.toMatchTextContent('Characters: 0');
		await expect
			.element(screen.getByTestId('length-indicator'))
			.toMatchTextContent('Status: Short text');
	});

	test('updates counts when text is entered', async () => {
		const screen = await render(TextAnalyzer);
		const input = screen.getByTestId('text-input');
		await input.fill('Hello world');
		await expect
			.element(screen.getByTestId('word-count'))
			.toMatchTextContent('Words: 2');
		await expect
			.element(screen.getByTestId('char-count'))
			.toMatchTextContent('Characters: 11');
		await expect
			.element(screen.getByTestId('length-indicator'))
			.toMatchTextContent('Status: Short text');

		await input.fill(
			'This is a much longer text that should have more than fifteen words so that we can test the long text indicator functionality properly',
		);
		await expect
			.element(screen.getByTestId('word-count'))
			.toMatchTextContent('Words: 24');
		await expect
			.element(screen.getByTestId('char-count'))
			.toMatchTextContent('Characters: 134');
		await expect
			.element(screen.getByTestId('length-indicator'))
			.toMatchTextContent('Status: Long text');
	});

	test('clear button resets the text', async () => {
		const screen = await render(TextAnalyzer);
		const input = screen.getByTestId('text-input');
		await input.fill('Hello world');
		await expect
			.element(screen.getByTestId('word-count'))
			.toMatchTextContent('Words: 2');
		await screen.getByTestId('clear-button').click();
		await expect
			.element(screen.getByTestId('word-count'))
			.toMatchTextContent('Words: 0');
		await expect
			.element(screen.getByTestId('char-count'))
			.toMatchTextContent('Characters: 0');
		await expect
			.element(screen.getByTestId('length-indicator'))
			.toMatchTextContent('Status: Short text');
		await expect.element(input).toHaveValue('');
	});
});
