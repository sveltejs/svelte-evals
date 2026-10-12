import { render } from 'vitest-browser-svelte';
import { expect, test, describe, vi } from 'vitest';
import Button from '../src/routes/+page.svelte';

describe('Button with Variants component', () => {
	test('applies variant class', async () => {
		const screen = await render(Button, { props: { variant: 'primary' } });
		await expect.element(screen.getByRole('button')).toHaveClass('primary');
	});

	test('applies size class', async () => {
		const screen = await render(Button, { props: { size: 'lg' } });
		await expect.element(screen.getByRole('button')).toHaveClass('lg');
	});

	test('disabled prevents click', async () => {
		const handleClick = vi.fn();
		const screen = await render(Button, {
			props: { disabled: true, onclick: handleClick },
		});
		const button = screen.getByRole('button');
		// Bypass Playwright's enabled check while keeping native disabled-button behavior.
		await button.click({ force: true });
		expect(handleClick).not.toHaveBeenCalled();
	});

	test('click event forwarded', async () => {
		const handleClick = vi.fn();
		const screen = await render(Button, { props: { onclick: handleClick } });
		await screen.getByRole('button').click();
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	test('default props work', async () => {
		const screen = await render(Button);
		const button = screen.getByRole('button');
		await expect.element(button).toHaveClass('primary');
		await expect.element(button).toHaveClass('md');
		await expect.element(button).not.toBeDisabled();
	});
});
