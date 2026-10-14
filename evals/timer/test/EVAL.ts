import { cleanup, render } from 'vitest-browser-svelte';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { tick } from 'svelte';
import Timer from '../src/routes/+page.svelte';

async function advanceTime(milliseconds: number) {
	vi.advanceTimersByTime(milliseconds);
	await tick();
}

describe('Timer component', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(async () => {
		// Unmount while fake timers are still installed so interval cleanup uses
		// the same clock as the component.
		await cleanup();
		vi.useRealTimers();
	});

	test('displays initial time as 00:00.00', async () => {
		const screen = await render(Timer);
		await expect
			.element(screen.getByTestId('display'))
			.toMatchTextContent('00:00.00');
	});

	test('start begins counting - click start, advance time, verify display shows elapsed time', async () => {
		const screen = await render(Timer);
		await screen.getByTestId('start').click();
		await advanceTime(1500);
		await expect
			.element(screen.getByTestId('display'))
			.toMatchTextContent('00:01.50');
	});

	test("pause stops counting - start, advance time, pause, advance more time, verify display didn't change", async () => {
		const screen = await render(Timer);
		await screen.getByTestId('start').click();
		await advanceTime(1000);
		await screen.getByTestId('pause').click();
		const display = screen.getByTestId('display');
		const displayAfterPause = display.element().textContent;
		await advanceTime(2000);
		await expect.element(display).toMatchTextContent(displayAfterPause!);
	});

	test('reset clears timer - start, advance, reset, verify display shows 00:00.00', async () => {
		const screen = await render(Timer);
		await screen.getByTestId('start').click();
		await advanceTime(5000);
		await screen.getByTestId('reset').click();
		await expect
			.element(screen.getByTestId('display'))
			.toMatchTextContent('00:00.00');
	});

	test('lap records current time - start, advance, click lap, verify lap time is recorded', async () => {
		const screen = await render(Timer);
		await screen.getByTestId('start').click();
		await advanceTime(2500);
		await screen.getByTestId('lap').click();
		await expect
			.element(screen.getByTestId('lap-0'))
			.toMatchTextContent('00:02.50');
	});

	test('display format is MM:SS.ms - verify format for over a minute', async () => {
		const screen = await render(Timer);
		await screen.getByTestId('start').click();
		await advanceTime(90250);
		await expect
			.element(screen.getByTestId('display'))
			.toMatchTextContent('01:30.25');
	});

	test('multiple laps are recorded correctly', async () => {
		const screen = await render(Timer);
		await screen.getByTestId('start').click();
		await advanceTime(1000);
		await screen.getByTestId('lap').click();
		await advanceTime(1500);
		await screen.getByTestId('lap').click();
		await expect
			.element(screen.getByTestId('lap-0'))
			.toMatchTextContent('00:01.00');
		await expect
			.element(screen.getByTestId('lap-1'))
			.toMatchTextContent('00:02.50');
	});

	test('reset clears laps', async () => {
		const screen = await render(Timer);
		await screen.getByTestId('start').click();
		await advanceTime(1000);
		await screen.getByTestId('lap').click();
		await expect.element(screen.getByTestId('lap-0')).toBeInTheDocument();
		await screen.getByTestId('reset').click();
		await expect.element(screen.getByTestId('lap-0')).not.toBeInTheDocument();
	});
});
