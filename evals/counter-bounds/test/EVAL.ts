import { render } from 'vitest-browser-svelte';
import { expect, test, describe } from 'vitest';
import Counter from '../src/routes/+page.svelte';

describe('Counter with bounds component', () => {
	test('increment increases count', async () => {
		const screen = await render(Counter, { props: { initialValue: 0 } });
		const count = screen.getByTestId('count-value');
		await expect.element(count).toMatchTextContent('0');
		await screen.getByTestId('increment-button').click();
		await expect.element(count).toMatchTextContent('1');
	});

	test('decrement decreases count', async () => {
		const screen = await render(Counter, { props: { initialValue: 5 } });
		const count = screen.getByTestId('count-value');
		await expect.element(count).toMatchTextContent('5');
		await screen.getByTestId('decrement-button').click();
		await expect.element(count).toMatchTextContent('4');
	});

	test('increment disabled at max', async () => {
		const screen = await render(Counter, {
			props: { initialValue: 10, max: 10 },
		});
		await expect.element(screen.getByTestId('increment-button')).toBeDisabled();
	});

	test('decrement disabled at min', async () => {
		const screen = await render(Counter, {
			props: { initialValue: 0, min: 0 },
		});
		await expect.element(screen.getByTestId('decrement-button')).toBeDisabled();
	});

	test('reset returns to initial value', async () => {
		const screen = await render(Counter, { props: { initialValue: 5 } });
		const count = screen.getByTestId('count-value');
		await expect.element(count).toMatchTextContent('5');
		await screen.getByTestId('increment-button').click();
		await expect.element(count).toMatchTextContent('6');
		await screen.getByTestId('reset-button').click();
		await expect.element(count).toMatchTextContent('5');
	});

	test('defaults work without bounds - no buttons disabled', async () => {
		const screen = await render(Counter, { props: { initialValue: 0 } });
		await expect
			.element(screen.getByTestId('increment-button'))
			.not.toBeDisabled();
		await expect
			.element(screen.getByTestId('decrement-button'))
			.not.toBeDisabled();
	});

	test('works if the initialValue prop changes', async () => {
		const screen = await render(Counter, { props: { initialValue: 0 } });
		const count = screen.getByTestId('count-value');
		await screen.getByTestId('increment-button').click();
		await expect.element(count).toMatchTextContent('1');
		await screen.rerender({ initialValue: 10 });
		await expect.element(count).toMatchTextContent('10');
	});
});
