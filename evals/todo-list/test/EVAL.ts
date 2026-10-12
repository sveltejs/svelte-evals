import { render } from 'vitest-browser-svelte';
import { page } from 'vitest/browser';
import { describe, expect, test } from 'vitest';
import TodoList from '../src/routes/+page.svelte';

async function setupInitialTodos(
	todos: { id: number; text: string; done: boolean }[],
) {
	for (const todo of todos) {
		await page.getByTestId('todo-input').fill(todo.text);
		await page.getByTestId('add-button').click();
		if (todo.done) {
			await page.getByTestId('todo-checkbox').last().click();
		}
	}
}

describe('TodoList component', () => {
	test('can add todo - render, type in textbox, submit form, verify new todo appears', async () => {
		const screen = await render(TodoList);
		await screen.getByTestId('todo-input').fill('Buy groceries');
		await screen.getByTestId('add-button').click();
		await expect
			.poll(() => screen.getByTestId('todo-item').elements().length)
			.toBe(1);
		await expect
			.element(screen.getByTestId('todo-text'))
			.toMatchTextContent('Buy groceries');
	});

	test('toggle marks complete - render with initial todo, click checkbox, verify checkbox is checked', async () => {
		const screen = await render(TodoList);
		await setupInitialTodos([{ id: 1, text: 'Test todo', done: false }]);
		const checkbox = screen.getByTestId('todo-checkbox');
		await expect.element(checkbox).not.toBeChecked();
		await checkbox.click();
		await expect.element(checkbox).toBeChecked();
	});

	test('delete removes todo - render with initial todo, click delete button, verify todo is gone', async () => {
		const screen = await render(TodoList);
		await setupInitialTodos([{ id: 1, text: 'Test todo', done: false }]);
		await expect.element(screen.getByTestId('todo-item')).toBeInTheDocument();
		await expect
			.element(screen.getByTestId('todo-text'))
			.toMatchTextContent('Test todo');
		await screen.getByTestId('delete-button').click();
		await expect
			.element(screen.getByTestId('todo-item'))
			.not.toBeInTheDocument();
	});

	test('shows remaining count - render with 2 todos (1 done, 1 not), verify shows correct count', async () => {
		const screen = await render(TodoList);
		await setupInitialTodos([
			{ id: 1, text: 'Done todo', done: true },
			{ id: 2, text: 'Pending todo', done: false },
		]);
		await expect
			.element(screen.getByTestId('remaining-count'))
			.toMatchTextContent(/1\s*(item|todo)/i);
	});

	test("empty input doesn't add - submit empty form, verify no todo added", async () => {
		const screen = await render(TodoList);
		await expect.element(screen.getByTestId('todo-input')).toHaveValue('');
		await screen.getByTestId('add-button').click({ force: true });
		await expect
			.element(screen.getByTestId('todo-item'))
			.not.toBeInTheDocument();
	});

	test('form resets after add - add a todo, verify input is cleared', async () => {
		const screen = await render(TodoList);
		const input = screen.getByTestId('todo-input');
		await input.fill('New todo');
		await expect.element(input).toHaveValue('New todo');
		await screen.getByTestId('add-button').click();
		await expect.element(input).toHaveValue('');
	});
});
