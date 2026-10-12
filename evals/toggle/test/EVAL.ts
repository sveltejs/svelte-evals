import { render } from 'vitest-browser-svelte';
import { expect, test, describe } from 'vitest';
import { userEvent } from 'vitest/browser';
import Toggle from '../src/routes/+page.svelte';

describe('Toggle component', () => {
	test('clicking toggles state - render with checked=false, click, verify aria-checked is true', async () => {
		const screen = await render(Toggle, {
			props: { checked: false, label: 'Test toggle' },
		});
		const toggle = screen.getByTestId('switch');
		await expect.element(toggle).toHaveAttribute('aria-checked', 'false');
		await toggle.click();
		await expect.element(toggle).toHaveAttribute('aria-checked', 'true');
	});

	test('Space key toggles - render with checked=false, press Space, verify toggled', async () => {
		const screen = await render(Toggle, {
			props: { checked: false, label: 'Test toggle' },
		});
		const toggle = screen.getByTestId('switch');
		await expect.element(toggle).toHaveAttribute('aria-checked', 'false');
		toggle.element().focus();
		await userEvent.keyboard(' ');
		await expect.element(toggle).toHaveAttribute('aria-checked', 'true');
	});

	test('Enter key toggles - render with checked=false, press Enter, verify toggled', async () => {
		const screen = await render(Toggle, {
			props: { checked: false, label: 'Test toggle' },
		});
		const toggle = screen.getByTestId('switch');
		await expect.element(toggle).toHaveAttribute('aria-checked', 'false');
		toggle.element().focus();
		await userEvent.keyboard('{Enter}');
		await expect.element(toggle).toHaveAttribute('aria-checked', 'true');
	});

	test('disabled prevents toggle - render with disabled=true, click, verify state unchanged', async () => {
		const screen = await render(Toggle, {
			props: { checked: false, disabled: true, label: 'Test toggle' },
		});
		const toggle = screen.getByTestId('switch');
		await expect.element(toggle).toHaveAttribute('aria-checked', 'false');
		// Allow a real click attempt on native or aria-disabled switches.
		await toggle.click({ force: true });
		await expect.element(toggle).toHaveAttribute('aria-checked', 'false');
	});

	test('label is associated - verify the label is properly connected to the switch', async () => {
		const screen = await render(Toggle, {
			props: { label: 'My Toggle Label' },
		});
		const label = screen.getByTestId('label');
		await expect.element(label).toMatchTextContent('My Toggle Label');
		const labelId = label.element().getAttribute('id');
		await expect
			.element(screen.getByTestId('switch'))
			.toHaveAttribute('aria-labelledby', labelId);
	});

	test('aria-checked reflects state - verify aria-checked attribute matches internal state', async () => {
		const screen = await render(Toggle, {
			props: { checked: true, label: 'Test toggle' },
		});
		const toggle = screen.getByTestId('switch');
		await expect.element(toggle).toHaveAttribute('aria-checked', 'true');
		await toggle.click();
		await expect.element(toggle).toHaveAttribute('aria-checked', 'false');
		await toggle.click();
		await expect.element(toggle).toHaveAttribute('aria-checked', 'true');
	});
});
