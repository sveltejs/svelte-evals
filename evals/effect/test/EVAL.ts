import { render } from 'vitest-browser-svelte';
import { expect, test, describe } from 'vitest';
import NumberDoubler from '../src/routes/+page.svelte';

describe('NumberDoubler component', () => {
	test('renders with initial state', async () => {
		const screen = await render(NumberDoubler);
		await expect
			.element(screen.getByTestId('number-value'))
			.toMatchTextContent('Number: 5');
		await expect
			.element(screen.getByTestId('doubled-value'))
			.toMatchTextContent('Doubled: 10');
	});

	test('updates doubled value when number increments', async () => {
		const screen = await render(NumberDoubler);
		await screen.getByTestId('increment-button').click();
		await expect
			.element(screen.getByTestId('number-value'))
			.toMatchTextContent('Number: 6');
		await expect
			.element(screen.getByTestId('doubled-value'))
			.toMatchTextContent('Doubled: 12');
		await screen.getByTestId('increment-button').click();
		await expect
			.element(screen.getByTestId('number-value'))
			.toMatchTextContent('Number: 7');
		await expect
			.element(screen.getByTestId('doubled-value'))
			.toMatchTextContent('Doubled: 14');
	});
});
