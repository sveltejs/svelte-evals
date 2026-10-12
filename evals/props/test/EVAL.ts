import { render } from 'vitest-browser-svelte';
import { expect, test, describe } from 'vitest';
import PropsDemo from '../src/routes/+page.svelte';

describe('PropsDemo component', () => {
	test('renders with default props', async () => {
		const screen = await render(PropsDemo);
		await expect
			.element(screen.getByTestId('name-display'))
			.toMatchTextContent('World');
		await expect
			.element(screen.getByTestId('count-display'))
			.toMatchTextContent(/0/);
		await expect.element(screen.getByTestId('details')).not.toBeInTheDocument();
	});

	test('renders with custom props', async () => {
		const screen = await render(PropsDemo, {
			props: { name: 'Svelte', count: 5, showDetails: true },
		});
		await expect
			.element(screen.getByTestId('name-display'))
			.toMatchTextContent('Svelte');
		await expect
			.element(screen.getByTestId('count-display'))
			.toMatchTextContent(/5/);
		const details = screen.getByTestId('details');
		await expect.element(details).toBeInTheDocument();
		await expect.element(details).toMatchTextContent(/Svelte/);
		await expect.element(details).toMatchTextContent(/5/);
		await expect.element(details).toMatchTextContent(/true/i);
	});

	test('increment button increases count', async () => {
		const screen = await render(PropsDemo, { props: { count: 10 } });
		const count = screen.getByTestId('count-display');
		await expect.element(count).toMatchTextContent(/10/);
		await screen.getByTestId('increment-button').click();
		await expect.element(count).toMatchTextContent(/11/);
	});

	test('conditional rendering works correctly', async () => {
		const screen = await render(PropsDemo, { props: { showDetails: false } });
		await expect.element(screen.getByTestId('details')).not.toBeInTheDocument();
		await screen.unmount();
		const withDetails = await render(PropsDemo, {
			props: { showDetails: true },
		});
		await expect
			.element(withDetails.getByTestId('details'))
			.toBeInTheDocument();
	});
});
