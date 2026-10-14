import { render } from 'vitest-browser-svelte';
import { expect, test, describe } from 'vitest';
import { userEvent } from 'vitest/browser';
import TemperatureConverter from '../src/routes/+page.svelte';

describe('TemperatureConverter component', () => {
	test('allows clearing and typing a decimal value without rewriting the active field', async () => {
		const screen = await render(TemperatureConverter);
		const kelvin = screen.getByTestId('kelvin-input');
		await kelvin.fill('273.15');
		await kelvin.fill('');
		await expect.element(kelvin).toHaveValue(null);
		await kelvin.click();
		for (const key of '373.15') {
			await userEvent.keyboard(key);
		}
		await expect.element(kelvin).toHaveValue(373.15);
		await expect.element(screen.getByTestId('celsius-input')).toHaveValue(100);
		await expect.element(screen.getByTestId('fahrenheit-input')).toHaveValue(212);
	});

	test('Celsius to Fahrenheit - enter 0 Celsius, verify Fahrenheit shows 32', async () => {
		const screen = await render(TemperatureConverter);
		await screen.getByTestId('celsius-input').fill('0');
		await expect
			.element(screen.getByTestId('fahrenheit-input'))
			.toHaveValue(32);
	});

	test('Fahrenheit to Celsius - enter 212 Fahrenheit, verify Celsius shows 100', async () => {
		const screen = await render(TemperatureConverter);
		await screen.getByTestId('fahrenheit-input').fill('212');
		await expect.element(screen.getByTestId('celsius-input')).toHaveValue(100);
	});

	test('Celsius to Kelvin - enter 0 Celsius, verify Kelvin shows 273.15', async () => {
		const screen = await render(TemperatureConverter);
		await screen.getByTestId('celsius-input').fill('0');
		await expect
			.element(screen.getByTestId('kelvin-input'))
			.toHaveValue(273.15);
	});

	test('Kelvin to Celsius - enter 373.15 Kelvin, verify Celsius shows 100', async () => {
		const screen = await render(TemperatureConverter);
		await screen.getByTestId('kelvin-input').fill('373.15');
		await expect.element(screen.getByTestId('celsius-input')).toHaveValue(100);
	});

	test('All fields update together - enter value in one, verify other two update', async () => {
		const screen = await render(TemperatureConverter);
		await screen.getByTestId('celsius-input').fill('100');
		await expect
			.element(screen.getByTestId('fahrenheit-input'))
			.toHaveValue(212);
		await expect
			.element(screen.getByTestId('kelvin-input'))
			.toHaveValue(373.15);
	});

	test('Handles decimals - enter decimal value, verify reasonable precision in outputs', async () => {
		const screen = await render(TemperatureConverter);
		await screen.getByTestId('celsius-input').fill('25.5');
		await expect
			.element(screen.getByTestId('fahrenheit-input'))
			.toHaveValue(77.9);
		await expect
			.element(screen.getByTestId('kelvin-input'))
			.toHaveValue(298.65);
	});
});
