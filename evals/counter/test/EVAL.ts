import { render } from 'vitest-browser-svelte';
import { expect, test, describe } from 'vitest';
import Counter from '../src/routes/+page.svelte';

describe('Counter component', () => {
	test('renders with initial count of 0', async () => {
		const screen = await render(Counter);
		await expect
			.element(screen.getByTestId('count-value'))
			.toHaveTextContent('0');
		await expect
			.element(screen.getByTestId('decrement-button'))
			.toBeInTheDocument();
		await expect
			.element(screen.getByTestId('increment-button'))
			.toBeInTheDocument();
	});

	test('increments the count when + button is clicked', async () => {
		const screen = await render(Counter);
		const count = screen.getByTestId('count-value');
		await expect.element(count).toHaveTextContent('0');
		await screen.getByTestId('increment-button').click();
		await expect.element(count).toHaveTextContent('1');
	});

	test('decrements the count when - button is clicked', async () => {
		const screen = await render(Counter);
		const count = screen.getByTestId('count-value');
		await expect.element(count).toHaveTextContent('0');
		await screen.getByTestId('decrement-button').click();
		await expect.element(count).toHaveTextContent('-1');
	});

	test('handles multiple clicks correctly', async () => {
		const screen = await render(Counter);
		const count = screen.getByTestId('count-value');
		await screen.getByTestId('increment-button').click();
		await screen.getByTestId('increment-button').click();
		await expect.element(count).toHaveTextContent('2');
		await screen.getByTestId('decrement-button').click();
		await expect.element(count).toHaveTextContent('1');
	});
});
