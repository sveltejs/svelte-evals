import { render } from 'vitest-browser-svelte';
import { expect, test, describe } from 'vitest';
import HelloWorld from '../src/routes/+page.svelte';

describe('HelloWorld component', () => {
	test('renders with Hello, World! text', async () => {
		const screen = await render(HelloWorld);
		await expect
			.element(screen.getByTestId('greeting'))
			.toMatchTextContent('Hello, World!');
	});

	test('has the correct styling class', async () => {
		const screen = await render(HelloWorld);
		await expect
			.element(screen.getByTestId('greeting'))
			.toHaveClass('greeting');
	});
});
