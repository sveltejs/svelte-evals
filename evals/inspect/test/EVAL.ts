import { render } from 'vitest-browser-svelte';
import { expect, test, describe, vi, afterEach } from 'vitest';
import type { Locator } from 'vitest/browser';
import InspectDemo from '../src/routes/+page.svelte';

async function expectCurrentTextToBe(element: Locator, expectedText: string) {
	await expect
		.poll(() => {
			const text = element.element().textContent || '';
			return (
				text.includes(`Current text: "${expectedText}"`) ||
				text.includes(`Current text: ${expectedText}`)
			);
		})
		.toBe(true);
}

describe('InspectDemo component', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	test('renders with initial state', async () => {
		const screen = await render(InspectDemo);
		await expectCurrentTextToBe(
			screen.getByTestId('text-value'),
			'Hello world',
		);
		await expect
			.element(screen.getByTestId('char-count'))
			.toMatchTextContent('Character count: 11');
	});

	test('updates text value and character count when input changes', async () => {
		const consoleSpy = vi.spyOn(console, 'log');
		const screen = await render(InspectDemo);
		await screen.getByTestId('text-input').fill('Testing $inspect');
		await expectCurrentTextToBe(
			screen.getByTestId('text-value'),
			'Testing $inspect',
		);
		await expect
			.element(screen.getByTestId('char-count'))
			.toMatchTextContent('Character count: 16');
		expect(consoleSpy).toHaveBeenCalled();
		const output = consoleSpy.mock.calls
			.map((call) => call.join(' '))
			.join('\n');
		expect(output).toContain('init');
		expect(output).toContain('update');
	});

	test('handles special characters correctly', async () => {
		const consoleSpy = vi.spyOn(console, 'log');
		const screen = await render(InspectDemo);
		await screen.getByTestId('text-input').fill('!@#$%^&*()');
		await expectCurrentTextToBe(screen.getByTestId('text-value'), '!@#$%^&*()');
		await expect
			.element(screen.getByTestId('char-count'))
			.toMatchTextContent('Character count: 10');
		expect(consoleSpy).toHaveBeenCalled();
		const output = consoleSpy.mock.calls
			.map((call) => call.join(' '))
			.join('\n');
		expect(output).toContain('init');
		expect(output).toContain('update');
	});

	test('handles empty input correctly', async () => {
		const consoleSpy = vi.spyOn(console, 'log');
		const screen = await render(InspectDemo);
		await screen.getByTestId('text-input').clear();
		await expectCurrentTextToBe(screen.getByTestId('text-value'), '');
		await expect
			.element(screen.getByTestId('char-count'))
			.toMatchTextContent('Character count: 0');
		expect(consoleSpy).toHaveBeenCalled();
		const output = consoleSpy.mock.calls
			.map((call) => call.join(' '))
			.join('\n');
		expect(output).toContain('init');
		expect(output).toContain('update');
	});
});
