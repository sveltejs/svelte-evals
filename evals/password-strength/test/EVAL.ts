import { render } from 'vitest-browser-svelte';
import { expect, test, describe } from 'vitest';
import { userEvent } from 'vitest/browser';
import PasswordStrength from '../src/routes/+page.svelte';

describe('PasswordStrength component', () => {
	test("weak password shows weak - enter 'abc', verify 'weak' is shown", async () => {
		const screen = await render(PasswordStrength);
		await screen.getByTestId('password-input').fill('abc');
		await expect
			.element(screen.getByTestId('strength-value'))
			.toMatchTextContent('weak');
	});

	test("criteria updates on input - enter 'Password1!', verify uppercase, lowercase, number criteria are met", async () => {
		const screen = await render(PasswordStrength);
		await screen.getByTestId('password-input').fill('Password1!');
		for (const criterion of ['uppercase', 'lowercase', 'number', 'special']) {
			await expect
				.element(screen.getByTestId(`criteria-${criterion}`))
				.toHaveClass('met');
		}
	});

	test("show button reveals password - verify input type changes from 'password' to 'text'", async () => {
		const screen = await render(PasswordStrength);
		const input = screen.getByTestId('password-input');
		await expect.element(input).toHaveAttribute('type', 'password');
		await screen.getByTestId('toggle-visibility').click();
		await expect.element(input).toHaveAttribute('type', 'text');
	});

	test('strong password shows strong - enter a password meeting all criteria, verify strength indicator', async () => {
		const screen = await render(PasswordStrength);
		await screen.getByTestId('password-input').fill('Password1!');
		await expect
			.element(screen.getByTestId('strength-value'))
			.toMatchTextContent('very strong');
	});

	test('all criteria start unchecked - render with no input, verify no criteria are met', async () => {
		const screen = await render(PasswordStrength);
		for (const criterion of [
			'length',
			'uppercase',
			'lowercase',
			'number',
			'special',
		]) {
			await expect
				.element(screen.getByTestId(`criteria-${criterion}`))
				.not.toHaveClass('met');
		}
	});

	test('length criteria works - enter 8+ characters, verify length criteria is met', async () => {
		const screen = await render(PasswordStrength);
		const input = screen.getByTestId('password-input');
		await input.fill('1234567');
		await expect
			.element(screen.getByTestId('criteria-length'))
			.not.toHaveClass('met');
		await userEvent.type(input, '8');
		await expect
			.element(screen.getByTestId('criteria-length'))
			.toHaveClass('met');
	});
});
