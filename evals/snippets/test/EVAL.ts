import { render } from 'vitest-browser-svelte';
import { expect, test, describe } from 'vitest';
import BookList from '../src/routes/+page.svelte';

describe('Simple Snippet component', () => {
	test('renders the correct number of book titles', async () => {
		const screen = await render(BookList);
		await expect
			.poll(() => screen.getByTestId('book-item').elements().length)
			.toBe(3);
		await expect
			.poll(() => screen.getByTestId('book-title').elements().length)
			.toBe(3);
	});

	test('displays correct book titles', async () => {
		const screen = await render(BookList);
		const titles = screen.getByTestId('book-title');
		await expect
			.element(titles.nth(0))
			.toMatchTextContent('The Lord of the Rings');
		await expect
			.element(titles.nth(1))
			.toMatchTextContent('To Kill a Mockingbird');
		await expect.element(titles.nth(2)).toMatchTextContent('1984');
	});

	test('has the correct structure for each book item', async () => {
		const screen = await render(BookList);
		const items = screen.getByTestId('book-item');
		await expect.poll(() => items.elements().length).toBe(3);
		for (let i = 0; i < 3; i++) {
			const item = items.nth(i);
			await expect.element(item).toHaveProperty('tagName', 'LI');
			const title = item.getByTestId('book-title');
			await expect.element(title).toBeInTheDocument();
			await expect.element(title).toHaveProperty('tagName', 'SPAN');
		}
	});
});
